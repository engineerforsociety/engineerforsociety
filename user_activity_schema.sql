-- =============================================
-- USER ACTIVITY TRACKING SCHEMA
-- For LinkedIn-style activity feed on profile
-- =============================================

-- User Activity Table
-- Tracks all user activities: posts, comments, reactions, shares, reposts
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL, -- 'post', 'comment', 'reaction', 'share', 'repost', 'experience_added', 'education_added'
  activity_data jsonb NULL, -- Flexible JSON to store activity-specific data
  related_post_id uuid NULL, -- If activity is related to a post
  related_comment_id uuid NULL, -- If activity is related to a comment
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_activities_pkey PRIMARY KEY (id),
  CONSTRAINT user_activities_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_activities_related_post_id_fkey FOREIGN KEY (related_post_id) 
    REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT user_activities_related_comment_id_fkey FOREIGN KEY (related_comment_id) 
    REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  CONSTRAINT user_activities_type_check CHECK (
    activity_type IN ('post', 'comment', 'reaction', 'share', 'repost', 'experience_added', 'education_added', 'profile_update')
  )
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_user_activities_user ON public.user_activities 
  USING btree (user_id, created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities 
  USING btree (activity_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_activities_post ON public.user_activities 
  USING btree (related_post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_activities_created ON public.user_activities 
  USING btree (created_at DESC) TABLESPACE pg_default;

-- Row Level Security
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view all activities" ON public.user_activities;
CREATE POLICY "Users can view all activities" ON public.user_activities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can create activities" ON public.user_activities;
CREATE POLICY "System can create activities" ON public.user_activities
  FOR INSERT WITH CHECK (true); -- Will be controlled by triggers

-- Grant permissions
GRANT SELECT ON public.user_activities TO authenticated, anon;
GRANT INSERT ON public.user_activities TO authenticated;

-- =============================================
-- TRIGGERS TO AUTO-CREATE ACTIVITIES
-- =============================================

-- Function to create activity when post is created
CREATE OR REPLACE FUNCTION public.create_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, related_post_id, activity_data)
  VALUES (
    NEW.author_id,
    'post',
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'content_preview', LEFT(NEW.content, 200),
      'slug', NEW.slug
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new posts
DROP TRIGGER IF EXISTS trigger_create_post_activity ON public.forum_posts;
CREATE TRIGGER trigger_create_post_activity
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_post_activity();

-- Function to create activity when comment is created
CREATE OR REPLACE FUNCTION public.create_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, related_post_id, related_comment_id, activity_data)
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

-- Trigger for new comments
DROP TRIGGER IF EXISTS trigger_create_comment_activity ON public.forum_comments;
CREATE TRIGGER trigger_create_comment_activity
  AFTER INSERT ON public.forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_activity();

-- Function to create activity when experience is added
CREATE OR REPLACE FUNCTION public.create_experience_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, activity_data)
  VALUES (
    NEW.profile_id,
    'experience_added',
    jsonb_build_object(
      'title', NEW.title,
      'company', NEW.company_name
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new experiences
DROP TRIGGER IF EXISTS trigger_create_experience_activity ON public.experiences;
CREATE TRIGGER trigger_create_experience_activity
  AFTER INSERT ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.create_experience_activity();

-- Function to create activity when education is added
CREATE OR REPLACE FUNCTION public.create_education_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, activity_data)
  VALUES (
    NEW.profile_id,
    'education_added',
    jsonb_build_object(
      'school', NEW.school_name,
      'degree', NEW.degree
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new educations
DROP TRIGGER IF EXISTS trigger_create_education_activity ON public.educations;
CREATE TRIGGER trigger_create_education_activity
  AFTER INSERT ON public.educations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_education_activity();

-- =============================================
-- VIEW FOR USER ACTIVITY FEED
-- =============================================

CREATE OR REPLACE VIEW public.user_activity_feed AS
SELECT 
  ua.id,
  ua.user_id,
  ua.activity_type,
  ua.created_at,
  ua.related_post_id,
  ua.related_comment_id,
  ua.activity_data,
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  p.job_title as user_job_title,
  -- Post data if available
  fp.title as post_title,
  fp.content as post_content,
  fp.slug as post_slug,
  -- Comment data if available
  fc.content as comment_content
FROM public.user_activities ua
LEFT JOIN public.profiles p ON ua.user_id = p.id
LEFT JOIN public.forum_posts fp ON ua.related_post_id = fp.id
LEFT JOIN public.forum_comments fc ON ua.related_comment_id = fc.id
ORDER BY ua.created_at DESC;

-- Grant access
GRANT SELECT ON public.user_activity_feed TO authenticated, anon;

