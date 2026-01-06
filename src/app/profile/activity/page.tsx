
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Edit, Trash2, ArrowLeft, Loader2, Plus, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { EditPostModal } from '@/app/components/edit-post-modal';
import { CreatePostModal } from '@/app/components/create-post-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ForumPost = {
    id: string;
    title: string;
    content: string;
    created_at: string;
    category_name?: string;
};

export default function UserActivityPage() {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();
    const { toast } = useToast();
    const router = useRouter();

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from('forum_posts')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err: any) {
            console.error('Error fetching your posts:', err);
            toast({ title: 'Error', description: 'Failed to load your activity.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, [supabase]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('forum_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPosts(posts.filter(p => p.id !== id));
            toast({ title: 'Post Deleted', description: 'Your post has been removed.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to delete post.', variant: 'destructive' });
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (post: ForumPost) => {
        setSelectedPost(post);
        setIsEditModalOpen(true);
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
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <MessageSquare className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Your Activity</h1>
                            <p className="text-muted-foreground">Manage your posts and discussions.</p>
                        </div>
                    </div>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create New Post
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading your posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h2 className="text-xl font-semibold">No posts yet</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">Share your thoughts or ask a question to get the conversation started.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="mt-6">
                        Start a Discussion
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <Card key={post.id} className="hover:shadow-sm transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold leading-tight hover:underline cursor-pointer">
                                            {post.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatTime(post.created_at)}</span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={(e) => {
                                                e.preventDefault();
                                                handleEdit(post);
                                            }}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Post
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(post.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Post
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                                    {post.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={fetchMyPosts}
            />

            {selectedPost && (
                <EditPostModal
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    onSuccess={fetchMyPosts}
                    post={selectedPost}
                />
            )}
        </div>
    );
}
