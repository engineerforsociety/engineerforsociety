'use client';

import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Upload,
    FileText,
    Check,
    AlertCircle,
    X,
    HardHat,
    Binary,
    Cpu,
    Factory,
    Beaker,
    Compass,
    Hash,
    Layout,
    Github,
    Youtube,
    GraduationCap,
    BookOpen,
    Wrench,
    Calendar,
    ArrowRight,
    Code,
    Loader2,
    ChevronLeft,
    Plus,
    ExternalLink,
    ShieldCheck,
    Mic,
    PencilRuler,
    Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createResource } from './actions';

interface ResourceUploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
    'Academic/Research',
    'Digital & Coding',
    'Visual/Learning',
    'Technical/Design',
    'Industry Standard',
    'Career Growth',
    'Practical Tools'
];

const DISCIPLINES = [
    { name: 'General', icon: Hash },
    { name: 'CSE', icon: Binary },
    { name: 'Civil', icon: HardHat },
    { name: 'EEE', icon: Cpu },
    { name: 'Textile', icon: Factory },
    { name: 'Mechanical', icon: Beaker },
    { name: 'Architecture', icon: Compass },
];

const TYPES = [
    // Academic/Research
    { value: 'research_paper', label: 'Research Paper', icon: BookOpen },
    { value: 'ieee', label: 'IEEE Xplore', icon: GraduationCap },
    { value: 'conference', label: 'Conference Material', icon: Calendar },
    // Digital & Coding
    { value: 'github', label: 'GitHub Repository', icon: Github },
    { value: 'tool', label: 'Interactive Tool/Iframe', icon: Code },
    // Visual/Learning
    { value: 'youtube', label: 'YouTube Tutorial/Video', icon: Youtube },
    { value: 'podcast', label: 'Engineering Podcast', icon: Mic },
    // Technical/Design
    { value: 'document', label: 'Technical Document', icon: FileText },
    { value: 'template', label: 'Design Template', icon: Layout },
    { value: 'cad_blueprint', label: 'CAD / Blueprint', icon: PencilRuler },
    // Industry Standard
    { value: 'standard_codes', label: 'Standard Codes (ISO/BNBC)', icon: ShieldCheck },
    { value: 'safety_manual', label: 'Safety Manual (HSE)', icon: ShieldCheck },
    // Career Growth
    { value: 'resume', label: 'Resume Template', icon: FileText },
    { value: 'interview_prep', label: 'Interview Prep', icon: GraduationCap },
    { value: 'certification_prep', label: 'Certification Prep', icon: Award },
    // Practical Tools
    { value: 'excel_calc', label: 'Calculation Sheet (Excel)', icon: Layout },
    { value: 'case_study', label: 'Case Study', icon: BookOpen },
];

const ICON_MAP: Record<string, any> = {
    'github': Github,
    'youtube': Youtube,
    'podcast': Mic,
    'ieee': GraduationCap,
    'research_paper': BookOpen,
    'tool': Code,
    'document': FileText,
    'template': Layout,
    'cad_blueprint': PencilRuler,
    'standard_codes': ShieldCheck,
    'safety_manual': ShieldCheck,
    'resume': FileText,
    'interview_prep': GraduationCap,
    'certification_prep': GraduationCap,
    'excel_calc': Layout,
    'case_study': BookOpen,
    'conference': Calendar
};

