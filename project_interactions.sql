
/* 
  SQL for Project Interactions: Likes, Comments (with Replies), and Shares
*/

-- 1. Project Likes
CREATE TABLE IF NOT EXISTS public.project_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, user_id)
);

-- 2. Project Comments
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE, -- For replies
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Project Shares (Optional Logging)
CREATE TABLE IF NOT EXISTS public.project_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- can be null if guest
    share_platform TEXT, -- e.g., 'copy-link', 'twitter', 'facebook'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Project Likes Policies
CREATE POLICY "Allow public read-access to project likes" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to like projects" ON public.project_likes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow users to unlike their own likes" ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- Project Comments Policies
CREATE POLICY "Allow public read-access to project comments" ON public.project_comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to comment" ON public.project_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow users to update their own comments" ON public.project_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own comments" ON public.project_comments FOR DELETE USING (auth.uid() = user_id);

-- Project Shares Policies
CREATE POLICY "Allow public recording of shares" ON public.project_shares FOR INSERT WITH CHECK (true);

-- Functions to get interaction counts efficiently
CREATE OR REPLACE FUNCTION get_project_stats(p_id UUID)
RETURNS TABLE (likes_count BIGINT, comments_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.project_likes WHERE project_id = p_id),
        (SELECT COUNT(*) FROM public.project_comments WHERE project_id = p_id);
END;
$$ LANGUAGE plpgsql;
