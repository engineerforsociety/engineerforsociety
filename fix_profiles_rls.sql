-- Fix for Profiles RLS and visibility issues

-- 1. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 3. Create comprehensive policies for profiles
-- Allow anyone (even logged out users) to view any profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( true );

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- 4. Fix RLS for related tables (Experiences, Educations)
-- Experiences
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public experiences are viewable by everyone" ON public.experiences;
CREATE POLICY "Public experiences are viewable by everyone" 
ON public.experiences FOR SELECT 
USING ( true );

DROP POLICY IF EXISTS "Users can manage their own experiences" ON public.experiences;
CREATE POLICY "Users can manage their own experiences" 
ON public.experiences FOR ALL 
USING ( auth.uid() = profile_id )
WITH CHECK ( auth.uid() = profile_id );

-- Educations
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public educations are viewable by everyone" ON public.educations;
CREATE POLICY "Public educations are viewable by everyone" 
ON public.educations FOR SELECT 
USING ( true );

DROP POLICY IF EXISTS "Users can manage their own educations" ON public.educations;
CREATE POLICY "Users can manage their own educations" 
ON public.educations FOR ALL 
USING ( auth.uid() = profile_id )
WITH CHECK ( auth.uid() = profile_id );

-- 5. Extra check for connections (visibility)
-- We already have some policies for connections, but let's make sure they don't block profile views
-- The profiles view doesn't depend on connections, but ProfileConnectionButton might.

-- 6. Ensure the handle_new_user trigger is set up correctly (as a backup)
-- (Already handled in complete_database_setup.sql, but ensuring it's not the cause of "missing" profiles)
