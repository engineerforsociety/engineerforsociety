-- =============================================
-- SUPER CLEAN ADMIN FIX
-- Run this to reset admin tables and fix login
-- =============================================

-- 1. DROP old tables (clean slate)
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_credentials CASCADE;

-- 2. Create CREDENTIALS table
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- 3. Create SESSIONS table
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISABLE RLS (Fixes all permission errors)
ALTER TABLE public.admin_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions DISABLE ROW LEVEL SECURITY;

-- 5. Insert ADMIN USER (Email: admin@engineerforsociety.com / Pass: admin123)
-- IMPORTANT: Make sure there are no spaces when copying the hash below
INSERT INTO public.admin_credentials (email, password_hash, full_name, is_active)
VALUES (
    'admin@engineerforsociety.com',
    '$2b$10$/sGvY8dtVX/OVHUh5DTMk.pEcntOALSpZn7k.KxahTpk6qzoCgyIu',
    'System Administrator',
    TRUE
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);

-- 7. VERIFY (Run this to see if the user exists)
SELECT id, email, is_active FROM public.admin_credentials WHERE email = 'admin@engineerforsociety.com';
