-- =============================================
-- FINAL REFINED ACTIVITY SYSTEM
-- Matches user provided schema + enhanced view
-- =============================================

-- 1. Ensure user_activities table structure matches request
-- (Using ALTER statements to avoid dropping data)
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_activities' AND column_name='related_repost_id') THEN
        ALTER TABLE public.user_activities ADD COLUMN related_repost_id uuid;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_activities' AND column_name='related_social_post_id') THEN
        ALTER TABLE public.user_activities ADD COLUMN related_social_post_id uuid;
    END IF;
END $$;

-- Update Constraints
ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_type_check;
ALTER TABLE public.user_activities 
ADD CONSTRAINT user_activities_type_check 
CHECK (activity_type IN ('post', 'comment', 'follow', 'join', 'project', 'like', 'repost', 'social_post', 'article'))
NOT VALID;

-- Update Foreign Keys (Ensure they match requested cascade behavior)
ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_related_comment_id_fkey;
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_related_comment_id_fkey 
    FOREIGN KEY (related_comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE;

ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_related_post_id_fkey;
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_related_post_id_fkey 
    FOREIGN KEY (related_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;

ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_related_social_post_id_fkey;
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_related_social_post_id_fkey 
    FOREIGN KEY (related_social_post_id) REFERENCES social_posts(id) ON DELETE CASCADE;

ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_related_repost_id_fkey;
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_related_repost_id_fkey 
    FOREIGN KEY (related_repost_id) REFERENCES forum_post_reposts(id) ON DELETE CASCADE;

-- 2. Rebuild the Unified View (Robust & Comprehensive)
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
  
  -- Unified Post Data (Coalesce across all possible sources)
  COALESCE(fp.title, (ua.activity_data->>'title'), 'Social Update') as post_title,
  
  COALESCE(
    fp.content, 
    sp.content, 
    fc.content, 
    sc.content, 
    (ua.activity_data->>'content_preview'),
    (ua.activity_data->>'post_content')
  ) as post_content,
  
  COALESCE(fp.slug, sp.slug, (ua.activity_data->>'slug'), (ua.activity_data->>'post_slug')) as post_slug,
  
  -- Detailed Comment Content
  COALESCE(fc.content, sc.content, (ua.activity_data->>'comment_content')) as comment_content,
  
  -- Repost Metadata
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

ORDER BY ua.created_at DESC;

-- 3. Ensure Permissions
GRANT SELECT ON public.user_activity_feed TO authenticated, anon;
