
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
    Send
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
    title: string;
    content: string;
    tags: string[];
    created_at: string;
    view_count: number;
    author_id: string;
    author_name: string;
    author_avatar: string;
    author_title: string;
    category_name: string;
    category_slug: string;
    like_count: number;
    comment_count: number;
    is_liked: boolean;
    is_saved: boolean;
    is_following: boolean;
};

export default function PostDetailPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<PostDetails | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
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

                // Fetch post details from the view
                const { data: postData, error: postError } = await supabase
                    .from('feed_posts_view')
                    .select('*')
                    .eq('slug', slug)
                    .maybeSingle();

                if (postError) throw postError;
                if (!postData) {
                    setPost(null);
                    setLoading(false);
                    return;
                }
                setPost(postData);

                // Increment view count via update directly since RPC might not be ready
                await supabase
                    .from('forum_posts')
                    .update({ view_count: (postData.view_count || 0) + 1 })
                    .eq('id', postData.id);

                // Fetch comments
                const { data: commentData, error: commentError } = await supabase
                    .from('forum_comments')
                    .select(`
                        id,
                        content,
                        created_at,
                        author_id,
                        profiles (
                            full_name,
                            avatar_url
                        )
                    `)
                    .eq('post_id', postData.id)
                    .order('created_at', { ascending: true });

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
        if (!post) return;

        try {
            if (post.is_liked) {
                await supabase.from('post_reactions').delete().eq('post_id', post.id).eq('user_id', user.id);
                setPost({ ...post, is_liked: false, like_count: Math.max(0, post.like_count - 1) });
            } else {
                await supabase.from('post_reactions').insert({ post_id: post.id, user_id: user.id, reaction_type: 'like' });
                setPost({ ...post, is_liked: true, like_count: post.like_count + 1 });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast({ title: "Sign in required", description: "Please sign in to save posts.", variant: "destructive" });
            return;
        }
        if (!post) return;

        try {
            if (post.is_saved) {
                await supabase.from('post_saves').delete().eq('post_id', post.id).eq('user_id', user.id);
                setPost({ ...post, is_saved: false });
                toast({ title: "Post unsaved", description: "Removed from bookmarks." });
            } else {
                await supabase.from('post_saves').insert({ post_id: post.id, user_id: user.id });
                setPost({ ...post, is_saved: true });
                toast({ title: "Post saved", description: "Added to bookmarks." });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
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
            const { data, error } = await supabase
                .from('forum_comments')
                .insert({
                    post_id: post.id,
                    author_id: user.id,
                    content: newComment.trim()
                })
                .select(`
                    id,
                    content,
                    created_at,
                    author_id,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
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
            toast({ title: "Comment added!", description: "Your thought has been shared." });
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
                    Forums
                </Link>
                <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
                <span className="text-foreground truncate">{post.title}</span>
            </nav>

            <article className="space-y-6">
                <header className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.author_avatar} alt={post.author_name} />
                                <AvatarFallback>{post.author_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground">{post.author_name}</p>
                                <p className="text-xs">{post.author_title || 'Engineer'}</p>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-8 hidden sm:block" />
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(post.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.view_count} views
                        </div>
                        <Badge variant="secondary" className="ml-auto sm:ml-0">
                            {post.category_name}
                        </Badge>
                    </div>
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
                                className="flex items-center gap-2"
                                onClick={handleLike}
                            >
                                <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                                {post.like_count} Likes
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
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
                                className="flex items-center gap-2"
                            >
                                <Bookmark className={`h-4 w-4 ${post.is_saved ? 'fill-current' : ''}`} />
                                {post.is_saved ? 'Saved' : 'Save'}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" /> Share
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </article>

            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">Comments</h2>
                    <Badge variant="secondary">{post.comment_count}</Badge>
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
                        <div className="text-center py-10 bg-muted/20 rounded-xl">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-muted-foreground">No comments yet. Start the conversation!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage src={comment.author_avatar} alt={comment.author_name} />
                                    <AvatarFallback>{comment.author_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">{comment.author_name}</h4>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(comment.created_at)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-foreground/80 leading-relaxed bg-muted/50 p-4 rounded-2xl rounded-tl-none">
                                        {comment.content}
                                    </div>
                                    <div className="flex gap-4 pt-1">
                                        <button className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Like</button>
                                        <button className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">Reply</button>
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
