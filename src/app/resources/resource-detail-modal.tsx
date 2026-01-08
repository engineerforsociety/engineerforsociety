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
    Download,
    Github,
    Youtube,
    ShieldCheck,
    Clock,
    X,
    Maximize2,
    FileText,
    Layout,
    GraduationCap,
    BookOpen,
    Wrench,
    Calendar,
    Globe,
    ArrowRight,
    PencilRuler,
    Briefcase,
    Mic,
    Code
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
        if (resource.youtube_url) {
            const ytMatch = resource.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/\S+|live\/))([^\?&"'>]+)/);
            if (ytMatch && ytMatch[1]) {
                return `https://www.youtube.com/embed/${ytMatch[1]}`;
            }
        }

        // GitHub doesn't allow iframing, so we render a preview card instead of iframe
        return null;
    };

    const embedUrl = getEmbedUrl();
    const canEmbed = !!embedUrl;

    const ResourceIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'github': return <Github className="h-5 w-5" />;
            case 'youtube': return <Youtube className="h-5 w-5" />;
            case 'ieee':
            case 'research_paper': return <GraduationCap className="h-5 w-5" />;
            case 'tool': return <Code className="h-5 w-5" />;
            case 'template':
            case 'excel_calc': return <Layout className="h-5 w-5" />;
            case 'document': return <FileText className="h-5 w-5" />;
            case 'cad_blueprint': return <PencilRuler className="h-5 w-5" />;
            case 'standard_codes':
            case 'safety_manual': return <ShieldCheck className="h-5 w-5" />;
            case 'resume':
            case 'interview_prep':
            case 'certification_prep': return <Briefcase className="h-5 w-5" />;
            case 'podcast': return <Mic className="h-5 w-5" />;
            case 'conference': return <Calendar className="h-5 w-5" />;
            case 'case_study': return <BookOpen className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden border-muted/30 shadow-2xl rounded-[32px] bg-background flex flex-col md:flex-row">
                {/* Left Side: Preview area */}
                <div className="flex-[1.2] bg-muted/10 flex flex-col h-[300px] md:h-auto border-b md:border-b-0 md:border-r border-border/50 overflow-hidden">
                    <div className="p-4 border-b bg-background/50 flex justify-between items-center backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <ResourceIcon type={resource.type} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Resource Vault</span>
                        </div>
                        {resource.url && (
                            <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <Maximize2 className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/50">
                        {canEmbed ? (
                            <iframe
                                src={embedUrl}
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                <div className="max-w-xs space-y-6">
                                    <div className="relative inline-block">
                                        <div className="h-24 w-24 bg-background rounded-[32px] shadow-xl border border-border/50 flex items-center justify-center mx-auto">
                                            <div className="text-primary/40 group-hover:text-primary transition-colors">
                                                <ResourceIcon type={resource.type} />
                                            </div>
                                        </div>
                                        <div className="absolute -top-2 -right-2 h-8 w-8 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center animate-pulse">
                                            <ExternalLink className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-black text-xl tracking-tight">Direct Access Only</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            This specialized resource requires a direct connection to the source vault for full security and interaction.
                                        </p>
                                    </div>

                                    {resource.url && (
                                        <Button asChild className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest gap-2 w-full shadow-lg shadow-primary/20">
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                Go to Source <ArrowRight className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Details area */}
                <div className="flex-1 flex flex-col h-[50vh] md:h-auto overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 text-[10px] font-bold uppercase tracking-wider">{resource.discipline}</Badge>
                                    <Badge variant="outline" className="rounded-full px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-muted/50">{resource.category}</Badge>
                                </div>
                                <DialogTitle className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">{resource.title}</DialogTitle>
                                <DialogDescription className="sr-only">Detailed view of {resource.title}</DialogDescription>
                                {resource.description && (
                                    <div className="bg-muted/30 p-6 rounded-[24px] border border-border/50">
                                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                            {resource.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-muted/20 rounded-[24px] border border-border/30">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-3">Contributor</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <p className="text-sm font-black">{resource.author}</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-muted/20 rounded-[24px] border border-border/30">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-3">Added On</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-600">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <p className="text-sm font-black">{resource.date}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Vault Metrics</h5>
                                <div className="flex justify-between items-center p-6 bg-slate-900 text-white rounded-[24px] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-center flex-1 relative z-10">
                                        <p className="text-2xl font-black">{resource.downloads > 1000 ? (resource.downloads / 1000).toFixed(1) + 'k' : resource.downloads}</p>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Accesses</p>
                                    </div>
                                    <Separator orientation="vertical" className="h-10 bg-white/10" />
                                    <div className="text-center flex-1 relative z-10">
                                        <p className="text-2xl font-black">{resource.views > 1000 ? (resource.views / 1000).toFixed(1) + 'k' : resource.views}</p>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Impact</p>
                                    </div>
                                </div>
                            </div>

                            {resource.tags && resource.tags.length > 0 && (
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Resource Tags</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.map((tag: string) => (
                                            <Badge key={tag} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-600 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-8 border-t bg-background mt-auto">
                        <div className="flex gap-4">
                            <Button className="flex-1 rounded-2xl h-14 text-lg font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    {['github', 'youtube', 'tool', 'ieee', 'research_paper'].includes(resource.type) ? (
                                        <>Access Vault <ExternalLink className="h-5 w-5" /></>
                                    ) : (
                                        <>Download Asset <Download className="h-5 w-5" /></>
                                    )}
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
