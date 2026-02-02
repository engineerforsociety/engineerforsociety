-- Create new tables to support the complex Project Data Structure
-- This is a "normalized" approach for components/tools to allow for better analytics later, 
-- but we also support JSONB for flexibility if preferred. Here we do JSONB for simplicity and speed.

-- 1. Update Projects Table with new JSONB columns for the dynamic lists
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS pitch text,
ADD COLUMN IF NOT EXISTS components jsonb DEFAULT '[]', -- Array of {name, qty}
ADD COLUMN IF NOT EXISTS tools jsonb DEFAULT '[]',      -- Array of strings
ADD COLUMN IF NOT EXISTS apps jsonb DEFAULT '[]',       -- Array of strings
ADD COLUMN IF NOT EXISTS code_links text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS doc_links text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_links text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS team_members jsonb DEFAULT '[]', -- Array of {id, name, role, is_author}
ADD COLUMN IF NOT EXISTS not_author boolean DEFAULT false;

-- 2. Create index on the JSONB columns if we plan to search inside them (optional but good)
CREATE INDEX IF NOT EXISTS idx_projects_components ON public.projects USING GIN (components);

-- 3. (Optional) If you want a more relational structure for Components, you would create a separate table.
-- For now, the user requested "add project e eigula dio" which usually implies just storing the data.

-- Example of what the JSONB data will look like:
-- components: [{"name": "Arduino Uno", "qty": "1"}, {"name": "LED", "qty": "5"}]
-- team_members: [{"user_id": "uuid...", "name": "razin", "role": "owner"}, {"user_id": null, "name": "External Contributor"}]
