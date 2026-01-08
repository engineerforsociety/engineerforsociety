'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    MessageSquare,
    Heart,
    Bookmark,
    Clock,
    Loader2,
    Send,
    Repeat2,
    Globe,
    Plus,
    X,
    Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

type Comment = {
    id: string;
    content: string;
    created_at: string;
    author_id: string;
    author_name: string;
    author_avatar: string;
};

type PostDetails = {
    id: string;
    feed_item_id?: string;
    title: string | null;
    content: string;
    tags: string[] | null;
    created_at: string;
    feed_created_at?: string;
    view_count: number;
    is_pinned?: boolean;
    slug: string;
    author_id: string;
    author_name: string;
    author_avatar: string;
    author_title: string;
    post_type: 'forum' | 'social';
    item_type: 'post' | 'repost';

    // Interaction counts
    like_count: number;
    comment_count: number;
    share_count?: number;
    repost_count?: number;
    is_liked?: boolean;
    is_saved?: boolean;

    // Repost info
    reposter_id?: string;
    reposter_name?: string;
    reposter_avatar?: string;
    reposter_title?: string;
    repost_record_id?: string;

    is_following?: boolean;
};

interface PostDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    post: any; // Using any for compatibility with FeedPost type
    currentUser: any;
    onPostUpdate?: (updatedPost: any) => void;
}

