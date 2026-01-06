
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
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || profilePic?.imageUrl;
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

function PostCard({ post, currentUserId, onRefresh }: { post: FeedPost; currentUserId?: string; onRefresh?: () => void }) {
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} disabled={isProcessing}>
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
      {
        currentUserId === post.author_id && (
          <EditPostModal
            isOpen={isEditModalOpen}
            onOpenChange={(open) => {
              setIsEditModalOpen(open);
              if (!open) {
                window.location.reload();
              }
            }}
            post={{
              id: post.id,
              content: post.content,
              title: post.title || ''
            }}
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
  { href: '/events', label: 'Events', icon: Calendar },
]

function SubNav() {
  const pathname = usePathname();
  return (
    <>
      <div className="bg-card border-b fixed top-16 left-0 right-0 z-40 w-full md:sticky">
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
      {/* Spacer to prevent content from jumping under fixed subnav on mobile */}
      <div className="h-14 md:hidden" aria-hidden="true" />
    </>
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
  const [loadingPosts, setLoadingPosts] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('feed_posts_view')
        .select('*')
        .order('feed_created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        // We use feed_item_id for unique identification to allow same post to appear as a repost
        const seenFeedIds = new Set<string>();
        const uniquePosts = data.filter((post: any) => {
          const feedId = post.feed_item_id || post.id;
          if (!feedId || seenFeedIds.has(feedId)) {
            return false;
          }
          seenFeedIds.add(feedId);
          return true;
        });
        setPosts(uniquePosts);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error.message || error);
      if (error.details) console.error('Error details:', error.details);
      if (error.hint) console.error('Error hint:', error.hint);
    } finally {
      setLoadingPosts(false);
    }
  }, [user, supabase]);

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
    if (user) {
      fetchPosts();
    }

    // Subscribe to forum posts
    const forumChannel = supabase
      .channel(`forum-posts-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_posts' },
        () => fetchPosts()
      )
      .subscribe();

    // Subscribe to social posts
    const socialChannel = supabase
      .channel(`social-posts-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'social_posts' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(forumChannel);
      supabase.removeChannel(socialChannel);
    };
  }, [user, supabase]);

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

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || profilePic?.imageUrl;
  const isHomePage = pathname === '/';
  const profileUrl = user ? `/users/${user.id}` : '/login';

  return (
    <>
      {isHomePage && <SubNav />}
      <div className="p-4 sm:p-6 lg:p-8 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <CreatePostModal
            isOpen={isPostModalOpen}
            initialType={modalInitialType}
            onOpenChange={setIsPostModalOpen}
            onSuccess={fetchPosts}
          />
          <PostJobModal isOpen={isJobModalOpen} onOpenChange={setIsJobModalOpen} />

          <div className="grid lg:grid-cols-4 gap-8 items-start">
            <aside className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
              <ProfileCard user={user} profile={profile} />
              <RecentActivityCard />
            </aside>

            <main className="lg:col-span-2 space-y-6">
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
                          const seenFeedIds = new Set<string>();
                          const uniquePosts = posts.filter((post) => {
                            const feedId = post.feed_item_id || post.id;
                            if (seenFeedIds.has(feedId)) {
                              return false;
                            }
                            seenFeedIds.add(feedId);
                            return true;
                          });

                          return uniquePosts.map((post) => (
                            <div className="px-4" key={post.feed_item_id || post.id}>
                              <PostCard post={post} currentUserId={user?.id} onRefresh={fetchPosts} />
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
