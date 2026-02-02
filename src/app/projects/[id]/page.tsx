'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { sampleProjects } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Heart,
    Eye,
    MessageSquare,
    Share2,
    Calendar,
    Clock,
    Cpu,
    Wrench,
    Code,
    FileText,
    Youtube,
    Download,
    GitBranch,
    Flag,
    AlertCircle,
    UserPlus,
    CheckCircle2
} from 'lucide-react';

// Mock specific project data since sampleProjects is limited
// In a real app, you'd fetch this from Supabase by ID
const extendedProjectData = {
    pitch: "An automated greenhouse system that monitors and controls environmental conditions for optimal plant growth.",
    skillLevel: "Intermediate",
    license: "CC BY-SA 4.0",
    difficulty: "Medium",
    estimatedTime: "5 hours",
    components: [
        { name: "Arduino Uno", qty: "1" },
        { name: "DHT11 Sensor", qty: "1" },
        { name: "Soil Moisture Sensor", qty: "2" },
        { name: "Relay Module", qty: "4" },
        { name: "Water Pump", qty: "1" },
        { name: "LCD Display 16x2", qty: "1" },
    ],
    tools: [
        "Soldering Iron",
        "Wire Stripper",
        "Hot Glue Gun"
    ],
    code: `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(1000);                       // wait for a second
  digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
  delay(1000);                       // wait for a second
}`,
    story: `
        <h3>Introduction</h3>
        <p>Gardening is a relaxing hobby, but it requires consistency. This project aims to automate the tedious parts of gardening: watering and environment monitoring.</p>
        <br/>
        <h3>How it Works</h3>
        <p>The system uses soil moisture sensors to detect when the plants need water. If the moisture level drops below a certain threshold, the Arduino activates the water pump via a relay module.</p>
        <p>Additionally, a DHT11 sensor constantly monitors temperature and humidity, displaying real-time data on an LCD screen.</p>
        <br/>
        <h3>Building the Circuit</h3>
        <p>Connect the sensors to the analog pins of the Arduino. The Relay module connects to the digital pins to control the high-voltage water pump circuit safely.</p>
    `
};

