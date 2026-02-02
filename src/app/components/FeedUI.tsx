'use client';

import {
    MessageSquare, Heart, MoreHorizontal, Bookmark, Send, Plus,
    Newspaper, BookCopy, Calendar, Rss, Building, Users, Copy,
    Code, X, UserMinus, Podcast, BookOpen, FilePen, Edit, Trash2,
    Loader2, Repeat2, Home as HomeIcon, TrendingUp, Compass,
    Activity, ChevronDown, Star, Gamepad2, Trophy, Zap, Globe,
    Settings2, Hash, Eye
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { EditPostModal } from '@/app/components/edit-post-modal';
import { PostDetailModal } from '@/app/components/post-detail-modal';
import { Badge } from '@/components/ui/badge';
import { markPostAsSeenAction } from '@/app/actions/smart-feed-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { sampleTrendingTopics } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CreatePostModal } from '@/app/components/create-post-modal';
import { PostJobModal } from '@/app/components/post-job-modal';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { SharePostModal } from '@/app/components/share-post-modal';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type FeedPost = any;

function ProfileCard({ user, profile }: { user: User | null, profile: any }) {
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
    const coverUrl = profile?.cover_url || null;
    const profileUrl = user ? `/users/${user.id}` : '/login';

    return (
        <Card className="overflow-hidden">
            <div className="relative h-20 w-full bg-muted">
                {coverUrl ? <Image src={coverUrl} alt="Cover" fill className="object-cover" /> : <div className="w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10" />}
                <Link href={profileUrl}>
                    <Avatar className="h-20 w-20 mx-auto absolute -bottom-10 left-1/2 -translate-x-1/2 border-4 border-background hover:opacity-90">
                        <AvatarImage src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" />
                        <AvatarFallback>{displayName?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                </Link>
            </div>
            <CardContent className="text-center pt-12 pb-4">
                <Link href={profileUrl}><h2 className="text-xl font-bold hover:underline">{displayName}</h2></Link>
                <p className="text-sm text-muted-foreground mt-1">{profile?.job_title || 'Add professional headline'}</p>
            </CardContent>
            <Separator />
            <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center hover:bg-muted p-2 rounded-md cursor-pointer"><span className="font-semibold text-muted-foreground">Connections</span><span className="font-bold text-primary">0</span></div>
                <div className="flex justify-between items-center hover:bg-muted p-2 rounded-md cursor-pointer"><span className="font-semibold text-muted-foreground">Invitations</span><span className="font-bold text-primary">0</span></div>
            </CardContent>
            <Separator />
            <CardContent className="p-4"><Link href="/profile/saved" className="flex items-center gap-2 hover:bg-muted p-2 rounded-md"><Bookmark className="h-4 w-4" /><span className="font-semibold">Saved Items</span></Link></CardContent>
        </Card>
    );
}

function PostCard({ post, currentUserId, onRefresh, onEdit, onPostClick }: { post: FeedPost; currentUserId?: string; onRefresh?: () => void; onEdit?: (post: FeedPost) => void; onPostClick?: (post: FeedPost) => void }) {
    const router = useRouter();
    const [isSeen, setIsSeen] = useState(post.is_seen || false);
    const observerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const supabase = createClient();

    // Mark as Seen Logic
    useEffect(() => {
        if (isSeen || !currentUserId) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                    setIsSeen(true);
                    markPostAsSeenAction(post.id, post.post_type);
                    observer.disconnect();
                }
            },
            { threshold: 0.6 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [isSeen, currentUserId, post.id, post.post_type]);

    const [isExpanded, setIsExpanded] = useState(false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [commentCount, setCommentCount] = useState(post.comment_count || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) {
            toast({ title: "Please login", description: "You need to be logged in to react.", variant: "destructive" });
            return;
        }
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount((prev: number) => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        try {
            let error;
            if (post.post_type === 'resource') {
                if (newIsLiked) {
                    // Try to insert, if fails because it exists, that's fine (sync issue)
                    const { error: insError } = await supabase.from('resource_interactions').insert({ resource_id: post.id, user_id: currentUserId, interaction_type: 'upvote' });
                    // Ignore 23505 (unique_violation)
                    if (insError && insError.code !== '23505') error = insError;
                } else {
                    const { error: delError } = await supabase.from('resource_interactions').delete().eq('resource_id', post.id).eq('user_id', currentUserId).eq('interaction_type', 'upvote');
                    error = delError;
                }
            } else {
                const table = post.post_type === 'forum' ? 'forum_post_reactions' : 'social_post_reactions';
                if (newIsLiked) {
                    const { error: insError } = await supabase.from(table).insert({ post_id: post.id, user_id: currentUserId, reaction_type: 'like' });
                    if (insError && insError.code !== '23505') error = insError;
                } else {
                    const { error: delError } = await supabase.from(table).delete().eq('post_id', post.id).eq('user_id', currentUserId);
                    error = delError;
                }
            }

            if (error) throw error;

        } catch (error: any) {
            // Revert state
            setIsLiked(!newIsLiked);
            setLikeCount((prev: number) => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));

            console.error("Like Error Detail:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update reaction",
                variant: "destructive"
            });
        }
    };

    const handleToggleComments = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newState = !showComments;
        setShowComments(newState);

        if (newState && comments.length === 0) {
            const table = post.post_type === 'forum' ? 'forum_comments' : (post.post_type === 'social' ? 'social_comments' : null);
            if (!table) return;

            const { data } = await supabase.from(table)
                .select('*, profiles(full_name, avatar_url)')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true })
                .limit(5);

            if (data) setComments(data);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId || !newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const table = post.post_type === 'forum' ? 'forum_comments' : 'social_comments';
            const { data, error } = await supabase.from(table)
                .insert({ post_id: post.id, author_id: currentUserId, content: newComment })
                .select('*, profiles(full_name, avatar_url)')
                .single();

            if (error) throw error;
            setComments([...comments, data]);
            setNewComment("");
            setCommentCount((prev: number) => prev + 1);
            toast({ title: "Comment added!" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (window.getSelection()?.toString() || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) return;
        if (onPostClick) { e.preventDefault(); onPostClick(post); }
        else router.push(post.post_type === 'resource' ? `/resources/${post.slug}` : `/forums/post/${post.slug}`);
    };

    if (post.post_type === 'resource') {
        return (
            <div className="space-y-4">
                <div
                    className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 group cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-all duration-300 shadow-sm"
                    onClick={() => router.push(`/resources/${post.slug}`)}
                >
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                        <BookCopy className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{post.resource_category || 'General'}</span>
                            <span className="text-muted-foreground text-[10px] hidden sm:inline">•</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{post.resource_type_label?.replace('_', ' ') || 'Resource'}</span>
                        </div>
                        <h3 className="font-bold text-xl text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                            &ldquo;{post.content}&rdquo;
                        </p>
                        <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <Button variant="ghost" size="sm" onClick={handleLike} className={cn("flex items-center gap-1.5 text-xs font-medium", isLiked ? "text-emerald-600 bg-emerald-100/50" : "text-muted-foreground")}>
                                <Activity className="h-3.5 w-3.5" />
                                <span>{post.view_count || 0} views</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleLike} className={cn("flex items-center gap-1.5 text-xs font-medium", isLiked ? "text-emerald-600" : "text-muted-foreground")}>
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>{likeCount} upvotes</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-1 gap-2">
                    <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-emerald-600" onClick={() => setIsSharing(true)}>
                        <Send className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 px-6 font-bold" asChild>
                        <Link href={`/resources/${post.slug}`}>Explore Resource</Link>
                    </Button>
                </div>
                {currentUserId && <SharePostModal isOpen={isSharing} onOpenChange={setIsSharing} postId={post.id} currentUserId={currentUserId} postType="resource" />}
            </div>
        );
    }

    return (
        <Card ref={observerRef} className={cn(
            "hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative",
            post.post_type === 'forum' ? 'border-l-4 border-l-blue-500/80 shadow-sm' : ''
        )} onClick={handleCardClick}>
            {isSeen && (
                <div className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold tracking-widest px-4 py-1 flex items-center gap-2 border-b">
                    <Eye className="h-3 w-3" /> You&apos;ve seen this earlier
                </div>
            )}
            <CardHeader className="pb-3 flex-row items-center gap-4 space-y-0">
                <Avatar className="h-10 w-10 border border-muted"><AvatarImage src={post.author_avatar} referrerPolicy="no-referrer" /><AvatarFallback>{post.author_name?.[0]}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-sm font-bold truncate hover:underline">{post.author_name}</CardTitle>
                        {post.post_type === 'forum' && (
                            <Badge variant="secondary" className="h-[18px] px-1.5 text-[10px] bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 gap-1 font-medium">
                                <MessageSquare className="h-2.5 w-2.5" /> Discussion
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{post.created_at ? formatDistanceToNow(new Date(post.created_at)) : ''} ago</span>
                    </div>
                    <CardDescription className="text-xs truncate">{post.author_title}</CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsSharing(true)}><Send className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                        <DropdownMenuItem><Bookmark className="mr-2 h-4 w-4" /> Save</DropdownMenuItem>
                        {currentUserId === post.author_id && onEdit && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="pb-3 space-y-2">
                {post.title && <h3 className={cn("font-bold text-lg leading-tight", post.post_type === 'forum' ? "text-primary/90" : "")}>{post.title}</h3>}
                <div className="text-sm text-foreground/80 space-y-1">
                    <div
                        className={cn("text-sm text-foreground/80 [&>p]:mb-1", !isExpanded ? "line-clamp-3" : "")}
                        dangerouslySetInnerHTML={{ __html: post.content || '' }}
                    />
                    {post.content && post.content.length > 280 && (
                        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-primary font-semibold text-xs hover:underline mt-1">
                            {isExpanded ? 'See less' : '...see more'}
                        </button>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch border-t bg-muted/20 py-2 px-4 space-y-3">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2 text-xs gap-1.5 transition-colors", isLiked ? "text-red-500 bg-red-50" : "hover:text-red-500 hover:bg-red-500/10")}
                            onClick={handleLike}
                        >
                            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} /> {likeCount}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2 text-xs gap-1.5", showComments && "bg-accent")}
                            onClick={handleToggleComments}
                        >
                            <MessageSquare className="h-3.5 w-3.5" /> {commentCount}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1.5" onClick={() => setIsSharing(true)}>
                            <Send className="h-3.5 w-3.5" /> Share
                        </Button>
                    </div>
                </div>
                {showComments && (
                    <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-3 mb-3 max-h-60 overflow-y-auto pr-1">
                            {comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-2 text-sm">
                                    <Avatar className="h-6 w-6"><AvatarImage src={comment.profiles?.avatar_url} referrerPolicy="no-referrer" /><AvatarFallback>U</AvatarFallback></Avatar>
                                    <div className="bg-background border rounded-lg p-2 flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs">{comment.profiles?.full_name}</span>
                                            <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at))} repo</span>
                                        </div>
                                        <p className="text-xs">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {currentUserId && (
                            <form onSubmit={handleSubmitComment} className="flex gap-2">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write your thoughts..."
                                    className="min-h-[2.5rem] h-[2.5rem] py-1 text-xs resize-none"
                                />
                                <Button size="sm" type="submit" disabled={isSubmitting || !newComment.trim()}>
                                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                </Button>
                            </form>
                        )}
                    </div>
                )}
            </CardFooter>
            {currentUserId && <SharePostModal isOpen={isSharing} onOpenChange={setIsSharing} postId={post.id} currentUserId={currentUserId} postType={post.post_type} />}
        </Card>
    );
}

