-- =============================================
-- FORUM POST FEATURES SCHEMA
-- Reactions, Saves, Shares, and Follows
-- =============================================

-- Post Reactions (Likes)
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'like', -- 'like', 'love', 'celebrate', etc.
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT post_reactions_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT post_reactions_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT post_reactions_unique UNIQUE (post_id, user_id, reaction_type)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions 
  USING btree (post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON public.post_reactions 
  USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_reactions_created ON public.post_reactions 
  USING btree (created_at DESC) TABLESPACE pg_default;

-- Post Saves (Bookmarks)
CREATE TABLE IF NOT EXISTS public.post_saves (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT post_saves_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT post_saves_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT post_saves_unique UNIQUE (post_id, user_id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_post_saves_post ON public.post_saves 
  USING btree (post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON public.post_saves 
  USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_saves_created ON public.post_saves 
  USING btree (created_at DESC) TABLESPACE pg_default;

-- Post Shares (Tracking shares)
CREATE TABLE IF NOT EXISTS public.post_shares (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  share_type text NOT NULL DEFAULT 'feed', -- 'feed', 'message', 'external'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_shares_pkey PRIMARY KEY (id),
  CONSTRAINT post_shares_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT post_shares_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares 
  USING btree (post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_shares_user ON public.post_shares 
  USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_shares_created ON public.post_shares 
  USING btree (created_at DESC) TABLESPACE pg_default;

-- User Follows (For unfollow functionality)
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  follower_id uuid NOT NULL, -- User who is following
  following_id uuid NOT NULL, -- User being followed
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_follows_pkey PRIMARY KEY (id),
  CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_follows_unique UNIQUE (follower_id, following_id),
  CONSTRAINT user_follows_no_self_follow CHECK (follower_id != following_id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows 
  USING btree (follower_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows 
  USING btree (following_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_follows_created ON public.user_follows 
  USING btree (created_at DESC) TABLESPACE pg_default;

-- Row Level Security Policies
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Post Reactions Policies
DROP POLICY IF EXISTS "Users can view all reactions" ON public.post_reactions;
CREATE POLICY "Users can view all reactions" ON public.post_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own reactions" ON public.post_reactions;
CREATE POLICY "Users can create their own reactions" ON public.post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.post_reactions;
CREATE POLICY "Users can delete their own reactions" ON public.post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Post Saves Policies
DROP POLICY IF EXISTS "Users can view all saves" ON public.post_saves;
CREATE POLICY "Users can view all saves" ON public.post_saves
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own saves" ON public.post_saves;
CREATE POLICY "Users can create their own saves" ON public.post_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saves" ON public.post_saves;
CREATE POLICY "Users can delete their own saves" ON public.post_saves
  FOR DELETE USING (auth.uid() = user_id);

-- Post Shares Policies
DROP POLICY IF EXISTS "Users can view all shares" ON public.post_shares;
CREATE POLICY "Users can view all shares" ON public.post_shares
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own shares" ON public.post_shares;
CREATE POLICY "Users can create their own shares" ON public.post_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Follows Policies
DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;
CREATE POLICY "Users can view all follows" ON public.user_follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own follows" ON public.user_follows;
CREATE POLICY "Users can create their own follows" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete their own follows" ON public.user_follows;
CREATE POLICY "Users can delete their own follows" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Post Reposts (For reposting to own profile)
CREATE TABLE IF NOT EXISTS public.post_reposts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  original_post_id uuid NOT NULL,
  reposter_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_reposts_pkey PRIMARY KEY (id),
  CONSTRAINT post_reposts_unique UNIQUE (original_post_id, reposter_id),
  CONSTRAINT post_reposts_original_post_id_fkey FOREIGN KEY (original_post_id) 
    REFERENCES public.forum_posts (id) ON DELETE CASCADE,
  CONSTRAINT post_reposts_reposter_id_fkey FOREIGN KEY (reposter_id) 
    REFERENCES public.profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_post_reposts_original ON public.post_reposts USING btree (original_post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_reposts_reposter ON public.post_reposts USING btree (reposter_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_reposts_created ON public.post_reposts USING btree (created_at desc) TABLESPACE pg_default;

-- Row Level Security for Reposts
ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;

-- Post Reposts Policies
DROP POLICY IF EXISTS "Users can view all reposts" ON public.post_reposts;
CREATE POLICY "Users can view all reposts" ON public.post_reposts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own reposts" ON public.post_reposts;
CREATE POLICY "Users can create their own reposts" ON public.post_reposts
  FOR INSERT WITH CHECK (auth.uid() = reposter_id);

DROP POLICY IF EXISTS "Users can delete their own reposts" ON public.post_reposts;
CREATE POLICY "Users can delete their own reposts" ON public.post_reposts
  FOR DELETE USING (auth.uid() = reposter_id);

-- Update feed_posts_view to include original posts and reposts
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
        NULL::text as reposter_name
    FROM public.forum_posts fp
    LEFT JOIN public.profiles p ON fp.author_id = p.id
    LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id

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
        p_author.id as author_id,
        p_author.full_name as author_name,
        p_author.avatar_url as author_avatar,
        p_author.job_title as author_title,
        fc.name as category_name,
        fc.slug as category_slug,
        'repost' as item_type,
        pr.reposter_id,
        p_reposter.full_name as reposter_name
    FROM public.post_reposts pr
    JOIN public.forum_posts fp ON pr.original_post_id = fp.id
    LEFT JOIN public.profiles p_author ON fp.author_id = p_author.id
    LEFT JOIN public.profiles p_reposter ON pr.reposter_id = p_reposter.id
    LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id
)
SELECT 
    bp.*,
    (SELECT COUNT(*) FROM public.forum_comments WHERE post_id = bp.id) as comment_count,
    (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = bp.id) as like_count,
    (SELECT COUNT(*) FROM public.post_shares WHERE post_id = bp.id) as share_count,
    (SELECT COUNT(*) FROM public.post_reposts WHERE original_post_id = bp.id) as repost_count,
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.post_reactions pr 
      WHERE pr.post_id = bp.id AND pr.user_id = auth.uid())), false) as is_liked,
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.post_saves ps 
      WHERE ps.post_id = bp.id AND ps.user_id = auth.uid())), false) as is_saved,
    COALESCE((SELECT EXISTS(SELECT 1 FROM public.user_follows uf 
      WHERE uf.following_id = bp.author_id AND uf.follower_id = auth.uid())), false) as is_following
FROM base_posts bp;

-- Grant access to the updated view
GRANT SELECT ON public.feed_posts_view TO authenticated, anon;

