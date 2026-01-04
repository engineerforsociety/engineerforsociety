import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, verifyPassword, hashPassword } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const admin = await getAdminSession()
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newEmail, newPassword, newName } = body

        const supabase = await createClient()

        // 1. Fetch current admin details to verify password
        const { data: dbAdmin, error: fetchError } = await supabase
            .from('admin_credentials')
            .select('password_hash')
            .eq('id', admin.id)
            .single()

        if (fetchError || !dbAdmin) {
            return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 })
        }

        // 2. Verify current password
        const isPasswordValid = await verifyPassword(currentPassword, dbAdmin.password_hash)
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
        }

        // 3. Prepare update data
        const updateData: any = {}
        if (newEmail) updateData.email = newEmail
        if (newName) updateData.full_name = newName
        if (newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json({ success: false, error: 'New password must be at least 6 characters' }, { status: 400 })
            }
            updateData.password_hash = await hashPassword(newPassword)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, error: 'No changes provided' }, { status: 400 })
        }

        // 4. Update database
        const { error: updateError } = await supabase
            .from('admin_credentials')
            .update(updateData)
            .eq('id', admin.id)

        if (updateError) {
            console.error('Update admin error:', updateError)
            if (updateError.code === '23505') {
                return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 })
            }
            return NextResponse.json({ success: false, error: 'Failed to update credentials' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Settings updated successfully' })
    } catch (error) {
        console.error('Admin settings API error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
