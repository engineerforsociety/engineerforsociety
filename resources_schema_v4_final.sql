-- Final Engineering Resources Schema v4
-- Comprehensive metadata for verified engineering links

-- Add enum for skill level
DO $$ BEGIN
    CREATE TYPE resource_skill_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add enum for source type
DO $$ BEGIN
    CREATE TYPE resource_source_type AS ENUM ('External Website', 'Google Drive', 'GitHub', 'YouTube', 'Research Portal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    author_id UUID NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    
    -- Categories and Disciplines
    category TEXT NOT NULL,      
    discipline TEXT NOT NULL,
    skill_level resource_skill_level DEFAULT 'Beginner',
    
    -- Asset Type
    resource_type TEXT NOT NULL, 
    -- 'research_paper', 'ieee_xplore', 'conference_material', 'case_study', 'technical_document', 'standard_codes', 'safety_manual'
    -- 'github_repo', 'interactive_tool', 'calculation_sheet', 'design_template', 'cad_blueprint'
    -- 'resume_template', 'interview_prep', 'certification_prep', 'youtube_tutorial', 'engineering_podcast'
    
    -- Source Metadata
    source_type resource_source_type NOT NULL DEFAULT 'External Website',
    external_url TEXT NOT NULL, -- Mandatory link
    embed_url TEXT NULL,        -- For Iframes
    
    -- Proof & Trust
    author_org TEXT NULL,       -- Author or Organization name
    year TEXT NULL,             -- Publication year
    license TEXT NULL,          -- Open / Educational / Personal
    is_original_creator BOOLEAN DEFAULT false,
    
    -- Community Metrics
    upvote_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Moderation
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'flagged', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT resources_pkey PRIMARY KEY (id),
    CONSTRAINT resources_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles (id) ON DELETE CASCADE,
    CONSTRAINT resources_status_check CHECK (status IN ('pending', 'approved', 'flagged', 'archived'))
);

-- Note: We are using a fresh table approach if it doesn't exist, 
-- but if it exists, we might need to alter it. 
-- Since I'm providing this to the user to 'copy-paste', I'll make it safe.

-- Add missing columns if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='skill_level') THEN
        ALTER TABLE public.resources ADD COLUMN skill_level resource_skill_level DEFAULT 'Beginner';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='source_type') THEN
        ALTER TABLE public.resources ADD COLUMN source_type resource_source_type DEFAULT 'External Website';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='author_org') THEN
        ALTER TABLE public.resources ADD COLUMN author_org TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='year') THEN
        ALTER TABLE public.resources ADD COLUMN year TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='license') THEN
        ALTER TABLE public.resources ADD COLUMN license TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='is_original_creator') THEN
        ALTER TABLE public.resources ADD COLUMN is_original_creator BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='upvote_count') THEN
        ALTER TABLE public.resources ADD COLUMN upvote_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='bookmark_count') THEN
        ALTER TABLE public.resources ADD COLUMN bookmark_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='report_count') THEN
        ALTER TABLE public.resources ADD COLUMN report_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anybody can view approved resources" ON public.resources;
DROP POLICY IF EXISTS "Authors can see own resources" ON public.resources;
DROP POLICY IF EXISTS "Auth users can contribute" ON public.resources;

CREATE POLICY "Anybody can view approved resources" 
ON public.resources FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Authors can see own resources" 
ON public.resources FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Auth users can contribute" 
ON public.resources FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Upvote/Bookmark functionality tables (Optional but recommended)
CREATE TABLE IF NOT EXISTS public.resource_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('upvote', 'bookmark')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_id, interaction_type)
);

ALTER TABLE public.resource_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interactions"
ON public.resource_interactions FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Interactions are public for viewing"
ON public.resource_interactions FOR SELECT
USING (true);

-- Trigger for interaction counting
CREATE OR REPLACE FUNCTION update_resource_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.interaction_type = 'upvote' THEN
            UPDATE resources SET upvote_count = upvote_count + 1 WHERE id = NEW.resource_id;
        ELSIF NEW.interaction_type = 'bookmark' THEN
            UPDATE resources SET bookmark_count = bookmark_count + 1 WHERE id = NEW.resource_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.interaction_type = 'upvote' THEN
            UPDATE resources SET upvote_count = upvote_count - 1 WHERE id = OLD.resource_id;
        ELSIF OLD.interaction_type = 'bookmark' THEN
            UPDATE resources SET bookmark_count = bookmark_count - 1 WHERE id = OLD.resource_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_resource_counts ON resource_interactions;
CREATE TRIGGER tr_update_resource_counts
AFTER INSERT OR DELETE ON resource_interactions
FOR EACH ROW EXECUTE FUNCTION update_resource_counts();
