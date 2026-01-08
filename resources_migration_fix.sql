-- Migration Script to update Resources Table
-- This script safely adds missing columns and updates the schema for the Digital Library

-- 1. Drop the table and recreate it for a clean, consistent schema
-- WARNING: This will delete existing data in the resources table.
DROP TABLE IF EXISTS public.resources CASCADE;

CREATE TABLE public.resources (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    author_id UUID NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    resource_type TEXT NOT NULL, -- 'document', 'video', 'template', 'guide', 'formula', 'manual'
    category TEXT NOT NULL,      -- 'Engineering Codes & Standards', 'Design Templates', etc.
    discipline TEXT NOT NULL,    -- 'General', 'CSE', 'Civil', 'EEE', 'Textile', etc.
    file_url TEXT NULL,          -- Path to the file in Supabase storage
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

-- 2. Create indexes for performance
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_discipline ON resources(discipline);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_resource_type ON resources(resource_type);

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

-- Policy: Authenticated users can insert resources
CREATE POLICY "Auth users can insert resources" 
ON public.resources FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Authors can update their own resources (if not already approved)
CREATE POLICY "Authors can update own pending resources" 
ON public.resources FOR UPDATE 
USING (auth.uid() = author_id AND status != 'approved');

-- 4. Trigger for updated_at
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
