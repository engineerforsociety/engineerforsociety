-- =============================================
-- ADMIN TABLE & AUTO-PROFILE CREATION
-- =============================================

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can view admin list
CREATE POLICY "Admins can view admins" ON public.admins
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- =============================================
-- AUTO-PROFILE CREATION TRIGGER
-- =============================================

-- Function to auto-create profile when user signs up
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
        user_type,
        email_notifications,
        created_at
    )
    VALUES (
        NEW.id,
        random_username,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'experienced', -- Default, will be updated during onboarding
        TRUE,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- DEFAULT FORUM CATEGORY
-- =============================================

-- Insert default forum category if it doesn't exist
INSERT INTO public.forum_categories (name, slug, description, icon, display_order, is_active)
VALUES 
    ('General Discussion', 'general', 'General discussions about engineering and technology', '💬', 1, true),
    ('Career & Jobs', 'career-jobs', 'Career advice, job postings, and professional development', '💼', 2, true),
    ('Projects Showcase', 'projects', 'Share your projects and get feedback', '🚀', 3, true),
    ('Help & Support', 'help-support', 'Get help with technical questions', '🆘', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PROFILE COMPLETION TRACKING
-- =============================================

-- Add profile completion flag
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT FALSE;

-- =============================================
-- ENHANCED RLS POLICIES FOR FORUM CATEGORIES
-- =============================================

-- Allow authenticated users to insert forum categories (for admins via admin panel)
DROP POLICY IF EXISTS "Admins can create categories" ON public.forum_categories;
CREATE POLICY "Admins can create categories" ON public.forum_categories
    FOR INSERT 
    WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admins));

-- Allow admins to update categories
DROP POLICY IF EXISTS "Admins can update categories" ON public.forum_categories;
CREATE POLICY "Admins can update categories" ON public.forum_categories
    FOR UPDATE 
    USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- =============================================
-- FEED QUERY OPTIMIZATION
-- =============================================

-- Create view for feed posts with author info
CREATE OR REPLACE VIEW public.feed_posts_view AS
SELECT 
    fp.id,
    fp.title,
    fp.content,
    fp.tags,
    fp.created_at,
    fp.view_count,
    fp.is_pinned,
    fp.slug,
    p.id as author_id,
    p.full_name as author_name,
    p.avatar_url as author_avatar,
    p.job_title as author_title,
    fc.name as category_name,
    fc.slug as category_slug,
    (SELECT COUNT(*) FROM public.forum_comments WHERE post_id = fp.id) as comment_count,
    (SELECT COUNT(*) FROM public.post_reactions WHERE post_id = fp.id) as like_count
FROM public.forum_posts fp
LEFT JOIN public.profiles p ON fp.author_id = p.id
LEFT JOIN public.forum_categories fc ON fp.category_id = fc.id
ORDER BY fp.is_pinned DESC, fp.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.feed_posts_view TO authenticated, anon;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Note: You'll need to replace 'YOUR_USER_ID' with your actual user ID after signing in
-- To add yourself as admin, run this after first login:
-- INSERT INTO public.admins (user_id) VALUES ('YOUR_USER_ID');

-- =============================================
-- PROFILE UPDATE POLICY FIX
-- =============================================

-- Ensure users can update their onboarding status
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
