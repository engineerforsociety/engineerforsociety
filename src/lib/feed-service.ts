import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const staticSupabase = createClient(supabaseUrl, supabaseKey);

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

// CACHED FEED FETCHER
export const getCachedFeed = unstable_cache(
    async () => {
        console.log("⚡ FETCHING FULL MIXED FEED (ISR Refresh) ⚡");

        try {
            // 1. Fetch ALL types of content in parallel
            const [
                { data: forumData, error: forumError },
                { data: socialData, error: socialError },
                { data: resourceData, error: resourceError },
                { data: socialShareData, error: shareError },
                { data: forumRepostData, error: repostError }
            ] = await Promise.all([
                staticSupabase.from('forum_posts').select('*, forum_post_reactions(count), forum_comments(count)').order('created_at', { ascending: false }).limit(20),
                staticSupabase.from('social_posts').select('*, social_post_reactions(count), social_comments(count)').order('created_at', { ascending: false }).limit(20),
                staticSupabase.from('resources').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(10),
                staticSupabase.from('social_post_shares').select('*, social_posts(*, social_post_reactions(count), social_comments(count))').eq('share_type', 'feed').order('created_at', { ascending: false }).limit(10),
                staticSupabase.from('forum_post_reposts').select('*, forum_posts(*, forum_post_reactions(count), forum_comments(count))').order('created_at', { ascending: false }).limit(10)
            ]);

            if (forumError) console.error("Forum Fetch Error:", forumError);
            if (resourceError) console.error("Resource Fetch Error:", resourceError);

            // 2. Collect ALL Author IDs to fetch profiles efficiently
            const profileIds = new Set<string>();
            forumData?.forEach(p => profileIds.add(p.author_id));
            socialData?.forEach(p => profileIds.add(p.author_id));
            resourceData?.forEach(r => { if (r.author_id) profileIds.add(r.author_id); });

            socialShareData?.forEach((s: any) => {
                profileIds.add(s.user_id);
                const originalArray = Array.isArray(s.social_posts) ? s.social_posts : [s.social_posts];
                if (originalArray[0]?.author_id) profileIds.add(originalArray[0].author_id);
            });

            forumRepostData?.forEach((r: any) => {
                profileIds.add(r.reposter_id);
                const originalArray = Array.isArray(r.forum_posts) ? r.forum_posts : [r.forum_posts];
                if (originalArray[0]?.author_id) profileIds.add(originalArray[0].author_id);
            });

            const { data: profiles } = await staticSupabase.from('profiles').select('id, full_name, avatar_url, job_title').in('id', Array.from(profileIds));
            const profilesMap = new Map(profiles?.map(p => [p.id, p]));

            // 3. Format Forum Posts
            const formattedForumPosts = (forumData || []).map(post => {
                const author = profilesMap.get(post.author_id);
                const likeCount = post.forum_post_reactions?.[0]?.count || 0;
                const commentCount = post.forum_comments?.[0]?.count || 0;
                return {
                    id: post.id,
                    feed_item_id: `forum-${post.id}`, // Unique ID for key
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

            // 4. Format Social Posts
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

            // 5. Format Resources
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
                    engagement_score: calculateEngagementScore(resource.upvote_count || 0, 0, resource.view_count || 0, resource.created_at) + 15, // Bonus score to ensure visibility
                    resource_category: resource.category,
                    resource_type_label: resource.resource_type,
                };
            });

            // 6. Combine ALL into one feed
            const allPosts = [
                ...formattedForumPosts,
                ...formattedSocialPosts,
                ...formattedResources,
                // (Add reposts/shares formatting here if needed, keeping simple first to ensure main items appear)
            ].sort((a, b) => b.engagement_score - a.engagement_score);

            console.log(`✅ Loaded: ${formattedForumPosts.length} Forum, ${formattedSocialPosts.length} Social, ${formattedResources.length} Resources`);

            return allPosts.slice(0, 50); // Increased limit to ensure variety
        } catch (error) {
            console.error('Server Feed Error:', error);
            return [];
        }
    },
    ['main-feed-v2'], // Changed key to force refresh
    { revalidate: 30, tags: ['feed'] }
);
