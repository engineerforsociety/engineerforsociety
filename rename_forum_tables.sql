-- =============================================
-- RENAME TABLES TO FORUM_ PREFIX FOR CONSISTENCY
-- =============================================

-- 1. Rename Tables
ALTER TABLE IF EXISTS public.post_reactions RENAME TO forum_post_reactions;
ALTER TABLE IF EXISTS public.post_saves RENAME TO forum_post_saves;
ALTER TABLE IF EXISTS public.post_reposts RENAME TO forum_post_reposts;
ALTER TABLE IF EXISTS public.post_shares RENAME TO forum_post_shares;

-- 2. Update Triggers and Functions (Dependencies)
-- The triggers usually survive renames, but the functions might reference table names.
-- Let's check the functions from previous steps.

-- Update log_repost_activity to use forum_post_reposts
CREATE OR REPLACE FUNCTION public.log_repost_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    related_repost_id,
    related_post_id,
    activity_data
  )
  SELECT 
    NEW.reposter_id,
    'repost',
    NEW.id,
    NEW.original_post_id,
    jsonb_build_object(
      'title', fp.title,
      'content_preview', LEFT(fp.content, 200),
      'slug', fp.slug
    )
  FROM public.forum_posts fp
  WHERE fp.id = NEW.original_post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger if it was dropped or needs refresh
DROP TRIGGER IF EXISTS trigger_log_repost_activity ON public.forum_post_reposts;
CREATE TRIGGER trigger_log_repost_activity
  AFTER INSERT ON public.forum_post_reposts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_repost_activity();

-- Update log_repost_share_activity
CREATE OR REPLACE FUNCTION public.log_repost_share_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_from_repost = true AND NEW.repost_id IS NOT NULL THEN
    INSERT INTO public.user_activities (
      user_id,
      activity_type,
      activity_data,
      related_repost_id,
      related_post_id
    ) VALUES (
      NEW.user_id,
      'repost_share',
      jsonb_build_object('share_type', NEW.share_type),
      NEW.repost_id,
      NEW.post_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_repost_share ON public.forum_post_shares;
CREATE TRIGGER trigger_log_repost_share
  AFTER INSERT ON public.forum_post_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.log_repost_share_activity();

-- 3. UPDATE MASTER FEED VIEW
DROP VIEW IF EXISTS public.feed_posts_view CASCADE;

CREATE OR REPLACE VIEW public.feed_posts_view 
WITH (security_invoker = true) AS
WITH all_items AS (
    -- Forum Posts
    SELECT 
        id, 
        id as feed_item_id, 
        title, 
        content, 
        tags, 
        created_at, 
        created_at as feed_created_at, 
        COALESCE(view_count, 0) as view_count, 
        COALESCE(is_pinned, false) as is_pinned, 
        slug, 
        author_id, 
        'forum'::text as post_type, 
        'post'::text as item_type, 
        NULL::uuid as reposter_id, 
        NULL::uuid as repost_record_id 
    FROM public.forum_posts

    UNION ALL

    -- Social Posts
    SELECT 
        id, 
        id as feed_item_id, 
        NULL as title, 
        content, 
        NULL as tags, 
        created_at, 
        created_at as feed_created_at, 
        0 as view_count, 
        false as is_pinned, 
        slug, 
        author_id, 
        'social'::text as post_type, 
        'post'::text as item_type, 
        NULL::uuid as reposter_id, 
        NULL::uuid as repost_record_id 
    FROM public.social_posts

    UNION ALL

    -- Reposts (Forum posts only for now based on current logic)
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
        pr.id as repost_record_id 
    FROM public.forum_post_reposts pr 
    LEFT JOIN public.forum_posts fp ON pr.original_post_id = fp.id 
    LEFT JOIN public.social_posts sp ON pr.original_post_id = sp.id
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

    -- is_liked state
    COALESCE(
        CASE 
            WHEN ai.item_type = 'repost' THEN EXISTS(SELECT 1 FROM public.repost_reactions WHERE repost_id = ai.repost_record_id AND user_id = auth.uid()) 
            WHEN ai.post_type = 'forum' THEN EXISTS(SELECT 1 FROM public.forum_post_reactions WHERE post_id = ai.id AND user_id = auth.uid()) 
            ELSE EXISTS(SELECT 1 FROM public.social_post_reactions WHERE post_id = ai.id AND user_id = auth.uid()) 
        END, false) as is_liked,

    -- is_saved state
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

-- 4. UPDATE USER ACTIVITY FEED VIEW
DROP VIEW IF EXISTS public.user_activity_feed CASCADE;

CREATE OR REPLACE VIEW public.user_activity_feed AS
SELECT 
  ua.id as activity_id,
  ua.user_id,
  ua.activity_type,
  ua.created_at,
  ua.related_post_id,
  ua.related_social_post_id,
  ua.related_comment_id,
  ua.related_repost_id,
  ua.activity_data,
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  p.job_title as user_job_title,
  -- Post data
  COALESCE(fp.title, (ua.activity_data->>'title'), 'Social Update') as post_title,
  COALESCE(fp.content, sp.content, (ua.activity_data->>'content_preview')) as post_content,
  COALESCE(fp.slug, sp.slug, (ua.activity_data->>'slug')) as post_slug,
  -- Comment
  COALESCE(fc.content, sc.content) as comment_content,
  -- Repost
  orig_p.full_name as original_author_name
FROM public.user_activities ua
LEFT JOIN public.profiles p ON ua.user_id = p.id
LEFT JOIN public.forum_posts fp ON ua.related_post_id = fp.id
LEFT JOIN public.social_posts sp ON ua.related_social_post_id = sp.id
LEFT JOIN public.forum_comments fc ON ua.related_comment_id = fc.id
LEFT JOIN public.social_comments sc ON ua.related_comment_id = sc.id
LEFT JOIN public.forum_post_reposts pr ON ua.related_repost_id = pr.id
LEFT JOIN public.forum_posts orig_fp ON pr.original_post_id = orig_fp.id
LEFT JOIN public.profiles orig_p ON orig_fp.author_id = orig_p.id
ORDER BY ua.created_at DESC;

GRANT SELECT ON public.user_activity_feed TO authenticated, anon;
