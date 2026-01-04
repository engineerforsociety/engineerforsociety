-- =============================================
-- FINAL WORKING ADMIN SETUP
-- This resets the admin tables and sets correct permissions
-- =============================================

-- 1. DROP EVERYTHING to start fresh
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_credentials CASCADE;

-- 2. CREATE CREDENTIALS TABLE
CREATE TABLE public.admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- 3. CREATE SESSIONS TABLE
CREATE TABLE public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE RLS
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- 5. CREATE PERMISSIVE POLICIES (Fixes "Access Denied")

-- Allow ANYONE to read admin_credentials (needed for login check)
CREATE POLICY "Public read admin credentials" 
ON public.admin_credentials FOR SELECT 
USING (true);

-- Allow ANYONE to manage sessions (needed for login/logout)
CREATE POLICY "Public manage admin sessions" 
ON public.admin_sessions FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. INSERT ADMIN USER
INSERT INTO public.admin_credentials (email, password_hash, full_name, is_active)
VALUES (
    'admin@engineerforsociety.com',
    '$2b$10$iyAReUTVIsgwsDzmQ9t30.1cDt95BueZyf9mNHYe.Q.FSD774kEMwC',
    'System Administrator',
    TRUE
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
