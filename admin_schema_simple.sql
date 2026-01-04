-- Drop existing policies first
DROP POLICY IF EXISTS "Allow read for authentication" ON public.admin_credentials;
DROP POLICY IF EXISTS "No public insert" ON public.admin_credentials;
DROP POLICY IF EXISTS "No public update" ON public.admin_credentials;
DROP POLICY IF EXISTS "No public delete" ON public.admin_credentials;
DROP POLICY IF EXISTS "Allow session management" ON public.admin_sessions;

-- Recreate tables fresh
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_credentials CASCADE;

-- Create admin_credentials table
CREATE TABLE public.admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Create admin_sessions table
CREATE TABLE public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE RLS completely for these tables (they're behind API routes anyway)
ALTER TABLE public.admin_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions DISABLE ROW LEVEL SECURITY;

-- Insert default admin
INSERT INTO public.admin_credentials (email, password_hash, full_name, is_active)
VALUES (
    'admin@engineerforsociety.com',
    '$2b$10$iyAReUTVIsgwsDzmQ9t30.1cDt95BueZyf9mNHYe.Q.FSD774kEMwC',
    'System Administrator',
    TRUE
);

-- Create index
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);
