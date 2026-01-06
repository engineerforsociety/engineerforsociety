-- =============================================
-- UPDATE FEED VIEW TO INCLUDE CATEGORIES
-- =============================================

DROP VIEW IF EXISTS public.feed_posts_view CASCADE;

CREATE OR REPLACE VIEW public.feed_posts_view 
WITH (security_invoker = true) AS
WITH all_items AS (
    -- Forum Posts (JOIN with Categories)
    SELECT 
        fp.id, 
        fp.id as feed_item_id, 
        fp.title, 
        fp.content, 
        fp.tags, 
        fp.created_at, 
        fp.created_at as feed_created_at, 
        COALESCE(fp.view_count, 0) as view_count, 
        COALESCE(fp.is_pinned, false) as is_pinned, 
        fp.slug, 
        fp.author_id, 
        'forum'::text as post_type, 
        'post'::text as item_type, 
        NULL::uuid as reposter_id, 
        NULL::uuid as repost_record_id,
        fc.name as category_name,
        fc.slug as category_slug
    FROM public.forum_posts fp
    LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id

    UNION ALL

    -- Social Posts (No Categories)
    SELECT 
        sp.id, 
        sp.id as feed_item_id, 
        NULL as title, 
        sp.content, 
        NULL as tags, 
        sp.created_at, 
        sp.created_at as feed_created_at, 
        0 as view_count, 
        false as is_pinned, 
        sp.slug, 
        sp.author_id, 
        'social'::text as post_type, 
        'post'::text as item_type, 
        NULL::uuid as reposter_id, 
        NULL::uuid as repost_record_id,
        NULL as category_name,
        NULL as category_slug
    FROM public.social_posts sp

    UNION ALL

    -- Reposts (Include partial category info if originating from forum)
    SELECT 
        COALESCE(fp.id, sp.id) as id, 
        pr.id as feed_item_id, 
        fp.title, 
        COALESCE(fp.content, sp.content) as content, 
        fp.tags, 
        COALESCE(fp.created_at, sp.created_at) as created_at, 
        pr.created_at as feed_created_at, 
        0 as view_count, 
        false as is_pinned, 
        COALESCE(fp.slug, sp.slug) as slug, 
        COALESCE(fp.author_id, sp.author_id) as author_id, 
        CASE WHEN fp.id IS NOT NULL THEN 'forum' ELSE 'social' END::text as post_type, 
        'repost'::text as item_type, 
        pr.reposter_id, 
        pr.id as repost_record_id,
        fc.name as category_name,
        fc.slug as category_slug
    FROM public.forum_post_reposts pr 
    LEFT JOIN public.forum_posts fp ON pr.original_post_id = fp.id 
    LEFT JOIN public.social_posts sp ON pr.original_post_id = sp.id
    LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id
)
SELECT 
    ai.*,
    p.full_name as author_name, 
    p.avatar_url as author_avatar, 
    p.job_title as author_title,
    pr_profile.full_name as reposter_name, 
    pr_profile.avatar_url as reposter_avatar, 
    pr_profile.job_title as reposter_title,
    
    -- Like Count
    CASE 
        WHEN ai.item_type = 'repost' THEN (SELECT COUNT(*) FROM public.repost_reactions WHERE repost_id = ai.repost_record_id AND reaction_type = 'like') 
        WHEN ai.post_type = 'forum' THEN (SELECT COUNT(*) FROM public.forum_post_reactions WHERE post_id = ai.id AND reaction_type = 'like') 
        ELSE (SELECT COUNT(*) FROM public.social_post_reactions WHERE post_id = ai.id AND reaction_type = 'like') 
    END as like_count,

    -- Comment Count
    CASE 
        WHEN ai.item_type = 'repost' THEN (SELECT COUNT(*) FROM public.repost_comments WHERE repost_id = ai.repost_record_id) 
        WHEN ai.post_type = 'forum' THEN (SELECT COUNT(*) FROM public.forum_comments WHERE post_id = ai.id) 
        ELSE (SELECT COUNT(*) FROM public.social_comments WHERE post_id = ai.id) 
    END as comment_count,

    -- is_liked, is_saved, is_following
    COALESCE(
        CASE 
            WHEN ai.item_type = 'repost' THEN EXISTS(SELECT 1 FROM public.repost_reactions WHERE repost_id = ai.repost_record_id AND user_id = auth.uid()) 
            WHEN ai.post_type = 'forum' THEN EXISTS(SELECT 1 FROM public.forum_post_reactions WHERE post_id = ai.id AND user_id = auth.uid()) 
            ELSE EXISTS(SELECT 1 FROM public.social_post_reactions WHERE post_id = ai.id AND user_id = auth.uid()) 
        END, false) as is_liked,
    COALESCE(
        CASE 
            WHEN ai.item_type = 'repost' THEN EXISTS(SELECT 1 FROM public.repost_saves WHERE repost_id = ai.repost_record_id AND user_id = auth.uid()) 
            WHEN ai.post_type = 'forum' THEN EXISTS(SELECT 1 FROM public.forum_post_saves WHERE post_id = ai.id AND user_id = auth.uid()) 
            ELSE EXISTS(SELECT 1 FROM public.social_post_saves WHERE post_id = ai.id AND user_id = auth.uid()) 
        END, false) as is_saved,
    COALESCE(EXISTS(SELECT 1 FROM public.user_follows WHERE following_id = ai.author_id AND follower_id = auth.uid()), false) as is_following
FROM all_items ai
LEFT JOIN public.profiles p ON ai.author_id = p.id
LEFT JOIN public.profiles pr_profile ON ai.reposter_id = pr_profile.id;

GRANT SELECT ON public.feed_posts_view TO authenticated, anon;
