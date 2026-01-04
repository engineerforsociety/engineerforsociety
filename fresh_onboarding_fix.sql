
-- 1. Ensure profiles table has correct columns for fresh start
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS engineering_field TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- 2. Update handle_new_user to be truly fresh
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    clean_username TEXT;
BEGIN
    -- Generate initial username from full_name or email
    clean_username := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        SPLIT_PART(NEW.email, '@', 1)
    ) || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 4);
    
    clean_username := LOWER(REPLACE(clean_username, ' ', '_'));

    INSERT INTO public.profiles (
        id, 
        username, 
        full_name, 
        avatar_url, 
        is_onboarding_complete,
        email_notifications,
        created_at
    )
    VALUES (
        NEW.id,
        clean_username,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        FALSE, -- 1st time user: onboarding is NOT complete
        TRUE,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-enable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Policy for profile updates (Ensure users can only edit their own)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
