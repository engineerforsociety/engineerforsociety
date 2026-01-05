
-- =============================================
-- FORUM COMMENTS SCHEMA
-- =============================================

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
  CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) 
    REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  CONSTRAINT forum_comments_author_id_fkey FOREIGN KEY (author_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments 
  USING btree (post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON public.forum_comments 
  USING btree (author_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_forum_comments_created ON public.forum_comments 
  USING btree (created_at ASC) TABLESPACE pg_default;

-- Increment Post View RPC
CREATE OR REPLACE FUNCTION public.increment_post_view(post_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.forum_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for Comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.forum_comments;
CREATE POLICY "Anyone can view comments" ON public.forum_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.forum_comments;
CREATE POLICY "Authenticated users can create comments" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.forum_comments;
CREATE POLICY "Users can update their own comments" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.forum_comments;
CREATE POLICY "Users can delete their own comments" ON public.forum_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_comments TO authenticated;
GRANT SELECT ON public.forum_comments TO anon;
