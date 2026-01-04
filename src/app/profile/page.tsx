
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { sampleUserProfile, sampleForumPosts } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Briefcase, Edit, GraduationCap, Mail, MapPin, Plus, Rss, Share2, MoreHorizontal, Heart, MessageSquare, Send, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ProfileHeaderCard() {
    const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

    return (
        <Card className="overflow-hidden">
            <div className="relative h-24 md:h-48 w-full">
                {heroImage && <Image src={heroImage.imageUrl} alt="Profile background" fill className="object-cover" data-ai-hint={heroImage.imageHint} />}
                <div className="absolute top-4 right-4">
                    <Button variant="outline" size="icon" className="bg-background/80 hover:bg-background h-8 w-8">
                        <Edit className="h-4 w-4"/>
                    </Button>
                </div>
                 <Avatar className="h-24 w-24 md:h-36 md:w-36 absolute -bottom-12 md:-bottom-20 left-4 md:left-6 border-4 border-background">
                    <AvatarImage src={profilePic?.imageUrl} alt={sampleUserProfile.name} data-ai-hint={profilePic?.imageHint} />
                    <AvatarFallback>{sampleUserProfile.name.substring(0,2)}</AvatarFallback>
                </Avatar>
            </div>
            <CardHeader className="pt-14 md:pt-24 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div className="w-full">
                        <CardTitle className="text-2xl md:text-3xl font-bold">{sampleUserProfile.name}</CardTitle>
                        <p className="text-base text-muted-foreground">Full-Stack Developer @EFS | Using tech for social good</p>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 md:gap-4 pt-2 flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> San Francisco, CA</span>
                            <Link href="#" className="text-primary font-semibold hover:underline">Contact info</Link>
                        </div>
                        <div className="pt-2">
                            <Link href="#" className="text-primary font-semibold hover:underline text-sm">128 connections</Link>
                        </div>
                    </div>
                    <div className="flex-shrink-0 pt-4 md:pt-0">
                         <Button variant="secondary" className="w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                    </div>
                </div>
            </CardHeader>
            <CardFooter className="gap-2 flex-wrap">
                 <Button>
                    <Plus className="mr-2 h-4 w-4"/> Follow
                </Button>
                <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" /> Message
                </Button>
                 <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            </CardFooter>
        </Card>
    );
}

function UserActivity() {
    const userPosts = sampleForumPosts.filter(p => p.author.name === sampleUserProfile.name);

    return(
        <Card>
            <CardHeader>
                <CardTitle>Activity</CardTitle>
                <Link href="#" className="text-sm font-semibold text-primary hover:underline">12 posts</Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {sampleForumPosts.slice(0,2).map((post) => {
                    const authorImage = PlaceHolderImages.find(p => p.id === post.author.avatarId);
                    return (
                        <div key={post.id} className="border-b pb-4 last:border-none last:pb-0">
                             <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={authorImage?.imageUrl} alt={post.author.name} data-ai-hint={authorImage?.imageHint} />
                                    <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{post.author.name} posted this</p>
                                    <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                                </div>
                            </div>
                            <h4 className="font-semibold mb-1">{post.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {post.content}
                            </p>
                            <div className="flex justify-between items-center text-muted-foreground text-xs">
                                <span>{post.likeCount} likes &middot; {post.commentCount} comments</span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            <CardFooter className="border-t">
                <Button variant="ghost" className="w-full">Show all activity</Button>
            </CardFooter>
        </Card>
    )
}

export default function ProfilePage() {
  
  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
        <main className="lg:col-span-2 space-y-6">
            <ProfileHeaderCard />
            <UserActivity />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>About</CardTitle>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        A passionate and experienced full-stack developer dedicated to using technology for social good. I believe in the power of collaboration and am always looking for new challenges that push the boundaries of what's possible.
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Experience</CardTitle>
                        <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Briefcase className="h-8 w-8 text-primary mt-1"/>
                        <div>
                             <p className="font-semibold text-lg">Full-Stack Developer</p>
                             <p className="text-sm">Engineer For Society</p>
                             <p className="text-sm text-muted-foreground">Jan 2020 - Present</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Education</CardTitle>
                        <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="flex gap-4">
                        <GraduationCap className="h-8 w-8 text-primary mt-1"/>
                        <div>
                             <p className="font-semibold text-lg">Stanford University</p>
                             <p className="text-sm">M.S. in Computer Science</p>
                             <p className="text-sm text-muted-foreground">2016 - 2018</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {sampleUserProfile.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>
                    ))}
                </CardContent>
            </Card>
        </main>
        <aside className="lg:col-span-1 space-y-6 sticky top-24 hidden lg:block">
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Profile Language</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">English</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle  className="text-base">Public profile & URL</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground break-all">https://efs.social/p/{sampleUserProfile.name.toLowerCase().replace(' ', '-')}</p>
                </CardContent>
            </Card>
        </aside>
    </div>
  );
}

    