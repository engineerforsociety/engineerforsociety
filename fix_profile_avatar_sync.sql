-- =============================================
-- FIX PROFILE AVATAR SYNC FROM GOOGLE AUTH
-- =============================================

-- Step 1: Update existing profiles with missing avatars from auth metadata
UPDATE public.profiles p
SET avatar_url = (
    SELECT au.raw_user_meta_data->>'avatar_url'
    FROM auth.users au
    WHERE au.id = p.id
    AND au.raw_user_meta_data->>'avatar_url' IS NOT NULL
)
WHERE p.avatar_url IS NULL;

-- Step 2: Update existing profiles with missing full_name from auth metadata
UPDATE public.profiles p
SET full_name = (
    SELECT au.raw_user_meta_data->>'full_name'
    FROM auth.users au
    WHERE au.id = p.id
    AND au.raw_user_meta_data->>'full_name' IS NOT NULL
)
WHERE p.full_name IS NULL;

-- Step 3: Create or replace function to sync auth.users metadata changes to profiles
CREATE OR REPLACE FUNCTION public.sync_auth_metadata_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile when auth user metadata changes
    UPDATE public.profiles
    SET 
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_metadata_updated ON auth.users;

-- Step 5: Create trigger to sync metadata updates
CREATE TRIGGER on_auth_user_metadata_updated
    AFTER UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW 
    WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION public.sync_auth_metadata_to_profile();

-- Step 6: Ensure the handle_new_user function includes email as fallback
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    random_username TEXT;
BEGIN
    -- Generate a unique username from email or full_name
    random_username := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        SPLIT_PART(NEW.email, '@', 1)
    ) || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
    
    -- Replace spaces with underscores and make lowercase
    random_username := LOWER(REPLACE(random_username, ' ', '_'));
    
    INSERT INTO public.profiles (
        id, 
        username, 
        full_name, 
        avatar_url, 
        email, -- Add email field
        user_type,
        email_notifications,
        created_at
    )
    VALUES (
        NEW.id,
        random_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url', -- This will get Google avatar
        NEW.email, -- Store email
        'experienced',
        TRUE,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add email column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 8: Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = (
    SELECT au.email
    FROM auth.users au
    WHERE au.id = p.id
)
WHERE p.email IS NULL;

-- Step 9: Add updated_at column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to check if avatars are synced correctly:
-- SELECT 
--     p.id,
--     p.full_name,
--     p.avatar_url as profile_avatar,
--     au.raw_user_meta_data->>'avatar_url' as auth_avatar,
--     au.raw_user_meta_data->>'full_name' as auth_name,
--     au.email
-- FROM public.profiles p
-- LEFT JOIN auth.users au ON p.id = au.id
-- LIMIT 10;
