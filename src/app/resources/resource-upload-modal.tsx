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
    ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResourceUploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
    'Engineering Codes & Standards',
    'Design Templates & Checklists',
    'Software Manuals',
    'Career Resources',
    'Academic Materials',
    'Discipline-Specific'
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
    { value: 'document', label: 'Technical Document (PDF/Manual)', icon: FileText },
    { value: 'template', label: 'Design Template (Excel/CAD)', icon: Layout },
    { value: 'github', label: 'GitHub Repository', icon: Github },
    { value: 'youtube', label: 'YouTube Tutorial/Video', icon: Youtube },
    { value: 'ieee', label: 'IEEE Xplore Resource', icon: GraduationCap },
    { value: 'research_paper', label: 'Research Paper / Journal', icon: BookOpen },
    { value: 'tool', label: 'Interactive Tool / Iframe', icon: Wrench },
    { value: 'conference', label: 'Conference Material', icon: Calendar }
];

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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast({
                title: "Resource Contribution Received!",
                description: "Your specialized resource has been sent to our expert board for verification.",
            });

            onOpenChange(false);
            setStep(1);
            setFormData({
                title: '', description: '', discipline: '', category: '', type: '',
                githubUrl: '', youtubeUrl: '', ieeeUrl: '', externalUrl: '', embedUrl: '', tags: ''
            });
            setSelectedFile(null);
        } catch (error) {
            toast({ title: "Error", description: "Submission failed. Please check your connection.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isUrlType = ['github', 'youtube', 'ieee', 'tool', 'conference'].includes(formData.type);
    const isFileType = ['document', 'template'].includes(formData.type);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[32px] border-muted/30 shadow-2xl">
                <div className="bg-[#0f172a] pt-10 pb-14 px-10 text-white relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                    <div className="absolute top-6 right-10">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold tracking-widest border border-white/10 uppercase">
                            Step {step} of 2
                        </div>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-4xl font-black tracking-tight mb-2 mb-3">Share Expertise</DialogTitle>
                        <DialogDescription className="text-blue-100/70 font-medium text-lg leading-relaxed max-w-md">
                            Contribute code, papers, or interactive tools to the global engineering vault.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2.5 mt-8">
                        <div className={cn("h-2 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10")} />
                        <div className={cn("h-2 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10")} />
                    </div>
                </div>

                <div className="px-10 py-10 -mt-8 bg-background rounded-t-[40px] relative shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                    <ScrollArea className="max-h-[60vh] pr-4">
                        {step === 1 ? (
                            <div className="space-y-8 py-2">
                                <div className="space-y-5">
                                    <div className="grid gap-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Resource Type *</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {TYPES.map(t => (
                                                <button
                                                    key={t.value}
                                                    onClick={() => setFormData({ ...formData, type: t.value })}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group",
                                                        formData.type === t.value
                                                            ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5"
                                                            : "bg-muted/10 border-transparent text-muted-foreground hover:border-muted hover:bg-muted/20"
                                                    )}
                                                >
                                                    <t.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", formData.type === t.value ? "text-primary" : "text-muted-foreground/50")} />
                                                    <span className="text-[10px] font-bold text-center leading-tight uppercase">{t.label.split('(')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Discipline *</Label>
                                            <Select value={formData.discipline} onValueChange={(v) => setFormData({ ...formData, discipline: v })}>
                                                <SelectTrigger className="rounded-2xl h-14 border-muted/50 bg-muted/5">
                                                    <SelectValue placeholder="Select" />
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
                                                    <SelectValue placeholder="Select" />
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

                                <Button
                                    onClick={() => setStep(2)}
                                    className="w-full rounded-2xl h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
                                    disabled={!formData.title || !formData.type || !formData.discipline || !formData.category}
                                >
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-8 py-2">
                                {/* Dynamic Input based on Type */}
                                <div className="space-y-6">
                                    {formData.type === 'github' && (
                                        <div className="grid gap-3 animate-in fade-in slide-in-from-right-4">
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
                                    )}

                                    {formData.type === 'youtube' && (
                                        <div className="grid gap-3 animate-in fade-in slide-in-from-right-4">
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
                                    )}

                                    {formData.type === 'tool' && (
                                        <div className="grid gap-3 animate-in fade-in slide-in-from-right-4">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Embed URL (Iframe Source) *</Label>
                                            <div className="relative">
                                                <Code className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500/60" />
                                                <Input
                                                    placeholder="Provide a URL to embed the tool (e.g. calculator or simulator)"
                                                    className="rounded-2xl h-14 pl-12 border-muted/50 bg-muted/5 font-mono text-xs"
                                                    value={formData.embedUrl}
                                                    onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground italic px-1">Note: The website must allow cross-origin embedding.</p>
                                        </div>
                                    )}

                                    {['ieee', 'research_paper', 'conference'].includes(formData.type) && (
                                        <div className="grid gap-3 animate-in fade-in slide-in-from-right-4">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Reference / Link *</Label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/60" />
                                                <Input
                                                    placeholder="https://ieeexplore.ieee.org/document/..."
                                                    className="rounded-2xl h-14 pl-12 border-muted/50 bg-muted/5 font-mono text-xs"
                                                    value={formData.externalUrl}
                                                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(formData.type === 'document' || formData.type === 'template' || formData.type === 'research_paper') && (
                                        <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom-4">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Local File (Optional/Required)</Label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-muted/30 group",
                                                    selectedFile ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10" : "border-muted/50 bg-muted/5"
                                                )}
                                            >
                                                {selectedFile ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="h-20 w-20 bg-blue-500/20 rounded-[24px] flex items-center justify-center text-blue-600 shadow-inner">
                                                            <Check className="h-10 w-10 animate-in zoom-in" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-black text-sm max-w-[200px] truncate">{selectedFile.name}</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="text-destructive font-bold text-xs hover:bg-destructive/10 rounded-xl" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>Discard File</Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="h-20 w-20 bg-muted/50 rounded-[24px] flex items-center justify-center text-muted-foreground/30 transition-transform group-hover:scale-110">
                                                            <Upload className="h-10 w-10" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-sm uppercase tracking-wide">Select Engineering Assets</p>
                                                            <p className="text-[10px] text-muted-foreground/60 mt-1 font-bold">PDF, Excel, CAD, ZIP (Max 100MB)</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept=".pdf,.xls,.xlsx,.doc,.docx,.zip,.dwg,.txt,.md"
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-3">
                                        <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 px-1">Description / Notes</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Briefly explain the significance of this resource..."
                                            className="rounded-2xl min-h-[120px] border-muted/50 focus-visible:ring-primary/20 resize-none bg-muted/5"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="ghost" className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-muted-foreground" onClick={() => setStep(1)}>
                                        <ChevronLeft className="mr-2 h-5 w-5" /> Back
                                    </Button>
                                    <Button
                                        className="flex-[2] rounded-2xl h-14 font-black uppercase tracking-widest gap-2 shadow-2xl shadow-primary/30"
                                        onClick={handleUpload}
                                        disabled={isSubmitting || (isUrlType && !formData.githubUrl && !formData.youtubeUrl && !formData.externalUrl && !formData.embedUrl)}
                                    >
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                        {isSubmitting ? "Submitting..." : "Publish Vault"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
