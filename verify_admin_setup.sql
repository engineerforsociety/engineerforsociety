-- =============================================
-- VERIFICATION QUERIES
-- Run these one by one to verify your setup
-- =============================================

-- 1. Check if admin_credentials table exists and has data
SELECT * FROM public.admin_credentials;

-- Expected result: You should see 1 row with email 'admin@engineerforsociety.com'

-- 2. Check if admin_sessions table exists
SELECT * FROM public.admin_sessions;

-- Expected result: Empty table (no sessions yet)

-- 3. Verify the admin email specifically
SELECT email, full_name, is_active, created_at 
FROM public.admin_credentials 
WHERE email = 'admin@engineerforsociety.com';

-- Expected result: 1 row showing the admin details

-- If any of these queries fail, you need to run admin_auth_schema.sql first!
