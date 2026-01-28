
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCachedFeed } from '@/lib/feed-service';
import FeedUI from './components/FeedUI';
import { LandingHero } from '@/app/components/landing-hero';

// ISR Configuration
export const revalidate = 60; // 60 seconds cache

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    return <LandingHero />;
  }

  // Fetch user profile (can be cached per user session if needed, but fast enough)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="bg-muted/40 font-body min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
        <FeedContentWrapper user={user} profile={profile} />
      </Suspense>
    </div>
  );
}

// Separate component for streaming content
async function FeedContentWrapper({ user, profile }: { user: any, profile: any }) {
  // fetching cached feed
  const initialPosts = await getCachedFeed();

  return (
    <FeedUI
      initialPosts={initialPosts}
      initialUser={user}
      initialProfile={profile}
    />
  );
}
