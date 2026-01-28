'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    fetchResourceBySlug,
    toggleInteraction,
    getCurrentUser,
    deleteResource,
    fetchLinkMetadata
} from '../actions';
import {
    BookOpen,
    GraduationCap,
    Calendar,
    FileSearch,
    FileText,
    ShieldCheck,
    HardHat,
    Github,
    Code,
    Layout,
    PencilRuler,
    Compass,
    UserCheck,
    Award,
    Youtube,
    Mic,
    Layers,
    ChevronLeft,
    ThumbsUp,
    Bookmark,
    Share2,
    Clock,
    Building2,
    ExternalLink,
    Maximize2,
    ArrowRight,
    Edit,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ResourceUploadModal } from '../resource-upload-modal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ResourceIcon = ({ type, className }: { type: string, className?: string }) => {
    const iconClass = className || "h-12 w-12";
    switch (type) {
        case 'research_paper': return <BookOpen className={cn(iconClass, "text-indigo-600")} />;
        case 'ieee_xplore': return <GraduationCap className={cn(iconClass, "text-blue-600")} />;
        case 'conference_material': return <Calendar className={cn(iconClass, "text-rose-600")} />;
        case 'case_study': return <FileSearch className={cn(iconClass, "text-orange-600")} />;
        case 'technical_document': return <FileText className={cn(iconClass, "text-blue-500")} />;
        case 'standard_codes': return <ShieldCheck className={cn(iconClass, "text-emerald-700")} />;
        case 'safety_manual': return <HardHat className={cn(iconClass, "text-amber-700")} />;
        case 'github_repo': return <Github className={cn(iconClass, "text-slate-900 dark:text-slate-100")} />;
        case 'interactive_tool': return <Code className={cn(iconClass, "text-emerald-600")} />;
        case 'calculation_sheet': return <Layout className={cn(iconClass, "text-sky-600")} />;
        case 'design_template': return <PencilRuler className={cn(iconClass, "text-pink-600")} />;
        case 'cad_blueprint': return <Compass className={cn(iconClass, "text-cyan-700")} />;
        case 'resume_template': return <UserCheck className={cn(iconClass, "text-violet-600")} />;
        case 'interview_prep': return <Award className={cn(iconClass, "text-yellow-700")} />;
        case 'certification_prep': return <ShieldCheck className={cn(iconClass, "text-indigo-700")} />;
        case 'youtube_tutorial': return <Youtube className={cn(iconClass, "text-red-600")} />;
        case 'engineering_podcast': return <Mic className={cn(iconClass, "text-purple-600")} />;
        default: return <Layers className={cn(iconClass, "text-slate-500")} />;
    }
};

