import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface AdminUser {
    id: string
    email: string
    full_name: string | null
}

const ADMIN_SESSION_COOKIE = 'admin_session_token'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export async function authenticateAdmin(
    email: string,
    password: string
): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
        console.log('--- ADMIN LOGIN ATTEMPT ---', email)
        const supabase = await createClient()

        // 1. Fetch admin by email
        const { data: admin, error } = await supabase
            .from('admin_credentials')
            .select('id, email, password_hash, full_name, is_active')
            .eq('email', email)
            .single()

        if (error) {
            console.error('Error fetching admin:', error)
        }

        if (error || !admin) {
            console.log('Admin not found in database for email:', email)
            return { success: false, error: 'Email not found in admin database' }
        }

        if (!admin.is_active) {
            console.log('Admin account is inactive')
            return { success: false, error: 'Account is deactivated' }
        }

        // 2. Verify password
        const isValid = await verifyPassword(password, admin.password_hash)
        console.log('Password valid:', isValid)

        if (!isValid) {
            console.log('Password mismatch for admin:', email)
            return { success: false, error: 'Password does not match our records' }
        }

        // 3. Create session
        const sessionToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + SESSION_DURATION)

        // Store session in database
        const { error: sessionError } = await supabase.from('admin_sessions').insert({
            admin_id: admin.id,
            session_token: sessionToken,
            expires_at: expiresAt.toISOString(),
        })

        if (sessionError) {
            console.error('Session insert error:', sessionError)
            return { success: false, error: 'Login session failed' }
        }

        // NOTE: Skipped updating last_login_at to avoid RLS permission issues

        // 4. Set cookie
        const cookieStore = await cookies()
        cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        })

        console.log('Login successful!')
        return {
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                full_name: admin.full_name,
            },
        }
    } catch (error) {
        console.error('Admin authentication internal error:', error)
        return { success: false, error: 'Authentication failed' }
    }
}

export async function getAdminSession(): Promise<AdminUser | null> {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

        if (!sessionToken) {
            return null
        }

        const supabase = await createClient()

        // Get session and admin data
        const { data: session, error } = await supabase
            .from('admin_sessions')
            .select(`
        id,
        admin_id,
        expires_at,
        admin_credentials (
          id,
          email,
          full_name,
          is_active
        )
      `)
            .eq('session_token', sessionToken)
            .single()

        if (error || !session) {
            return null
        }

        // Check if session expired
        if (new Date(session.expires_at) < new Date()) {
            // Try to delete expired session, ignore errors
            await supabase.from('admin_sessions').delete().eq('id', session.id).catch(() => { })
            return null
        }

        const admin = session.admin_credentials as any

        if (!admin || !admin.is_active) {
            return null
        }

        return {
            id: admin.id,
            email: admin.email,
            full_name: admin.full_name,
        }
    } catch (error) {
        console.error('Get admin session error:', error)
        return null
    }
}

export async function requireAdmin(): Promise<AdminUser> {
    const admin = await getAdminSession()

    if (!admin) {
        redirect('/admin/login')
    }

    return admin
}

export async function adminLogout() {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

        if (sessionToken) {
            const supabase = await createClient()
            await supabase
                .from('admin_sessions')
                .delete()
                .eq('session_token', sessionToken)
        }

        cookieStore.delete(ADMIN_SESSION_COOKIE)
    } catch (error) {
        console.error('Admin logout error:', error)
    }
}