export function PostDetailModal({ isOpen, onOpenChange, post: initialPost, currentUser, onPostUpdate }: PostDetailModalProps) {
    const [post, setPost] = useState<PostDetails | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false); // Start false as we have initial data
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    // Helper to render formatted text (reusing logic from page.tsx)
    const renderFormattedContent = (content: string) => {
        if (!content) return null;
        const paragraphs = content.split('\n');

        return paragraphs.map((paragraph, pIndex) => {
            if (!paragraph.trim()) return <br key={pIndex} />;

            const parts = [];
            let lastIndex = 0;
            const regex = /(\*\*(.*?)\*\*)|(\*(.*?)\*)/g;
            let match;

            while ((match = regex.exec(paragraph)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(paragraph.substring(lastIndex, match.index));
                }

                if (match[2]) { // Bold
                    parts.push(<strong key={`${pIndex}-${match.index}`} className="font-bold text-foreground">{match[2]}</strong>);
                } else if (match[4]) { // Italic
                    parts.push(<em key={`${pIndex}-${match.index}`} className="italic">{match[4]}</em>);
                }

                lastIndex = regex.lastIndex;
            }

            if (lastIndex < paragraph.length) {
                parts.push(paragraph.substring(lastIndex));
            }

            return (
                <div key={pIndex}>
                    {parts.length > 0 ? parts : paragraph}
                </div>
            );
        });
    };

    const formatTime = (date: string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    // Initialize post state from props
    useEffect(() => {
        if (initialPost && isOpen) {
            setPost(initialPost);
            fetchComments(initialPost);

            // Update URL to post slug
            const newPath = `/forums/post/${initialPost.slug}${initialPost.item_type === 'repost' ? `?repost=${initialPost.repost_record_id}` : ''}`;
            window.history.pushState({ modal: true }, '', newPath);

            // Handle browser back button
            const handlePopState = () => {
                onOpenChange(false);
            };
            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [initialPost, isOpen, onOpenChange]);

    // Cleanup URL on close
    useEffect(() => {
        if (!isOpen && post) {
            // Only replace state if we are still on the post URL to avoid accidental redirects
            if (window.location.pathname.includes('/post/')) {
                window.history.replaceState(null, '', '/');
            }
        }
    }, [isOpen, post]);

    const fetchComments = async (currentPost: PostDetails) => {
        setLoadingComments(true);
        try {
            // Fetch comments based on item type and post type
            let commentQuery;
            if (currentPost.item_type === 'repost') {
                commentQuery = supabase
                    .from('repost_comments')
                    .select('id, content, created_at, author_id, profiles(full_name, avatar_url)')
                    .eq('repost_id', currentPost.repost_record_id);
            } else {
                const table = currentPost.post_type === 'social' ? 'social_comments' : 'forum_comments';
                commentQuery = supabase
                    .from(table)
                    .select('id, content, created_at, author_id, profiles(full_name, avatar_url)')
                    .eq('post_id', currentPost.id);
            }

            const { data: commentData, error: commentError } = await commentQuery.order('created_at', { ascending: true });

            if (commentError) {
                console.error('Error fetching comments:', commentError);
            } else {
                const formattedComments = (commentData || [])?.map((c: any) => ({
                    id: c.id,
                    content: c.content,
                    created_at: c.created_at,
                    author_id: c.author_id,
                    author_name: c.profiles?.full_name || 'Anonymous',
                    author_avatar: c.profiles?.avatar_url
                })) || [];
                setComments(formattedComments);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            toast({ title: "Sign in required", description: "Please sign in to like posts.", variant: "destructive" });
            return;
        }
        if (!post || isProcessing) return;

        setIsProcessing(true);
        try {
            const isRepost = post.item_type === 'repost';
            let newIsLiked = !post.is_liked;
            let newLikeCount = post.is_liked ? Math.max(0, post.like_count - 1) : post.like_count + 1;

            // Optimistic update
            const updatedPost = { ...post, is_liked: newIsLiked, like_count: newLikeCount };
            setPost(updatedPost);
            if (onPostUpdate) onPostUpdate(updatedPost);

            if (isRepost) {
                if (post.is_liked) {
                    await supabase.from('repost_reactions').delete().eq('repost_id', post.repost_record_id).eq('user_id', currentUser.id).eq('reaction_type', 'like');
                } else {
                    await supabase.from('repost_reactions').insert({ repost_id: post.repost_record_id, user_id: currentUser.id, reaction_type: 'like' });
                }
            } else {
                const table = post.post_type === 'social' ? 'social_post_reactions' : 'forum_post_reactions';
                if (post.is_liked) {
                    await supabase.from(table).delete().eq('post_id', post.id).eq('user_id', currentUser.id).eq('reaction_type', 'like');
                } else {
                    await supabase.from(table).insert({ post_id: post.id, user_id: currentUser.id, reaction_type: 'like' });
                }
            }
        } catch (err: any) {
            // Revert on error
            setPost(post);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (!currentUser) {
            toast({ title: "Sign in required", description: "Please sign in to save posts.", variant: "destructive" });
            return;
        }
        if (!post || isProcessing) return;

        setIsProcessing(true);
        try {
            const isRepost = post.item_type === 'repost';
            let newIsSaved = !post.is_saved;

            // Optimistic update
            const updatedPost = { ...post, is_saved: newIsSaved };
            setPost(updatedPost);
            if (onPostUpdate) onPostUpdate(updatedPost);

            if (isRepost) {
                if (post.is_saved) {
                    await supabase.from('repost_saves').delete().eq('repost_id', post.repost_record_id).eq('user_id', currentUser.id);
                } else {
                    await supabase.from('repost_saves').insert({ repost_id: post.repost_record_id, user_id: currentUser.id });
                }
            } else {
                const table = post.post_type === 'social' ? 'social_post_saves' : 'forum_post_saves';
                if (post.is_saved) {
                    await supabase.from(table).delete().eq('post_id', post.id).eq('user_id', currentUser.id);
                } else {
                    await supabase.from(table).insert({ post_id: post.id, user_id: currentUser.id });
                }
            }
            toast({ title: newIsSaved ? "Saved" : "Removed", description: newIsSaved ? "Added to bookmarks." : "Removed from bookmarks." });
        } catch (err: any) {
            setPost(post);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            toast({ title: "Sign in required", description: "Please sign in to comment.", variant: "destructive" });
            return;
        }
        if (!newComment.trim() || !post) return;

        setIsSubmitting(true);
        try {
            const isRepost = post.item_type === 'repost';
            const table = isRepost ? 'repost_comments' : (post.post_type === 'social' ? 'social_comments' : 'forum_comments');
            const idField = isRepost ? 'repost_id' : 'post_id';
            const itemId = isRepost ? post.repost_record_id : post.id;

            const { data, error } = await supabase
                .from(table)
                .insert({
                    [idField]: itemId,
                    author_id: currentUser.id,
                    content: newComment.trim()
                })
                .select('id, content, created_at, author_id, profiles (full_name, avatar_url)')
                .single();

            if (error) throw error;

            const resData = data as any;
            const addedComment: Comment = {
                id: resData.id,
                content: resData.content,
                created_at: resData.created_at,
                author_id: resData.author_id,
                author_name: resData.profiles?.full_name || 'You',
                author_avatar: resData.profiles?.avatar_url
            };

            setComments([...comments, addedComment]);
            setNewComment('');

            const updatedPost = { ...post, comment_count: post.comment_count + 1 };
            setPost(updatedPost);
            if (onPostUpdate) onPostUpdate(updatedPost);

            toast({ title: "Comment added!" });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!post) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col sm:flex-row bg-background">
                <DialogTitle className="sr-only">Post by {post.author_name}</DialogTitle>
                <DialogDescription className="sr-only">View post details and comments</DialogDescription>
                {/* Left Side: Post Content (Scrollable) */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-border/50">
                    <div className="p-4 border-b flex justify-between items-center bg-muted/10 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author_avatar} />
                                <AvatarFallback>{post.author_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-sm font-bold">{post.author_name}</h3>
                                <p className="text-[10px] text-muted-foreground">{post.author_title || 'Member'} • {formatTime(post.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" asChild title="Open in new page">
                                <Link href={`/forums/post/${post.slug}`} target="_blank">
                                    <Maximize2 className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6 pb-6">
                            {post.item_type === 'repost' && (
                                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                                    <Repeat2 className="h-4 w-4 text-primary" />
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={post.reposter_avatar} />
                                        <AvatarFallback>{post.reposter_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs font-medium">
                                        {post.reposter_name} <span className="text-muted-foreground font-normal">reposted this</span>
                                    </p>
                                </div>
                            )}

                            {post.title && (
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/90">
                                    {post.title}
                                </h1>
                            )}

                            <div className="text-base leading-relaxed text-foreground/90 space-y-1">
                                {renderFormattedContent(post.content)}
                            </div>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex gap-2 flex-wrap pt-2">
                                    {post.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs hover:bg-accent cursor-pointer">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant={post.is_liked ? "default" : "outline"}
                                    size="sm"
                                    className={`flex items-center gap-2 rounded-full px-4 h-8 text-xs ${post.is_liked ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 hover:text-primary border-primary/20"}`}
                                    onClick={handleLike}
                                    disabled={isProcessing}
                                >
                                    <Heart className={`h-3.5 w-3.5 ${post.is_liked ? 'fill-current' : ''}`} />
                                    {post.like_count} Likes
                                </Button>
                                <Button
                                    variant={post.is_saved ? "default" : "outline"}
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isProcessing}
                                    className={`flex items-center gap-2 rounded-full px-4 h-8 text-xs ${post.is_saved ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 hover:text-primary border-primary/20"}`}
                                >
                                    <Bookmark className={`h-3.5 w-3.5 ${post.is_saved ? 'fill-current' : ''}`} />
                                    {post.is_saved ? 'Saved' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Side: Comments (Fixed width on desktop, stacked on mobile) */}
                <div className="w-full sm:w-[350px] lg:w-[400px] bg-muted/10 flex flex-col h-[50vh] sm:h-auto border-t sm:border-t-0 sm:border-l border-border/50">
                    <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                        <h3 className="font-bold text-sm">Comments ({post.comment_count})</h3>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {loadingComments ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                                    <p className="text-xs text-muted-foreground/70">Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-2.5">
                                        <Avatar className="h-8 w-8 shrink-0 mt-1">
                                            <AvatarImage src={comment.author_avatar} />
                                            <AvatarFallback>{comment.author_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="bg-background border border-border/40 p-2.5 rounded-lg rounded-tl-none shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-xs">{comment.author_name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                                                </div>
                                                <div className="text-sm text-foreground/90 leading-tight">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-3 bg-background border-t mt-auto">
                        {currentUser ? (
                            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
                                    <AvatarFallback>{(currentUser?.email || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex gap-2">
                                    <Textarea
                                        placeholder="Add a comment..."
                                        className="min-h-[36px] h-9 py-2 text-sm resize-none flex-1"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleCommentSubmit(e);
                                            }
                                        }}
                                    />
                                    <Button size="icon" className="h-9 w-9 shrink-0" type="submit" disabled={!newComment.trim() || isSubmitting}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <Button variant="outline" className="w-full text-xs" asChild>
                                <Link href="/login">Sign in to comment</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
