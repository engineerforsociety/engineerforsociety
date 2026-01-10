'use client';

import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
    Check,
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
    ExternalLink,
    ShieldCheck,
    Mic,
    PencilRuler,
    Award,
    Globe,
    FileSearch,
    UserCheck,
    FileCheck,
    Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createResource, updateResource } from './actions';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';

interface ResourceUploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSuccess?: () => void;
}

const CATEGORIES = [
    'Knowledge & Research',
    'Code & Tools',
    'Career & Learning'
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

const ASSET_TYPES = {
    'Knowledge & Research': [
        { value: 'research_paper', label: 'Research Paper', icon: BookOpen },
        { value: 'ieee_xplore', label: 'IEEE Xplore', icon: GraduationCap },
        { value: 'conference_material', label: 'Conference Material', icon: Calendar },
        { value: 'case_study', label: 'Case Study', icon: BookOpen },
        { value: 'technical_document', label: 'Technical Document', icon: FileSearch },
        { value: 'standard_codes', label: 'Standard Codes (ISO/BNBC)', icon: ShieldCheck },
        { value: 'safety_manual', label: 'Safety Manual (HSE)', icon: ShieldCheck },
    ],
    'Code & Tools': [
        { value: 'github_repo', label: 'GitHub Repository', icon: Github },
        { value: 'interactive_tool', label: 'Interactive Tool/App', icon: Code },
        { value: 'calculation_sheet', label: 'Calculation Sheet (Excel)', icon: Layout },
        { value: 'design_template', label: 'Design Template', icon: Layout },
        { value: 'cad_blueprint', label: 'CAD / Blueprint', icon: PencilRuler },
    ],
    'Career & Learning': [
        { value: 'resume_template', label: 'Resume Template', icon: UserCheck },
        { value: 'interview_prep', label: 'Interview Preparation', icon: GraduationCap },
        { value: 'certification_prep', label: 'Certification Prep', icon: Award },
        { value: 'youtube_tutorial', label: 'YouTube Tutorial', icon: Youtube },
        { value: 'engineering_podcast', label: 'Engineering Podcast', icon: Mic },
    ]
};

const SOURCE_TYPES = [
    { value: 'External Website', icon: Globe },
    { value: 'Google Drive', icon: Layout },
    { value: 'GitHub', icon: Github },
    { value: 'YouTube', icon: Youtube },
    { value: 'Research Portal', icon: GraduationCap },
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export function ResourceUploadModal({ isOpen, onOpenChange, initialData, onSuccess }: ResourceUploadModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discipline: '',
        category: '',
        resource_type: '',
        skill_level: 'Beginner',
        source_type: 'External Website',
        external_url: '',
        embed_url: '',
        author_org: '',
        year: new Date().getFullYear().toString(),
        license: 'Open',
        is_original_creator: false,
        tags: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                discipline: initialData.discipline || '',
                category: initialData.category || '',
                resource_type: initialData.resource_type || '',
                skill_level: initialData.skill_level || 'Beginner',
                source_type: initialData.source_type || 'External Website',
                external_url: initialData.external_url || '',
                embed_url: initialData.embed_url || '',
                author_org: initialData.author_org || '',
                year: initialData.year || new Date().getFullYear().toString(),
                license: initialData.license || 'Open',
                is_original_creator: initialData.is_original_creator || false,
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : ''
            });
        }
    }, [initialData, isOpen]);

    const handleUpload = async () => {
        if (!formData.title || !formData.discipline || !formData.category || !formData.resource_type || !formData.external_url) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields marked with *.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const resourceData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
            };

            if (initialData?.id) {
                await updateResource(initialData.id, resourceData);
            } else {
                await createResource(resourceData);
            }

            toast({
                title: initialData ? "Asset Updated!" : "Contribution Successful!",
                description: initialData ? "Your changes have been saved." : "Your knowledge asset has been added to the library.",
            });

            onOpenChange(false);
            if (onSuccess) onSuccess();
            setStep(1);
            setFormData({
                title: '', description: '', discipline: '', category: '', resource_type: '',
                skill_level: 'Beginner', source_type: 'External Website', external_url: '',
                embed_url: '', author_org: '', year: new Date().getFullYear().toString(),
                license: 'Open', is_original_creator: false, tags: ''
            });
        } catch (error: any) {
            toast({
                title: "Submission Error",
                description: error.message || "Failed to publish resource.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAssetTypes = () => {
        if (!formData.category) return [];
        return ASSET_TYPES[formData.category as keyof typeof ASSET_TYPES] || [];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[95vh] bg-white dark:bg-slate-950 rounded-[24px]">
                {/* Header Section */}
                <div className="bg-slate-900 pt-10 pb-12 px-10 text-white relative">
                    <div className="absolute top-6 right-10">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-white/20 uppercase">
                            Step {step} of 4
                        </div>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold tracking-tight mb-2">
                            {initialData ? "Edit Knowledge Asset" : "Publish Knowledge Asset"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium text-base leading-relaxed max-w-lg">
                            {initialData ? "Update the details of your shared resource." : "Ensure title and description are clear for the engineering community."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Progress Bar */}
                    <div className="flex gap-2.5 mt-8">
                        {[1, 2, 3, 4].map(s => (
                            <div
                                key={s}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                                    step >= s ? "bg-blue-500" : "bg-white/10"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-hidden flex flex-col px-10 py-8 bg-white dark:bg-slate-950">
                    <ScrollArea className="flex-1 pr-4 -mr-2">
                        {step === 1 ? (
                            <div className="space-y-6 animate-in fade-in duration-300 pb-4">
                                <div className="grid gap-4">
                                    <Label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300">Asset Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Seismic Analysis of RCC Multi-story Buildings"
                                        className="rounded-xl h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 text-base bg-slate-50 dark:bg-slate-900 font-medium"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-4">
                                    <Label htmlFor="desc" className="text-sm font-bold text-slate-700 dark:text-slate-300">Description *</Label>
                                    <Textarea
                                        id="desc"
                                        placeholder="Explain what problem this resource solves and why it is useful..."
                                        className="rounded-xl min-h-[120px] border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 bg-slate-50 dark:bg-slate-900 font-medium"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Discipline *</Label>
                                        <Select value={formData.discipline} onValueChange={(v) => setFormData({ ...formData, discipline: v })}>
                                            <SelectTrigger className="rounded-xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium">
                                                <SelectValue placeholder="Select Discipline" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {DISCIPLINES.map(d => (
                                                    <SelectItem key={d.name} value={d.name} className="py-2.5 rounded-lg cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <d.icon className="h-4 w-4" />
                                                            {d.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Skill Level *</Label>
                                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-800">
                                            {SKILL_LEVELS.map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setFormData({ ...formData, skill_level: level })}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                                        formData.skill_level === level
                                                            ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400"
                                                            : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : step === 2 ? (
                            <div className="space-y-8 animate-in fade-in duration-300 pb-4">
                                <div className="grid gap-4">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category *</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {CATEGORIES.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => setFormData({ ...formData, category, resource_type: '' })}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center",
                                                    formData.category === category
                                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400"
                                                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                                                )}
                                            >
                                                <div className={cn("p-2 rounded-xl", formData.category === category ? "bg-blue-100 dark:bg-blue-900/40" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm")}>
                                                    {category === 'Knowledge & Research' && <BookOpen className="h-6 w-6" />}
                                                    {category === 'Code & Tools' && <Code className="h-6 w-6" />}
                                                    {category === 'Career & Learning' && <GraduationCap className="h-6 w-6" />}
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-tight leading-tight">{category}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.category && (
                                    <div className="grid gap-4 animate-in slide-in-from-top-4 duration-300">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Specific Type *</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {getAssetTypes().map(t => (
                                                <button
                                                    key={t.value}
                                                    onClick={() => setFormData({ ...formData, resource_type: t.value })}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 h-24",
                                                        formData.resource_type === t.value
                                                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400"
                                                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                                                    )}
                                                >
                                                    <t.icon className={cn("h-5 w-5", formData.resource_type === t.value ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                                                    <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-tight">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : step === 3 ? (
                            <div className="space-y-8 animate-in fade-in duration-300 pb-4">
                                <div className="grid gap-4">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Source Provider *</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {SOURCE_TYPES.map(s => (
                                            <button
                                                key={s.value}
                                                onClick={() => setFormData({ ...formData, source_type: s.value as any })}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 h-20",
                                                    formData.source_type === s.value
                                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600"
                                                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"
                                                )}
                                            >
                                                <s.icon className="h-5 w-5" />
                                                <span className="text-[9px] font-bold uppercase text-center leading-tight">{s.value}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <Label htmlFor="url" className="text-sm font-bold text-slate-700 dark:text-slate-300">Resource Link *</Label>
                                    <Input
                                        id="url"
                                        placeholder={
                                            formData.source_type === 'GitHub' ? "https://github.com/user/repo" :
                                                formData.source_type === 'YouTube' ? "https://youtube.com/watch?v=..." :
                                                    "Paste the direct verified link"
                                        }
                                        className="rounded-xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                                        value={formData.external_url}
                                        onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                                    />
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-1">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                        All links are verified by moderators before publishing.
                                    </div>
                                </div>

                                {formData.resource_type === 'interactive_tool' && (
                                    <div className="grid gap-3 animate-in slide-in-from-top-2">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Embed Frame URL (Optional)</Label>
                                        <Input
                                            placeholder="URL for interactive preview"
                                            className="rounded-xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                                            value={formData.embed_url}
                                            onChange={(e) => setFormData({ ...formData, embed_url: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300 pb-4">
                                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                        <Award className="h-4 w-4" /> Proof & Metadata
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Author / Org *</Label>
                                            <Input
                                                placeholder="e.g. IEEE, PWD, or Name"
                                                className="rounded-xl h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium"
                                                value={formData.author_org}
                                                onChange={(e) => setFormData({ ...formData, author_org: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Year</Label>
                                            <Input
                                                placeholder="e.g. 2024"
                                                className="rounded-xl h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium"
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">License</Label>
                                        <Select value={formData.license} onValueChange={(v) => setFormData({ ...formData, license: v })}>
                                            <SelectTrigger className="rounded-xl h-11 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold">
                                                <SelectValue placeholder="Select License" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Open" className="rounded-lg cursor-pointer">Open Source</SelectItem>
                                                <SelectItem value="Educational" className="rounded-lg cursor-pointer">Educational Only</SelectItem>
                                                <SelectItem value="Personal" className="rounded-lg cursor-pointer">Personal Use</SelectItem>
                                                <SelectItem value="Proprietary" className="rounded-lg cursor-pointer">Proprietary</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Original Creator?</Label>
                                            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Did you create this asset?</p>
                                        </div>
                                        <Switch
                                            checked={formData.is_original_creator}
                                            onCheckedChange={(v) => setFormData({ ...formData, is_original_creator: v })}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Search Tags (Optional)</Label>
                                    <Input
                                        placeholder="e.g. concrete, structural, design"
                                        className="rounded-xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-500 px-1 font-medium italic">Separate tags with commas.</p>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Controls */}
                    <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                        {step > 1 && (
                            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl h-12 font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        )}

                        {step < 4 ? (
                            <Button
                                onClick={() => setStep(step + 1)}
                                className={cn(
                                    "rounded-xl h-12 text-sm font-bold tracking-wide transition-all",
                                    step === 1 ? "w-full" : "flex-[1.5]",
                                    "bg-blue-600 hover:bg-blue-700"
                                )}
                                disabled={
                                    (step === 1 && (!formData.title || !formData.discipline)) ||
                                    (step === 2 && !formData.resource_type) ||
                                    (step === 3 && !formData.external_url)
                                }
                            >
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleUpload}
                                className="flex-[1.5] rounded-xl h-12 text-sm font-bold tracking-wide bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                disabled={isSubmitting || !formData.author_org}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <FileCheck className="h-4 w-4" />
                                        {initialData ? "Save Changes" : "Publish To Vault"}
                                    </div>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
