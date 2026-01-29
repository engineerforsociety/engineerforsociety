import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import EventsClient from './events-client';
import { fetchEvents, fetchGrants } from './actions';

// Force dynamic behavior where needed, but actions use caching
// We want the page shell to be static if possible, but searchParams might require dynamic rendering
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  // Parallel data fetching on the server
  // Results are cached by Next.js Data Cache (ISR)
  const [events, grants] = await Promise.all([
    fetchEvents(),
    fetchGrants()
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0E14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">
            Loading Deployments...
          </p>
        </div>
      </div>
    }>
      <EventsClient initialEvents={events || []} initialGrants={grants || []} />
    </Suspense>
  );
}

// SEO Metadata
export async function generateMetadata() {
  return {
    title: 'Engineering Summits & Tech Circles | Engineer for Society',
    description: 'Connect with global pioneers, track research deadlines, and earn professional development credits in your specialized discipline.',
  };
}
