-- =============================================
-- CONSOLIDATED SOCIAL & FORUM SPLIT UPDATES
-- =============================================

-- 1. Ensure columns exist in user_activities
ALTER TABLE public.user_activities ADD COLUMN IF NOT EXISTS related_social_post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE;

-- 2. Update activity creation logic for social comments
CREATE OR REPLACE FUNCTION public.create_social_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, related_social_post_id, related_comment_id, activity_data)
  VALUES (
    NEW.author_id,
    'comment',
    NEW.post_id,
    NEW.id,
    jsonb_build_object(
      'content_preview', LEFT(NEW.content, 200)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_social_comment_activity ON public.social_comments;
CREATE TRIGGER trigger_create_social_comment_activity
  AFTER INSERT ON public.social_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_social_comment_activity();

-- 3. Update User Activity Feed View
DROP VIEW IF EXISTS public.user_activity_feed CASCADE;

CREATE OR REPLACE VIEW public.user_activity_feed AS
SELECT 
  ua.id,
  ua.user_id,
  ua.activity_type,
  ua.created_at,
  ua.related_post_id,
  ua.related_social_post_id,
  ua.related_comment_id,
  ua.activity_data,
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  p.job_title as user_job_title,
  -- Post data (consolidated from forum and social)
  COALESCE(fp.title, (ua.activity_data->>'title'), 'Social Update') as post_title,
  COALESCE(fp.content, sp.content) as post_content,
  COALESCE(fp.slug, sp.slug) as post_slug,
  -- Repost specific
  COALESCE(p_orig.full_name, (ua.activity_data->>'original_author_name')) as original_author_name,
  -- Comment
  COALESCE(fc.content, sc.content) as comment_content
FROM public.user_activities ua
LEFT JOIN public.profiles p ON ua.user_id = p.id
LEFT JOIN public.forum_posts fp ON ua.related_post_id = fp.id
LEFT JOIN public.social_posts sp ON ua.related_social_post_id = sp.id
LEFT JOIN public.forum_comments fc ON ua.related_comment_id = fc.id
LEFT JOIN public.social_comments sc ON ua.related_comment_id = sc.id
-- For reposts
LEFT JOIN public.post_reposts pr ON ua.related_post_id = pr.original_post_id AND ua.activity_type = 'repost'
LEFT JOIN public.profiles p_orig ON fp.author_id = p_orig.id
ORDER BY ua.created_at DESC;

GRANT SELECT ON public.user_activity_feed TO authenticated, anon;