export default function ResourceDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { toast } = useToast();

    // Utility function defined first to avoid initialization error
    const getEmbedUrl = (res: any) => {
        if (res.embed_url) return res.embed_url;

        const url = res.external_url;
        if (!url) return null;

        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S+|live\/))([^\?&"'>]+)/);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }

        // Google Drive
        if (url.includes('drive.google.com')) {
            if (url.includes('/view')) return url.replace('/view', '/preview');
            if (url.includes('id=')) {
                const id = url.split('id=')[1].split('&')[0];
                return `https://drive.google.com/file/d/${id}/preview`;
            }
            if (url.includes('/file/d/')) {
                const parts = url.split('/file/d/');
                if (parts[1]) {
                    const id = parts[1].split('/')[0];
                    return `https://drive.google.com/file/d/${id}/preview`;
                }
            }
        }

        // PDF direct links
        if (url.toLowerCase().endsWith('.pdf')) {
            return url;
        }

        return null;
    };
    const [resource, setResource] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [githubContent, setGithubContent] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [linkMetadata, setLinkMetadata] = useState<any>(null);

    const loadResource = async () => {
        if (!slug) return;
        setLoading(true);

        try {
            const [data, user] = await Promise.all([
                fetchResourceBySlug(slug as string),
                getCurrentUser()
            ]);

            setCurrentUser(user);

            if (data) {
                setResource(data);
                setLoading(false); // Render main content ASAP

                // Fetch secondary data in background
                const embedUrl = getEmbedUrl(data);

                if (data.external_url?.includes('github.com') && data.external_url?.includes('/blob/')) {
                    // GitHub fetching
                    const urlParts = data.external_url.replace('https://github.com/', '').split('/');
                    const owner = urlParts[0];
                    const repo = urlParts[1];
                    const path = urlParts.slice(4).join('/');

                    fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`)
                        .then(res => res.json())
                        .then(ghData => {
                            if (ghData.content) {
                                const decoded = atob(ghData.content.replace(/\n/g, ''));
                                setGithubContent(decoded);
                            }
                        })
                        .catch(err => console.error("GitHub content fail:", err));
                } else if (!embedUrl && data.external_url) {
                    // OG Metadata fetching
                    fetchLinkMetadata(data.external_url)
                        .then(meta => {
                            if (meta) setLinkMetadata(meta);
                        })
                        .catch(err => console.error("OG metadata fail:", err));
                }
            } else {
                toast({
                    title: "Resource not found",
                    description: "The resource you're looking for might have been removed.",
                    variant: "destructive"
                });
                router.push('/resources');
            }
        } catch (error) {
            console.error("Load resource error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResource();
    }, [slug]);

    const handleInteraction = async (type: 'upvote' | 'bookmark') => {
        try {
            const result = await toggleInteraction(resource.id, type);
            // Refresh local state or re-fetch
            const updated = await fetchResourceBySlug(slug as string);
            setResource(updated);
            toast({
                title: result.active ? `${type.charAt(0).toUpperCase() + type.slice(1)} added` : `${type.charAt(0).toUpperCase() + type.slice(1)} removed`,
                description: result.active ? "Thank you for the community validation!" : "Resource interaction updated.",
            });
        } catch (error: any) {
            toast({
                title: "Authentication Required",
                description: "You must be logged in to interact with resources.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteResource(resource.id);
            toast({
                title: "Resource Deleted",
                description: "The resource has been permanently removed.",
            });
            router.push('/resources');
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to delete resource.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading || !resource) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-20">
                <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-pulse">
                    <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-[400px] w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                            <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                            <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (!resource) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/resources')}
                        className="rounded-xl font-bold gap-2 text-slate-600 hover:text-blue-600"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Resources
                    </Button>
                    <div className="flex items-center gap-2">
                        {currentUser && resource.author_id === currentUser.id && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="rounded-xl font-bold gap-2 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Edit className="h-4 w-4" /> Edit
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl font-bold gap-2 border-slate-200 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                                        <AlertDialogHeader>
                                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                                <AlertTriangle className="h-6 w-6 text-red-600" />
                                            </div>
                                            <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-slate-500 font-medium">
                                                This action cannot be undone. This will permanently delete your contribution from the specialized engineering archives.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-2">
                                            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="rounded-xl font-bold bg-red-600 hover:bg-red-700"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200" onClick={() => handleInteraction('bookmark')}>
                            <Bookmark className={cn("h-4 w-4", resource.user_has_bookmarked ? "fill-amber-500 text-amber-500" : "")} />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Side: Information */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-blue-600 text-white rounded-lg px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                                    {resource.discipline}
                                </Badge>
                                <Badge variant="outline" className="rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] font-bold px-4 py-1">
                                    {resource.category}
                                </Badge>
                                <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 border-none rounded-lg px-4 py-1 text-[10px] font-black uppercase">
                                    {resource.skill_level}
                                </Badge>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                {resource.title}
                            </h1>

                            <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Published: {new Date(resource.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {resource.author_org || "Engineering Community"}
                                </div>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden aspect-video relative shadow-2xl">
                            {githubContent ? (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <Github className="h-5 w-5" />
                                            <span className="text-sm font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">File Preview: GitHub API</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold gap-2" asChild>
                                            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3.5 w-3.5" /> View Original
                                            </a>
                                        </Button>
                                    </div>
                                    <pre className="p-6 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed shadow-2xl">
                                        <code>{githubContent}</code>
                                    </pre>
                                </div>
                            ) : getEmbedUrl(resource) ? (
                                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                                    <iframe
                                        src={getEmbedUrl(resource)!}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            ) : linkMetadata ? (
                                <div className="h-full w-full animate-in fade-in zoom-in-95 duration-500">
                                    <a
                                        href={resource.external_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative group block h-full w-full bg-slate-900 overflow-hidden transition-all"
                                    >
                                        {/* Background Image with Blur/Overlay */}
                                        {linkMetadata.image && (
                                            <>
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-2xl opacity-40 scale-110"
                                                    style={{ backgroundImage: `url(${linkMetadata.image})` }}
                                                />
                                                <Image
                                                    src={linkMetadata.image}
                                                    alt={linkMetadata.title}
                                                    fill
                                                    unoptimized
                                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                                                />
                                            </>
                                        )}

                                        {/* Content Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                                            <div className="max-w-3xl space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                                                        External Source
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-300 backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                                        {new URL(resource.external_url).hostname}
                                                    </span>
                                                </div>

                                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                                                    {linkMetadata.title || 'Access Engineering Vault'}
                                                </h3>

                                                {linkMetadata.description && (
                                                    <p className="text-slate-300 text-sm md:text-base font-medium line-clamp-2 max-w-2xl text-balance opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {linkMetadata.description}
                                                    </p>
                                                )}

                                                <div className="pt-4 flex items-center gap-4">
                                                    <div className="h-12 px-6 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                                                        {resource.source_type === 'GitHub' ? <Github className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
                                                        Explore Resource
                                                    </div>
                                                    <div className="text-white/60 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                                        Verified Secure Link
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute top-0 right-0 p-8">
                                            <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                                <ArrowRight className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ) : !(getEmbedUrl(resource) || (resource.external_url?.includes('github.com') && resource.external_url?.includes('/blob/'))) ? (
                                <div className="h-full w-full flex items-center justify-center bg-slate-900/50">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Preview...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center space-y-8 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="p-8 bg-white dark:bg-slate-900 rounded-full shadow-xl">
                                        <ResourceIcon type={resource.resource_type} className="h-16 w-16" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Direct Verified Access</h3>
                                        <p className="text-slate-500 max-w-sm font-medium">This resource is hosted on an external site. Open link to view content.</p>
                                    </div>
                                    <Button size="lg" className="rounded-xl h-14 px-8 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" asChild>
                                        <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                            Open External Resource <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <FileText className="h-6 w-6 text-blue-600" /> Resource Description
                            </h2>
                            <Separator />
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {resource.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Meta & Actions */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <Card className="rounded-[32px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <Button className="w-full rounded-2xl h-16 text-lg font-bold gap-3 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 group" asChild>
                                        <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                            Access Knowledge Hub <ExternalLink className="group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </Button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" onClick={() => handleInteraction('upvote')} className="rounded-2xl h-14 font-bold gap-2 border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                            <ThumbsUp className="h-5 w-5" /> {resource.upvote_count}
                                        </Button>
                                        <Button variant="outline" onClick={() => handleInteraction('bookmark')} className="rounded-2xl h-14 font-bold gap-2 border-slate-200 hover:bg-amber-50 hover:text-amber-600 transition-all">
                                            <Bookmark className="h-5 w-5" /> Save
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Contributor Info</h4>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-black">
                                            {resource.profiles?.full_name?.[0] || "E"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{resource.profiles?.full_name || "Expert Member"}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{resource.author_org || "Contributor"}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Year</p>
                                        <p className="text-sm font-bold">{resource.year || "2024"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">License</p>
                                        <p className="text-sm font-bold">{resource.license || "Standard"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact</p>
                                        <p className="text-sm font-bold">{resource.view_count || 0} Views</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Format</p>
                                        <p className="text-sm font-bold capitalize">{resource.resource_type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tags Card */}
                        {resource.tags && resource.tags.length > 0 && (
                            <Card className="rounded-[32px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                <CardContent className="p-8 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Knowledge Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.map((tag: string) => (
                                            <Badge key={tag} className="bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg px-3 py-1.5 text-[11px] font-bold">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Legal Notice */}
                        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                            <div className="flex gap-3">
                                <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-tight">Community Verified</p>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                                        This resource has been vetted for engineering quality. If you find any copyright issues or incorrect technical data, please report it immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ResourceUploadModal
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                initialData={resource}
                onSuccess={loadResource}
            />
        </div>
    );
}
