-- Enable RLS for social_posts
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to view social posts
CREATE POLICY "Public profiles are viewable by everyone" 
ON social_posts FOR SELECT 
USING ( true );

-- Policy to allow users to insert their own posts
CREATE POLICY "Users can insert their own posts" 
ON social_posts FOR INSERT 
WITH CHECK ( auth.uid() = author_id );

-- Policy to allow users to update their own posts
CREATE POLICY "Users can update their own posts" 
ON social_posts FOR UPDATE 
USING ( auth.uid() = author_id );

-- Policy to allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" 
ON social_posts FOR DELETE 
USING ( auth.uid() = author_id );

-- Ensure forum_posts are also viewable (re-run to be safe)
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public forum posts are viewable by everyone" 
ON forum_posts FOR SELECT 
USING ( true );
