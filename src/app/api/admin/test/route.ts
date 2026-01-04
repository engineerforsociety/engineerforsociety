import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Test 1: Check if table exists
        const { data: admins, error: tableError } = await supabase
            .from('admin_credentials')
            .select('*')
            .limit(1)

        if (tableError) {
            return NextResponse.json({
                success: false,
                error: 'Table does not exist',
                details: tableError.message
            })
        }

        // Test 2: Check specific admin exists
        const { data: admin, error: adminError } = await supabase
            .from('admin_credentials')
            .select('*')
            .eq('email', 'admin@engineerforsociety.com')
            .single()

        if (adminError || !admin) {
            return NextResponse.json({
                success: false,
                error: 'Admin not found',
                details: adminError?.message
            })
        }

        // Test 3: Verify password
        const testPassword = 'admin123'
        const isValid = await bcrypt.compare(testPassword, admin.password_hash)

        return NextResponse.json({
            success: true,
            tests: {
                tableExists: true,
                adminExists: true,
                adminEmail: admin.email,
                passwordVerifies: isValid,
                passwordHash: admin.password_hash.substring(0, 20) + '...'
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: 'Test failed',
            details: error.message
        })
    }
}
