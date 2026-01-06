-- =============================================
-- SOCIAL POSTS FEATURE SCHEMA
-- Separating normal posts from forum discussions
-- =============================================

-- Social Posts Table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  author_id uuid NOT NULL,
  content text NOT NULL,
  slug text NOT NULL, -- To maintain consistent routing
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_posts_pkey PRIMARY KEY (id),
  CONSTRAINT social_posts_slug_key UNIQUE (slug),
  CONSTRAINT social_posts_author_id_fkey FOREIGN KEY (author_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_social_posts_author ON public.social_posts USING btree (author_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON public.social_posts USING btree (created_at DESC) TABLESPACE pg_default;

-- Social Comments Table
CREATE TABLE IF NOT EXISTS public.social_comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_comments_pkey PRIMARY KEY (id),
  CONSTRAINT social_comments_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.social_posts(id) ON DELETE CASCADE,
  CONSTRAINT social_comments_author_id_fkey FOREIGN KEY (author_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_social_comments_post ON public.social_comments USING btree (post_id) TABLESPACE pg_default;

-- Social Post Reactions
CREATE TABLE IF NOT EXISTS public.social_post_reactions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_post_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT social_post_reactions_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.social_posts(id) ON DELETE CASCADE,
  CONSTRAINT social_post_reactions_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT social_post_reactions_unique UNIQUE (post_id, user_id, reaction_type)
) TABLESPACE pg_default;

-- Social Post Saves
CREATE TABLE IF NOT EXISTS public.social_post_saves (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT social_post_saves_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.social_posts(id) ON DELETE CASCADE,
  CONSTRAINT social_post_saves_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT social_post_saves_unique UNIQUE (post_id, user_id)
) TABLESPACE pg_default;

-- Social Post Shares
CREATE TABLE IF NOT EXISTS public.social_post_shares (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  share_type text NOT NULL DEFAULT 'feed',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_post_shares_pkey PRIMARY KEY (id),
  CONSTRAINT social_post_shares_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.social_posts(id) ON DELETE CASCADE,
  CONSTRAINT social_post_shares_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- RLS Enablement
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_shares ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Viewable by all, editable by owner)
CREATE POLICY "Public Social Posts are viewable by everyone" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own social posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own social posts" ON public.social_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own social posts" ON public.social_posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Social comments are viewable by everyone" ON public.social_comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own social comments" ON public.social_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Social reactions are viewable by everyone" ON public.social_post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own social reactions" ON public.social_post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own social reactions" ON public.social_post_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Social saves are viewable by owner" ON public.social_post_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their social saves" ON public.social_post_saves FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- LOGGING SOCIAL ACTIVITIES
-- =============================================

-- Add social post related columns to user_activities
ALTER TABLE public.user_activities ADD COLUMN IF NOT EXISTS related_social_post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE;

-- Function to create activity for social post
CREATE OR REPLACE FUNCTION public.create_social_post_activity()
RETURNS TRIGGER AS $$
BEGIN
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

-- =============================================
-- UPDATE FEED VIEW (MERGE BOTH)
-- =============================================

DROP VIEW IF EXISTS public.feed_posts_view CASCADE;

CREATE OR REPLACE VIEW public.feed_posts_view AS
WITH all_posts AS (
    -- Forum Posts
    SELECT 
        id,
        id as feed_item_id,
        title,
        content,
        tags,
        created_at,
        created_at as feed_created_at,
        view_count,
        is_pinned,
        slug,
        author_id,
        'forum'::text as post_type,
        'post'::text as item_type,
        NULL::uuid as reposter_id,
        NULL::text as reposter_name,
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
        NULL::text as reposter_name,
        NULL::uuid as repost_record_id
    FROM public.social_posts

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
        fp.author_id,
        'forum'::text as post_type, -- Reposting a forum post
        'repost'::text as item_type,
        pr.reposter_id,
        p_reposter.full_name as reposter_name,
        pr.id as repost_record_id
    FROM public.post_reposts pr
    JOIN public.forum_posts fp ON pr.original_post_id = fp.id
    LEFT JOIN public.profiles p_reposter ON pr.reposter_id = p_reposter.id
)
SELECT 
    ap.*,
    p.full_name as author_name,
    p.avatar_url as author_avatar,
    p.job_title as author_title,
    -- Stats calculation (Generic based on post_type)
    CASE 
        WHEN ap.post_type = 'forum' THEN (SELECT COUNT(*) FROM public.forum_comments WHERE post_id = ap.id)
        WHEN ap.post_type = 'social' THEN (SELECT COUNT(*) FROM public.social_comments WHERE post_id = ap.id)
        ELSE 0
    END as comment_count,
    CASE 
        WHEN ap.post_type = 'forum' THEN (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = ap.id)
        WHEN ap.post_type = 'social' THEN (SELECT COUNT(*) FROM public.social_post_reactions WHERE post_id = ap.id)
        ELSE 0
    END as like_count,
    -- Interaction states
    COALESCE(
        CASE 
            WHEN ap.post_type = 'forum' THEN EXISTS(SELECT 1 FROM public.post_reactions r WHERE r.post_id = ap.id AND r.user_id = auth.uid())
            WHEN ap.post_type = 'social' THEN EXISTS(SELECT 1 FROM public.social_post_reactions r WHERE r.post_id = ap.id AND r.user_id = auth.uid())
            ELSE false
        END, false) as is_liked,
    COALESCE(
        CASE 
            WHEN ap.post_type = 'forum' THEN EXISTS(SELECT 1 FROM public.post_saves ps WHERE ps.post_id = ap.id AND ps.user_id = auth.uid())
            WHEN ap.post_type = 'social' THEN EXISTS(SELECT 1 FROM public.social_post_saves ps WHERE ps.post_id = ap.id AND ps.user_id = auth.uid())
            ELSE false
        END, false) as is_saved
FROM all_posts ap
LEFT JOIN public.profiles p ON ap.author_id = p.id;

GRANT SELECT ON public.feed_posts_view TO authenticated, anon;
