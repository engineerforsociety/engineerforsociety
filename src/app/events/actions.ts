'use server';

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Cache revalidation time (seconds) - ISR
// This ensures that new events appear within 60 seconds
// while keeping DB load minimal.
const REVALIDATE_TIME = 60;

// Supabase client for Server-Side fetching (bypasses cookies for public data)
const getSupabaseClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// -----------------------------------------------------------------------------
// fetchEvents (Cached)
// -----------------------------------------------------------------------------
export const fetchEvents = unstable_cache(
    async () => {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('start_time', { ascending: true });

            if (error) {
                console.error('Supabase error fetching events:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('Unexpected error fetching events:', err);
            return [];
        }
    },
    ['events-list-full'],
    {
        revalidate: REVALIDATE_TIME,
        tags: ['events']
    }
);

// -----------------------------------------------------------------------------
// fetchGrants (Cached)
// -----------------------------------------------------------------------------
export const fetchGrants = unstable_cache(
    async () => {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from('event_grants')
                .select('*, events(title)')
                .limit(3);

            if (error) {
                console.error('Supabase error fetching grants:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('Unexpected error fetching grants:', err);
            return [];
        }
    },
    ['events-grants-list'],
    {
        revalidate: REVALIDATE_TIME,
        tags: ['grants']
    }
);