export default function ProjectDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    // Find project from samples or default to first for demo
    const project = sampleProjects.find(p => p.id === id) || sampleProjects[0];

    // Merge with extended mock data
    const data = { ...project, ...extendedProjectData };

    const projectImage = PlaceHolderImages.find(p => p.id === data.imageId);
    const ownerImage = PlaceHolderImages.find(p => p.id === data.owner.avatarId);

    if (!project) return notFound();

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative">
                {/* Background Blur */}
                <div className="absolute inset-0 h-[500px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-10" />
                    {projectImage && (
                        <Image
                            src={projectImage.imageUrl}
                            alt="Background"
                            fill
                            className="object-cover blur-[100px] opacity-30"
                        />
                    )}
                </div>

                <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-20 pt-10">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                        {/* Main Image */}
                        <div className="w-full md:w-2/3 lg:w-3/5 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative aspect-video bg-black/50">
                            {projectImage && (
                                <Image
                                    src={projectImage.imageUrl}
                                    alt={data.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>

                        {/* Title & Stats */}
                        <div className="flex-1 space-y-6 pt-2">
                            <div className="space-y-2">
                                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 mb-2">
                                    {data.technologies[0]}
                                </Badge>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                                    {data.title}
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    {data.pitch}
                                </p>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border backdrop-blur-sm w-fit">
                                <Avatar className="h-10 w-10 border-2 border-primary/20">
                                    {ownerImage && <AvatarImage src={ownerImage.imageUrl} />}
                                    <AvatarFallback>{data.owner.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-sm">{data.owner.name}</div>
                                    <div className="text-xs text-muted-foreground">Pro Maker</div>
                                </div>
                                <Button size="sm" variant="secondary" className="ml-2 h-8 text-xs font-bold">
                                    <UserPlus className="h-3 w-3 mr-1" /> Follow
                                </Button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-4 py-4 border-y border-border/50">
                                <div className="flex flex-col items-center justify-center p-2">
                                    <Heart className="h-5 w-5 text-red-500 mb-1" />
                                    <span className="font-bold text-lg">{data.likeCount}</span>
                                    <span className="text-[10px] uppercase text-muted-foreground">Likes</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 border-l border-border/50">
                                    <Eye className="h-5 w-5 text-blue-500 mb-1" />
                                    <span className="font-bold text-lg">{data.viewCount}</span>
                                    <span className="text-[10px] uppercase text-muted-foreground">Views</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 border-l border-border/50">
                                    <MessageSquare className="h-5 w-5 text-green-500 mb-1" />
                                    <span className="font-bold text-lg">12</span>
                                    <span className="text-[10px] uppercase text-muted-foreground">Comments</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 border-l border-border/50">
                                    <Share2 className="h-5 w-5 text-purple-500 mb-1" />
                                    <span className="font-bold text-lg">Share</span>
                                    <span className="text-[10px] uppercase text-muted-foreground">Project</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button size="lg" className="flex-1 font-bold text-base shadow-lg shadow-primary/20">
                                    <Download className="mr-2 h-5 w-5" /> Download Code
                                </Button>
                                <Button size="lg" variant="outline" className="flex-1 font-bold text-base">
                                    <Youtube className="mr-2 h-5 w-5 text-red-600" /> Watch Video
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Layout */}
                    <div className="grid lg:grid-cols-3 gap-8 mt-12">
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-8">
                            <Tabs defaultValue="story" className="w-full">
                                <TabsList className="w-full h-14 p-1 bg-muted/50 rounded-2xl mb-8">
                                    <TabsTrigger value="story" className="flex-1 h-full rounded-xl custom-tab text-base font-bold"><FileText className="mr-2 h-4 w-4" /> Story</TabsTrigger>
                                    <TabsTrigger value="schematics" className="flex-1 h-full rounded-xl custom-tab text-base font-bold"><Cpu className="mr-2 h-4 w-4" /> Schematics</TabsTrigger>
                                    <TabsTrigger value="code" className="flex-1 h-full rounded-xl custom-tab text-base font-bold"><Code className="mr-2 h-4 w-4" /> Code</TabsTrigger>
                                </TabsList>

                                <TabsContent value="story" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Card className="border-none shadow-sm bg-card/50">
                                        <CardContent className="p-8 prose dark:prose-invert max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: data.story }} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="schematics" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Card className="border-none shadow-sm bg-card/50 min-h-[400px] flex items-center justify-center flex-col gap-4 p-8 text-center">
                                        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                                            <Wrench className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">Schematics & Diagrams</h3>
                                            <p className="text-muted-foreground">No schematics have been uploaded for this project yet.</p>
                                        </div>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="code" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <Card className="border-none shadow-sm bg-card/50 overflow-hidden">
                                        <div className="bg-zinc-950 p-4 flex items-center justify-between border-b border-white/10">
                                            <span className="text-zinc-400 font-mono text-sm">main.ino</span>
                                            <Button size="sm" variant="ghost" className="h-6 text-zinc-400 hover:text-white">
                                                Copy
                                            </Button>
                                        </div>
                                        <div className="p-6 bg-zinc-950 overflow-x-auto">
                                            <pre className="text-sm font-mono text-green-400 leading-relaxed">
                                                <code>{data.code}</code>
                                            </pre>
                                        </div>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Comments Section */}
                            <div className="pt-8 border-t border-border">
                                <h3 className="text-2xl font-bold mb-6">Comments (3)</h3>
                                <div className="space-y-6">
                                    {/* Mock Comment */}
                                    <div className="flex gap-4">
                                        <Avatar>
                                            <AvatarFallback>JD</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <div className="bg-muted/50 p-4 rounded-xl rounded-tl-none">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-sm">John Doe</span>
                                                    <span className="text-xs text-muted-foreground">2 days ago</span>
                                                </div>
                                                <p className="text-sm">This looks amazing! Can I use a Raspberry Pi instead of Arduino?</p>
                                            </div>
                                            <div className="flex items-center gap-4 pl-2 text-xs font-semibold text-muted-foreground">
                                                <button className="hover:text-primary">Reply</button>
                                                <button className="hover:text-primary">Like</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            {/* Project Meta Card */}
                            <Card className="shadow-lg border-border/50">
                                <CardHeader>
                                    <CardTitle>Project Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" /> Difficulty
                                        </span>
                                        <Badge variant="secondary" className="font-bold">{data.skillLevel}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4" /> Est. Time
                                        </span>
                                        <span className="text-sm font-bold">{data.estimatedTime}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Flag className="h-4 w-4" /> License
                                        </span>
                                        <span className="text-sm font-bold">{data.license}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Created
                                        </span>
                                        <span className="text-sm font-bold">Oct 24, 2025</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Components List */}
                            <Card className="shadow-lg border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Cpu className="h-5 w-5 text-primary" /> Components
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[300px]">
                                        <div className="divide-y divide-border/50">
                                            {data.components.map((comp, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                                                    <span className="text-sm font-medium">{comp.name}</span>
                                                    <Badge variant="outline" className="text-xs bg-background/50">x{comp.qty}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>

                                </CardContent>
                            </Card>

                            {/* Tags */}
                            <Card className="shadow-none border-none bg-transparent">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="text-base">Tags</CardTitle>
                                </CardHeader>
                                <CardContent className="px-0 flex flex-wrap gap-2">
                                    {['Arduino', 'HomeAutomation', 'Sensors', 'DIY', 'Gardening', 'IoT'].map(tag => (
                                        <Badge key={tag} variant="secondary" className="rounded-md hover:bg-primary/20 cursor-pointer transition-colors px-3 py-1">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