function SideNavigation() {
    const pathname = usePathname();
    const subNavLinks = [
        { href: '/forums', label: 'Forums', icon: MessageSquare },
        { href: '/podcasts', label: 'Podcasts', icon: Podcast },
        { href: '/resources', label: 'Resources', icon: BookOpen },
        { href: '/events', label: 'Summits', icon: Calendar },
    ];
    return (
        <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center justify-between px-2 mb-2 mt-4"><h3 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em]">Discovery</h3></div>
            {subNavLinks.map(link => (
                <Link key={link.href} href={link.href}>
                    <div className={cn("flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 group text-[14px] font-medium", pathname === link.href ? "bg-accent text-primary font-bold" : "text-muted-foreground hover:bg-accent/70")}>
                        <link.icon className="h-[20px] w-[20px]" /><span>{link.label}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

import { InfiniteFeed } from '@/app/components/InfiniteFeed';

export default function FeedUI({ initialPosts, initialUser, initialProfile }: { initialPosts: any[], initialUser: User | null, initialProfile: any }) {
    const [user] = useState<User | null>(initialUser);
    const [profile] = useState<any>(initialProfile);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [modalInitialType, setModalInitialType] = useState<'social' | 'forum'>('social');
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const supabase = createClient();

    // Realtime Logic
    useEffect(() => {
        // Basic subscriber to refresh feed if needed
        const channel = supabase.channel('feed-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_posts' }, () => {
                // In a real app we would toast or update 'posts', but for ISR strategy rely on refresh/swr
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    const handlePostClick = (post: any) => { setSelectedPost(post); setIsPostDetailModalOpen(true); };

    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';

    return (
        <div className="w-full mx-auto px-1 lg:pl-1 lg:pr-2 p-2 sm:p-4 lg:pt-0">
            <div className="grid lg:grid-cols-6 gap-4">
                {/* Left Sidebar */}
                <aside className="lg:col-span-1 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pt-6">
                    <SideNavigation />
                </aside>

                {/* Profile Sidebar */}
                <aside className="lg:col-span-1 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pt-6">
                    <ProfileCard user={user} profile={profile} />
                </aside>

                {/* Feed */}
                <main className="lg:col-span-2 pt-6 space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12"><AvatarImage src={avatarUrl} referrerPolicy="no-referrer" /><AvatarFallback>{displayName?.[0]}</AvatarFallback></Avatar>
                            <button onClick={() => { setModalInitialType('social'); setIsPostModalOpen(true); }} className="w-full bg-muted rounded-full px-4 py-3 text-sm text-left text-muted-foreground hover:bg-border transition-colors">Start a post</button>
                        </CardHeader>
                        <CardFooter className="flex justify-around border-t py-2">
                            <Button variant="ghost" size="sm" onClick={() => { setModalInitialType('forum'); setIsPostModalOpen(true); }}><FilePen className="mr-2 text-blue-500" /> Forum Post</Button>
                            <Button variant="ghost" size="sm" onClick={() => setIsJobModalOpen(true)}><Newspaper className="mr-2 text-rose-500" /> Job</Button>
                        </CardFooter>
                    </Card>

                    <InfiniteFeed
                        initialPosts={initialPosts}
                        currentUser={user}
                        profile={profile}
                        PostCardComponent={PostCard}
                        onPostClick={handlePostClick}
                        onEdit={(p) => { setEditingPost(p); setIsEditModalOpen(true); }}
                    />
                </main>

                {/* Right Sidebar */}
                <aside className="lg:col-span-2 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pt-6">
                    <Card><CardHeader><CardTitle>Trending</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{sampleTrendingTopics.map(t => <Badge key={t} variant="outline"># {t}</Badge>)}</CardContent></Card>
                </aside>
            </div>

            {/* Modals */}
            <CreatePostModal isOpen={isPostModalOpen} onOpenChange={setIsPostModalOpen} initialType={modalInitialType} profile={profile} onSuccess={() => window.location.reload()} />
            <PostJobModal isOpen={isJobModalOpen} onOpenChange={setIsJobModalOpen} onSuccess={() => { }} />
            {editingPost && (
                <EditPostModal
                    key={editingPost.id}
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    post={editingPost}
                    onSuccess={() => window.location.reload()}
                />
            )}
            <PostDetailModal isOpen={isPostDetailModalOpen} onOpenChange={setIsPostDetailModalOpen} post={selectedPost} currentUser={user} />
        </div>
    );
}
