
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Card,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Eye,
    Users,
    Heart,
    MessageSquare,
    Share2,
    Search,
    Filter,
    Zap,
    Speaker,
    Wifi,
    Settings,
    Home as HomeIcon,
    Plane,
    FlaskConical,
    Leaf,
    Bot,
    Gamepad2,
    Lightbulb,
    Monitor,
    Watch,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ProjectsClientProps {
    initialProjects: any[];
    allTags: string[];
}

const categories = [
    { name: 'All', icon: Zap },
    { name: 'Audio & Sound', icon: Speaker },
    { name: 'IoT', icon: Wifi },
    { name: 'Installations', icon: Settings },
    { name: 'Home Automation', icon: HomeIcon },
    { name: 'Flying Things', icon: Plane },
    { name: 'Lab Tools', icon: FlaskConical },
    { name: 'Environment', icon: Leaf },
    { name: 'Robotics', icon: Bot },
    { name: 'Games', icon: Gamepad2 },
    { name: 'Smart Lighting', icon: Lightbulb },
    { name: 'Displays', icon: Monitor },
    { name: 'Wearables', icon: Watch },
];

export function ProjectsClient({ initialProjects, allTags }: ProjectsClientProps) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
    const [replies, setReplies] = useState<{ [key: string]: string }>({});

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleLike = (projectId: string) => {
        setLikes(prev => ({ ...prev, [projectId]: !prev[projectId] }));
    };

    const handleShare = (project: any) => {
        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: project.description,
                url: window.location.href + '/' + project.id,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href + '/' + project.id);
            alert('Link copied to clipboard!');
        }
    };

    const filteredProjects = initialProjects.filter(project => {
        const matchesCategory = selectedCategory === 'All' || project.technologies.includes(selectedCategory);
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => project.technologies.includes(tag));
        return matchesCategory && matchesSearch && matchesTags;
    });

    return (
        <>
            {/* Categories Strip */}
            <div className="w-full border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30 mb-8">
                <div className="container mx-auto max-w-7xl py-4">
                    <ScrollArea className="w-full whitespace-nowrap pb-2">
                        <div className="flex space-x-4 md:space-x-8 px-4 justify-start md:justify-center min-w-max">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 group transition-all duration-300",
                                        selectedCategory === cat.name ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground hover:scale-105"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 rounded-2xl transition-all duration-300",
                                        selectedCategory === cat.name ? "bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-secondary/5 group-hover:bg-secondary/10"
                                    )}>
                                        <cat.icon className="h-6 w-6 md:h-8 md:w-8" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-xs font-medium">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16 flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters (Desktop) */}
                <aside className={`md:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">Filter by Tags</h3>
                        </div>
                        <div className="h-px bg-border" />
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-3">
                                {allTags.map(tag => (
                                    <div key={tag} className="flex items-center space-x-2">
                                        <div
                                            className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedTags.includes(tag) ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                                                }`}
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {selectedTags.includes(tag) && <div className="h-2.5 w-2.5 bg-primary-foreground rounded-[1px]" />}
                                        </div>
                                        <label
                                            className="text-sm font-medium leading-none cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {tag}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </aside>

                {/* Project Grid */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">
                            {selectedCategory === 'All' ? 'Trending Projects' : `${selectedCategory} Projects`}
                        </h2>
                        <span className="text-muted-foreground text-sm">{filteredProjects.length} results</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const projectImage = PlaceHolderImages.find(p => p.id === project.imageId);
                            const ownerImage = PlaceHolderImages.find(p => p.id === project.owner.avatarId);
                            const isLiked = likes[project.id];

                            return (
                                <Card
                                    key={project.id}
                                    className="group flex flex-col overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                >
                                    {projectImage && (
                                        <div className="relative h-56 w-full overflow-hidden">
                                            <Image
                                                src={projectImage.imageUrl}
                                                alt={project.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {project.isSeekingCollaborators && (
                                                <div className="absolute top-3 right-3 animate-pulse">
                                                    <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                                                        <Users className="mr-1 h-3 w-3" /> Collab
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className="absolute bottom-3 left-3 right-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <Button size="sm" className="w-full bg-primary/90 hover:bg-primary backdrop-blur-sm" asChild>
                                                    <Link href={`/projects/${project.id}`}>View Details</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <CardContent className="flex-1 p-5 space-y-4">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="text-xs font-normal mb-2 border-primary/20 text-primary">
                                                {project.technologies[0] || 'Engineering'}
                                            </Badge>
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                {project.title}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {project.description}
                                        </p>

                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {project.technologies.slice(0, 4).map((tech: string) => (
                                                <span key={tech} className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wide">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-5 pt-0 flex flex-col border-t border-border/50 mt-auto">
                                        <div className="flex items-center justify-between w-full py-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-border/20">
                                                    {ownerImage && <AvatarImage src={ownerImage.imageUrl} alt={project.owner.name} />}
                                                    <AvatarFallback>{project.owner.name.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium">{project.owner.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">Engineer</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>{formatNumber(project.viewCount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 w-full border-t pt-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("gap-2", isLiked && "text-rose-500 hover:text-rose-600")}
                                                onClick={() => handleLike(project.id)}
                                            >
                                                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                                                <span className="text-xs">{formatNumber(project.likeCount + (isLiked ? 1 : 0))}</span>
                                            </Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="gap-2">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span className="text-xs">Comment</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Comments - {project.title}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 mt-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Textarea
                                                                placeholder="Write a comment..."
                                                                value={commentTexts[project.id] || ''}
                                                                onChange={(e) => setCommentTexts(prev => ({ ...prev, [project.id]: e.target.value }))}
                                                                className="min-h-[80px]"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                disabled={!commentTexts[project.id]?.trim()}
                                                                onClick={() => {
                                                                    alert('Comment posted! (Mock)');
                                                                    setCommentTexts(prev => ({ ...prev, [project.id]: '' }));
                                                                }}
                                                            >
                                                                Post Comment
                                                            </Button>
                                                        </div>

                                                        <ScrollArea className="h-[300px] pr-4">
                                                            <div className="space-y-6">
                                                                {/* Mock Comments */}
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6">
                                                                            <AvatarFallback>A</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-sm font-bold">Asad</span>
                                                                        <span className="text-[10px] text-muted-foreground">2h ago</span>
                                                                    </div>
                                                                    <p className="text-sm pl-8">This project looks amazing! Keep it up.</p>
                                                                    <div className="pl-8 pt-2">
                                                                        <button className="text-[10px] font-bold text-primary hover:underline">Reply</button>
                                                                    </div>
                                                                </div>

                                                                {/* Mock Reply */}
                                                                <div className="ml-8 space-y-1 border-l-2 pl-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6">
                                                                            <AvatarFallback>R</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-sm font-bold">Razin</span>
                                                                        <span className="text-[10px] text-muted-foreground">1h ago</span>
                                                                    </div>
                                                                    <p className="text-sm">Thank you! Glad you liked the architecture.</p>
                                                                </div>
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => handleShare(project)}
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span className="text-xs">Share</span>
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

