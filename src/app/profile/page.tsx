
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProfileRedirectPage() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUserAndRedirect = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.replace(`/users/${user.id}`);
            } else {
                router.replace('/login');
            }
        };
        getUserAndRedirect();
    }, [router, supabase]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
}
