'use client';

import { useState, useMemo } from 'react';
import {
    FileText,
    Github,
    BookOpen,
    Search,
    Filter,
    Download,
    Eye,
    Plus,
    ChevronRight,
    ShieldCheck,
    Layout,
    Clock,
    ExternalLink,
    GraduationCap,
    Briefcase,
    Wrench,
    Binary,
    HardHat,
    Cpu,
    Factory,
    Beaker,
    Compass,
    Hash,
    Youtube,
    Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ResourceUploadModal } from './resource-upload-modal';

// Types for our library
type ResourceDiscipline = 'General' | 'CSE' | 'Civil' | 'EEE' | 'Textile' | 'Mechanical' | 'Architecture';
type ResourceCategory =
    | 'Engineering Codes & Standards'
    | 'Design Templates & Checklists'
    | 'Software Manuals'
    | 'Career Resources'
    | 'Academic Materials'
    | 'Discipline-Specific';

interface EngineeringResource {
    id: string;
    title: string;
    description: string;
    type: 'document' | 'template' | 'manual' | 'guide' | 'formula' | 'github' | 'youtube' | 'ieee' | 'research_paper' | 'tool' | 'conference';
    category: ResourceCategory;
    discipline: ResourceDiscipline;
    author: string;
    fileSize?: string;
    fileType?: string;
    url?: string;
    downloads: number;
    views: number;
    date: string;
    isPremium?: boolean;
}

const SAMPLE_RESOURCES: EngineeringResource[] = [
    {
        id: '1',
        title: 'BNBC 2020: Part 6 (Structural Design)',
        description: 'The definitive Bangladesh National Building Code for structural engineering and safety standards.',
        type: 'document',
        category: 'Engineering Codes & Standards',
        discipline: 'Civil',
        author: 'PWD Bangladesh',
        fileSize: '12.4 MB',
        fileType: 'PDF',
        downloads: 1250,
        views: 4500,
        date: '2023-10-15',
    },
    {
        id: '2',
        title: 'AutoCAD Standard Layer Protocol',
        description: 'Complete layer management template and block library for professional architectural drawings.',
        type: 'template',
        category: 'Design Templates & Checklists',
        discipline: 'Architecture',
        author: 'Elite Designs',
        fileSize: '2.1 MB',
        fileType: 'DWG / ZIP',
        downloads: 850,
        views: 2100,
        date: '2024-01-20',
    },
    {
        id: '3',
        title: 'ATS-Friendly Engineer Resume Template',
        description: 'High-conversion CV template specifically optimized for technical recruitment systems.',
        type: 'template',
        category: 'Career Resources',
        discipline: 'General',
        author: 'HR Experts',
        fileSize: '450 KB',
        fileType: 'DOCX',
        downloads: 3200,
        views: 8900,
        date: '2024-02-10',
        isPremium: true,
    },
    {
        id: '4',
        title: 'Structural Load Calculation (Excel)',
        description: 'Automated calculation sheet for dead, live, and wind loads following BNBC guidelines.',
        type: 'template',
        category: 'Design Templates & Checklists',
        discipline: 'Civil',
        author: 'Engr. Rakib',
        fileSize: '1.2 MB',
        fileType: 'XLSX',
        downloads: 1540,
        views: 3200,
        date: '2023-12-05',
    },
    {
        id: '5',
        title: 'Kubernetes Cheat Sheet for Devs',
        description: 'A comprehensive guide to common K8s commands, configurations, and troubleshooting steps.',
        type: 'manual',
        category: 'Software Manuals',
        discipline: 'CSE',
        author: 'Open Source Community',
        fileSize: '890 KB',
        fileType: 'PDF',
        downloads: 5600,
        views: 12400,
        date: '2024-03-01',
    },
    {
        id: 'g1',
        title: 'Finite Element Analysis Solver (Python)',
        description: 'Open-source FEA solver for 2D/3D truss and frame structures. Includes full source code and documentation.',
        type: 'github',
        category: 'Discipline-Specific',
        discipline: 'Mechanical',
        author: 'MechMasters Org',
        url: 'https://github.com/example/fea-python',
        downloads: 2400,
        views: 6700,
        date: '2024-01-05',
    },
    {
        id: 'y1',
        title: 'ETABS 21 Masterclass: High-Rise Modeling',
        description: 'Advanced tutorial on seismic analysis and modeling of 40-story building using ETABS 21.',
        type: 'youtube',
        category: 'Software Manuals',
        discipline: 'Civil',
        author: 'Engr. Academy',
        url: 'https://youtube.com/watch?v=example',
        downloads: 8900,
        views: 45000,
        date: '2024-02-15',
    },
    {
        id: 't1',
        title: 'Interactive Psychrometric Chart',
        description: 'Web-based interactive tool for calculating moist air properties. Essential for HVAC design.',
        type: 'tool',
        category: 'Design Templates & Checklists',
        discipline: 'Mechanical',
        author: 'HVAC Labs',
        url: 'https://example-tool.com',
        downloads: 3200,
        views: 12000,
        date: '2024-03-01',
    }
];

