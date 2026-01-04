import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const result = await authenticateAdmin(email, password)

        if (result.success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 401 }
            )
        }
    } catch (error) {
        console.error('Admin login API error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
