-- v3: Add skill_level to projects table
-- tags column was already added in v1 (update_projects_table.sql)

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS skill_level text DEFAULT 'Intermediate';

-- Optional: Add check constraint for skill_level to ensure data consistency
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_skill_level_check;

ALTER TABLE public.projects 
ADD CONSTRAINT projects_skill_level_check 
CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'));