const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'github': return <Github className="h-12 w-12 text-slate-800 dark:text-slate-200" />;
        case 'youtube': return <Youtube className="h-12 w-12 text-red-600" />;
        case 'ieee':
        case 'research_paper': return <GraduationCap className="h-12 w-12 text-indigo-600" />;
        case 'tool': return <Code className="h-12 w-12 text-emerald-600" />;
        case 'template': return <Layout className="h-12 w-12 text-amber-500/80" />;
        case 'manual': return <Wrench className="h-12 w-12 text-emerald-500/80" />;
        case 'guide': return <Compass className="h-12 w-12 text-rose-500/80" />;
        case 'formula': return <Binary className="h-12 w-12 text-violet-500/80" />;
        default: return <FileText className="h-12 w-12 text-blue-500/80" />;
    }
};

const CATEGORIES: { name: ResourceCategory; icon: any; description: string }[] = [
    { name: 'Engineering Codes & Standards', icon: ShieldCheck, description: 'ISO, IEEE, BNBC, Safety Codes' },
    { name: 'Design Templates & Checklists', icon: Layout, description: 'CAD, Calculation Sheets, QC Forms' },
    { name: 'Software Manuals', icon: Wrench, description: 'Cheat-sheets, Troubleshooting Guides' },
    { name: 'Career Resources', icon: Briefcase, description: 'Resume Templates, Interview Prep' },
    { name: 'Academic Materials', icon: GraduationCap, description: 'Handbooks, Research Papers' },
    { name: 'Discipline-Specific', icon: Compass, description: 'Technical documentation by field' },
];

const DISCIPLINES: { name: ResourceDiscipline; icon: any }[] = [
    { name: 'General', icon: Hash },
    { name: 'CSE', icon: Binary },
    { name: 'Civil', icon: HardHat },
    { name: 'EEE', icon: Cpu },
    { name: 'Textile', icon: Factory },
    { name: 'Mechanical', icon: Beaker },
    { name: 'Architecture', icon: Compass },
];

