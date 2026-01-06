-- =============================================
-- PROFESSIONAL REPOST SYSTEM
-- Separate reactions, comments for reposts and original posts
-- =============================================

-- 1. Create repost_reactions table (separate from post_reactions)
CREATE TABLE IF NOT EXISTS public.repost_reactions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  repost_id uuid NOT NULL, -- Links to post_reposts.id
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT repost_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT repost_reactions_repost_id_fkey FOREIGN KEY (repost_id) 
    REFERENCES public.post_reposts(id) ON DELETE CASCADE,
  CONSTRAINT repost_reactions_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT repost_reactions_unique UNIQUE (repost_id, user_id, reaction_type),
  CONSTRAINT repost_reactions_reaction_type_check CHECK (
    reaction_type = ANY (ARRAY['like'::text, 'helpful'::text, 'insightful'::text, 'celebrate'::text])
  )
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_repost_reactions_repost ON public.repost_reactions 
  USING btree (repost_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_repost_reactions_user ON public.repost_reactions 
  USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_repost_reactions_created ON public.repost_reactions 
  USING btree (created_at DESC) TABLESPACE pg_default;

-- 2. Create repost_comments table (separate from forum_comments)
CREATE TABLE IF NOT EXISTS public.repost_comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  repost_id uuid NOT NULL, -- Links to post_reposts.id
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT repost_comments_pkey PRIMARY KEY (id),
  CONSTRAINT repost_comments_repost_id_fkey FOREIGN KEY (repost_id) 
    REFERENCES public.post_reposts(id) ON DELETE CASCADE,
  CONSTRAINT repost_comments_author_id_fkey FOREIGN KEY (author_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_repost_comments_repost ON public.repost_comments 
  USING btree (repost_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_repost_comments_author ON public.repost_comments 
  USING btree (author_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_repost_comments_created ON public.repost_comments 
  USING btree (created_at DESC) TABLESPACE pg_default;

-- 3. Create repost_saves table (for saving reposts separately)
CREATE TABLE IF NOT EXISTS public.repost_saves (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  repost_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT repost_saves_pkey PRIMARY KEY (id),
  CONSTRAINT repost_saves_repost_id_fkey FOREIGN KEY (repost_id) 
    REFERENCES public.post_reposts(id) ON DELETE CASCADE,
  CONSTRAINT repost_saves_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT repost_saves_unique UNIQUE (repost_id, user_id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_repost_saves_repost ON public.repost_saves 
  USING btree (repost_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_repost_saves_user ON public.repost_saves 
  USING btree (user_id) TABLESPACE pg_default;

-- 4. Update post_shares table to track original_post_id properly
-- Add a column to distinguish if the share is from a repost or original post
ALTER TABLE public.post_shares 
  ADD COLUMN IF NOT EXISTS is_from_repost boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS repost_id uuid;

ALTER TABLE public.post_shares
  ADD CONSTRAINT post_shares_repost_id_fkey FOREIGN KEY (repost_id) 
    REFERENCES public.post_reposts(id) ON DELETE CASCADE;

-- 5. Update user_activities to track repost activities
-- Already has 'repost' in activity_type_check, but let's ensure share_repost is added
ALTER TABLE public.user_activities 
  DROP CONSTRAINT IF EXISTS user_activities_type_check;

ALTER TABLE public.user_activities
  ADD CONSTRAINT user_activities_type_check CHECK (
    activity_type = ANY (ARRAY[
      'post'::text,
      'comment'::text,
      'reaction'::text,
      'share'::text,
      'repost'::text,
      'repost_reaction'::text,
      'repost_comment'::text,
      'repost_share'::text,
      'experience_added'::text,
      'education_added'::text,
      'profile_update'::text
    ])
  );

-- Add columns to track repost-specific activities
ALTER TABLE public.user_activities
  ADD COLUMN IF NOT EXISTS related_repost_id uuid;

ALTER TABLE public.user_activities
  ADD CONSTRAINT user_activities_related_repost_id_fkey FOREIGN KEY (related_repost_id) 
    REFERENCES public.post_reposts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_activities_repost ON public.user_activities 
  USING btree (related_repost_id) TABLESPACE pg_default;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE public.repost_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repost_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repost_saves ENABLE ROW LEVEL SECURITY;

-- Repost Reactions Policies
DROP POLICY IF EXISTS "Users can view all repost reactions" ON public.repost_reactions;
CREATE POLICY "Users can view all repost reactions" ON public.repost_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own repost reactions" ON public.repost_reactions;
CREATE POLICY "Users can create their own repost reactions" ON public.repost_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own repost reactions" ON public.repost_reactions;
CREATE POLICY "Users can delete their own repost reactions" ON public.repost_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Repost Comments Policies
DROP POLICY IF EXISTS "Users can view all repost comments" ON public.repost_comments;
CREATE POLICY "Users can view all repost comments" ON public.repost_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own repost comments" ON public.repost_comments;
CREATE POLICY "Users can create their own repost comments" ON public.repost_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own repost comments" ON public.repost_comments;
CREATE POLICY "Users can update their own repost comments" ON public.repost_comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own repost comments" ON public.repost_comments;
CREATE POLICY "Users can delete their own repost comments" ON public.repost_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Repost Saves Policies
DROP POLICY IF EXISTS "Users can view all repost saves" ON public.repost_saves;
CREATE POLICY "Users can view all repost saves" ON public.repost_saves
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own repost saves" ON public.repost_saves;
CREATE POLICY "Users can create their own repost saves" ON public.repost_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own repost saves" ON public.repost_saves;
CREATE POLICY "Users can delete their own repost saves" ON public.repost_saves
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- UPDATE FEED VIEW FOR PROFESSIONAL REPOSTS
-- =============================================

DROP VIEW IF EXISTS public.feed_posts_view CASCADE;

CREATE VIEW public.feed_posts_view AS
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
        'post' as item_type,
        NULL::uuid as reposter_id,
        NULL::text as reposter_name,
        NULL::text as reposter_avatar,
        NULL::text as reposter_title,
        NULL::uuid as repost_record_id
    FROM public.forum_posts fp
    LEFT JOIN public.profiles p ON fp.author_id = p.id
    LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id

    UNION ALL

    -- Reposts (with separate counts)
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
        'repost' as item_type,
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
    -- Original post counts (always from main post)
    (SELECT COUNT(*) FROM public.forum_comments WHERE post_id = bp.id) as original_comment_count,
    (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = bp.id) as original_like_count,
    (SELECT COUNT(*) FROM public.post_shares WHERE post_id = bp.id AND is_from_repost = false) as original_share_count,
    (SELECT COUNT(*) FROM public.post_reposts WHERE original_post_id = bp.id) as repost_count,
    
    -- Repost-specific counts (only for reposts)
    CASE 
        WHEN bp.item_type = 'repost' THEN (SELECT COUNT(*) FROM public.repost_comments WHERE repost_id = bp.repost_record_id)
        ELSE 0
    END as repost_comment_count,
    CASE 
        WHEN bp.item_type = 'repost' THEN (SELECT COUNT(*) FROM public.repost_reactions WHERE repost_id = bp.repost_record_id)
        ELSE 0
    END as repost_like_count,
    CASE 
        WHEN bp.item_type = 'repost' THEN (SELECT COUNT(*) FROM public.post_shares WHERE repost_id = bp.repost_record_id AND is_from_repost = true)
        ELSE 0
    END as repost_share_count,
    
    -- User interaction states for original post
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.post_reactions pr 
      WHERE pr.post_id = bp.id AND pr.user_id = auth.uid())), false) as original_is_liked,
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.post_saves ps 
      WHERE ps.post_id = bp.id AND ps.user_id = auth.uid())), false) as original_is_saved,
    
    -- User interaction states for repost (only if it's a repost)
    CASE 
        WHEN bp.item_type = 'repost' THEN COALESCE((SELECT EXISTS(SELECT 1 FROM public.repost_reactions rr 
          WHERE rr.repost_id = bp.repost_record_id AND rr.user_id = auth.uid())), false)
        ELSE false
    END as repost_is_liked,
    CASE 
        WHEN bp.item_type = 'repost' THEN COALESCE((SELECT EXISTS(SELECT 1 FROM public.repost_saves rs 
          WHERE rs.repost_id = bp.repost_record_id AND rs.user_id = auth.uid())), false)
        ELSE false
    END as repost_is_saved,
    
    -- Following status
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.user_follows uf 
      WHERE uf.following_id = bp.author_id AND uf.follower_id = auth.uid())), false) as is_following
