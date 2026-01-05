
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
  Copy,
  Code,
  X,
  UserMinus,
  Podcast,
  BookOpen,
  FilePen,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sampleTrendingTopics, sampleUserProfile } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CreatePostModal } from '@/app/components/create-post-modal';
import { PostJobModal } from '@/app/components/post-job-modal';
import { LandingHero } from '@/app/components/landing-hero';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Logo } from '@/app/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { SharePostModal } from '@/app/components/share-post-modal';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type FeedPost = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_title: string;
  category_name: string;
  like_count: number;
  comment_count: number;
  share_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
  is_following?: boolean;
};

type SuggestedUser = {
    id: string;
    full_name: string | null;
    job_title: string | null;
    avatar_url: string | null;
}

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
          <h2 className="text-xl font-bold cursor-pointer hover:underline">{displayName}</h2>
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

function PostCard({ post, currentUserId, formatDate }: { post: FeedPost; currentUserId?: string; formatDate: (date: string) => string }) {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [isFollowing, setIsFollowing] = useState(post.is_following || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId)
          .eq('reaction_type', 'like');

        if (error) throw error;
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: post.id,
            user_id: currentUserId,
            reaction_type: 'like'
          });

        if (error) throw error;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update like.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save posts.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('post_saves')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);

        if (error) throw error;
        setIsSaved(false);
        toast({
          title: "Post unsaved",
          description: "Post removed from your saved items."
        });
      } else {
        // Save
        const { error } = await supabase
          .from('post_saves')
          .insert({
            post_id: post.id,
            user_id: currentUserId
          });

        if (error) throw error;
        setIsSaved(true);
        toast({
          title: "Post saved",
          description: "Post added to your saved items."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save post.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to share posts.",
        variant: "destructive"
      });
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleRepost = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to repost.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Check if already reposted
      const { data: existing } = await supabase
        .from('post_reposts')
        .select('id')
        .eq('original_post_id', post.id)
        .eq('reposter_id', currentUserId)
        .single();

      if (existing) {
        // Unrepost
        const { error } = await supabase
          .from('post_reposts')
          .delete()
          .eq('original_post_id', post.id)
          .eq('reposter_id', currentUserId);

        if (error) throw error;
        toast({
          title: "Repost removed",
          description: "Post removed from your profile."
        });
      } else {
        // Repost
        const { error } = await supabase
          .from('post_reposts')
          .insert({
            original_post_id: post.id,
            reposter_id: currentUserId
          });

        if (error) throw error;
        toast({
          title: "Reposted!",
          description: "Post has been added to your profile."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to repost.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/forums/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive"
      });
    }
  };

  const handleEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/forums/post/${post.id}/embed" width="600" height="400" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode).then(() => {
      toast({
        title: "Embed code copied!",
        description: "Embed code copied to clipboard."
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy embed code.",
        variant: "destructive"
      });
    });
  };

  const handleNotInterested = async () => {
    // This could hide the post from the feed
    toast({
      title: "Post hidden",
      description: "We'll show you less content like this."
    });
  };

  const handleUnfollow = async () => {
    if (!currentUserId || !post.author_id) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', post.author_id);

      if (error) throw error;
      setIsFollowing(false);
      toast({
        title: "Unfollowed",
        description: `You've unfollowed ${post.author_name}.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to profile - for now using /profile, but ideally should be /profile/[userId]
    // Since we don't have dynamic profile routes yet, we'll use a query param or create one
    router.push(`/profile?userId=${post.author_id}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href={`/profile?userId=${post.author_id}`} onClick={handleAuthorClick}>
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={post.author_avatar} alt={post.author_name} />
              <AvatarFallback>{post.author_name?.substring(0, 2) || 'U'}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link href={`/profile?userId=${post.author_id}`} onClick={handleAuthorClick}>
              <CardTitle className="text-base font-semibold leading-tight hover:underline cursor-pointer">
                {post.author_name || 'Anonymous'}
              </CardTitle>
            </Link>
            <CardDescription className="text-xs">
              {post.author_title || 'Engineer'} · {formatDate(post.created_at)}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto" disabled={isProcessing}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSave} disabled={isProcessing}>
                <Bookmark className="mr-2 h-4 w-4" />
                {isSaved ? 'Unsave' : 'Save'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink} disabled={isProcessing}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link to post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEmbed} disabled={isProcessing}>
                <Code className="mr-2 h-4 w-4" />
                Embed this post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNotInterested} disabled={isProcessing}>
                <X className="mr-2 h-4 w-4" />
                Not interested
              </DropdownMenuItem>
              {isFollowing && (
                <DropdownMenuItem onClick={handleUnfollow} disabled={isProcessing}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unfollow
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {(() => {
          const isTitleDerived = post.title.endsWith('...')
            ? post.content.startsWith(post.title.slice(0, -3))
            : post.title === post.content;

          if (isTitleDerived) {
            return (
              <p className="text-foreground text-sm sm:text-base mb-4 whitespace-pre-wrap line-clamp-[10]">
                {post.content}
              </p>
            );
          }

          return (
            <>
              <h3 className="text-lg font-bold mb-2">{post.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 whitespace-pre-wrap">
                {post.content}
              </p>
            </>
          );
        })()}
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
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
            onClick={handleLike}
            disabled={isProcessing}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} /> {likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> {post.comment_count || 0}
          </Button>
        </div>
        <div className='flex gap-1'>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleShare}
            disabled={isProcessing}
          >
            <Send className="h-5 w-5" /> Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${isSaved ? 'text-primary' : ''}`}
            onClick={handleSave}
            disabled={isProcessing}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} /> Save
          </Button>
        </div>
      </CardFooter>
      {
        currentUserId && (
          <SharePostModal
            isOpen={isShareModalOpen}
            onOpenChange={setIsShareModalOpen}
            postId={post.id}
            currentUserId={currentUserId}
            onRepost={handleRepost}
          />
        )
      }
    </Card >
  );
}

const subNavLinks = [
    { href: '/forums', label: 'Forums', icon: Users },
    { href: '/podcasts', label: 'Podcasts', icon: Podcast },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/chapters', label: 'Chapters', icon: Users },
]

function SubNav() {
    const pathname = usePathname();
    return (
        <div className="bg-card border-b sticky top-16 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex justify-center items-center h-14">
                    <nav className="flex space-x-6">
                        {subNavLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 text-sm font-medium transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <link.icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </div>
    )
}

function SuggestedFollows({ currentUser }: { currentUser: User | null }) {
    const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            if (!currentUser) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, job_title, avatar_url')
                .not('id', 'eq', currentUser.id)
                .limit(3);

            if (error) {
                console.error('Error fetching suggested users:', error);
            } else {
                setSuggestedUsers(data);
            }
        };
        fetchSuggestedUsers();
    }, [currentUser, supabase]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add to your feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestedUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || 'User'} />
                            <AvatarFallback>{(user.full_name || 'U').substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-semibold hover:underline cursor-pointer">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.job_title || 'Community Member'}</p>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1">
                            <Plus className="h-4 w-4" /> Follow
                        </Button>
                    </div>
                ))}
                <Button variant="link" size="sm" className="text-muted-foreground font-bold">View all recommendations</Button>
            </CardContent>
        </Card>
    );
}

export default function Home() {
  const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

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
      if (!session?.user) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const fetchPosts = async () => {
      if (!user || !isMounted) return;

      setLoadingPosts(true);
      try {
        const { data, error } = await supabase
          .from('feed_posts_view')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Remove duplicates based on post id - more robust
        if (data && isMounted) {
          const seenIds = new Set<string>();
          const uniquePosts = data.filter((post: any) => {
            if (!post.id || seenIds.has(post.id)) {
              return false;
            }
            seenIds.add(post.id);
            return true;
          });
          setPosts(uniquePosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    };

    fetchPosts();

    // Subscribe to new posts
    channel = supabase
      .channel(`posts-changes-${user?.id || 'anon'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_posts' },
        () => {
          if (isMounted) {
            fetchPosts();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, supabase]);

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
  const isHomePage = pathname === '/';

  return (
    <>
      {isHomePage && <SubNav />}
      <div className="p-4 sm:p-6 lg:p-8 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <CreatePostModal isOpen={isPostModalOpen} onOpenChange={setIsPostModalOpen} />
          <PostJobModal isOpen={isJobModalOpen} onOpenChange={setIsJobModalOpen} />

          <div className="grid lg:grid-cols-4 gap-8 items-start">
            <aside className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
              <ProfileCard user={user} profile={profile} />
              <RecentActivityCard />
            </aside>

            <main className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Link href="/profile">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <button
                      onClick={() => setIsPostModalOpen(true)}
                      className="w-full bg-muted rounded-full px-4 py-3 text-sm text-left text-muted-foreground border-transparent hover:bg-border transition-colors"
                    >
                      Start a post
                    </button>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-around">
                  <Button onClick={() => setIsPostModalOpen(true)} variant="ghost" size="sm" className="text-muted-foreground font-semibold"><FilePen className="text-blue-500" /> Forum Post</Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><BookCopy className="text-sky-500" /> Write article</Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><Calendar className="text-amber-500" /> Create event</Button>
                  <Button onClick={() => setIsJobModalOpen(true)} variant="ghost" size="sm" className="text-muted-foreground font-semibold"><Newspaper className="text-rose-500" /> Post a job</Button>
                </CardFooter>

                <div className="border-t">
                  {
                    loadingPosts ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="py-12">
                        <div className="text-center space-y-2">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                          <h3 className="font-semibold text-lg">No posts yet</h3>
                          <p className="text-muted-foreground">Be the first to share something with the community!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4 bg-muted/20">
                        {(() => {
                          // Final deduplication before rendering
                          const seenIds = new Set<string>();
                          const uniquePosts = posts.filter((post) => {
                            if (seenIds.has(post.id)) {
                              return false;
                            }
                            seenIds.add(post.id);
                            return true;
                          });

                          return uniquePosts.map((post) => (
                            <div className="px-4" key={post.id}>
                              <PostCard post={post} currentUserId={user?.id} formatDate={formatDate} />
                            </div>
                          ));
                        })()}
                      </div>
                    )
                  }
                </div>
              </Card>

            </main >

            <aside className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
              <SuggestedFollows currentUser={user} />

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
    </>
  );
}
