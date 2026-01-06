-- =============================================
-- ROBUST ACTIVITY SYSTEM UPDATE (FIXED TABLE NAMES)
-- =============================================

-- 1. Ensure Activity Types are Valid
ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_type_check;
ALTER TABLE public.user_activities
ADD CONSTRAINT user_activities_type_check 
CHECK (activity_type IN ('post', 'comment', 'follow', 'join', 'project', 'like', 'repost', 'social_post'))
NOT VALID;

-- 2. Trigger for FORUM POSTS (Activity Type: 'post')
CREATE OR REPLACE FUNCTION public.create_forum_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, related_post_id, activity_data)
  VALUES (
    NEW.author_id,
    'post', -- 'post' will represent Forum Posts for legacy/compatibility
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'slug', NEW.slug
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_forum_post_activity ON public.forum_posts;
CREATE TRIGGER trigger_create_forum_post_activity
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_forum_post_activity();

-- 3. Trigger for FORUM COMMENTS (Activity Type: 'comment')
CREATE OR REPLACE FUNCTION public.create_forum_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, related_comment_id, related_post_id, activity_data)
  VALUES (
    NEW.author_id,
    'comment',
    NEW.id,
    NEW.post_id,
    jsonb_build_object('content_preview', LEFT(NEW.content, 100))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_forum_comment_activity ON public.forum_comments;
CREATE TRIGGER trigger_create_forum_comment_activity
  AFTER INSERT ON public.forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_forum_comment_activity();


-- 4. Re-Define User Activity Feed View to handle all types gracefully
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

-- Joins for Forum Posts
LEFT JOIN public.forum_posts fp ON ua.related_post_id = fp.id

-- Joins for Social Posts
LEFT JOIN public.social_posts sp ON ua.related_social_post_id = sp.id

-- Joins for Comments (Forum & Social)
LEFT JOIN public.forum_comments fc ON ua.related_comment_id = fc.id
LEFT JOIN public.social_comments sc ON ua.related_comment_id = sc.id

-- Joins for Reposts
-- FIXED: Changed 'public.post_reposts' to 'public.forum_post_reposts'
LEFT JOIN public.forum_post_reposts pr ON ua.related_repost_id = pr.id
LEFT JOIN public.forum_posts orig_fp ON pr.original_post_id = orig_fp.id
LEFT JOIN public.profiles orig_p ON orig_fp.author_id = orig_p.id

ORDER BY ua.created_at DESC;

GRANT SELECT ON public.user_activity_feed TO authenticated, anon;