export default function ResourcesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All'>('All');
    const [selectedDiscipline, setSelectedDiscipline] = useState<ResourceDiscipline | 'All'>('All');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const filteredResources = useMemo(() => {
        return SAMPLE_RESOURCES.filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
            const matchesDiscipline = selectedDiscipline === 'All' || r.discipline === selectedDiscipline;
            return matchesSearch && matchesCategory && matchesDiscipline;
        });
    }, [searchQuery, selectedCategory, selectedDiscipline]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <ResourceUploadModal isOpen={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Engineer's Toolbox</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        A specialized digital library for professional engineers. Find codes, templates, and manuals in seconds.
                    </p>
                </div>
                <Button onClick={() => setIsUploadModalOpen(true)} size="lg" className="gap-2 shadow-lg shadow-primary/20 rounded-xl px-8 h-12">
                    <Plus className="h-5 w-5" /> Contribution
                </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <aside className="space-y-8 h-fit lg:sticky lg:top-24">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Disciplines</h3>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => setSelectedDiscipline('All')}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                    selectedDiscipline === 'All' ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                            >
                                All Disciplines
                            </button>
                            {DISCIPLINES.map(d => (
                                <button
                                    key={d.name}
                                    onClick={() => setSelectedDiscipline(d.name)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                        selectedDiscipline === d.name ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                >
                                    <d.icon className="h-4 w-4" />
                                    {d.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Categories</h3>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                    selectedCategory === 'All' ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                            >
                                All Categories
                            </button>
                            {CATEGORIES.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => setSelectedCategory(c.name)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all",
                                        selectedCategory === c.name ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                >
                                    <c.icon className="h-4 w-4 shrink-0" />
                                    <span className="line-clamp-1">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats bit */}
                    <div className="bg-accent/30 rounded-2xl p-6 border border-border/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Verified Library</p>
                                <p className="text-[10px] text-muted-foreground">Certified Engineering Resources</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">Total Resources</span>
                                <span className="font-bold">2,450+</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">Monthly Downloads</span>
                                <span className="font-bold">150k+</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-3 space-y-6">
                    {/* Search & Sort Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                            <Input
                                placeholder="Search manual, manual, manual, codes, templates..."
                                className="pl-11 h-12 bg-background/50 border-muted focus-visible:ring-primary/20 text-lg rounded-xl shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-12 px-5 gap-2 rounded-xl group hover:border-primary/30">
                                        <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        Sort By
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                                    <DropdownMenuItem className="rounded-lg">Most Popular</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg">Recently Added</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg">Highest Rated</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg">File Size</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Resource Grid */}
                    <div className="grid gap-5">
                        {filteredResources.length > 0 ? (
                            filteredResources.map((resource) => (
                                <Card key={resource.id} className="group overflow-hidden rounded-2xl border-muted/60 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-background/40 backdrop-blur-sm">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-48 bg-muted/20 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border/50 group-hover:bg-primary/5 transition-colors">
                                            <ResourceIcon type={resource.type} />
                                        </div>
                                        <CardContent className="flex-1 p-6">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                        {resource.discipline}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] px-3 py-0.5 rounded-full font-medium text-muted-foreground border-muted-foreground/30 capitalize">
                                                        {resource.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                {resource.isPremium && (
                                                    <div className="bg-yellow-400/20 text-yellow-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-400/30">
                                                        PREMIUM
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors cursor-pointer">{resource.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                                                {resource.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[12px] text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-help">
                                                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                                                    {resource.author}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {resource.date}
                                                </div>
                                                {resource.fileType && (
                                                    <div className="flex items-center gap-1.5 border-l border-border pl-6 ml-0">
                                                        <span className="font-bold text-foreground uppercase">{resource.fileType}</span>
                                                        <span>({resource.fileSize})</span>
                                                    </div>
                                                )}
                                                {resource.type === 'github' && (
                                                    <div className="flex items-center gap-1.5 border-l border-border pl-6 ml-0 text-slate-600">
                                                        <Github className="h-3.5 w-3.5" />
                                                        <span>GitHub Repository</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <div className="p-6 md:p-8 flex flex-row md:flex-col justify-between items-center gap-4 bg-muted/5 border-t md:border-t-0 md:border-l border-border/30">
                                            <div className="flex md:flex-col items-center gap-4 md:gap-1 text-center">
                                                <p className="text-lg font-black leading-none">{resource.downloads > 1000 ? (resource.downloads / 1000).toFixed(1) + 'k' : resource.downloads}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {['youtube', 'github', 'tool'].includes(resource.type) ? 'Views' : 'Downloads'}
                                                </p>
                                            </div>
                                            <Button
                                                asChild
                                                className="rounded-xl h-11 w-11 md:w-auto md:px-6 shadow-sm group/btn bg-primary hover:bg-primary/90 transition-all cursor-pointer"
                                            >
                                                <a href={resource.url || '#'} target="_blank" rel="noopener noreferrer">
                                                    {['github', 'youtube', 'tool', 'ieee', 'research_paper'].includes(resource.type) ? (
                                                        <ExternalLink className="h-5 w-5 md:mr-2 group-hover/btn:scale-110 transition-transform" />
                                                    ) : (
                                                        <Download className="h-5 w-5 md:mr-2 group-hover/btn:translate-y-0.5 transition-transform" />
                                                    )}
                                                    <span className="hidden md:inline">
                                                        {resource.type === 'github' ? 'View Repo' :
                                                            resource.type === 'youtube' ? 'Watch' :
                                                                resource.type === 'tool' ? 'Open Tool' : 'Access'}
                                                    </span>
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                                <div className="bg-muted p-6 rounded-full">
                                    <Search className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">No resources found</h3>
                                    <p className="text-muted-foreground">Try adjusting your filters or search keywords.</p>
                                </div>
                                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDiscipline('All'); }}>Clear All Filters</Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
