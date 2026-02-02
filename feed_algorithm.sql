/* 
  Smart Feed System: Seen Posts Tracking
*/

CREATE TABLE IF NOT EXISTS public.user_seen_posts (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL, -- Generic ID for forum, social, resource
    post_type TEXT NOT NULL, -- 'forum', 'social', 'resource'
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, post_id)
);

-- Index for fast filtering by user and time
CREATE INDEX IF NOT EXISTS idx_user_seen_posts_user_time ON public.user_seen_posts(user_id, seen_at);

-- RLS Policies
ALTER TABLE public.user_seen_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own seen records" 
ON public.user_seen_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own seen records" 
ON public.user_seen_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own seen records" 
ON public.user_seen_posts 
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to upsert seen record (update time if already exists)
CREATE OR REPLACE FUNCTION mark_post_seen(p_user_id UUID, p_post_id UUID, p_post_type TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_seen_posts (user_id, post_id, post_type, seen_at)
    VALUES (p_user_id, p_post_id, p_post_type, now())
    ON CONFLICT (user_id, post_id) 
    DO UPDATE SET seen_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
