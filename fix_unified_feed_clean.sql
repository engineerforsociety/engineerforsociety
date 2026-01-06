-- ==========================================================
-- FINAL CLEAN UNIFIED FEED VIEW & ACTIVITY LOGGING
-- ==========================================================

-- 1. Ensure Social Tables exist
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_posts_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.social_comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_comments_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.social_post_reactions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_post_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT social_post_reactions_unique UNIQUE (post_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS public.social_post_saves (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT social_post_saves_unique UNIQUE (post_id, user_id)
);

-- 2. Activity Consistency
ALTER TABLE public.user_activities ADD COLUMN IF NOT EXISTS related_social_post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.log_activity_unified()
RETURNS TRIGGER AS $$
DECLARE
    target_author_id uuid;
    target_activity_type text;
    target_data jsonb;
BEGIN
    IF TG_TABLE_NAME = 'forum_posts' THEN
        target_author_id := NEW.author_id;
        target_activity_type := 'post';
        target_data := jsonb_build_object('title', NEW.title, 'slug', NEW.slug);
        
        INSERT INTO public.user_activities (user_id, activity_type, activity_data, related_post_id)
        VALUES (target_author_id, target_activity_type, target_data, NEW.id);
        
    ELSIF TG_TABLE_NAME = 'social_posts' THEN
        target_author_id := NEW.author_id;
        target_activity_type := 'social_post';
        target_data := jsonb_build_object('content_preview', LEFT(NEW.content, 100), 'slug', NEW.slug);
        
        INSERT INTO public.user_activities (user_id, activity_type, activity_data, related_social_post_id)
        VALUES (target_author_id, target_activity_type, target_data, NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_forum_post_activity ON public.forum_posts;
CREATE TRIGGER trigger_forum_post_activity
    AFTER INSERT ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION public.log_activity_unified();

DROP TRIGGER IF EXISTS trigger_social_post_activity ON public.social_posts;
CREATE TRIGGER trigger_social_post_activity
    AFTER INSERT ON public.social_posts
    FOR EACH ROW EXECUTE FUNCTION public.log_activity_unified();

-- 3. MASTER UNIFIED VIEW (Strict One-Pass)
DROP VIEW IF EXISTS public.feed_posts_view CASCADE;

CREATE OR REPLACE VIEW public.feed_posts_view 
WITH (security_invoker = true) AS
WITH all_unified_items AS (
    -- Forum Posts
    SELECT 
        id,
        id as feed_item_id,
        title,
        content,
        tags,
        created_at,
        created_at as feed_created_at,
        COALESCE(view_count, 0) as view_count,
        COALESCE(is_pinned, false) as is_pinned,
        slug,
        author_id,
        'forum'::text as post_type,
        'post'::text as item_type,
        NULL::uuid as reposter_id,
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
        NULL::uuid as repost_record_id
    FROM public.social_posts

    UNION ALL

    -- Reposts
    SELECT 
        COALESCE(fp.id, sp.id) as id,
        pr.id as feed_item_id,
        fp.title as title,
        COALESCE(fp.content, sp.content) as content,
        fp.tags as tags,
        COALESCE(fp.created_at, sp.created_at) as created_at,
        pr.created_at as feed_created_at,
        COALESCE(fp.view_count, 0) as view_count,
        false as is_pinned,
        COALESCE(fp.slug, sp.slug) as slug,
        COALESCE(fp.author_id, sp.author_id) as author_id,
        CASE WHEN fp.id IS NOT NULL THEN 'forum' ELSE 'social' END::text as post_type,
        'repost'::text as item_type,
        pr.reposter_id,
        pr.id as repost_record_id
    FROM public.post_reposts pr
    LEFT JOIN public.forum_posts fp ON pr.original_post_id = fp.id
    LEFT JOIN public.social_posts sp ON pr.original_post_id = sp.id
)
SELECT 
    aui.*,
    p.full_name as author_name,
    p.avatar_url as author_avatar,
    p.job_title as author_title,
    p_reposter.full_name as reposter_name,
    p_reposter.avatar_url as reposter_avatar,
    p_reposter.job_title as reposter_title,
    
    -- Interaction Counts
    CASE 
        WHEN aui.item_type = 'repost' THEN (SELECT COUNT(*) FROM public.repost_reactions WHERE repost_id = aui.repost_record_id AND reaction_type = 'like')
        WHEN aui.post_type = 'forum' THEN (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = aui.id AND reaction_type = 'like')
        WHEN aui.post_type = 'social' THEN (SELECT COUNT(*) FROM public.social_post_reactions WHERE post_id = aui.id AND reaction_type = 'like')
        ELSE 0
    END as like_count,

    CASE 
        WHEN aui.item_type = 'repost' THEN (SELECT COUNT(*) FROM public.repost_comments WHERE repost_id = aui.repost_record_id)
        WHEN aui.post_type = 'forum' THEN (SELECT COUNT(*) FROM public.forum_comments WHERE post_id = aui.id)
        WHEN aui.post_type = 'social' THEN (SELECT COUNT(*) FROM public.social_comments WHERE post_id = aui.id)
        ELSE 0
    END as comment_count,

    -- Auth States
    COALESCE(
        CASE 
            WHEN aui.item_type = 'repost' THEN EXISTS(SELECT 1 FROM public.repost_reactions WHERE repost_id = aui.repost_record_id AND user_id = auth.uid())
            WHEN aui.post_type = 'forum' THEN EXISTS(SELECT 1 FROM public.post_reactions WHERE post_id = aui.id AND user_id = auth.uid())
            WHEN aui.post_type = 'social' THEN EXISTS(SELECT 1 FROM public.social_post_reactions WHERE post_id = aui.id AND user_id = auth.uid())
            ELSE false
        END, false) as is_liked,

    COALESCE(
        CASE 
            WHEN aui.item_type = 'repost' THEN EXISTS(SELECT 1 FROM public.repost_saves WHERE repost_id = aui.repost_record_id AND user_id = auth.uid())
            WHEN aui.post_type = 'forum' THEN EXISTS(SELECT 1 FROM public.post_saves WHERE post_id = aui.id AND user_id = auth.uid())
            WHEN aui.post_type = 'social' THEN EXISTS(SELECT 1 FROM public.social_post_saves WHERE post_id = aui.id AND user_id = auth.uid())
            ELSE false
        END, false) as is_saved,
    
    COALESCE(EXISTS(SELECT 1 FROM public.user_follows WHERE following_id = aui.author_id AND follower_id = auth.uid()), false) as is_following

FROM all_unified_items aui
LEFT JOIN public.profiles p ON aui.author_id = p.id
LEFT JOIN public.profiles p_reposter ON aui.reposter_id = p_reposter.id;

GRANT SELECT ON public.feed_posts_view TO authenticated, anon;
