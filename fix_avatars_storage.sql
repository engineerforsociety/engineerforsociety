-- =============================================
-- FIX STORAGE BUCKET AND AVATAR VISIBILITY
-- =============================================

-- 1. Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Set up RLS for the avatars bucket
-- Allow anyone to read objects in the avatars bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update/delete their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);


-- 3. SYNC AVATARS FROM AUTH (Ensuring data is actually there)
-- This updates profiles where avatar_url is missing but exists in auth metadata
UPDATE public.profiles p
SET avatar_url = (
    SELECT au.raw_user_meta_data->>'avatar_url'
    FROM auth.users au
    WHERE au.id = p.id
)
WHERE p.avatar_url IS NULL;

-- 4. Handle cases where avatar_url might be an empty string
UPDATE public.profiles
SET avatar_url = NULL
WHERE avatar_url = '';

-- 5. Add Google and Supabase Storage to next.config.ts (just in case they use it elsewhere)
-- (I'll do this in a separate step via multi_replace_file_content)