export function ResourceUploadModal({ isOpen, onOpenChange }: ResourceUploadModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discipline: '',
        category: '',
        type: '',
        githubUrl: '',
        youtubeUrl: '',
        ieeeUrl: '',
        externalUrl: '',
        embedUrl: '',
        tags: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                toast({
                    title: "File too large",
                    description: "Please upload a file smaller than 100MB.",
                    variant: "destructive"
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!formData.title || !formData.discipline || !formData.category || !formData.type) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const resourceData = {
                title: formData.title,
                description: formData.description,
                resource_type: formData.type,
                category: formData.category,
                discipline: formData.discipline,
                github_url: formData.githubUrl || null,
                youtube_url: formData.youtubeUrl || null,
                ieee_url: formData.ieeeUrl || null,
                external_url: formData.externalUrl || null,
                embed_url: formData.embedUrl || null,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
            };

            await createResource(resourceData);

            toast({
                title: "Resource Contribution Received!",
                description: "Your specialized resource has been published and is now available in the toolbox.",
            });

            onOpenChange(false);
            setStep(1);
            setFormData({
                title: '', description: '', discipline: '', category: '', type: '',
                githubUrl: '', youtubeUrl: '', ieeeUrl: '', externalUrl: '', embedUrl: '', tags: ''
            });
            setSelectedFile(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Submission failed. Please check your connection.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isUrlType = ['github', 'youtube', 'ieee', 'tool', 'conference', 'research_paper', 'podcast'].includes(formData.type);
    const isFileType = ['document', 'template', 'cad_blueprint', 'excel_calc', 'safety_manual', 'standard_codes', 'resume', 'interview_prep', 'certification_prep', 'case_study'].includes(formData.type);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[32px] border-muted/30 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-[#0f172a] pt-10 pb-14 px-10 text-white relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                    <div className="absolute top-6 right-10">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold tracking-widest border border-white/10 uppercase">
                            Step {step} of 3
                        </div>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-4xl font-black tracking-tight mb-3">Share Expertise</DialogTitle>
                        <DialogDescription className="text-blue-100/70 font-medium text-lg leading-relaxed max-w-md">
                            Contribute code, papers, or interactive tools to the global engineering vault.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2.5 mt-8">
                        <div className={cn("h-2 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10")} />
                        <div className={cn("h-2 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10")} />
                        <div className={cn("h-2 flex-1 rounded-full transition-all duration-500", step >= 3 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10")} />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col px-10 py-8 -mt-8 bg-background rounded-t-[40px] relative shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                    <ScrollArea className="flex-1 pr-4 -mr-2">
                        {step === 1 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-4">
                                <div className="grid gap-4">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Choose Asset Type *</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {TYPES.map(t => (
                                            <button
                                                key={t.value}
                                                onClick={() => setFormData({ ...formData, type: t.value })}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group relative overflow-hidden",
                                                    formData.type === t.value
                                                        ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5"
                                                        : "bg-muted/10 border-transparent text-muted-foreground hover:border-muted hover:bg-muted/20"
                                                )}
                                            >
                                                {formData.type === t.value && (
                                                    <div className="absolute top-2 right-2 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in">
                                                        <Check className="h-2 w-2" />
                                                    </div>
                                                )}
                                                <t.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", formData.type === t.value ? "text-primary" : "text-muted-foreground/50")} />
                                                <span className="text-[10px] font-black text-center leading-tight uppercase tracking-tighter">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : step === 2 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Resource Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Structural Optimizer v2.4 (Open Source)"
                                        className="rounded-2xl h-14 border-muted/50 focus-visible:ring-primary/20 text-lg bg-muted/5"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Discipline *</Label>
                                        <Select value={formData.discipline} onValueChange={(v) => setFormData({ ...formData, discipline: v })}>
                                            <SelectTrigger className="rounded-2xl h-14 border-muted/50 bg-muted/5">
                                                <SelectValue placeholder="Select Discipline" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {DISCIPLINES.map(d => (
                                                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Category *</Label>
                                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                            <SelectTrigger className="rounded-2xl h-14 border-muted/50 bg-muted/5">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {CATEGORIES.map(c => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Description</Label>
                                    <Textarea
                                        id="desc"
                                        placeholder="What makes this resource special? Add key features..."
                                        className="rounded-2xl min-h-[100px] border-muted/50 focus-visible:ring-primary/20 bg-muted/5"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-6">
                                    {/* Link Inputs based on Type */}
                                    {formData.type === 'github' ? (
                                        <div className="grid gap-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Repository URL *</Label>
                                            <div className="relative">
                                                <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                                                <Input
                                                    placeholder="https://github.com/user/project"
                                                    className="rounded-2xl h-14 pl-12 border-muted/50 bg-muted/5 font-mono text-sm"
                                                    value={formData.githubUrl}
                                                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ) : formData.type === 'youtube' ? (
                                        <div className="grid gap-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Video Link *</Label>
                                            <div className="relative">
                                                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500/60" />
                                                <Input
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className="rounded-2xl h-14 pl-12 border-muted/50 bg-muted/5"
                                                    value={formData.youtubeUrl}
                                                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ) : formData.type === 'tool' ? (
                                        <div className="grid gap-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Embed URL (Iframe Source) *</Label>
                                            <div className="relative">
                                                <Code className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500/60" />
                                                <Input
                                                    placeholder="Provide a URL to embed the tool"
                                                    className="rounded-2xl h-14 pl-12 border-muted/50 bg-muted/5 font-mono text-xs"
                                                    value={formData.embedUrl}
                                                    onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">External Link / Reference</Label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/60" />
                                                <Input
                                                    placeholder="https://example.com/resource"
                                                    className="rounded-2xl h-14 pl-12 border-muted/50 bg-muted/5 font-mono text-xs"
                                                    value={formData.externalUrl || formData.ieeeUrl}
                                                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value, ieeeUrl: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground italic px-1">Useful if the resource is hosted on Google Drive, Dropbox, or a website.</p>
                                        </div>
                                    )}

                                    {/* File Upload for applicable types */}
                                    {isFileType && (
                                        <div className="space-y-4 text-center">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Local File (Optional if Link provided)</Label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-muted/30 group",
                                                    selectedFile ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10" : "border-muted/50 bg-muted/5"
                                                )}
                                            >
                                                {selectedFile ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600">
                                                            <Check className="h-6 w-6" />
                                                        </div>
                                                        <p className="font-black text-xs max-w-[200px] truncate">{selectedFile.name}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                                                        <p className="font-black text-[10px] uppercase tracking-wide">Upload File (Max 100MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                        </div>
                                    )}

                                    <div className="grid gap-3 pb-8">
                                        <Label htmlFor="tags" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Tags (Comma separated)</Label>
                                        <Input
                                            id="tags"
                                            placeholder="e.g. structural, optimization"
                                            className="rounded-2xl h-14 border-muted/50 bg-muted/5"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Sticky Footer Buttons */}
                    <div className="pt-6 mt-4 border-t border-muted/10 animate-in fade-in slide-in-from-bottom-2">
                        {step === 1 ? (
                            <Button
                                onClick={() => setStep(2)}
                                className="w-full rounded-2xl h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
                                disabled={!formData.type}
                            >
                                Next Step <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        ) : step === 2 ? (
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest gap-2">
                                    <ChevronLeft className="h-5 w-5" /> Back
                                </Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    className="flex-[1.5] rounded-2xl h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all"
                                    disabled={!formData.title || !formData.discipline || !formData.category}
                                >
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest gap-2">
                                    <ChevronLeft className="h-5 w-5" /> Back
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    className="flex-[1.5] rounded-2xl h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all"
                                    disabled={isSubmitting || (!selectedFile && !formData.githubUrl && !formData.youtubeUrl && !formData.externalUrl && !formData.embedUrl && !formData.ieeeUrl)}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                        <>Share to Vault <ArrowRight className="ml-2 h-5 w-5" /></>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
