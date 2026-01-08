-- Ultra-Modern Engineering Resources Schema v3
-- Supports Files, GitHub, YouTube, IEEE, Research Papers, and Interactive Tools with Iframe Support

DROP TABLE IF EXISTS public.resources CASCADE;

CREATE TABLE public.resources (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    author_id UUID NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    
    -- New Expanded Resource Types
    resource_type TEXT NOT NULL, 
    -- 'github', 'youtube', 'ieee', 'research_paper', 'conference', 'tool', 'document', 'template'
    
    category TEXT NOT NULL,      
    discipline TEXT NOT NULL,    
    
    -- Specialized Links
    file_url TEXT NULL,          -- Path to file in storage
    external_url TEXT NULL,      -- General website link
    github_url TEXT NULL,        -- GitHub Repository link
    youtube_url TEXT NULL,       -- YouTube Video ID or URL
    ieee_url TEXT NULL,          -- IEEE Xplore link
    embed_url TEXT NULL,         -- URL for Iframe embedding (for tools/calculators)
    
    thumbnail_url TEXT NULL,
    tags TEXT[] NULL,
    is_premium BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- File Metadata
    file_size BIGINT NULL,
    file_extension TEXT NULL,
    
    -- Moderation
    status TEXT DEFAULT 'pending', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT resources_pkey PRIMARY KEY (id),
    CONSTRAINT resources_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles (id) ON DELETE CASCADE,
    CONSTRAINT resources_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT resources_type_check CHECK (
        resource_type IN ('github', 'youtube', 'ieee', 'research_paper', 'conference', 'tool', 'document', 'template')
    )
);

-- Optimization Indexes
CREATE INDEX idx_resources_composite ON resources(category, discipline, status);
CREATE INDEX idx_resources_type ON resources(resource_type);

-- Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anybody can view approved resources" 
ON public.resources FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Authors can see own resources" 
ON public.resources FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Auth users can contribute" 
ON public.resources FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_update_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
