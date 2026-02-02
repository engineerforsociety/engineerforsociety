
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getSmartFeedAction } from './actions/smart-feed-actions';
import FeedUI from './components/FeedUI';
import { LandingHero } from '@/app/components/landing-hero';

// Disable static ISR and use dynamic rendering for personalized feed
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) {
    return <LandingHero />;
  }

  // Fetch user profile
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
  // fetching smart feed (RSC call to server action logic)
  const result = await getSmartFeedAction(0, 10);
  const initialPosts = result.posts;

  return (
    <FeedUI
      initialPosts={initialPosts}
      initialUser={user}
      initialProfile={profile}
    />
  );
}
