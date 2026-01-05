
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Bookmark, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type SavedPost = {
    id: string;
    title: string;
    content: string;
    created_at: string;
    saved_at: string;
    author_id: string;
    author_name?: string;
    author_avatar?: string;
    slug: string;
};

export default function SavedPostsPage() {
    const [posts, setPosts] = useState<SavedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [unsavingId, setUnsavingId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();
    const { toast } = useToast();
    const router = useRouter();

    const fetchSavedPosts = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Fetch saved posts with author details
            const { data, error } = await supabase
                .from('post_saves')
                .select(`
                    id,
                    created_at,
                    post_id,
                    forum_posts (
                        id,
                        title,
                        content,
                        created_at,
                        slug,
                        author_id,
                        profiles (
                            full_name,
                            avatar_url
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedPosts = data?.map((item: any) => ({
                id: item.forum_posts.id, // We use post's id for navigation/unsaving
                save_record_id: item.id,
                title: item.forum_posts.title,
                content: item.forum_posts.content,
                created_at: item.forum_posts.created_at,
                saved_at: item.created_at,
                author_id: item.forum_posts.author_id,
                author_name: item.forum_posts.profiles?.full_name || 'Anonymous',
                author_avatar: item.forum_posts.profiles?.avatar_url,
                slug: item.forum_posts.slug
            })) || [];

            setPosts(formattedPosts);
        } catch (err: any) {
            console.error('Error fetching saved posts:', err);
            toast({ title: 'Error', description: 'Failed to load your saved posts.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPosts();
    }, [supabase]);

    const handleUnsave = async (postId: string) => {
        setUnsavingId(postId);
        try {
            const { error } = await supabase
                .from('post_saves')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            if (error) throw error;

            setPosts(posts.filter(p => p.id !== postId));
            toast({ title: 'Post Unsaved', description: 'Removed from your saved list.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to remove post.', variant: 'destructive' });
        } finally {
            setUnsavingId(null);
        }
    };

    const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true });

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Feed
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <Bookmark className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Saved Posts</h1>
                            <p className="text-muted-foreground">Catch up on discussions you've bookmarked.</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading bookmarks...</p>
                </div>
            ) : posts.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Bookmark className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h2 className="text-xl font-semibold">No saved posts</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">Bookmark interesting posts in the feed to read them later here.</p>
                    <Button asChild className="mt-6">
                        <Link href="/">Explore Feed</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {posts.map((post) => (
                        <Card key={post.id} className="hover:shadow-sm transition-shadow">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={post.author_avatar} alt={post.author_name} />
                                            <AvatarFallback>{post.author_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold">{post.author_name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Original post {formatTime(post.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUnsave(post.id)}
                                        disabled={unsavingId === post.id}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        {unsavingId === post.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Bookmark className="h-4 w-4 fill-current text-amber-600" />
                                        )}
                                        <span className="ml-2 hidden sm:inline">Unsave</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <h3 className="text-lg font-bold mb-2 leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">
                                    {post.content}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                                <span>Saved {formatTime(post.saved_at)}</span>
                                <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary">
                                    <Link href={`/forums/post/${post.slug}`}>View Discussion</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
