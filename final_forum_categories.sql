-- =============================================
-- FINAL PROFESSIONAL FORUM CATEGORIES SEED
-- =============================================

-- 1. Ensure category_group column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_categories' AND column_name='category_group') THEN
        ALTER TABLE public.forum_categories ADD COLUMN category_group text DEFAULT 'General';
    END IF;
END $$;

-- 2. Clear existing categories to strictly follow the new structure
-- Note: This will re-map existing posts to slugs, but it's better for a clean professional start.
TRUNCATE public.forum_categories CASCADE;

-- 3. Seed Comprehensive Categories
INSERT INTO public.forum_categories (name, slug, description, category_group, display_order, icon_name)
VALUES 
  -- 1. Core Engineering Disciplines
  ('Civil, Structural & Architecture', 'civil-structural-architecture', 'Construction, Urban Planning, Geotechnical, and Infrastructure.', 'Core Engineering', 10, 'Building'),
  ('Electrical & Electronics (EEE)', 'eee-electronics', 'Power Systems, Microelectronics, Telecommunications, and Control.', 'Core Engineering', 11, 'Zap'),
  ('Computer Science & Software', 'cs-software-engineering', 'AI/ML, Cybersecurity, Cloud Computing, and Software Development.', 'Core Engineering', 12, 'Code'),
  ('Mechanical & Robotics', 'mechanical-robotics', 'Thermodynamics, Mechatronics, Automotive, and Manufacturing.', 'Core Engineering', 13, 'Settings'),
  ('Textile & Apparel Engineering', 'textile-apparel', 'Fabric Manufacturing, Garments Tech, Fashion Design, and Wet Processing.', 'Core Engineering', 14, 'Shirt'),
  ('Chemical & Materials Science', 'chemical-materials', 'Process Engineering, Nanotechnology, and Polymer Science.', 'Core Engineering', 15, 'FlaskConical'),
  ('Industrial & Production (IPE)', 'industrial-production', 'Operations Management, Supply Chain, and Lean Manufacturing.', 'Core Engineering', 16, 'Factory'),
  ('Aerospace & Marine Engineering', 'aerospace-marine', 'Aviation, Shipbuilding, Space Tech, and Naval Architecture.', 'Core Engineering', 17, 'Plane'),

  -- 2. Career & Professional Growth
  ('Job Board & Career Leads', 'jobs-career-leads', 'Global job postings, internship opportunities, and referrals.', 'Career Growth', 20, 'Briefcase'),
  ('Interview Prep & HR Insights', 'interview-hr-insights', 'Technical interview questions, mock interviews, and salary negotiations.', 'Career Growth', 21, 'UserCheck'),
  ('Freelancing for Engineers', 'freelancing-engineers', 'Remote engineering gigs, CAD freelancing, and consultancy.', 'Career Growth', 22, 'Laptop'),
  ('Professional Certifications', 'certifications-pe-pmp', 'Preparation for PE, PMP, CCNA, AWS, and ISO Standards.', 'Career Growth', 23, 'Award'),
  ('Higher Studies & Scholarships', 'higher-studies-scholarships', 'Masters/PhD guidance, GRE/IELTS tips, and Global University reviews.', 'Career Growth', 24, 'GraduationCap'),

  -- 3. Society & Social Impact
  ('Sustainable Engineering', 'sustainable-engineering', 'Discussion on Green Energy, Waste Management, and Climate Change.', 'Social Impact', 30, 'Leaf'),
  ('Engineering Ethics & Law', 'ethics-engineering-law', 'Professional conduct, safety regulations, and legal matters.', 'Social Impact', 31, 'Scale'),
  ('Disaster Management', 'disaster-management', 'Engineering roles in flood, earthquake, and emergency response.', 'Social Impact', 32, 'AlertTriangle'),
  ('Blood Donation & Health', 'blood-donation-health', 'Dedicated space for organizing drives and health support.', 'Social Impact', 33, 'HeartPulse'),
  ('Rural Development Projects', 'rural-development', 'How engineering can improve life in underdeveloped areas.', 'Social Impact', 34, 'Home'),

  -- 4. Technical Resources & Innovation
  ('Design & Simulation Tools', 'design-simulation-tools', 'Discussions on AutoCAD, SolidWorks, Revit, MATLAB, Ansys, etc.', 'Resources', 40, 'PencilRuler'),
  ('Research, Journals & Patents', 'research-journals-patents', 'Sharing research papers, innovation news, and patent filing guides.', 'Resources', 41, 'BookOpen'),
  ('Coding for All Engineers', 'coding-non-cse', 'Programming for non-CSE engineers (Python for Civil/Mech, etc.).', 'Resources', 42, 'Binary'),
  ('Project Showcase', 'project-showcase', 'A Gallery where members can post finished projects or prototypes.', 'Resources', 43, 'Layout'),

  -- 5. Global Networking & Events
  ('Regional Chapters', 'regional-chapters', 'Sub-forums for specific locations (South Asia, Middle East, etc.).', 'Networking', 50, 'Map'),
  ('Startups & Entrepreneurship', 'startups-entrepreneurship', 'For engineers looking to build their own tech companies.', 'Networking', 51, 'Rocket'),
  ('Engineering Podcasts & Webinars', 'podcasts-webinars', 'Links to video/audio content and live sessions.', 'Networking', 52, 'Mic'),
  ('The Engineers'' Lounge', 'engineers-lounge', 'Casual space for general networking, hobbies, and off-topic chat.', 'Networking', 53, 'Coffee'),

  -- 6. Help & Support
  ('Technical Troubleshooting', 'technical-troubleshooting', 'Asking for help with specific technical engineering problems.', 'Support', 60, 'Wrench'),
  ('Math & Science Support', 'math-science-support', 'Fundamental help for students and early-career engineers.', 'Support', 61, 'Sigma'),
  ('Platform Support', 'platform-support', 'Feedback, bug reporting, and user guides for the website.', 'Support', 62, 'HelpCircle');
