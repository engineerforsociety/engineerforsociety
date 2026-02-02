
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NotificationsClient } from './notifications-client';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch initial notifications on the server
    const { data: initialNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .not('type', 'eq', 'new_message')
        .order('created_at', { ascending: false })
        .limit(50);

    return <NotificationsClient initialNotifications={initialNotifications || []} />;
}
