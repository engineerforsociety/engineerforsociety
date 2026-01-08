
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
  Edit,
  Trash2,
  Loader2,
  Repeat2,
  Home as HomeIcon,
  TrendingUp,
  Compass,
  Activity,
  ChevronDown,
  Star,
  Gamepad2,
  Trophy,
  Zap,
  Globe,
  Settings2,
  Hash
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { EditPostModal } from '@/app/components/edit-post-modal';
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
import { sampleTrendingTopics } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CreatePostModal } from '@/app/components/create-post-modal';
import { PostJobModal } from '@/app/components/post-job-modal';
import { LandingHero } from '@/app/components/landing-hero';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { SharePostModal } from '@/app/components/share-post-modal';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

type FeedPost = {
  id: string;
  feed_item_id: string;
  title: string | null;
  content: string;
  tags: string[] | null;
  created_at: string;
  feed_created_at: string;
  view_count: number;
  is_pinned: boolean;
  slug: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_title: string;
  post_type: 'forum' | 'social';
  item_type: 'post' | 'repost';

  // Original post counts
  like_count: number;
  comment_count: number;
  share_count?: number;
  repost_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;

  // Repost-specific info
  reposter_id?: string;
  reposter_name?: string;
  reposter_avatar?: string;
  reposter_title?: string;
  repost_record_id?: string;

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
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const coverUrl = profile?.cover_url || null;

  const profileUrl = user ? `/users/${user.id}` : '/login';

  return (
    <Card className="overflow-hidden">
      <div className="relative h-20 w-full bg-muted">
        {coverUrl ? (
          <Image src={coverUrl} alt="Profile background" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10" />
        )}
        <Link href={profileUrl}>
          <Avatar className="h-20 w-20 mx-auto absolute -bottom-10 left-1/2 -translate-x-1/2 border-4 border-background cursor-pointer hover:opacity-90 transition-opacity">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <CardContent className="text-center pt-12 pb-4">
        <Link href={profileUrl}>
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
        <Link href="/profile/saved" className="flex items-center gap-2 hover:bg-muted p-2 rounded-md cursor-pointer transition-colors">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Saved Items</span>
        </Link>
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

function PostCard({ post, currentUserId, onRefresh, onEdit }: { post: FeedPost; currentUserId?: string; onRefresh?: () => void; onEdit?: (post: FeedPost) => void }) {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const isRepost = post.item_type === 'repost';

  // Interaction states
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [isFollowing, setIsFollowing] = useState(post.is_following || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUserId) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', currentUserId)
          .single();
        setCurrentUserProfile(data);
      }
    };
    fetchProfile();
  }, [currentUserId, supabase]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

    setIsProcessing(true);
    try {
      if (isRepost) {
        const { error } = await supabase
          .from('forum_post_reposts')
          .delete()
          .eq('id', post.repost_record_id);

        if (error) throw error;
      } else {
        const table = post.post_type === 'social' ? 'social_posts' : 'forum_posts';
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', post.id);

        if (error) throw error;
      }

      toast({ title: 'Success', description: 'Post has been removed.' });
      if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete post.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return `${formatDistanceToNow(new Date(dateString))} ago`;
    } catch (error) {
      return 'a while ago';
    }
  };

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
      if (isRepost) {
        // Handle repost reactions
        if (isLiked) {
          await supabase.from('repost_reactions').delete().eq('repost_id', post.repost_record_id).eq('user_id', currentUserId).eq('reaction_type', 'like');
          setIsLiked(false);
          setLikeCount((prev: number) => Math.max(0, prev - 1));
        } else {
          await supabase.from('repost_reactions').insert({ repost_id: post.repost_record_id, user_id: currentUserId, reaction_type: 'like' });
          setIsLiked(true);
          setLikeCount((prev: number) => prev + 1);
        }
      } else {
        const table = post.post_type === 'social' ? 'social_post_reactions' : 'forum_post_reactions';
        if (isLiked) {
          await supabase.from(table).delete().eq('post_id', post.id).eq('user_id', currentUserId).eq('reaction_type', 'like');
          setIsLiked(false);
          setLikeCount((prev: number) => Math.max(0, prev - 1));
        } else {
          await supabase.from(table).insert({ post_id: post.id, user_id: currentUserId, reaction_type: 'like' });
          setIsLiked(true);
          setLikeCount((prev: number) => prev + 1);
        }
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
      if (isRepost) {
        if (isSaved) {
          await supabase.from('repost_saves').delete().eq('repost_id', post.repost_record_id).eq('user_id', currentUserId);
          setIsSaved(false);
          toast({ title: "Removed", description: "Removed from your saved items." });
        } else {
          await supabase.from('repost_saves').insert({ repost_id: post.repost_record_id, user_id: currentUserId });
          setIsSaved(true);
          toast({ title: "Saved", description: "Added to your saved items." });
        }
      } else {
        const table = post.post_type === 'social' ? 'social_post_saves' : 'forum_post_saves';
        if (isSaved) {
          await supabase.from(table).delete().eq('post_id', post.id).eq('user_id', currentUserId);
          setIsSaved(false);
          toast({ title: "Removed", description: "Removed from your saved items." });
        } else {
          await supabase.from(table).insert({ post_id: post.id, user_id: currentUserId });
          setIsSaved(true);
          toast({ title: "Saved", description: "Added to your saved items." });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save.",
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
        .from('forum_post_reposts')
        .select('id')
        .eq('original_post_id', post.id)
        .eq('reposter_id', currentUserId)
        .single();

      if (existing) {
        // Unrepost
        const { error } = await supabase
          .from('forum_post_reposts')
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
          .from('forum_post_reposts')
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

  const fetchComments = async () => {
    if (comments.length > 0) return;
    setIsLoadingComments(true);
    try {
      let query;
      if (isRepost) {
        query = supabase.from('repost_comments').select('id, content, created_at, author_id, profiles(full_name, avatar_url)').eq('repost_id', post.repost_record_id);
      } else {
        const table = post.post_type === 'social' ? 'social_comments' : 'forum_comments';
        query = supabase.from(table).select('id, content, created_at, author_id, profiles(full_name, avatar_url)').eq('post_id', post.id);
      }
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    const newState = !isCommentsExpanded;
    setIsCommentsExpanded(newState);
    if (newState) {
      fetchComments();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive"
      });
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    setIsSubmittingComment(true);
    try {
      let table, idField;
      if (isRepost) {
        table = 'repost_comments';
        idField = 'repost_id';
      } else {
        table = post.post_type === 'social' ? 'social_comments' : 'forum_comments';
        idField = 'post_id';
      }

      const { data, error } = await supabase
        .from(table)
        .insert({
          [idField]: isRepost ? post.repost_record_id : post.id,
          author_id: currentUserId,
          content: newComment.trim()
        })
        .select(`
          id,
          content,
          created_at,
          author_id,
          profiles (full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
      setCommentCount((prev: number) => prev + 1);
      toast({ title: "Comment shared" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/users/${post.author_id}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link
            href={`/users/${post.item_type === 'repost' ? post.reposter_id : post.author_id}`}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/users/${post.item_type === 'repost' ? post.reposter_id : post.author_id}`);
            }}
          >
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage
                src={post.item_type === 'repost' ? post.reposter_avatar : post.author_avatar}
                alt={post.item_type === 'repost' ? post.reposter_name : post.author_name}
              />
              <AvatarFallback>
                {(post.item_type === 'repost' ? post.reposter_name : post.author_name)?.substring(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link
              href={`/users/${post.item_type === 'repost' ? post.reposter_id : post.author_id}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/users/${post.item_type === 'repost' ? post.reposter_id : post.author_id}`);
              }}
            >
              <div className="flex items-center gap-1 flex-wrap">
                <CardTitle className="text-base font-semibold leading-tight hover:underline cursor-pointer">
                  {post.item_type === 'repost' ? post.reposter_name : (post.author_name || 'Anonymous')}
                </CardTitle>
                {post.item_type === 'repost' && (
                  <span className="text-xs text-muted-foreground font-normal">reposted this</span>
                )}
              </div>
            </Link>
            <CardDescription className="text-xs">
              {(post.item_type === 'repost' ? post.reposter_title : post.author_title) || 'Engineer'} · {formatDate(post.item_type === 'repost' ? post.feed_created_at : post.created_at)}
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
              {currentUserId === (post.item_type === 'repost' ? post.reposter_id : post.author_id) && (
                <>
                  <DropdownMenuSeparator />
                  {!isRepost && (
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      onEdit?.(post);
                    }} disabled={isProcessing}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {post.item_type === 'repost' ? (
          <div className="border rounded-xl p-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => router.push(`/forums/post/${post.slug}${post.item_type === 'repost' ? `?repost=${post.repost_record_id}` : ''}`)}>
            <div className="flex items-center gap-3 mb-3">
              <Link
                href={`/users/${post.author_id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={post.author_avatar} alt={post.author_name} />
                  <AvatarFallback>{post.author_name?.substring(0, 2) || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link
                  href={`/users/${post.author_id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm font-bold leading-tight hover:underline cursor-pointer">{post.author_name}</p>
                </Link>
                <p className="text-xs text-muted-foreground">{post.author_title} · {formatDate(post.created_at)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {post.title && <h3 className="text-base font-bold">{post.title}</h3>}
              <p className="text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-2 h-5">
                    #{tag.toLowerCase().replace(/ /g, '')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          (() => {
            const isForumPost = post.post_type === 'forum';
            const hasTitle = !!post.title;

            // If it's a social post or doesn't have a distinct title, render only content
            const renderOnlyContent = !isForumPost || !hasTitle || (post.title === post.content) || (post.title?.endsWith('...') && post.content.startsWith(post.title.slice(0, -3)));

            const maxLength = 280;
            const shouldTruncate = post.content.length > maxLength && !isExpanded;
            const displayContent = shouldTruncate ? post.content.substring(0, maxLength) + '...' : post.content;

            if (renderOnlyContent) {
              return (
                <div className="space-y-4">
                  <Link href={`/forums/post/${post.slug}`} className="block group">
                    <p className="text-foreground text-sm sm:text-base whitespace-pre-wrap group-hover:text-primary transition-colors">
                      {displayContent}
                    </p>
                  </Link>
                  {post.content.length > maxLength && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-primary font-semibold text-sm hover:underline focus:outline-none"
                    >
                      {isExpanded ? 'See less' : '...see more'}
                    </button>
                  )}
                </div>
              );
            }

            return (
              <>
                <Link href={`/forums/post/${post.slug}`} className="block group">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                </Link>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {displayContent}
                  </p>
                  {post.content.length > maxLength && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-primary font-semibold text-sm hover:underline focus:outline-none"
                    >
                      {isExpanded ? 'See less' : '...see more'}
                    </button>
                  )}
                </div>
              </>
            );
          })()
        )}

        {post.item_type !== 'repost' && post.tags && post.tags.length > 0 && (
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
          <Button
            variant="ghost"
            size="sm"
            className={cn("flex items-center gap-2", isCommentsExpanded && "text-primary")}
            onClick={handleToggleComments}
          >
            <MessageSquare className="h-5 w-5" /> {commentCount}
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

      {isCommentsExpanded && (
        <div className="border-t p-4 space-y-4 bg-muted/20">
          {currentUserId ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUserProfile?.avatar_url} />
                <AvatarFallback>{(currentUserProfile?.full_name || 'ME').substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Please sign in to comment.</p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-2">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback>{(comment.profiles?.full_name || 'U').substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none">
                      <p className="text-xs font-bold mb-1">{comment.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <div className="flex gap-3 mt-1 ml-1">
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                      <button className="text-[10px] font-bold text-muted-foreground hover:text-primary">Like</button>
                      <button className="text-[10px] font-bold text-muted-foreground hover:text-primary">Reply</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {
        currentUserId && (
          <SharePostModal
            isOpen={isShareModalOpen}
            onOpenChange={setIsShareModalOpen}
            postId={post.id}
            currentUserId={currentUserId}
            onRepost={handleRepost}
            isRepost={isRepost}
            repostId={post.repost_record_id}
          />
        )
      }
    </Card >
  );
}

const subNavLinks = [
  { href: '/forums', label: 'Forums', icon: MessageSquare },
  { href: '/podcasts', label: 'Podcasts', icon: Podcast },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/events', label: 'Events', icon: Calendar },
]

function NavItem({ icon: Icon, label, active, indent }: { icon: any, label: string, active?: boolean, indent?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 group text-[14px] font-medium",
      active
        ? "bg-accent text-primary font-bold"
        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
      indent && "ml-4"
    )}>
      <Icon className={cn("h-[20px] w-[20px]", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
      <span>{label}</span>
    </div>
  )
}

function SectionHeader({ label, collapsible = true }: { label: string, collapsible?: boolean }) {
  return (
    <div className="flex items-center justify-between px-2 mb-2 mt-4 cursor-pointer group">
      <h3 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em]">{label}</h3>
      {collapsible && <ChevronDown className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />}
    </div>
  )
}

function SideNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2 py-2">
      {/* Top Main Nav */}
      <nav className="space-y-0.5">
        <NavItem icon={HomeIcon} label="Home" active={pathname === '/'} />
        <NavItem icon={TrendingUp} label="Popular" />
        <NavItem icon={Compass} label="Explore" />
        <NavItem icon={Activity} label="All Activity" />
        <NavItem icon={Plus} label="Start a community" />
      </nav>

      <Separator className="my-2 bg-border/50" />

      {/* Featured Section */}
      <div className="space-y-1">
        <SectionHeader label="Engineers' Pick" />

        {/* Yellow Featured Featured Card (Reddit style) */}
        <div className="px-1 mb-4">
          <div className="bg-yellow-400 rounded-2xl p-3.5 text-black relative overflow-hidden group cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <div className="absolute top-0 right-[-2px] bg-orange-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-bl-xl shadow-sm z-10">NEW</div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-2xl h-11 w-11 flex items-center justify-center font-black text-2xl shadow-inner text-yellow-500">S</div>
              <div className="flex-1">
                <p className="font-bold text-[15px] leading-tight">Career Hub</p>
                <p className="text-[11px] font-semibold opacity-70">Expert Mentorship</p>
                <p className="text-[10px] font-medium opacity-50 mt-0.5 truncate">1.2M monthly aspirants</p>
              </div>
            </div>
          </div>
        </div>

        <NavItem icon={Gamepad2} label="Logic Puzzles" indent />
        <NavItem icon={Trophy} label="Active Hackathons" indent />
        <NavItem icon={Zap} label="Discover Skills" indent />
      </div>

      <Separator className="my-2 bg-border/50" />

      {/* Custom Links Feeds */}
      <div className="space-y-0.5">
        <SectionHeader label="Your Society" />
        <NavItem icon={Plus} label="Create Custom Feed" />

        <div className="flex items-center justify-between group px-2 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 h-6 w-6 rounded-md flex items-center justify-center text-white font-bold text-[10px] shadow-sm">EF</div>
            <span className="text-[14px] font-medium">Design Systems</span>
          </div>
          <Star className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <Separator className="my-2 bg-border/50" />

      {/* Topics */}
      <div className="space-y-0.5">
        <SectionHeader label="Global Topics" />
        {subNavLinks.map(link => (
          <Link key={link.href} href={link.href}>
            <NavItem icon={link.icon} label={link.label} />
          </Link>
        ))}
        <NavItem icon={Globe} label="View Global Map" />
      </div>

      <Separator className="my-2 bg-border/50" />

      {/* Settings */}
      <div className="space-y-0.5">
        <SectionHeader label="Preferences" />
        <NavItem icon={Settings2} label="Manage Communities" />
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
  const [modalInitialType, setModalInitialType] = useState<'social' | 'forum'>('social');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    setLoadingPosts(true);
    try {
      // Fetch forum posts with reaction counts
      const { data: forumData, error: forumError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          author_id,
          slug,
          view_count,
          forum_post_reactions(count),
          forum_comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      if (forumError) throw forumError;

      // Fetch social posts with reaction counts
      const { data: socialData, error: socialError } = await supabase
        .from('social_posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          slug,
          social_post_reactions(count),
          social_comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      if (socialError) throw socialError;

      // Get all unique author IDs to fetch profiles
      const authorIds = new Set<string>();
      forumData?.forEach(p => authorIds.add(p.author_id));
      socialData?.forEach(p => authorIds.add(p.author_id));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, job_title')
        .in('id', Array.from(authorIds));

      const profilesMap = new Map(profiles?.map(p => [p.id, p]));

      // Smart Feed Algorithm - Calculate engagement score
      const calculateEngagementScore = (
        likeCount: number,
        commentCount: number,
        viewCount: number,
        createdAt: string
      ): number => {
        // Time decay factor (posts older than 24 hours get reduced score)
        const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.max(0.1, 1 - (ageInHours / 168)); // Decay over 7 days

        // Engagement weights
        const likeWeight = 3;
        const commentWeight = 5; // Comments are more valuable for engagement
        const viewWeight = 0.1;

        // Calculate raw engagement score
        const rawScore = (likeCount * likeWeight) + (commentCount * commentWeight) + (viewCount * viewWeight);

        // Apply time decay and ensure recent posts get visibility
        // Recent posts (< 2 hours) get a significant boost
        const recencyBonus = ageInHours < 2 ? 50 : (ageInHours < 12 ? 20 : 0);

        return (rawScore * timeDecay) + recencyBonus;
      };

      // Transform forum posts
      const formattedForumPosts = (forumData || []).map(post => {
        const author = profilesMap.get(post.author_id);
        const likeCount = post.forum_post_reactions?.[0]?.count || 0;
        const commentCount = post.forum_comments?.[0]?.count || 0;

        return {
          id: post.id,
          feed_item_id: `forum-${post.id}`,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          feed_created_at: post.created_at,
          view_count: post.view_count || 0,
          slug: post.slug,
          author_id: post.author_id,
          author_name: author?.full_name || 'Unknown',
          author_avatar: author?.avatar_url,
          author_title: author?.job_title,
          post_type: 'forum' as const,
          item_type: 'post' as const,
          like_count: likeCount,
          comment_count: commentCount,
          tags: null,
          is_pinned: false,
          engagement_score: calculateEngagementScore(likeCount, commentCount, post.view_count || 0, post.created_at),
        };
      });

      // Transform social posts
      const formattedSocialPosts = (socialData || []).map(post => {
        const author = profilesMap.get(post.author_id);
        const likeCount = post.social_post_reactions?.[0]?.count || 0;
        const commentCount = post.social_comments?.[0]?.count || 0;

        return {
          id: post.id,
          feed_item_id: `social-${post.id}`,
          content: post.content,
          created_at: post.created_at,
          feed_created_at: post.created_at,
          author_id: post.author_id,
          author_name: author?.full_name || 'Unknown',
          author_avatar: author?.avatar_url,
          author_title: author?.job_title,
          post_type: 'social' as const,
          item_type: 'post' as const,
          like_count: likeCount,
          comment_count: commentCount,
          title: null,
          slug: post.slug || '',
          view_count: 0,
          tags: null,
          is_pinned: false,
          engagement_score: calculateEngagementScore(likeCount, commentCount, 0, post.created_at),
        };
      });

      // Merge and sort by engagement score (smart algorithm)
      const allPosts = [...formattedForumPosts, ...formattedSocialPosts].sort((a, b) => {
        // Primary sort by engagement score
        const scoreDiff = (b.engagement_score || 0) - (a.engagement_score || 0);

        // If scores are similar (within 10 points), sort by recency
        if (Math.abs(scoreDiff) < 10) {
          return new Date(b.feed_created_at).getTime() - new Date(a.feed_created_at).getTime();
        }

        return scoreDiff;
      });

      // Limit to top 25 posts for performance
      setPosts(allPosts.slice(0, 25) as FeedPost[]);

    } catch (error: any) {
      console.error('Error fetching posts:', error.message || error);
    } finally {
      setLoadingPosts(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    // Initial data fetch
    const initData = async () => {
      // 1. Get current session first
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 2. Fetch profile if user exists
      if (currentUser) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(profileData);
        } catch (e) {
          console.error("Profile fetch error", e);
        }
      }

      // 3. Mark loading as done so UI shows up
      setLoading(false);
    };

    initData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Separate effect to fetch posts when user is available
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  // State to track number of new posts
  const [newPostsCount, setNewPostsCount] = useState(0);

  useEffect(() => {
    // Subscribe to forum posts
    const forumChannel = supabase
      .channel(`forum-posts-changes`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forum_posts' },
        (payload) => {
          if ((payload.new as any).author_id === user?.id) {
            // Own post - refresh immediately
            fetchPosts();
          } else if (posts.length === 0) {
            // Feed is empty - auto refresh to show first post
            fetchPosts();
          } else {
            // Show notification for new posts
            setHasNewPosts(true);
            setNewPostsCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    // Subscribe to social posts
    const socialChannel = supabase
      .channel(`social-posts-changes`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'social_posts' },
        (payload) => {
          if ((payload.new as any).author_id === user?.id) {
            // Own post - refresh immediately
            fetchPosts();
          } else if (posts.length === 0) {
            // Feed is empty - auto refresh to show first post
            fetchPosts();
          } else {
            // Show notification for new posts
            setHasNewPosts(true);
            setNewPostsCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(forumChannel);
      supabase.removeChannel(socialChannel);
    };
  }, [supabase, fetchPosts]);

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

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const isHomePage = pathname === '/';
  const profileUrl = user ? `/users/${user.id}` : '/login';

  return (
    <>
      <div className="p-2 sm:p-4 lg:pb-6 lg:pr-6 lg:pl-2 lg:pt-0 bg-muted/40 font-body">
        <div className="w-full mx-auto px-1 lg:pl-1 lg:pr-2">
          <CreatePostModal
            isOpen={isPostModalOpen}
            initialType={modalInitialType}
            onOpenChange={setIsPostModalOpen}
            onSuccess={fetchPosts}
            profile={profile}
          />
          <PostJobModal isOpen={isJobModalOpen} onOpenChange={setIsJobModalOpen} />

          <div className="grid lg:grid-cols-6 gap-4">
            {/* Left Sidebar - Navigation */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar scroll-isolated">
                <div className="pt-6 pb-10">
                  <SideNavigation />
                </div>
              </div>
            </aside>

            {/* Second Left Sidebar - Profile & Activity */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar scroll-isolated">
                <div className="pt-6 pb-10 space-y-4">
                  <ProfileCard user={user} profile={profile} />
                  <RecentActivityCard />
                </div>
              </div>
            </aside>

            <main className="lg:col-span-2 pt-6 space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Link href={profileUrl}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        setModalInitialType('social');
                        setIsPostModalOpen(true);
                      }}
                      className="w-full bg-muted rounded-full px-4 py-3 text-sm text-left text-muted-foreground border-transparent hover:bg-border transition-colors"
                    >
                      Start a post
                    </button>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-around">
                  <Button
                    onClick={() => {
                      setModalInitialType('forum');
                      setIsPostModalOpen(true);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground font-semibold"
                  >
                    <FilePen className="text-blue-500" /> Forum Post
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><BookCopy className="text-sky-500" /> Write article</Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><Calendar className="text-amber-500" /> Create event</Button>
                  <Button onClick={() => setIsJobModalOpen(true)} variant="ghost" size="sm" className="text-muted-foreground font-semibold"><Newspaper className="text-rose-500" /> Post a job</Button>
                </CardFooter>

                <div className="border-t">
                  {hasNewPosts && (
                    <div className="relative overflow-hidden">
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5 animate-gradient-shift" />

                      <div className="relative flex justify-center py-3 border-b border-primary/10">
                        <Button
                          onClick={() => {
                            fetchPosts();
                            setHasNewPosts(false);
                            setNewPostsCount(0);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="group new-post-pulse rounded-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 border-0 px-5 py-2 gap-2.5 font-semibold transition-all duration-300 hover:scale-105"
                        >
                          <div className="relative">
                            <Repeat2 className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                            {newPostsCount > 0 && (
                              <div className="absolute -top-2 -right-2 h-4 w-4 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                {newPostsCount > 9 ? '9+' : newPostsCount}
                              </div>
                            )}
                          </div>
                          <span className="flex items-center gap-1.5">
                            {newPostsCount > 1 ? `${newPostsCount} new posts` : 'New post'} available
                            <TrendingUp className="h-3.5 w-3.5 opacity-70" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {
                    loadingPosts ? (
                      /* Beautiful Skeleton Loading Animation */
                      <div className="space-y-4 pt-4 px-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-background rounded-xl p-4 border border-border/50">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-muted via-muted/80 to-muted animate-shimmer" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 rounded-full bg-gradient-to-r from-muted to-muted/60" />
                                <div className="h-3 w-24 rounded-full bg-muted/60" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="h-4 w-full rounded-full bg-muted/50" />
                              <div className="h-4 w-4/5 rounded-full bg-muted/40" />
                              <div className="h-4 w-3/5 rounded-full bg-muted/30" />
                            </div>
                            <div className="flex gap-4 mt-4 pt-4 border-t border-border/30">
                              <div className="h-8 w-16 rounded-full bg-muted/40" />
                              <div className="h-8 w-16 rounded-full bg-muted/40" />
                              <div className="flex-1" />
                              <div className="h-8 w-16 rounded-full bg-muted/40" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : posts.length === 0 ? (
                      /* Beautiful Empty State with Animated Gradient */
                      <div className="py-16 px-6">
                        <div className="relative max-w-md mx-auto">
                          {/* Animated Background Gradient */}
                          <div className="absolute inset-0 -m-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-3xl animate-gradient-shift" />

                          <div className="relative text-center space-y-6">
                            {/* Animated Icon Container */}
                            <div className="relative inline-flex">
                              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
                              <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-6 rounded-full border border-primary/10">
                                <div className="relative">
                                  <MessageSquare className="h-12 w-12 text-primary/60" strokeWidth={1.5} />
                                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary/30 rounded-full flex items-center justify-center">
                                    <Plus className="h-2.5 w-2.5 text-primary" />
                                  </div>
                                </div>
                              </div>
                              {/* Floating Decorative Elements */}
                              <div className="absolute -top-2 -left-4 h-3 w-3 bg-primary/40 rounded-full animate-bounce delay-100" />
                              <div className="absolute -bottom-3 -right-2 h-2 w-2 bg-secondary/50 rounded-full animate-bounce delay-300" />
                              <div className="absolute top-1/2 -right-6 h-2.5 w-2.5 bg-primary/30 rounded-full animate-bounce delay-500" />
                            </div>

                            {/* Text Content */}
                            <div className="space-y-3">
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Your Feed is Empty
                              </h3>
                              <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
                                Be the first to spark a conversation! Share your thoughts, insights, or discoveries with the community.
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                              <Button
                                onClick={() => {
                                  setModalInitialType('social');
                                  setIsPostModalOpen(true);
                                }}
                                className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold px-6 py-5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                              >
                                <span className="relative flex items-center gap-2">
                                  <Plus className="h-4 w-4" />
                                  Create Your First Post
                                </span>
                              </Button>

                              <Button
                                variant="outline"
                                onClick={fetchPosts}
                                className="group border-2 border-border/50 hover:border-primary/30 hover:bg-primary/5 px-5 py-5 rounded-xl font-medium transition-all duration-300"
                              >
                                <Repeat2 className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Refresh Feed
                              </Button>
                            </div>

                            {/* Suggested Actions */}
                            <div className="pt-6 border-t border-border/30 mt-6">
                              <p className="text-xs text-muted-foreground/60 mb-4 uppercase tracking-wider font-medium">Quick Actions</p>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setModalInitialType('forum');
                                    setIsPostModalOpen(true);
                                  }}
                                  className="text-xs bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-full px-4"
                                >
                                  <FilePen className="h-3 w-3 mr-1.5" />
                                  Forum Post
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-full px-4"
                                >
                                  <Calendar className="h-3 w-3 mr-1.5" />
                                  Create Event
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsJobModalOpen(true)}
                                  className="text-xs bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-full px-4"
                                >
                                  <Newspaper className="h-3 w-3 mr-1.5" />
                                  Post Job
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Feed with Staggered Animations */
                      <div className="space-y-4 pt-4 bg-gradient-to-b from-muted/10 to-muted/30">
                        {(() => {
                          // Final deduplication before rendering
                          const seenFeedIds = new Set<string>();
                          const uniquePosts = posts.filter((post) => {
                            const feedId = post.feed_item_id || post.id;
                            if (seenFeedIds.has(feedId)) {
                              return false;
                            }
                            seenFeedIds.add(feedId);
                            return true;
                          });

                          return uniquePosts.map((post, index) => (
                            <div
                              className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                              key={post.feed_item_id || post.id}
                              style={{
                                animationDelay: `${Math.min(index * 100, 500)}ms`,
                                animationFillMode: 'both'
                              }}
                            >
                              <PostCard
                                post={post}
                                currentUserId={user?.id}
                                onRefresh={fetchPosts}
                                onEdit={(p) => {
                                  setEditingPost(p);
                                  setIsEditModalOpen(true);
                                }}
                              />
                            </div>
                          ));
                        })()}

                        {/* End of Feed Indicator */}
                        <div className="py-8 text-center">
                          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground/60 bg-muted/30 px-4 py-2 rounded-full">
                            <Zap className="h-3.5 w-3.5" />
                            You're all caught up!
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>
              </Card>

            </main >

            {/* Right Sidebar - Suggested Follows */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar scroll-isolated">
                <div className="pt-6 pb-10">
                  <SuggestedFollows currentUser={user} />
                </div>
              </div>
            </aside>

            {/* Far Right Sidebar - Trending Topics */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar scroll-isolated">
                <div className="pt-6 pb-10">
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
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div >
      <EditPostModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={fetchPosts}
        post={editingPost ? {
          id: editingPost.id,
          content: editingPost.content,
          title: editingPost.title || ''
        } : { id: '', content: '', title: '' }}
      />
    </>
  );
}
