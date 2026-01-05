
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type Post = {
    id: string;
    title: string;
    content: string;
    created_at: string;
    slug: string;
    like_count: number;
    comment_count: number;
    tags: string[];
};

async function getPostsData(userId: string) {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        notFound();
    }

    const { data: posts, error: postsError } = await supabase
        .from('forum_posts_with_counts')
        .select('id, title, content, created_at, slug, like_count, comment_count, tags')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

    if (postsError) {
        console.error('Error fetching posts:', postsError);
        return { profile, posts: [] };
    }

    return { profile, posts: posts as Post[] };
}

export default async function UserPostsPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    const { profile, posts } = await getPostsData(userId);

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return 'a while ago';
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8 px-4">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href={`/users/${profile.id}`} className="text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
                    <AvatarFallback className="text-2xl">{(profile.full_name || 'U').substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">Posts by {profile.full_name}</h1>
                    <p className="text-muted-foreground">{posts.length} posts</p>
                </div>
            </div>

            <div className="space-y-6">
                {posts.length === 0 ? (
                    <Card className="text-center py-12">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No Posts Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">This user hasn't made any posts.</p>
                    </Card>
                ) : (
                    posts.map(post => (
                        <Card key={post.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <Link href={`/forums/post/${post.slug || post.id}`}>
                                    <CardTitle className="text-xl hover:text-primary transition-colors">{post.title}</CardTitle>
                                </Link>
                                <CardDescription>
                                    Posted {formatDate(post.created_at)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {post.content}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {post.tags && post.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between text-sm text-muted-foreground">
                                <span>{post.like_count || 0} Likes</span>
                                <span>{post.comment_count || 0} Comments</span>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

