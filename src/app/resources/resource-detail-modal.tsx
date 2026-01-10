'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ExternalLink,
    ShieldCheck,
    Clock,
    X,
    Maximize2,
    FileText,
    Layout,
    GraduationCap,
    BookOpen,
    Calendar,
    ArrowRight,
    PencilRuler,
    Briefcase,
    Mic,
    Code,
    ThumbsUp,
    Bookmark,
    Building2,
    User,
    HardHat,
    Youtube,
    FileSearch,
    Award,
    Globe,
    FileCheck,
    Github
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ResourceDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    resource: any;
}

export function ResourceDetailModal({ isOpen, onOpenChange, resource }: ResourceDetailModalProps) {
    if (!resource) return null;

    const getEmbedUrl = () => {
        if (resource.embed_url) return resource.embed_url;

        // Handle YouTube
        if (resource.external_url && resource.resource_type === 'youtube_tutorial') {
            const ytMatch = resource.external_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S+|live\/))([^\?&"'>]+)/);
            if (ytMatch && ytMatch[1]) {
                return `https://www.youtube.com/embed/${ytMatch[1]}`;
            }
        }
        return null;
    };

    const embedUrl = getEmbedUrl();
    const canEmbed = !!embedUrl;

    const ResourceIcon = ({ type }: { type: string }) => {
        const iconClass = "h-6 w-6";
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
            case 'cad_blueprint': return <PencilRuler className={cn(iconClass, "text-cyan-700")} />;
            case 'resume_template': return <UserCheck className={cn(iconClass, "text-violet-600")} />;
            case 'interview_prep': return <Award className={cn(iconClass, "text-yellow-700")} />;
            case 'certification_prep': return <ShieldCheck className={cn(iconClass, "text-indigo-700")} />;
            case 'youtube_tutorial': return <Youtube className={cn(iconClass, "text-red-600")} />;
            case 'engineering_podcast': return <Mic className={cn(iconClass, "text-purple-600")} />;
            default: return <FileText className={cn(iconClass, "text-slate-500")} />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[92vh] p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white dark:bg-slate-950 flex flex-col md:flex-row">
                {/* Left Side: Preview area */}
                <div className="flex-[1.4] bg-slate-50 dark:bg-slate-900 flex flex-col h-[350px] md:h-auto border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden relative">
                    <div className="p-5 border-b bg-white/80 dark:bg-slate-900/80 flex justify-between items-center backdrop-blur-md relative z-10 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600 shadow-sm border border-blue-600/10">
                                <ResourceIcon type={resource.resource_type} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Knowledge Vault</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{resource.resource_type.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" asChild>
                                <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                    <Maximize2 className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 relative bg-slate-100 dark:bg-slate-900">
                        {canEmbed ? (
                            <iframe
                                src={embedUrl}
                                className="w-full h-full border-none shadow-inner"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                <div className="max-w-sm space-y-8">
                                    <div className="relative inline-block">
                                        <div className="h-28 w-28 bg-white dark:bg-slate-800 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto">
                                            <div className="scale-150">
                                                <ResourceIcon type={resource.resource_type} />
                                            </div>
                                        </div>
                                        <div className="absolute -top-3 -right-3 h-9 w-9 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center">
                                            <ExternalLink className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">External Asset Access</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            To maintain high-quality verification and original formatting, this engineering asset is accessed directly via its verified source.
                                        </p>
                                    </div>

                                    <Button asChild className="rounded-xl h-12 px-8 font-bold uppercase tracking-wide gap-3 w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-base transition-all">
                                        <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                            Open Direct Link <ArrowRight className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Details area */}
                <div className="flex-1 flex flex-col h-[50vh] md:h-auto overflow-hidden bg-white dark:bg-slate-950">
                    <ScrollArea className="flex-1">
                        <div className="p-8 md:p-10 space-y-10">
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2.5">
                                    <Badge className="bg-blue-600 text-white border-none rounded-lg px-4 py-1 text-[10px] font-black uppercase tracking-widest">{resource.discipline}</Badge>
                                    <Badge variant="outline" className="rounded-lg px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-slate-200 dark:border-slate-800">{resource.category}</Badge>
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none rounded-lg px-4 py-1 text-[10px] font-black uppercase tracking-widest">{resource.skill_level}</Badge>
                                </div>
                                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">{resource.title}</h2>
                                {resource.description && (
                                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[24px] border border-slate-100 dark:border-slate-800 relative">
                                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium whitespace-pre-wrap">
                                            {resource.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                        <UserCheck className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contributor</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{resource.author_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">{resource.author_org || 'Expert Member'}</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Metadata</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{resource.year || '2024'}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{resource.license || 'Open Resource'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Community Impact</h5>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 bg-slate-900 text-white rounded-2xl text-center flex flex-col items-center gap-1">
                                        <ThumbsUp className="h-4 w-4 text-blue-400" />
                                        <p className="text-lg font-black">{resource.upvote_count}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Helpful</p>
                                    </div>
                                    <div className="p-4 bg-slate-900 text-white rounded-2xl text-center flex flex-col items-center gap-1">
                                        <Bookmark className="h-4 w-4 text-amber-500" />
                                        <p className="text-lg font-black">{resource.bookmark_count}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Saves</p>
                                    </div>
                                    <div className="p-4 bg-slate-900 text-white rounded-2xl text-center flex flex-col items-center gap-1">
                                        <Eye className="h-4 w-4 text-emerald-400" />
                                        <p className="text-lg font-black">{resource.view_count}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Views</p>
                                    </div>
                                </div>
                            </div>

                            {resource.tags && resource.tags.length > 0 && (
                                <div className="space-y-4 pt-2">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Knowledge Tags</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.map((tag: string) => (
                                            <Badge key={tag} className="px-4 py-2 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border-none text-slate-600 dark:text-slate-400">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-8 md:p-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
                        <Button className="w-full rounded-xl h-14 text-base font-bold uppercase tracking-wider gap-3 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20" asChild>
                            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                Access Asset <ExternalLink className="h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const UserCheck = ({ className }: { className?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
    )
}

const Eye = ({ className }: { className?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
    )
}
