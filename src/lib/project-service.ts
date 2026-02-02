
import { unstable_cache } from 'next/cache';
import { sampleProjects } from '@/lib/data';

// This simulates fetching from Supabase with caching (ISR)
export const getProjects = unstable_cache(
    async () => {
        // In a real app, we would do:
        // const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        // return data;

        // Simulating a delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return sampleProjects;
    },
    ['projects-list'],
    { revalidate: 3600, tags: ['projects'] }
);
