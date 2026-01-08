-- Resources Table Schema v2
-- This schema supports a professional engineering digital library

-- 1. Update the Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    author_id UUID NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    resource_type TEXT NOT NULL, -- 'document', 'video', 'template', 'guide', 'formula', 'manual'
    category TEXT NOT NULL,      -- 'Standards', 'Templates', 'Manuals', 'Career', 'Academic', 'Research'
    discipline TEXT NOT NULL,    -- 'General', 'CSE', 'Civil', 'EEE', 'Textile', 'Mechanical', 'Architecture'
    file_url TEXT NULL,          -- Path to the file in storage
    external_url TEXT NULL,      -- External link if applicable
    thumbnail_url TEXT NULL,
    tags TEXT[] NULL,
    is_premium BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    file_size BIGINT NULL,       -- Size in bytes
    file_extension TEXT NULL,    -- .pdf, .xlsx, .docx, etc.
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT resources_pkey PRIMARY KEY (id),
    CONSTRAINT resources_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles (id) ON DELETE CASCADE,
    CONSTRAINT resources_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT resources_resource_type_check CHECK (
        resource_type IN ('document', 'video', 'template', 'guide', 'formula', 'manual', 'article', 'course')
    )
);

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_discipline ON resources(discipline);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);

-- 3. Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view approved resources
CREATE POLICY "Public can view approved resources" 
ON public.resources FOR SELECT 
USING (status = 'approved');

-- Policy: Users can view their own resources regardless of status
CREATE POLICY "Users can view own resources" 
ON public.resources FOR SELECT 
USING (auth.uid() = author_id);

-- Policy: Authenticated users can insert resources (will be pending by default)
CREATE POLICY "Auth users can insert resources" 
ON public.resources FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authors can update their own resources (if not already approved)
CREATE POLICY "Authors can update own pending resources" 
ON public.resources FOR UPDATE 
USING (auth.uid() = author_id AND status != 'approved');

-- 4. Automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_update_resources_updated_at ON resources;
CREATE TRIGGER tr_update_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
