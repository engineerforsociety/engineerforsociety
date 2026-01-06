-- =============================================
-- FIX USER_ACTIVITIES TYPE CONSTRAINT (SAFE MODE)
-- =============================================

-- 1. Drop existing check constraint if it creates conflicts
ALTER TABLE public.user_activities DROP CONSTRAINT IF EXISTS user_activities_type_check;

-- 2. Add new constraint allowing 'social_post' but mark as NOT VALID first
-- This prevents the error "violated by some row" for existing data that might have legacy types
ALTER TABLE public.user_activities
ADD CONSTRAINT user_activities_type_check 
CHECK (activity_type IN ('post', 'comment', 'follow', 'join', 'project', 'like', 'repost', 'social_post'))
NOT VALID;

-- 3. (Optional) Validate later if needed, but this allows new inserts immediately
-- ALTER TABLE public.user_activities VALIDATE CONSTRAINT user_activities_type_check;
