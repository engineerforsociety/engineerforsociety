-- =============================================
-- ADMIN EMAIL/PASSWORD AUTHENTICATION
-- This works alongside your existing 'admins' table
-- =============================================

-- Create admin_credentials table for email/password login
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Enable RLS on admin_credentials
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read (needed for login check)
CREATE POLICY "Allow read for authentication" ON public.admin_credentials
    FOR SELECT USING (true);

-- No insert/update/delete via RLS
CREATE POLICY "No public insert" ON public.admin_credentials
    FOR INSERT WITH CHECK (false);
    
CREATE POLICY "No public update" ON public.admin_credentials
    FOR UPDATE USING (false);
    
CREATE POLICY "No public delete" ON public.admin_credentials
    FOR DELETE USING (false);

-- =============================================
-- ADMIN SESSIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Allow read/write for sessions (needed for login/logout)
CREATE POLICY "Allow session management" ON public.admin_sessions
    FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- =============================================
-- INSERT DEFAULT ADMIN
-- Email: admin@engineerforsociety.com
-- Password: admin123
-- =============================================

INSERT INTO public.admin_credentials (email, password_hash, full_name, is_active)
VALUES (
    'admin@engineerforsociety.com',
    '$2b$10$iyAReUTVIsgwsDzmQ9t30.1cDt95BueZyf9mNHYe.Q.FSD774kEMwC',
    'System Administrator',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- UPDATE LAST LOGIN FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_admin_last_login(admin_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.admin_credentials
    SET last_login_at = NOW()
    WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CLEANUP FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
