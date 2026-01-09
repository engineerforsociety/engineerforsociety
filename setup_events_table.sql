-- PROFESSIONAL SUMMITS & ENGAGEMENTS SCHEMA
-- Supports: Internal/External Conferences, CFP Trackers, Proceedings, Grants

-- 1. Main Engagements Table (Updated)
DROP TABLE IF EXISTS public.engagement_proceedings CASCADE;
DROP TABLE IF EXISTS public.research_travel_grants CASCADE;
DROP TABLE IF EXISTS public.engagement_registrations CASCADE;
DROP TABLE IF EXISTS public.professional_engagements CASCADE;

CREATE TABLE public.professional_engagements (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  organizer_id uuid NULL, -- If null, it might be a system/admin event, or we use a specific admin profile
  
  -- Core Identity
  engagement_title text NOT NULL,
  engagement_brief text NULL,
  engagement_type text NOT NULL, -- 'online', 'offline', 'hybrid'
  engagement_category text NOT NULL, 
  -- Categories: 'conference', 'symposium', 'workshop', 'webinar', 'technical_meetup', 'industry_tour', 'hackathon'
  
  -- Source & Scope
  is_external_event boolean DEFAULT false, -- If true, it's a global event listed for info
  external_organizer_name text NULL, -- e.g. "IEEE", "ASME"
  external_url text NULL, -- Link to official site
  
  -- Engineering Metadata
  target_disciplines text[] DEFAULT '{}', -- ['CSE', 'EEE', 'Civil', 'Mechanical', 'All']
  proficiency_level text DEFAULT 'all', -- 'beginner', 'intermediate', 'expert', 'all'
  
  -- Schedule
  commencement_time timestamp with time zone NOT NULL,
  conclusion_time timestamp with time zone NOT NULL,
  timezone_id text DEFAULT 'UTC',
  
  -- Location
  venue_name text NULL,
  venue_address text NULL,
  venue_geo_lat numeric(10, 8) NULL,
  venue_geo_lng numeric(11, 8) NULL,
  virtual_endpoint_url text NULL,
  
  -- RESEARCH & CONFERENCE FEATURES (The "Academic" Tab)
  has_cfp boolean DEFAULT false, -- Does it have a Call For Papers?
  cfp_deadline timestamp with time zone NULL,
  cfp_guidelines_url text NULL, -- Link to PDF/Page
  cfp_submission_url text NULL, -- Where to submit
  
  -- Grants & Scholarships Info
  has_travel_grants boolean DEFAULT false,
  grant_details text NULL,
  
  -- Logistics
  delegate_capacity integer NULL,
  is_premium_access boolean DEFAULT false,
  access_fee numeric(10, 2) DEFAULT 0,
  ticket_link text NULL, -- For external tickets
  branding_image_url text NULL,
  
  -- Status
  engagement_status text DEFAULT 'draft', -- 'published', 'completed', 'scheduled'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT professional_engagements_pkey PRIMARY KEY (id),
  CONSTRAINT professional_engagements_organizer_fkey FOREIGN KEY (organizer_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 2. Proceedings & Archives (For Past Summits)
-- This allows users/admins to upload papers or resources AFTER the event
CREATE TABLE public.engagement_proceedings (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  engagement_id uuid NOT NULL,
  uploader_id uuid NULL, -- Who uploaded this?
  
  title text NOT NULL, -- "Keynote Slides" or "Research Paper: AI in Const."
  description text NULL,
  resource_type text NOT NULL, -- 'paper', 'slides', 'video', 'dataset'
  file_url text NOT NULL,
  is_public boolean DEFAULT true,
  
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT engagement_proceedings_pkey PRIMARY KEY (id),
  CONSTRAINT engagement_proceedings_engagement_fkey FOREIGN KEY (engagement_id) REFERENCES professional_engagements (id) ON DELETE CASCADE
);

-- 3. Travel Grants (Structured Applications)
-- Users can see grants and apply
CREATE TABLE public.research_travel_grants (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  engagement_id uuid NOT NULL,
  
  grant_title text NOT NULL, -- "Student Travel Grant"
  coverage_amount numeric(10, 2) NULL,
  description text NULL,
  eligibility_criteria text NULL,
  application_deadline timestamp with time zone NOT NULL,
  application_link text NULL, -- If external
  
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT research_travel_grants_pkey PRIMARY KEY (id),
  CONSTRAINT research_travel_grants_engagement_fkey FOREIGN KEY (engagement_id) REFERENCES professional_engagements (id) ON DELETE CASCADE
);

-- 4. Registrations / RSVP
CREATE TABLE public.engagement_registrations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  engagement_id uuid NOT NULL,
  user_id uuid NOT NULL,
  
  status text DEFAULT 'registered', -- 'registered', 'waitlist', 'attended'
  ticket_type text DEFAULT 'standard',
  registration_notes text NULL,
  
  registered_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT engagement_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT engagement_registrations_unique UNIQUE (engagement_id, user_id),
  CONSTRAINT engagement_registrations_engagement_fkey FOREIGN KEY (engagement_id) REFERENCES professional_engagements (id) ON DELETE CASCADE,
  CONSTRAINT engagement_registrations_user_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 5. RLS Policies
ALTER TABLE public.professional_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_proceedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_travel_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can read published engagements
CREATE POLICY "Public read published engagements" ON public.professional_engagements
  FOR SELECT USING (engagement_status = 'published');

-- Authenticated users can create engagements (User Generated Content)
CREATE POLICY "Users can create engagements" ON public.professional_engagements
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their engagements
CREATE POLICY "Organizers can update own engagements" ON public.professional_engagements
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Proceedings: Public read, organizers upload
CREATE POLICY "Public read proceedings" ON public.engagement_proceedings
  FOR SELECT USING (true);
CREATE POLICY "Organizers upload proceedings" ON public.engagement_proceedings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professional_engagements 
      WHERE id = engagement_id AND organizer_id = auth.uid()
    )
  );

-- Registrations: create own, read own
CREATE POLICY "Users register themselves" ON public.engagement_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own registrations" ON public.engagement_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Grants: Public read
CREATE POLICY "Public read grants" ON public.research_travel_grants
  FOR SELECT USING (true);