FROM base_posts bp;

GRANT SELECT ON public.feed_posts_view TO authenticated, anon;

-- =============================================
-- TRIGGERS FOR ACTIVITY TRACKING
-- =============================================

-- Function to log repost reactions
CREATE OR REPLACE FUNCTION log_repost_reaction_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    activity_data,
    related_repost_id
  ) VALUES (
    NEW.user_id,
    'repost_reaction',
    jsonb_build_object('reaction_type', NEW.reaction_type),
    NEW.repost_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_repost_reaction ON public.repost_reactions;
CREATE TRIGGER trigger_log_repost_reaction
  AFTER INSERT ON public.repost_reactions
  FOR EACH ROW
  EXECUTE FUNCTION log_repost_reaction_activity();

-- Function to log repost comments
CREATE OR REPLACE FUNCTION log_repost_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    activity_data,
    related_repost_id
  ) VALUES (
    NEW.author_id,
    'repost_comment',
    jsonb_build_object('content_preview', LEFT(NEW.content, 100)),
    NEW.repost_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_repost_comment ON public.repost_comments;
CREATE TRIGGER trigger_log_repost_comment
  AFTER INSERT ON public.repost_comments
  FOR EACH ROW
  EXECUTE FUNCTION log_repost_comment_activity();

-- Function to log repost shares
CREATE OR REPLACE FUNCTION log_repost_share_activity()
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

DROP TRIGGER IF EXISTS trigger_log_repost_share ON public.post_shares;
CREATE TRIGGER trigger_log_repost_share
  AFTER INSERT ON public.post_shares
  FOR EACH ROW
  EXECUTE FUNCTION log_repost_share_activity();

-- Function to log initial repost action
CREATE OR REPLACE FUNCTION log_repost_activity()
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

DROP TRIGGER IF EXISTS trigger_log_repost_activity ON public.post_reposts;
CREATE TRIGGER trigger_log_repost_activity
  AFTER INSERT ON public.post_reposts
  FOR EACH ROW
  EXECUTE FUNCTION log_repost_activity();

DROP VIEW IF EXISTS public.user_activity_feed CASCADE;

-- Update user_activity_feed view to include repost info
CREATE OR REPLACE VIEW public.user_activity_feed AS
SELECT 
  ua.id as activity_id,
  ua.user_id,
  ua.activity_type,
  ua.created_at,
  ua.related_post_id,
  ua.related_comment_id,
  ua.related_repost_id,
  ua.activity_data,
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  p.job_title as user_job_title,
  -- Post data (works for post, comment, and repost types)
  COALESCE(fp.title, (ua.activity_data->>'title')) as post_title,
  COALESCE(fp.content, (ua.activity_data->>'content_preview')) as post_content,
  COALESCE(fp.slug, (ua.activity_data->>'slug')) as post_slug,
  -- Comment data if available
  fc.content as comment_content,
  -- Repost specific info
  pr.original_post_id as repost_original_id,
  orig_p.full_name as original_author_name,
  orig_p.avatar_url as original_author_avatar
FROM public.user_activities ua
LEFT JOIN public.profiles p ON ua.user_id = p.id
LEFT JOIN public.forum_posts fp ON ua.related_post_id = fp.id
LEFT JOIN public.forum_comments fc ON ua.related_comment_id = fc.id
LEFT JOIN public.post_reposts pr ON ua.related_repost_id = pr.id
LEFT JOIN public.forum_posts orig_fp ON pr.original_post_id = orig_fp.id
LEFT JOIN public.profiles orig_p ON orig_fp.author_id = orig_p.id
ORDER BY ua.created_at DESC;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.repost_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repost_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repost_saves TO authenticated;
GRANT SELECT ON public.repost_reactions TO anon;
GRANT SELECT ON public.repost_comments TO anon;
GRANT SELECT ON public.repost_saves TO anon;
