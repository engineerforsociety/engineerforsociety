/* update_projects_schema_v4.sql */

/* 
  Update 'projects' table to include new fields for the enhanced project form.
*/

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS tools text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS components jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS apps text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS code_links text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_links text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS doc_links text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS team_members text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS not_author boolean DEFAULT false;

/* 
  Make sure 'skill_level' and 'tags' exist (from v3)
*/
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS skill_level text DEFAULT 'Intermediate';

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

/* 
  Ensure jsonb column defaults are correct if they were null
*/
UPDATE public.projects SET components = '[]'::jsonb WHERE components IS NULL;
