'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSmartFeedAction(
    page: number = 0,
    limit: number = 10,
    clientSeenIds: string[] = []
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Session-level exclusion only (to prevent duplicate items in current scroll)
    const excludeIds = [...new Set(clientSeenIds)].filter(id => id && id.length === 36);

    // 2. Call RPC v12 (Stable & Cooldown balanced)
    console.log(`🧠 Smart Feed v12: User: ${user?.id ? 'Auth' : 'Guest'}, Session Excl: ${excludeIds.length}`);

    let { data: rawFeed, error: rpcError } = await supabase.rpc('fetch_smart_feed_v12', {
        p_user_id: user?.id || null,
        p_exclude_ids: excludeIds.length > 0 ? excludeIds : [],
        p_limit: limit
    });

    if (rpcError) {
        console.error("❌ RPC Error:", { message: rpcError.message, code: rpcError.code });
        // Emergency Fallback
        const { data: fallback } = await supabase.from('forum_posts').select('*').limit(limit).order('created_at', { ascending: false });
        rawFeed = (fallback || []).map(p => ({
            res_id: p.id, res_post_type: 'forum', res_title: p.title, res_content: p.content,
            res_created_at: p.created_at, res_author_id: p.author_id, res_slug: p.slug, res_score: 10
        })) as any;
    }

    if (!rawFeed || (rawFeed as any[]).length === 0) return { posts: [], hasMore: false };

    // 3. Map for UI
    const posts = (rawFeed as any[]).map(item => ({
        id: item.res_id,
        feed_item_id: `${item.res_post_type}-${item.res_id}`,
        post_type: item.res_post_type,
        created_at: item.res_created_at,
        author_id: item.res_author_id,
        title: item.res_title,
        content: item.res_content || item.res_description || '',
        image_url: item.res_image_url,
        slug: item.res_slug,
        resource_category: item.res_category,
        resource_type_label: item.res_type_label,
        external_url: item.res_external_url,
        like_count: Number(item.res_like_count || 0),
        comment_count: Number(item.res_comment_count || 0),
        is_seen: false, // Will be marked if needed in UI
        is_new: true
    }));

    // 4. Profiles Enrichment
    const authIds = [...new Set(posts.map(p => p.author_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url, job_title').in('id', authIds);
    const profilesMap = new Map(profiles?.map(p => [p.id, p]));

    const finalPosts = posts.map(p => {
        const auth = profilesMap.get(p.author_id);
        return {
            ...p,
            author_name: auth?.full_name || 'Member',
            author_avatar: auth?.avatar_url,
            author_title: auth?.job_title
        };
    });

    return { posts: finalPosts, hasMore: finalPosts.length === limit };
}

export async function markPostAsSeenAction(postId: string, postType: 'forum' | 'social' | 'resource') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
        await supabase.rpc('mark_post_seen', { p_user_id: user.id, p_post_id: postId, p_post_type: postType });
    } catch (e) {
        console.error('Failed to mark seen:', e);
    }
}
