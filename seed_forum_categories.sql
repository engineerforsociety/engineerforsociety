-- =============================================
-- SEED PROFESSIONAL FORUM CATEGORIES (FIXED)
-- =============================================

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT forum_categories_pkey PRIMARY KEY (id)
);

-- 2. Add icon_name column if it doesn't exist (MUST BE DONE BEFORE INSERT)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_categories' AND column_name='icon_name') THEN
        ALTER TABLE public.forum_categories ADD COLUMN icon_name text;
    END IF;
END $$;

-- 3. Seed Data
INSERT INTO public.forum_categories (name, slug, description, display_order, icon_name)
VALUES 
  ('Job Interview Questions', 'job-interview-questions', 'Prepare for your next big opportunity with community-sourced questions and answers.', 10, 'Briefcase'),
  ('Industry Discussions', 'industry-discussions', 'Deep dives into engineering trends, standards, and future technologies.', 20, 'Building'),
  ('Math & Science Support', 'math-science-support', 'Collaborative problem solving for complex theoretical challenges.', 30, 'Sigma'),
  ('Alternative Pathways', 'alternative-pathways', 'Navigating non-traditional routes into engineering and technology careers.', 40, 'GitFork'),
  ('Project Showcases', 'project-showcases', 'Share your engineering projects, get feedback, and find collaborators.', 50, 'Lightbulb'),
  ('New Engineers', 'new-engineers', 'Guidance, mentorship, and support for those just starting their journey.', 60, 'UserPlus')
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  icon_name = EXCLUDED.icon_name;
