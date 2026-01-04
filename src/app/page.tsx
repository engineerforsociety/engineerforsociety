
'use client';

import {
  MessageSquare,
  Heart,
  MoreHorizontal,
  Bookmark,
  Send,
  Plus,
  Newspaper,
  BookCopy,
  Calendar,
  Rss,
  Building,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sampleForumPosts, sampleTrendingTopics, sampleUsersToFollow, sampleUserProfile } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CreatePostModal } from '@/app/components/create-post-modal';
import { LandingHero } from '@/app/components/landing-hero';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Logo } from '@/app/components/icons';

type FeedPost = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  author_name: string;
  author_avatar: string;
  author_title: string;
  category_name: string;
  like_count: number;
  comment_count: number;
};

function ProfileCard({ user, profile }: { user: User | null, profile: any }) {
  const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || profilePic?.imageUrl;
  const coverUrl = profile?.cover_url || null;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-20 w-full bg-muted">
        {coverUrl ? (
          <Image src={coverUrl} alt="Profile background" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10" />
        )}
        <Link href="/profile">
          <Avatar className="h-20 w-20 mx-auto absolute -bottom-10 left-1/2 -translate-x-1/2 border-4 border-background cursor-pointer hover:opacity-90 transition-opacity">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <CardContent className="text-center pt-12 pb-4">
        <Link href="/profile">
          <h2 className="text-xl font-bold cursor-pointer">{displayName}</h2>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          {profile?.job_title || 'Add professional headline'}
        </p>
      </CardContent>
      <Separator />
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="flex justify-between items-center hover:bg-muted p-2 rounded-md cursor-pointer">
          <span className="font-semibold text-muted-foreground">Connections</span>
          <span className="font-bold text-primary">0</span>
        </div>
        <div className="flex justify-between items-center hover:bg-muted p-2 rounded-md cursor-pointer">
          <span className="font-semibold text-muted-foreground">Invitations</span>
          <span className="font-bold text-primary">0</span>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="p-4">
        <div className="hover:bg-muted p-2 rounded-md cursor-pointer">
          <p className="text-xs text-muted-foreground">Achieve your goals with Premium</p>
          <p className="font-semibold text-sm hover:underline">Try Premium for $0</p>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 hover:bg-muted p-2 rounded-md cursor-pointer">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Saved Items</span>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-col gap-1 hover:bg-muted p-2 -m-2 rounded-md cursor-pointer">
          <span className="font-semibold text-muted-foreground flex items-center gap-2"><Rss className="h-4 w-4" /> #javascript</span>
          <p className="text-xs text-muted-foreground">You posted 2 new articles</p>
        </div>
        <div className="flex flex-col gap-1 hover:bg-muted p-2 -m-2 rounded-md cursor-pointer">
          <span className="font-semibold text-muted-foreground flex items-center gap-2"><Building className="h-4 w-4" /> Company Updates</span>
          <p className="text-xs text-muted-foreground">Innovate AI just posted a new job</p>
        </div>
      </CardContent>
      <Separator />
      <CardFooter>
        <Link href="/forums" className="text-sm font-semibold text-primary hover:underline w-full pt-4 text-center">See all activity</Link>
      </CardFooter>
    </Card>
  )
}

export default function Home() {
  const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

      setLoading(false);
    };
    getUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;

      setLoadingPosts(true);
      try {
        const { data, error } = await supabase
          .from('feed_posts_view')
          .select('*')
          .limit(10);

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();

    // Subscribe to new posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_posts' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingHero />;
  }

  const displayName = user?.user_metadata?.full_name || user?.email || sampleUserProfile.name;
  const avatarUrl = user?.user_metadata?.avatar_url || profilePic?.imageUrl;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <CreatePostModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          <aside className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
            <ProfileCard user={user} profile={profile} />
            <RecentActivityCard />
          </aside>

          <main className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Link href="/profile">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-muted rounded-full px-4 py-3 text-sm text-left text-muted-foreground border-transparent hover:bg-border transition-colors"
                  >
                    Start a post
                  </button>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-around">
                <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><BookCopy className="text-sky-500" /> Write article</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><Calendar className="text-amber-500" /> Create event</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><Newspaper className="text-rose-500" /> Post a job</Button>
              </CardFooter>
            </Card>

            {
              loadingPosts ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-2">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                      <h3 className="font-semibold text-lg">No posts yet</h3>
                      <p className="text-muted-foreground">Be the first to share something with the community!</p>
                      <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Create your first post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={post.author_avatar} alt={post.author_name} />
                            <AvatarFallback>{post.author_name?.substring(0, 2) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base font-semibold leading-tight hover:underline cursor-pointer">
                              {post.author_name || 'Anonymous'}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {post.author_title || 'Engineer'} · {formatDate(post.created_at)}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="ml-auto">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/forums/post/${post.id}`} className="hover:underline">
                          <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.content}
                        </p>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="hover:bg-primary/10 cursor-pointer">
                                #{tag.toLowerCase().replace(/ /g, '')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between items-center text-muted-foreground border-t pt-2">
                        <div className='flex gap-1'>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Heart className="h-5 w-5" /> {post.like_count || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> {post.comment_count || 0}
                          </Button>
                        </div>
                        <div className='flex gap-1'>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Send className="h-5 w-5" /> Share
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Bookmark className="h-5 w-5" /> Save
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )
            }
          </main >

          <aside className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle>Add to your feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleUsersToFollow.map(user => {
                  const userImage = PlaceHolderImages.find(p => p.id === user.avatarId);
                  return (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={userImage?.imageUrl} alt={user.name} data-ai-hint={userImage?.imageHint} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold hover:underline cursor-pointer">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.title}</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Follow
                      </Button>
                    </div>
                  )
                })}
                <Button variant="link" size="sm" className="text-muted-foreground font-bold">View all recommendations</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sampleTrendingTopics.map(topic => (
                    <Badge key={topic} variant="outline" className="text-sm font-semibold p-2 hover:bg-muted cursor-pointer">
                      # {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
