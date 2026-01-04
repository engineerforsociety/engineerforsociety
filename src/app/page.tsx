import {
  MessageSquare,
  Heart,
  MoreHorizontal,
  Bookmark,
  Send,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
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
import { sampleForumPosts, sampleTrendingTopics, sampleUsersToFollow } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <main className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3Njc1MTExMDd8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Alex Doe" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <input
                placeholder="What's on your mind, Alex?"
                className="w-full bg-muted rounded-full px-4 py-2 text-sm border-transparent focus:border-primary focus:ring-primary"
              />
            </div>
            <Button>Post</Button>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {sampleForumPosts.map((post) => {
            const authorImage = PlaceHolderImages.find(p => p.id === post.author.avatarId);
            return (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={authorImage?.imageUrl} alt={post.author.name} data-ai-hint={authorImage?.imageHint} />
                      <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold leading-tight">
                        {post.author.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {post.author.title} &middot; {post.createdAt}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {post.content}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-muted-foreground">
                    <div className='flex gap-4'>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Heart className="h-4 w-4" /> {post.likeCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> {post.commentCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Send className="h-4 w-4" /> Share
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4" />
                    </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>

      <aside className="lg:col-span-1 space-y-6 sticky top-20">
        <Card>
          <CardHeader>
            <CardTitle>Who to follow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleUsersToFollow.map(user => {
                const userImage = PlaceHolderImages.find(p => p.id === user.avatarId);
                return(
                    <div key={user.id} className="flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={userImage?.imageUrl} alt={user.name} data-ai-hint={userImage?.imageHint}/>
                            <AvatarFallback>{user.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.title}</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Plus className="h-4 w-4" /> Follow
                        </Button>
                    </div>
                )
            })}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {sampleTrendingTopics.map(topic => (
                        <Badge key={topic} variant="outline" className="text-sm">
                            <Link href="#"># {topic}</Link>
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}
