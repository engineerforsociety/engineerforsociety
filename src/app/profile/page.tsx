import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleUserProfile } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Briefcase, Edit, GraduationCap, Heart, Mail, MapPin, Share2 } from "lucide-react";

export default function ProfilePage() {
  const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="text-center">
            <CardContent className="p-6">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src={profilePic?.imageUrl} alt={sampleUserProfile.name} data-ai-hint={profilePic?.imageHint} />
                    <AvatarFallback>{sampleUserProfile.name.substring(0,2)}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{sampleUserProfile.name}</h1>
                <p className="text-muted-foreground">Full-Stack Developer</p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2"><MapPin className="h-4 w-4"/> San Francisco, CA</p>
                <div className="mt-4 flex gap-2 justify-center">
                    <Button size="sm">
                        <Mail className="mr-2 h-4 w-4" /> Contact
                    </Button>
                     <Button size="sm" variant="outline">
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {sampleUserProfile.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{sampleUserProfile.interests}</p>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
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
                <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <CardTitle>Experience</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{sampleUserProfile.experience}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <CardTitle>Education</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">M.S. in Computer Science</p>
                <p className="text-sm text-muted-foreground">Stanford University, 2018</p>
                <p className="font-semibold mt-4">B.S. in Electrical Engineering</p>
                <p className="text-sm text-muted-foreground">Georgia Institute of Technology, 2016</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-primary" />
                    <CardTitle>Social Impact Contributions</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Lead volunteer for the "Code for Community" hackathon.</li>
                    <li>Mentor for three junior engineers through our mentorship program.</li>
                    <li>Developed a water quality monitoring sensor for a local environmental group.</li>
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
