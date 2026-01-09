-- Comprehensive Fix for Profiles and Related Tables Visibility (RLS)

-- 1. PROFILES Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing possibly restrictive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Allow anyone (authenticated or anonymous) to view any profile
-- This ensures that shared profiles and the network page work for everyone
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( true );

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );


-- 2. EXPERIENCES Table
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


-- 3. EDUCATIONS Table
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


-- 4. USER_FOLLOWS Table (To see follower counts)
-- Check if table exists first (it was mentioned in the code)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_follows') THEN
        ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public can view follows" ON public.user_follows;
        CREATE POLICY "Public can view follows" ON public.user_follows
            FOR SELECT USING ( true );
            
        DROP POLICY IF EXISTS "Users can manage their own follows" ON public.user_follows;
        CREATE POLICY "Users can manage their own follows" ON public.user_follows
            FOR ALL USING ( auth.uid() = follower_id )
            WITH CHECK ( auth.uid() = follower_id );
    END IF;
END $$;


-- 5. CONNECTIONS Table
-- Connection visibility is already handled in some scripts, but ensuring it works for counts
DROP POLICY IF EXISTS "Users can view all connections" ON public.connections;
CREATE POLICY "Users can view all connections" ON public.connections
  FOR SELECT USING (true); -- Usually connections are public info in social networks (counts, etc)


-- 6. Grant basic permissions to all roles
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.experiences TO anon, authenticated;
GRANT SELECT ON public.educations TO anon, authenticated;
GRANT SELECT ON public.connections TO anon, authenticated;
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_follows') THEN
    GRANT SELECT ON public.user_follows TO anon, authenticated;
END IF;

-- 7. Ensure Updated At Trigger exists for profiles (as requested)
-- Function update_updated_at_column() should already exist from other schemas, but let's be safe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
