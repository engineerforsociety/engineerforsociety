-- =============================================
-- FINAL UPDATE FOR FEED POSTS VIEW
-- To support professional repost system and detail page
-- =============================================

DROP VIEW IF EXISTS public.feed_posts_view CASCADE;

CREATE OR REPLACE VIEW public.feed_posts_view AS
WITH base_posts AS (
    -- Original posts
    SELECT 
        fp.id,
        fp.id as feed_item_id,
        fp.title,
        fp.content,
        fp.tags,
        fp.created_at,
        fp.created_at as feed_created_at,
        fp.view_count,
        fp.is_pinned,
        fp.slug,
        p.id as author_id,
        p.full_name as author_name,
        p.avatar_url as author_avatar,
        p.job_title as author_title,
        fc.name as category_name,
        fc.slug as category_slug,
        'post'::text as item_type,
        NULL::uuid as reposter_id,
        NULL::text as reposter_name,
        NULL::text as reposter_avatar,
        NULL::text as reposter_title,
        NULL::uuid as repost_record_id
    FROM public.forum_posts fp
    LEFT JOIN public.profiles p ON fp.author_id = p.id
    LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id

    UNION ALL

    -- Reposts
    SELECT 
        fp.id,
        pr.id as feed_item_id,
        fp.title,
        fp.content,
        fp.tags,
        fp.created_at,
        pr.created_at as feed_created_at,
        fp.view_count,
        false as is_pinned,
        fp.slug,
        p_author.id as author_id,
        p_author.full_name as author_name,
        p_author.avatar_url as author_avatar,
        p_author.job_title as author_title,
        fc.name as category_name,
        fc.slug as category_slug,
        'repost'::text as item_type,
        pr.reposter_id,
        p_reposter.full_name as reposter_name,
        p_reposter.avatar_url as reposter_avatar,
        p_reposter.job_title as reposter_title,
        pr.id as repost_record_id
    FROM public.post_reposts pr
    JOIN public.forum_posts fp ON pr.original_post_id = fp.id
    LEFT JOIN public.profiles p_author ON fp.author_id = p_author.id
    LEFT JOIN public.profiles p_reposter ON pr.reposter_id = p_reposter.id
    LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id
)
SELECT 
    bp.*,
    -- Original post stats
    (SELECT COUNT(*) FROM public.forum_comments WHERE post_id = bp.id) as original_comment_count,
    (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = bp.id) as original_like_count,
    (SELECT COUNT(*) FROM public.post_shares WHERE post_id = bp.id AND (is_from_repost IS FALSE OR is_from_repost IS NULL)) as original_share_count,
    (SELECT COUNT(*) FROM public.post_reposts WHERE original_post_id = bp.id) as repost_count,
    
    -- Interaction states for current user (Original Post)
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.post_reactions r 
      WHERE r.post_id = bp.id AND r.user_id = auth.uid())), false) as original_is_liked,
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.post_saves s 
      WHERE s.post_id = bp.id AND s.user_id = auth.uid())), false) as original_is_saved,
    
    -- Repost specific stats
    CASE WHEN bp.item_type = 'repost' THEN
        (SELECT COUNT(*) FROM public.repost_comments WHERE repost_id = bp.repost_record_id)
    ELSE 0 END as repost_comment_count,
    
    CASE WHEN bp.item_type = 'repost' THEN
        (SELECT COUNT(*) FROM public.repost_reactions WHERE repost_id = bp.repost_record_id)
    ELSE 0 END as repost_like_count,
    
    CASE WHEN bp.item_type = 'repost' THEN
        (SELECT COUNT(*) FROM public.post_shares WHERE repost_id = bp.repost_record_id AND is_from_repost IS TRUE)
    ELSE 0 END as repost_share_count,
    
    -- Interaction states for current user (Repost)
    CASE WHEN bp.item_type = 'repost' THEN
        COALESCE((SELECT EXISTS(SELECT 1 FROM public.repost_reactions rr 
          WHERE rr.repost_id = bp.repost_record_id AND rr.user_id = auth.uid())), false)
    ELSE false END as repost_is_liked,
    
    CASE WHEN bp.item_type = 'repost' THEN
        COALESCE((SELECT EXISTS(SELECT 1 FROM public.repost_saves rs 
          WHERE rs.repost_id = bp.repost_record_id AND rs.user_id = auth.uid())), false)
    ELSE false END as repost_is_saved,

    -- Global following state
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.user_follows uf 
      WHERE uf.following_id = bp.author_id AND uf.follower_id = auth.uid())), false) as is_following
FROM base_posts bp;

GRANT SELECT ON public.feed_posts_view TO authenticated, anon;
