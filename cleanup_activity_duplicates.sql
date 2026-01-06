-- =============================================
-- CLEANUP DUPLICATE ACTIVITIES AND TRIGGERS
-- =============================================

-- 1. Identify and remove duplicate triggers on social_posts and forum_posts
-- We want only ONE trigger per table for activity logging.

-- Remove potential duplicates/old names for social posts
DROP TRIGGER IF EXISTS trigger_social_post_activity ON public.social_posts;
DROP TRIGGER IF EXISTS social_post_activity_trigger ON public.social_posts;
DROP TRIGGER IF EXISTS trigger_create_social_post_activity ON public.social_posts;

-- Re-create only THE ONE definitive trigger for social posts
CREATE OR REPLACE FUNCTION public.create_social_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Avoid double entry if already exists for this post
  IF EXISTS (SELECT 1 FROM public.user_activities WHERE related_social_post_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_activities (user_id, activity_type, related_social_post_id, activity_data)
  VALUES (
    NEW.author_id,
    'social_post',
    NEW.id,
    jsonb_build_object(
      'content_preview', LEFT(NEW.content, 200),
      'slug', NEW.slug
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_social_post_activity
  AFTER INSERT ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_social_post_activity();


-- Remove potential duplicates/old names for forum posts
DROP TRIGGER IF EXISTS trigger_forum_post_activity ON public.forum_posts;
DROP TRIGGER IF EXISTS forum_post_activity_trigger ON public.forum_posts;
DROP TRIGGER IF EXISTS trigger_create_forum_post_activity ON public.forum_posts;

-- Re-create only THE ONE definitive trigger for forum posts
CREATE OR REPLACE FUNCTION public.create_forum_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Avoid double entry if already exists for this post
  IF EXISTS (SELECT 1 FROM public.user_activities WHERE related_post_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_activities (user_id, activity_type, related_post_id, activity_data)
  VALUES (
    NEW.author_id,
    'post',
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'slug', NEW.slug
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_forum_post_activity
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_forum_post_activity();


-- 2. Cleanup existing duplicate data in user_activities
-- Keep only the oldest entry if multiple exist for the same related_post_id or related_social_post_id
DELETE FROM public.user_activities a
USING public.user_activities b
WHERE a.id > b.id 
  AND (
    (a.related_post_id = b.related_post_id AND a.related_post_id IS NOT NULL)
    OR 
    (a.related_social_post_id = b.related_social_post_id AND a.related_social_post_id IS NOT NULL)
  );

-- 3. Fix the View to ensure no internal join duplications (using DISTINCT ON or GROUP BY)
-- Actually, the join duplication is unlikely, but let's make it robust.
DROP VIEW IF EXISTS public.user_activity_feed CASCADE;

CREATE OR REPLACE VIEW public.user_activity_feed AS
SELECT DISTINCT ON (ua.id)
  ua.id as activity_id,
  ua.user_id,
  ua.activity_type,
  ua.created_at,
  ua.related_post_id,
  ua.related_social_post_id,
  ua.related_comment_id,
  ua.related_repost_id,
  ua.activity_data,
  
  -- User Info
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  p.job_title as user_job_title,
  
  -- Unified Post Data (Forum OR Social)
  COALESCE(fp.title, 'Social Update') as post_title,
  COALESCE(fp.content, sp.content, (ua.activity_data->>'content_preview')) as post_content,
  COALESCE(fp.slug, sp.slug, (ua.activity_data->>'slug')) as post_slug,
  
  -- Comment Data
  COALESCE(fc.content, sc.content) as comment_content,
  
  -- Repost Info
  orig_p.full_name as original_author_name,
  orig_p.avatar_url as original_author_avatar

FROM public.user_activities ua
LEFT JOIN public.profiles p ON ua.user_id = p.id
LEFT JOIN public.forum_posts fp ON ua.related_post_id = fp.id
LEFT JOIN public.social_posts sp ON ua.related_social_post_id = sp.id
LEFT JOIN public.forum_comments fc ON ua.related_comment_id = fc.id
LEFT JOIN public.social_comments sc ON ua.related_comment_id = sc.id
LEFT JOIN public.forum_post_reposts pr ON ua.related_repost_id = pr.id
LEFT JOIN public.forum_posts orig_fp ON pr.original_post_id = orig_fp.id
LEFT JOIN public.profiles orig_p ON orig_fp.author_id = orig_p.id

ORDER BY ua.id, ua.created_at DESC;

GRANT SELECT ON public.user_activity_feed TO authenticated, anon;
