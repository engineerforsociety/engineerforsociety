-- Update projects table to support new features
-- This adds the 'tags' column which was missing but is required for the detailed filtering we implemented.
-- It also sets up an index for faster filtering by tags.

-- Add tags column if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create an index/GIN index for efficient array searching (filtering by tags)
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN (tags);

-- Optional: If you want to force categories to be one of the predefined list, you can add a check constraint.
-- For flexibility, we leave it as text for now, but here is how you could do it if you wanted strictly enforced categories:
/*
ALTER TABLE public.projects 
ADD CONSTRAINT projects_category_check 
CHECK (category IN (
  'Audio & Sound', 'IoT', 'Installations', 'Home Automation', 
  'Flying Things', 'Lab Tools', 'Environment', 'Robotics', 
  'Games', 'Smart Lighting', 'Displays', 'Wearables', 'Other'
));
*/
