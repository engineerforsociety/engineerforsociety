-- =============================================
-- EXPANDED FORUM CATEGORIES & GROUPING
-- =============================================

-- 1. Add Grouping Capability
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_categories' AND column_name='category_group') THEN
        ALTER TABLE public.forum_categories ADD COLUMN category_group text DEFAULT 'General';
    END IF;
END $$;

-- 2. Clear existing categories to strictly follow the new structure (Optional, but cleaner for this request)
-- DELETE FROM public.forum_categories; -- Commented out to be safe, we will upsert.

-- 3. Seed Comprehensive Categories
INSERT INTO public.forum_categories (name, slug, description, category_group, display_order, icon_name)
VALUES 
  -- Engineering Disciplines
  ('Civil Engineering', 'civil-engineering', 'Structural, geotechnical, and transportation engineering discussions.', 'Disciplines', 10, 'Building'),
  ('EEE & Electronics', 'eee-electronics', 'Circuits, power systems, and electronics engineering.', 'Disciplines', 11, 'Zap'),
  ('Mechanical Engineering', 'mechanical-engineering', 'Thermodynamics, robotics, and mechanical systems.', 'Disciplines', 12, 'Settings'),
  ('Computer & Data Science', 'cs-data-science', 'Software, AI, ML, and big data technologies.', 'Disciplines', 13, 'Code'),
  ('Chemical Engineering', 'chemical-engineering', 'Process engineering, materials, and chemical systems.', 'Disciplines', 14, 'FlaskConical'),
  ('Aerospace Engineering', 'aerospace-engineering', 'Aircraft, spacecraft, and aerodynamics.', 'Disciplines', 15, 'Plane'),

  -- Professional Skills & Topics
  ('GitHub & Coding', 'github-coding', 'Code reviews, open source contributions, and version control.', 'Topics', 20, 'Github'),
  ('Problem Solving', 'problem-solving', 'DSA, LeetCode, and engineering challenges.', 'Topics', 21, 'Puzzle'),
  ('Research & Innovation', 'research-innovation', 'Academic research, papers, and R&D discussions.', 'Topics', 22, 'Microscope'),
  ('Job Interview Prep', 'job-interview-prep', 'Mock interviews, questions, and career guidance.', 'Topics', 23, 'Briefcase'),
  
  -- Community & Regional
  ('Subcontinent Engineers', 'subcontinent-engineers', 'Community space for engineers from South Asia and the subcontinent.', 'Regional', 30, 'Globe'),
  ('Global Opportunities', 'global-opportunities', 'Immigration, visa, and international engineering careers.', 'Regional', 31, 'Plane'),

  -- General Support (Mapping old ones to groups)
  ('New Engineers', 'new-engineers', 'Guidance for students and fresh graduates.', 'General', 40, 'UserPlus'),
  ('Math & Science Support', 'math-science-support', 'Fundamental concepts and theoretical help.', 'General', 41, 'Sigma')

ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_group = EXCLUDED.category_group,
  display_order = EXCLUDED.display_order,
  icon_name = EXCLUDED.icon_name;
