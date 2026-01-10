-- Fix for Resources Table Schema
-- Dropping old constraints that cause Submission Error (23514)

DO $$ 
BEGIN
    -- Drop old status check if it exists
    ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_status_check;
    
    -- Add new status check
    ALTER TABLE public.resources ADD CONSTRAINT resources_status_check 
        CHECK (status IN ('pending', 'approved', 'flagged', 'archived'));

    -- Drop old resource type check if it exists
    ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_type_check;
    
    -- Ensure tags column exists (it might be missing in some v4 iterations)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='tags') THEN
        ALTER TABLE public.resources ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    -- Ensure slug column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='slug') THEN
        ALTER TABLE public.resources ADD COLUMN slug TEXT UNIQUE;
    END IF;

    -- Update any existing null tags
    UPDATE public.resources SET tags = '{}' WHERE tags IS NULL;

END $$;
