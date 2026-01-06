
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    MessageSquare,
    Heart,
    Share2,
    Bookmark,
    ArrowLeft,
    Clock,
    ChevronRight,
    Loader2,
    Eye,
    Send,
    Repeat2,
    Globe,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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

export default function PostDetailPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<PostDetails | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();
    const { toast } = useToast();

    const formatTime = (date: string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    useEffect(() => {
        const fetchPostAndComments = async () => {
            setLoading(true);
            try {
                // Get current user
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                if (!slug || slug === 'undefined') {
                    setLoading(false);
                    return;
                }

                // Check for repost context in URL
                const urlParams = new URLSearchParams(window.location.search);
                const repostId = urlParams.get('repost');

                // Fetch post details from the view
                let query = supabase
                    .from('feed_posts_view')
                    .select('*')
                    .eq('slug', slug);

                if (repostId) {
                    query = query.eq('repost_record_id', repostId);
                } else {
                    query = query.eq('item_type', 'post');
                }

                const { data: postData, error: postError } = await query.maybeSingle();

                if (postError) throw postError;
                if (!postData) {
                    setPost(null);
                    setLoading(false);
                    return;
                }
                const formattedPost = postData as PostDetails;
                setPost(formattedPost);

                // Increment view count (only for forum posts)
                if (postData.post_type === 'forum') {
                    await supabase
                        .from('forum_posts')
                        .update({ view_count: (postData.view_count || 0) + 1 })
                        .eq('id', postData.id);
                }

                // Fetch comments based on item type and post type
                let commentQuery;
                if (formattedPost.item_type === 'repost') {
                    commentQuery = supabase
                        .from('repost_comments')
                        .select('id, content, created_at, author_id, profiles(full_name, avatar_url)')
                        .eq('repost_id', formattedPost.repost_record_id);
                } else {
                    const table = formattedPost.post_type === 'social' ? 'social_comments' : 'forum_comments';
                    commentQuery = supabase
                        .from(table)
                        .select('id, content, created_at, author_id, profiles(full_name, avatar_url)')
                        .eq('post_id', formattedPost.id);
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
                console.error('Error fetching post:', {
                    message: err.message,
                    details: err.details,
                    hint: err.hint,
                    code: err.code
                });
                toast({ title: 'Error', description: err.message || 'Failed to load post.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPostAndComments();
    }, [slug, supabase, toast]);

    const handleLike = async () => {
        if (!user) {
            toast({ title: "Sign in required", description: "Please sign in to like posts.", variant: "destructive" });
            return;
        }
        if (!post || isProcessing) return;

        setIsProcessing(true);
        try {
            const isRepost = post.item_type === 'repost';
            if (isRepost) {
                if (post.is_liked) {
                    await supabase.from('repost_reactions').delete().eq('repost_id', post.repost_record_id).eq('user_id', user.id).eq('reaction_type', 'like');
                    setPost({ ...post, is_liked: false, like_count: Math.max(0, post.like_count - 1) });
                } else {
                    await supabase.from('repost_reactions').insert({ repost_id: post.repost_record_id, user_id: user.id, reaction_type: 'like' });
                    setPost({ ...post, is_liked: true, like_count: post.like_count + 1 });
                }
            } else {
                const table = post.post_type === 'social' ? 'social_post_reactions' : 'forum_post_reactions';
                if (post.is_liked) {
                    await supabase.from(table).delete().eq('post_id', post.id).eq('user_id', user.id).eq('reaction_type', 'like');
                    setPost({ ...post, is_liked: false, like_count: Math.max(0, post.like_count - 1) });
                } else {
                    await supabase.from(table).insert({ post_id: post.id, user_id: user.id, reaction_type: 'like' });
                    setPost({ ...post, is_liked: true, like_count: post.like_count + 1 });
                }
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast({ title: "Sign in required", description: "Please sign in to save posts.", variant: "destructive" });
            return;
        }
        if (!post || isProcessing) return;

        setIsProcessing(true);
        try {
            const isRepost = post.item_type === 'repost';
            if (isRepost) {
                if (post.is_saved) {
                    await supabase.from('repost_saves').delete().eq('repost_id', post.repost_record_id).eq('user_id', user.id);
                    setPost({ ...post, is_saved: false });
                } else {
                    await supabase.from('repost_saves').insert({ repost_id: post.repost_record_id, user_id: user.id });
                    setPost({ ...post, is_saved: true });
                }
            } else {
                const table = post.post_type === 'social' ? 'social_post_saves' : 'forum_post_saves';
                if (post.is_saved) {
                    await supabase.from(table).delete().eq('post_id', post.id).eq('user_id', user.id);
                    setPost({ ...post, is_saved: false });
                } else {
                    await supabase.from(table).insert({ post_id: post.id, user_id: user.id });
                    setPost({ ...post, is_saved: true });
                }
            }
            toast({ title: post.is_saved ? "Saved" : "Removed", description: post.is_saved ? "Added to bookmarks." : "Removed from bookmarks." });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
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
                    author_id: user.id,
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
            setPost({ ...post, comment_count: post.comment_count + 1 });
            toast({ title: "Comment added!" });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading discussion...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold">Post not found</h2>
                <p className="text-muted-foreground mt-2">The discussion you're looking for doesn't exist or has been removed.</p>
                <Button asChild className="mt-6">
                    <Link href="/">Back to Feed</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
            <nav className="flex items-center text-sm text-muted-foreground mb-4 overflow-hidden whitespace-nowrap">
                <Link href="/" className="hover:text-primary flex items-center shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Feed
                </Link>
                <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
                <Link href={`/forums`} className="hover:text-primary shrink-0 transition-colors">
                    {post.post_type === 'social' ? 'Feed' : 'Forums'}
                </Link>
                <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
                <span className="text-foreground truncate">{post.title || 'Update'}</span>
            </nav>

            <article className="space-y-6">
                {post.item_type === 'repost' && (
                    <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <Repeat2 className="h-5 w-5 text-primary" />
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.reposter_avatar} />
                            <AvatarFallback>{post.reposter_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-bold">
                            {post.reposter_name} <span className="text-muted-foreground font-normal">reposted this discussion</span>
                        </p>
                    </div>
                )}

                <header className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-14 w-14 border border-border/50">
                                <AvatarImage src={post.author_avatar} alt={post.author_name} />
                                <AvatarFallback className="bg-muted text-lg font-bold">
                                    {post.author_name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg text-foreground leading-tight">{post.author_name}</p>
                                    {user?.id === post.author_id && <Badge variant="secondary" className="text-[10px] h-4 bg-muted text-muted-foreground uppercase">You</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">{post.author_title || 'Community Member'}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                    <span>{formatTime(post.created_at)}</span>
                                    <span>•</span>
                                    <Globe className="h-3 w-3" />
                                    {post.post_type === 'forum' && (
                                        <>
                                            <span>•</span>
                                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] h-4 border-none hover:bg-primary/10">
                                                Discussion
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {user?.id !== post.author_id && (
                            <Button variant="outline" size="sm" className="rounded-full border-primary text-primary font-bold px-4 h-9 hover:bg-primary/5 flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                {post.is_following ? 'Following' : 'Follow'}
                            </Button>
                        )}
                    </div>
                    {post.title && (
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-foreground/90">
                            {post.title}
                        </h1>
                    )}
                </header>

                <Card className="border-none shadow-none bg-background">
                    <CardContent className="px-0 py-4">
                        <div className="text-lg leading-relaxed whitespace-pre-wrap text-foreground/90">
                            {post.content}
                        </div>
                    </CardContent>

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap pb-4">
                            {post.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="hover:bg-accent cursor-pointer">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Separator />

                    <CardFooter className="px-0 py-4 flex flex-wrap justify-between gap-4">
                        <div className="flex gap-2">
                            <Button
                                variant={post.is_liked ? "default" : "outline"}
                                size="sm"
                                className={`flex items-center gap-2 rounded-full px-4 ${post.is_liked ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 hover:text-primary border-primary/20"}`}
                                onClick={handleLike}
                                disabled={isProcessing}
                            >
                                <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                                {post.like_count} Likes
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 rounded-full px-4 hover:bg-primary/5 hover:text-primary border-primary/20 text-muted-foreground"
                            >
                                <MessageSquare className="h-4 w-4" />
                                {post.comment_count} Comments
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={post.is_saved ? "default" : "outline"}
                                size="sm"
                                onClick={handleSave}
                                disabled={isProcessing}
                                className={`flex items-center gap-2 rounded-full px-4 ${post.is_saved ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 hover:text-primary border-primary/20"}`}
                            >
                                <Bookmark className={`h-4 w-4 ${post.is_saved ? 'fill-current' : ''}`} />
                                {post.is_saved ? 'Saved' : 'Save'}
                            </Button>

                        </div>
                    </CardFooter>
                </Card>
            </article>

            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">Comments</h2>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground px-2">
                        {post.comment_count}
                    </Badge>
                </div>

                {user ? (
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div className="flex gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback>{(user?.email || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-4">
                                <Textarea
                                    placeholder="Add to the conversation..."
                                    className="min-h-[120px] resize-none focus-visible:ring-1"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="px-6"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
                                        ) : (
                                            <><Send className="mr-2 h-4 w-4" /> Post Comment</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground">Please sign in to join the discussion.</p>
                            <Button asChild variant="outline" className="mt-4">
                                <Link href="/login">Sign In</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6 pt-4">
                    {comments.length === 0 ? (
                        <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border/60">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-muted-foreground">No comments yet. Start the conversation!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-10 w-10 shrink-0 border border-border/40">
                                    <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                                    <AvatarFallback className="bg-muted font-bold">{comment.author_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-border/30">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-bold text-sm hover:underline cursor-pointer">{comment.author_name}</h4>
                                                {user?.id === comment.author_id && <Badge variant="secondary" className="text-[9px] h-3.5 bg-muted text-muted-foreground uppercase px-1">You</Badge>}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatTime(comment.created_at)}
                                            </span>
                                        </div>
                                        <div className="text-[13px] text-foreground/90 leading-normal">
                                            {comment.content}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 px-2 pt-0.5">
                                        <button className="text-[11px] font-bold text-muted-foreground hover:text-emerald-700 transition-colors">Like</button>
                                        <button className="text-[11px] font-bold text-muted-foreground hover:text-emerald-700 transition-colors">Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
