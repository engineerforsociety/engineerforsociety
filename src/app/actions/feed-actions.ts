'use server';

import { createClient } from '@/lib/supabase/server';

// Smart Feed Algorithm
const calculateEngagementScore = (
    likeCount: number,
    commentCount: number,
    viewCount: number,
    createdAt: string
): number => {
    const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const timeDecay = Math.max(0.1, 1 - (ageInHours / 168));
    const likeWeight = 3;
    const commentWeight = 5;
    const viewWeight = 0.1;
    const rawScore = (likeCount * likeWeight) + (commentCount * commentWeight) + (viewCount * viewWeight);
    const recencyBonus = ageInHours < 2 ? 50 : (ageInHours < 12 ? 20 : 0);
    return (rawScore * timeDecay) + recencyBonus;
};

// SERVER ACTION for Paginated Feed
export async function getPaginatedFeedAction(
    page: number = 0,
    limit: number = 10,
    seenPostIds: string[] = []
) {
    console.log(`📄 Fetching Feed Page ${page + 1} (Limit: ${limit}, Seen: ${seenPostIds.length})`);

    try {
        const supabase = await createClient();
        const offset = page * limit;

        // Fetch MORE posts and FEWER resources for better balance
        // Fetch extra to ensure we have enough after mixing
        const forumLimit = 6;  // Get 6 forum posts
        const socialLimit = 6; // Get 6 social posts
        const resourceLimit = 3; // Get 3 resources

        const [
            { data: forumData },
            { data: socialData },
            { data: resourceData }
        ] = await Promise.all([
            supabase
                .from('forum_posts')
                .select('*, forum_post_reactions(count), forum_comments(count)')
                .order('created_at', { ascending: false })
                .range(page * forumLimit, (page + 1) * forumLimit - 1),
            supabase
                .from('social_posts')
                .select('*, social_post_reactions(count), social_comments(count)')
                .order('created_at', { ascending: false })
                .range(page * socialLimit, (page + 1) * socialLimit - 1),
            supabase
                .from('resources')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .range(page * resourceLimit, (page + 1) * resourceLimit - 1)
        ]);

        // Collect profile IDs
        const profileIds = new Set<string>();
        forumData?.forEach(p => profileIds.add(p.author_id));
        socialData?.forEach(p => profileIds.add(p.author_id));
        resourceData?.forEach(r => { if (r.author_id) profileIds.add(r.author_id); });

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, job_title')
            .in('id', Array.from(profileIds));

        const profilesMap = new Map(profiles?.map(p => [p.id, p]));

        // Format posts
        const formattedForumPosts = (forumData || []).map(post => {
            const author = profilesMap.get(post.author_id);
            const likeCount = post.forum_post_reactions?.[0]?.count || 0;
            const commentCount = post.forum_comments?.[0]?.count || 0;
            return {
                id: post.id,
                feed_item_id: `forum-${post.id}`,
                title: post.title,
                content: post.content,
                created_at: post.created_at,
                feed_created_at: post.created_at,
                view_count: post.view_count || 0,
                slug: post.slug,
                author_id: post.author_id,
                author_name: author?.full_name || 'Unknown',
                author_avatar: author?.avatar_url,
                author_title: author?.job_title,
                post_type: 'forum',
                item_type: 'post',
                like_count: likeCount,
                comment_count: commentCount,
                tags: null,
                is_pinned: false,
                engagement_score: calculateEngagementScore(likeCount, commentCount, post.view_count || 0, post.created_at),
            };
        });

        const formattedSocialPosts = (socialData || []).map(post => {
            const author = profilesMap.get(post.author_id);
            const likeCount = post.social_post_reactions?.[0]?.count || 0;
            const commentCount = post.social_comments?.[0]?.count || 0;
            return {
                id: post.id,
                feed_item_id: `social-${post.id}`,
                content: post.content,
                created_at: post.created_at,
                feed_created_at: post.created_at,
                author_id: post.author_id,
                author_name: author?.full_name || 'Unknown',
                author_avatar: author?.avatar_url,
                author_title: author?.job_title,
                post_type: 'social',
                item_type: 'post',
                like_count: likeCount,
                comment_count: commentCount,
                title: null,
                slug: post.slug || '',
                view_count: 0,
                tags: null,
                is_pinned: false,
                engagement_score: calculateEngagementScore(likeCount, commentCount, 0, post.created_at),
            };
        });

        const formattedResources = (resourceData || []).map(resource => {
            const author = resource.author_id ? profilesMap.get(resource.author_id) : null;
            return {
                id: resource.id,
                feed_item_id: `resource-${resource.id}`,
                title: resource.title,
                content: resource.description || '',
                created_at: resource.created_at,
                feed_created_at: resource.created_at,
                slug: resource.slug || '',
                view_count: resource.view_count || 0,
                author_id: resource.author_id,
                author_name: author?.full_name || 'Engineering Portal',
                author_avatar: author?.avatar_url,
                author_title: author?.job_title || 'Verified Resource',
                post_type: 'resource',
                item_type: 'post',
                like_count: resource.upvote_count || 0,
                comment_count: 0,
                engagement_score: calculateEngagementScore(resource.upvote_count || 0, 0, resource.view_count || 0, resource.created_at) + 10, // Reduced bonus
                resource_category: resource.category,
                resource_type_label: resource.resource_type,
            };
        });

        // Intelligent mixing: Interleave posts and resources
        const allPosts = [...formattedForumPosts, ...formattedSocialPosts];
        const mixedFeed: any[] = [];

        // Sort posts by engagement
        allPosts.sort((a, b) => b.engagement_score - a.engagement_score);

        // Mix: Every 3-4 posts, insert 1 resource
        let postIndex = 0;
        let resourceIndex = 0;

        while (mixedFeed.length < limit && (postIndex < allPosts.length || resourceIndex < formattedResources.length)) {
            // Add 3-4 posts
            for (let i = 0; i < 3 && postIndex < allPosts.length && mixedFeed.length < limit; i++) {
                mixedFeed.push(allPosts[postIndex++]);
            }

            // Add 1 resource
            if (resourceIndex < formattedResources.length && mixedFeed.length < limit) {
                mixedFeed.push(formattedResources[resourceIndex++]);
            }
        }

        console.log(`✅ Page ${page + 1}: ${mixedFeed.length} items (${formattedForumPosts.length} forum, ${formattedSocialPosts.length} social, ${formattedResources.length} resources)`);

        return {
            posts: mixedFeed,
            hasMore: mixedFeed.length >= limit,
            nextPage: page + 1
        };
    } catch (error) {
        console.error('Paginated Feed Error:', error);
        return { posts: [], hasMore: false, nextPage: page };
    }
}
