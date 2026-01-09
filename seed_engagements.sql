-- Populate professional_engagements with initial sample data

INSERT INTO public.professional_engagements (
  id,
  organizer_id, -- Will be null initially, can be updated later or linked to a system admin
  engagement_title,
  engagement_brief,
  engagement_category,
  engagement_type,
  commencement_time,
  conclusion_time,
  venue_name,
  target_disciplines,
  proficiency_level,
  is_premium_access,
  branding_image_url,
  -- Research specifics
  is_external_event,
  cfp_deadline,
  has_cfp,
  has_travel_grants,
  engagement_status
) VALUES 
  -- 1. Learning: Advanced SolidWorks
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID for l1
    NULL,
    'Advanced SolidWorks for Mechanical Systems',
    'Master complex surfacing and assembly animations for high-precision engineering projects.',
    'workshop',
    'online',
    '2025-02-15 14:00:00+00',
    '2025-02-15 17:00:00+00',
    'Microsoft Teams',
    ARRAY['Mechanical'],
    'expert',
    FALSE,
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    FALSE,
    NULL,
    FALSE,
    FALSE,
    'published'
  ),

  -- 2. Learning: AI in Power Grids
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', -- UUID for l2
    NULL,
    'AI in Smart Power Grids Symposium',
    'How machine learning is optimizing energy distribution and fault detection in modern EEE.',
    'symposium',
    'online',
    '2025-02-18 16:00:00+00',
    '2025-02-18 18:00:00+00',
    'Zoom Virtual Hall',
    ARRAY['EEE', 'CSE'],
    'intermediate',
    TRUE,
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop',
    FALSE,
    NULL,
    FALSE,
    FALSE,
    'published'
  ),

  -- 3. Networking: Dhaka Meetup
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', -- UUID for n1
    NULL,
    'Dhaka Engineer Fellowship Engagement',
    'In-depth coordination between 50+ senior engineers and founders for urban infrastructure projects.',
    'technical_meetup',
    'offline',
    '2025-02-25 19:00:00+00',
    '2025-02-25 22:00:00+00',
    'Intercontinental Dhaka',
    ARRAY['All'],
    'beginner',
    FALSE,
    'https://images.unsplash.com/photo-1528605248644-14dd04cb113d?q=80&w=2070&auto=format&fit=crop',
    FALSE,
    NULL,
    FALSE,
    FALSE,
    'published'
  ),

  -- 4. Networking: Industry Visit
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', -- UUID for n2
    NULL,
    'Industry Initiative: Automated Ports',
    'A professional industry tour of the automation systems and crane logic used in smart logistic hubs.',
    'industry_tour',
    'offline',
    '2025-03-05 09:00:00+00',
    '2025-03-05 15:00:00+00',
    'Bay Terminal Hub',
    ARRAY['Mechanical', 'EEE'],
    'intermediate',
    FALSE,
    'https://images.unsplash.com/photo-1586528116311-ad863c1788a1?q=80&w=2070&auto=format&fit=crop',
    FALSE,
    NULL,
    FALSE,
    FALSE,
    'published'
  ),

  -- 5. Academic: Global Infrastructure Conference
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', -- UUID for a1
    NULL,
    'Global Infrastructure Research Summit',
    'Presenting peer-reviewed research in sustainable urban planning and high-speed transit systems.',
    'conference',
    'hybrid',
    '2025-05-12 09:00:00+00',
    '2025-05-15 17:00:00+00',
    'Singapore Exhibition Center',
    ARRAY['Civil', 'All'],
    'expert',
    TRUE,
    'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070&auto=format&fit=crop',
    TRUE, -- is_external
    '2025-03-10 23:59:59+00', -- cfp_deadline
    TRUE, -- has_cfp
    TRUE, -- has_travel_grants
    'published'
  ),

  -- 6. Academic: Renewable Energy Seminar
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', -- UUID for a2
    NULL,
    'Renewable Energy Scientific Seminar',
    'Technical deep-dive into next-gen photovoltaic cells and industrial hydrogen storage.',
    'technical_meetup',
    'online',
    '2025-03-20 10:00:00+00',
    '2025-03-20 13:00:00+00',
    'Society Virtual Auditorium',
    ARRAY['Mechanical', 'Chemical'],
    'intermediate',
    FALSE,
    'https://images.unsplash.com/photo-1466611653911-954ffea11271?q=80&w=2070&auto=format&fit=crop',
    FALSE,
    NULL,
    FALSE,
    FALSE,
    'published'
  );

  -- Add to event_registrations (Optional mock attendees)
