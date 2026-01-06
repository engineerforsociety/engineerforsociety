-- =============================================
-- ULTIMATE ACTIVITY SYSTEM REPAIR
-- Ensures no duplicates, correct sorting, and data visibility
-- =============================================

-- 1. Ensure related_social_post_id column exists (safety check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_activities' AND column_name='related_social_post_id') THEN
        ALTER TABLE public.user_activities ADD COLUMN related_social_post_id uuid;
    END IF;
END $$;

-- 2. Clean up any corrupted activity data (orphans)
-- (Optional but helpful for performance)

-- 3. Update the Feed View (Optimized and Robust)
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
  
  -- User Info (The person who performed the activity)
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  p.job_title as user_job_title,
  
  -- Unified Post Metadata
  -- If it's a forum post (fp), use its title. If social (sp), use a generic label.
  COALESCE(fp.title, (ua.activity_data->>'title'), 'Social Update') as post_title,
  
  -- Priority of content: 
  -- 1. Forum Post Content
  -- 2. Social Post Content
  -- 3. Comment Content (if activity is a comment)
  -- 4. Cached content in activity_data (fallback)
  COALESCE(
    fp.content, 
    sp.content, 
    fc.content, 
    sc.content, 
    (ua.activity_data->>'content_preview')
  ) as post_content,
  
  -- Unified Slug
  COALESCE(fp.slug, sp.slug, (ua.activity_data->>'slug')) as post_slug,
  
  -- Comment Specific (Legacy field for ActivityCard)
  COALESCE(fc.content, sc.content) as comment_content,
  
  -- Repost Source Info
  orig_p.full_name as original_author_name,
  orig_p.avatar_url as original_author_avatar

FROM public.user_activities ua
JOIN public.profiles p ON ua.user_id = p.id -- INNER JOIN to ensure we only see activities from valid users

-- JOINS (Using LEFT JOIN to ensure activity shows even if post was deleted)
LEFT JOIN public.forum_posts fp ON ua.related_post_id = fp.id
LEFT JOIN public.social_posts sp ON ua.related_social_post_id = sp.id
LEFT JOIN public.forum_comments fc ON ua.related_comment_id = fc.id
LEFT JOIN public.social_comments sc ON ua.related_comment_id = sc.id

-- Repost Joins
LEFT JOIN public.forum_post_reposts pr ON ua.related_repost_id = pr.id
LEFT JOIN public.forum_posts orig_fp ON pr.original_post_id = orig_fp.id
LEFT JOIN public.profiles orig_p ON orig_fp.author_id = orig_p.id;

-- 4. Re-Grant Permissions
GRANT SELECT ON public.user_activity_feed TO authenticated, anon;

-- 5. Fix Triggers to be Bulletproof (Idempotent)
CREATE OR REPLACE FUNCTION public.sync_social_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for existing to prevent duplicates
  IF NOT EXISTS (SELECT 1 FROM public.user_activities WHERE related_social_post_id = NEW.id) THEN
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_social_post_activity ON public.social_posts;
CREATE TRIGGER trigger_sync_social_post_activity
  AFTER INSERT ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_social_post_activity();

CREATE OR REPLACE FUNCTION public.sync_forum_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_activities WHERE related_post_id = NEW.id) THEN
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_forum_post_activity ON public.forum_posts;
CREATE TRIGGER trigger_sync_forum_post_activity
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_forum_post_activity();

-- 6. Comment Syncing
CREATE OR REPLACE FUNCTION public.sync_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_activities WHERE related_comment_id = NEW.id) THEN
    INSERT INTO public.user_activities (user_id, activity_type, related_comment_id, related_post_id, activity_data)
    VALUES (
      NEW.author_id,
      'comment',
      NEW.id,
      COALESCE(NEW.post_id), -- for forum_comments it's post_id
      jsonb_build_object('content_preview', LEFT(NEW.content, 100))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Forum Comments
DROP TRIGGER IF EXISTS trigger_sync_forum_comment_activity ON public.forum_comments;
CREATE TRIGGER trigger_sync_forum_comment_activity
  AFTER INSERT ON public.forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_comment_activity();

-- Social Comments (Assuming sc has post_id or related_social_post_id)
-- Note: Adjust based on actual social_comments schema if needed
CREATE OR REPLACE FUNCTION public.sync_social_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_activities WHERE related_comment_id = NEW.id) THEN
    INSERT INTO public.user_activities (user_id, activity_type, related_comment_id, related_social_post_id, activity_data)
    VALUES (
      NEW.author_id,
      'comment',
      NEW.id,
      NEW.post_id,
      jsonb_build_object('content_preview', LEFT(NEW.content, 100))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_social_comment_activity ON public.social_comments;
CREATE TRIGGER trigger_sync_social_comment_activity
  AFTER INSERT ON public.social_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_social_comment_activity();

