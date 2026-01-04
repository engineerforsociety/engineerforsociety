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
import { sampleForumPosts, sampleTrendingTopics, sampleUsersToFollow, sampleUserProfile } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

function ProfileCard() {
    const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
    return (
        <Card className="overflow-hidden">
            <div className="relative h-20 w-full">
                {heroImage && <Image src={heroImage.imageUrl} alt="Profile background" fill className="object-cover" data-ai-hint={heroImage.imageHint} />}
                 <Avatar className="h-20 w-20 mx-auto absolute -bottom-10 left-1/2 -translate-x-1/2 border-4 border-background">
                    <AvatarImage src={profilePic?.imageUrl} alt={sampleUserProfile.name} data-ai-hint={profilePic?.imageHint} />
                    <AvatarFallback>{sampleUserProfile.name.substring(0,2)}</AvatarFallback>
                </Avatar>
            </div>
            <CardContent className="text-center pt-12 pb-4">
                <h2 className="text-xl font-bold hover:underline cursor-pointer">{sampleUserProfile.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">Full-Stack Developer @EFS</p>
            </CardContent>
            <Separator />
            <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center hover:bg-muted p-2 rounded-md cursor-pointer">
                    <span className="font-semibold text-muted-foreground">Connections</span>
                    <span className="font-bold text-primary">18</span>
                </div>
                 <div className="flex justify-between items-center hover:bg-muted p-2 rounded-md cursor-pointer">
                    <span className="font-semibold text-muted-foreground">Invitations</span>
                    <span className="font-bold text-primary">1</span>
                </div>
            </CardContent>
            <Separator />
            <CardContent className="p-4">
                 <div className="hover:bg-muted p-2 rounded-md cursor-pointer">
                    <p className="text-xs text-muted-foreground">Achieve your goals with Premium</p>
                    <p className="font-semibold text-sm hover:underline">Try Premium for BDT0</p>
                </div>
            </CardContent>
             <Separator />
             <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 hover:bg-muted p-2 rounded-md cursor-pointer">
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Saved Items</span>
                </div>
                <div className="flex items-center gap-2 hover:bg-muted p-2 rounded-md cursor-pointer">
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Newsletters</span>
                </div>
                 <div className="flex items-center gap-2 hover:bg-muted p-2 rounded-md cursor-pointer">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Events</span>
                </div>
             </CardContent>
        </Card>
    )
}

export default function Home() {
  return (
    <div className="grid lg:grid-cols-4 gap-8 items-start">
      <aside className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
        <ProfileCard />
      </aside>

      <main className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3Njc1MTExMDd8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Alex Doe" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <input
                placeholder="Start a post"
                className="w-full bg-muted rounded-full px-4 py-3 text-sm border-transparent focus:border-primary focus:ring-primary"
              />
            </div>
          </CardHeader>
           <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><BookCopy className="text-sky-500"/> Write article</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground font-semibold"><Calendar className="text-amber-500" /> Create event</Button>
           </CardFooter>
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
                      <CardTitle className="text-base font-semibold leading-tight hover:underline cursor-pointer">
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
                      <Badge key={tag} variant="secondary" className="hover:bg-primary/10 cursor-pointer">
                        #{tag.toLowerCase().replace(/ /g, '')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-muted-foreground border-t pt-2">
                    <div className='flex gap-1'>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Heart className="h-5 w-5" /> {post.likeCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> {post.commentCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Send className="h-5 w-5" /> Share
                        </Button>
                         <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Bookmark className="h-5 w-5" />
                        </Button>
                    </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>

      <aside className="lg:col-span-1 space-y-6 sticky top-24">
        <Card>
          <CardHeader>
            <CardTitle>Add to your feed</CardTitle>
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
                            <p className="text-sm font-semibold hover:underline cursor-pointer">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.title}</p>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1">
                            <Plus className="h-4 w-4" /> Follow
                        </Button>
                    </div>
                )
            })}
             <Button variant="link" size="sm" className="text-muted-foreground font-bold">View all recommendations</Button>
          </CardContent>
        </Card>

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
  );
}
