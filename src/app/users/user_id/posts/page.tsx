
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Heart, Layout, Globe, Share2, Twitter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Post = {
    id: string;
    title: string | null;
    content: string;
    created_at: string;
    slug: string;
    like_count: number;
    comment_count: number;
    tags: string[] | null;
    post_type: 'forum' | 'social';
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

    // Fetch Forum Posts with counts
    const { data: forumPosts, error: forumError } = await supabase
        .from('forum_posts')
        .select(`
            id, 
            title, 
            content, 
            created_at, 
            slug, 
            tags,
            forum_post_reactions(count), 
            forum_comments(count)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

    // Fetch Social Posts with counts
    const { data: socialPosts, error: socialError } = await supabase
        .from('social_posts')
        .select(`
            id, 
            content, 
            created_at, 
            slug,
            social_post_reactions(count), 
            social_comments(count)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

    const formattedForumPosts: Post[] = (forumPosts || []).map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        created_at: p.created_at,
        slug: p.slug,
        tags: p.tags,
        like_count: (p.forum_post_reactions as any)?.[0]?.count || 0,
        comment_count: (p.forum_comments as any)?.[0]?.count || 0,
        post_type: 'forum'
    }));

    const formattedSocialPosts: Post[] = (socialPosts || []).map(p => ({
        id: p.id,
        title: null,
        content: p.content,
        created_at: p.created_at,
        slug: p.slug,
        tags: null,
        like_count: (p.social_post_reactions as any)?.[0]?.count || 0,
        comment_count: (p.social_comments as any)?.[0]?.count || 0,
        post_type: 'social'
    }));

    return { profile, forumPosts: formattedForumPosts, socialPosts: formattedSocialPosts };
}

export default async function UserPostsPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    const { profile, forumPosts, socialPosts } = await getPostsData(userId);

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    const renderPost = (post: Post) => (
        <Card key={post.id} className="hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col h-full bg-card">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        {post.post_type === 'forum' ? (
                            <Link href={`/forums/post/${post.slug || post.id}`}>
                                <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2 leading-tight">{post.title}</CardTitle>
                            </Link>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 px-2 bg-blue-500/10 rounded-md flex items-center gap-1.5">
                                        <Twitter className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Social Update</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <CardDescription className="flex items-center gap-2 mt-2 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(post.created_at)}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div
                    className="text-sm text-foreground/80 line-clamp-4 [&>p]:mb-1 [&>a]:text-primary [&>a]:hover:underline"
                    dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-2 h-5 font-semibold bg-muted/50 border-none">
                                #{tag.toLowerCase().replace(/ /g, '')}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center py-4 bg-muted/10 border-t border-border/40 px-6">
                <div className="flex items-center gap-5 text-sm font-bold text-muted-foreground/70">
                    <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                        <Heart className="h-4 w-4" /> {post.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                        <MessageSquare className="h-4 w-4" /> {post.comment_count || 0}
                    </span>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-9 text-primary font-bold hover:bg-primary/5 px-4 rounded-full">
                    <Link href={`/forums/post/${post.slug || post.id}`}>
                        View Details →
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <div className="container mx-auto max-w-5xl py-8 px-4">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="hover:bg-background shadow-sm border border-border/20 px-4 h-10 rounded-xl">
                        <Link href={`/users/${profile.id}`} className="text-muted-foreground font-semibold flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Profile
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12 bg-background p-8 rounded-3xl shadow-sm border border-border/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-xl ring-2 ring-primary/10">
                        <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
                        <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-primary/20 to-primary/10 text-primary">{(profile.full_name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center md:text-left z-10">
                        <h1 className="text-4xl font-black tracking-tight mb-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                            {profile.full_name}
                            <Badge className="w-fit mx-auto md:mx-0 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5">Contributor</Badge>
                        </h1>
                        <p className="text-muted-foreground font-semibold text-lg flex items-center justify-center md:justify-start gap-2">
                            <Globe className="h-5 w-5 text-primary/60" />
                            {forumPosts.length + socialPosts.length} professional contributions shared
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="forum" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 p-1 bg-background shadow-sm border border-border/30 rounded-2xl h-14 mb-10 overflow-hidden">
                        <TabsTrigger
                            value="forum"
                            className="rounded-xl font-black text-[15px] uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-3 transition-all duration-300"
                        >
                            <Layout className="h-5 w-5" /> Discussions ({forumPosts.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="social"
                            className="rounded-xl font-black text-[15px] uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-3 transition-all duration-300"
                        >
                            <Twitter className="h-5 w-5" /> Social Posts ({socialPosts.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="forum" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {forumPosts.length === 0 ? (
                            <Card className="text-center py-24 border-dashed bg-background/40 rounded-3xl">
                                <MessageSquare className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                                <h3 className="text-2xl font-black text-muted-foreground">No Discussions Found</h3>
                                <p className="mt-2 text-muted-foreground font-medium max-w-xs mx-auto">This professional contributor hasn't initiated any forum discussions yet.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {forumPosts.map(post => renderPost(post))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="social" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {socialPosts.length === 0 ? (
                            <Card className="text-center py-24 border-dashed bg-background/40 rounded-3xl">
                                <Twitter className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                                <h3 className="text-2xl font-black text-muted-foreground">No Social Feed</h3>
                                <p className="mt-2 text-muted-foreground font-medium max-w-xs mx-auto">This professional contributor hasn't shared any social style updates lately.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {socialPosts.map(post => renderPost(post))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Re-using common icons
function Clock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
