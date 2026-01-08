-- Resources Table for Engineering Society Vault
-- Handles multiple resource types, URLs, embeds, and tags

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL, -- 'github', 'youtube', 'document', 'certification_prep', etc.
    category TEXT NOT NULL,      -- 'Academic/Research', 'Career Growth', etc.
    discipline TEXT NOT NULL,    -- 'CSE', 'Civil', 'EEE', etc.
    
    -- Storage/Links
    file_url TEXT,               -- Link to uploaded file in Supabase Storage
    external_url TEXT,           -- Generic external link (Drive, Dropbox, etc.)
    github_url TEXT,
    youtube_url TEXT,
    ieee_url TEXT,
    embed_url TEXT,              -- For tool iframes
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    
    -- Metrics
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved resources
CREATE POLICY "Public can view approved resources" 
ON public.resources FOR SELECT 
USING (status = 'approved');

-- Authenticated users can contribute
CREATE POLICY "Authenticated users can create resources" 
ON public.resources FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Authors can update their own resources (e.g. description)
CREATE POLICY "Authors can update their own resources" 
ON public.resources FOR UPDATE 
USING (auth.uid() = author_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
