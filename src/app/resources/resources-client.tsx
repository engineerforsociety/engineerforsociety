'use client';

import { useState, useMemo, useTransition } from 'react';
import {
    FileText,
    Github,
    BookOpen,
    Search,
    Filter,
    Plus,
    ShieldCheck,
    Layout,
    Clock,
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
    Code,
    Loader2,
    Mic,
    PencilRuler,
    Calendar,
    Award,
    ThumbsUp,
    Bookmark,
    Building2,
    FileSearch,
    UserCheck,
    Layers,
    ListFilter,
    ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ResourceUploadModal } from './resource-upload-modal';
import { toggleInteraction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

// Types
type ResourceDiscipline = 'General' | 'CSE' | 'Civil' | 'EEE' | 'Textile' | 'Mechanical' | 'Architecture';
type ResourceCategory = 'Knowledge & Research' | 'Code & Tools' | 'Career & Learning';

interface EngineeringResource {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    category: ResourceCategory;
    discipline: ResourceDiscipline;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    author_org?: string;
    external_url: string;
    embed_url?: string;
    upvote_count: number;
    bookmark_count: number;
    view_count: number;
    created_at: string;
    year?: string;
    license?: string;
    skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
    is_premium?: boolean;
    tags: string[];
    slug: string;
}

const ResourceIcon = ({ type }: { type: string }) => {
    const iconClass = "h-8 w-8";
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

const CATEGORIES: { name: ResourceCategory; icon: any; description: string }[] = [
    { name: 'Knowledge & Research', icon: BookOpen, description: 'Papers & Standards' },
    { name: 'Code & Tools', icon: Code, description: 'Repos & Utilities' },
    { name: 'Career & Learning', icon: GraduationCap, description: 'CVs & Tutorials' },
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

interface ResourcesClientProps {
    initialResources: EngineeringResource[];
}

export default function ResourcesClient({ initialResources }: ResourcesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All'>(
        (searchParams.get('category') as ResourceCategory) || 'All'
    );
    const [selectedDiscipline, setSelectedDiscipline] = useState<ResourceDiscipline | 'All'>(
        (searchParams.get('discipline') as ResourceDiscipline) || 'All'
    );
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Sidebar Specific State
    const [expandedSections, setExpandedSections] = useState<string[]>(['departments', 'level', 'topics']);
    const [sidebarSearch, setSidebarSearch] = useState({ departments: '', topics: '' });

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedDiscipline('All');
        updateURL('', 'All', 'All');
    };

    // Client-side filtering for instant feedback
    const filteredResources = useMemo(() => {
        return initialResources.filter(resource => {
            const matchesSearch = !searchQuery ||
                resource.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
            const matchesDiscipline = selectedDiscipline === 'All' || resource.discipline === selectedDiscipline;

            return matchesSearch && matchesCategory && matchesDiscipline;
        });
    }, [initialResources, searchQuery, selectedCategory, selectedDiscipline]);

    const updateURL = (query: string, category: string, discipline: string) => {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (category !== 'All') params.set('category', category);
        if (discipline !== 'All') params.set('discipline', discipline);

        const newURL = params.toString() ? `?${params.toString()}` : '/resources';
        startTransition(() => {
            router.push(newURL, { scroll: false });
        });
    };

    const handleCategoryChange = (category: ResourceCategory | 'All') => {
        setSelectedCategory(category);
        updateURL(searchQuery, category, selectedDiscipline);
    };

    const handleDisciplineChange = (discipline: ResourceDiscipline | 'All') => {
        setSelectedDiscipline(discipline);
        updateURL(searchQuery, selectedCategory, discipline);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        // Debounced URL update happens via useEffect in actual implementation
    };

    const handleInteraction = async (e: React.MouseEvent, id: string, type: 'upvote' | 'bookmark') => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const result = await toggleInteraction(id, type);
            router.refresh(); // Revalidate server data
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

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617]">
            <ResourceUploadModal
                isOpen={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onSuccess={() => router.refresh()}
            />

            {/* Header Hero */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 py-16 max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Open Engineering <span className="text-blue-600">Resources</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl font-medium">
                                Contribute, discover, and preserve specialized engineering knowledge for the global community.
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsUploadModalOpen(true)}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-8 h-14 text-base font-bold transition-all"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Contribute Resource
                        </Button>
                    </div>
                </div>
            </div>

            {/* DMCA Disclaimer Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-900/30 py-3">
                <div className="container mx-auto px-4 max-w-7xl flex items-center justify-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
                    <p className="text-[11px] md:text-xs font-bold text-amber-800 dark:text-amber-400 text-center">
                        <span className="uppercase mr-2 font-black tracking-widest text-[9px] bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded">Disclaimer:</span>
                        All resources are linked to their original sources. Engineer for Society does not claim ownership.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="space-y-6 lg:sticky lg:top-8 h-fit">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Filter className="h-5 w-5" /> Filters
                            </h2>
                            <button
                                onClick={clearAllFilters}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Search Component */}
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search repository..."
                                className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-12 rounded-xl text-sm font-medium focus-visible:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>

                        {/* Departments (Disciplines) */}
                        <Collapsible
                            open={expandedSections.includes('departments')}
                            onOpenChange={() => toggleSection('departments')}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                        >
                            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 px-5 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                                Departments
                                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSections.includes('departments') ? "rotate-180" : "")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Search Departments"
                                            className="h-9 pl-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                            value={sidebarSearch.departments}
                                            onChange={(e) => setSidebarSearch({ ...sidebarSearch, departments: e.target.value })}
                                        />
                                    </div>
                                    <ScrollArea className="h-[250px] pr-2 -mr-1">
                                        <div className="space-y-1">
                                            <div
                                                onClick={() => handleDisciplineChange('All')}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer",
                                                    selectedDiscipline === 'All' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox checked={selectedDiscipline === 'All'} onCheckedChange={() => handleDisciplineChange('All')} className="rounded-md h-4 w-4" />
                                                    All Departments
                                                </div>
                                            </div>
                                            {DISCIPLINES.filter(d => d.name.toLowerCase().includes(sidebarSearch.departments.toLowerCase())).map(d => (
                                                <div
                                                    key={d.name}
                                                    onClick={() => handleDisciplineChange(d.name)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer",
                                                        selectedDiscipline === d.name ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 text-left">
                                                        <Checkbox checked={selectedDiscipline === d.name} onCheckedChange={() => handleDisciplineChange(d.name)} className="rounded-md h-4 w-4" />
                                                        {d.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Level (Skill Level) */}
                        <Collapsible
                            open={expandedSections.includes('level')}
                            onOpenChange={() => toggleSection('level')}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                        >
                            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 px-5 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                                Level
                                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSections.includes('level') ? "rotate-180" : "")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 space-y-1 text-sm font-bold">
                                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                        <div key={level} className="flex items-center justify-between p-2.5 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-3">
                                                <Checkbox className="rounded-md h-4 w-4" />
                                                {level}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Topics (Categories) */}
                        <Collapsible
                            open={expandedSections.includes('topics')}
                            onOpenChange={() => toggleSection('topics')}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                        >
                            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 px-5 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                                Topics
                                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSections.includes('topics') ? "rotate-180" : "")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Search Topics"
                                            className="h-9 pl-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                            value={sidebarSearch.topics}
                                            onChange={(e) => setSidebarSearch({ ...sidebarSearch, topics: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div
                                            onClick={() => handleCategoryChange('All')}
                                            className={cn(
                                                "w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer",
                                                selectedCategory === 'All' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 text-left">
                                                <Checkbox checked={selectedCategory === 'All'} onCheckedChange={() => handleCategoryChange('All')} className="rounded-md h-4 w-4" />
                                                All Categories
                                            </div>
                                        </div>
                                        {CATEGORIES.filter(c => c.name.toLowerCase().includes(sidebarSearch.topics.toLowerCase())).map(c => (
                                            <div
                                                key={c.name}
                                                onClick={() => handleCategoryChange(c.name)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer",
                                                    selectedCategory === c.name ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 text-left">
                                                    <Checkbox checked={selectedCategory === c.name} onCheckedChange={() => handleCategoryChange(c.name)} className="rounded-md h-4 w-4" />
                                                    {c.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">
                        {/* Sort & Results Bar */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                Showing <span className="text-slate-900 dark:text-white">{filteredResources.length}</span> specialized resources
                            </p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-5 gap-2 border-slate-200 dark:border-slate-700">
                                        <ListFilter className="h-4 w-4" /> Sort By
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                    <DropdownMenuItem className="font-medium cursor-pointer">Most Popular</DropdownMenuItem>
                                    <DropdownMenuItem className="font-medium cursor-pointer">Recently Added</DropdownMenuItem>
                                    <DropdownMenuItem className="font-medium cursor-pointer">Highest Rated</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* grid list of resources */}
                        <div className="grid gap-4">
                            {isPending ? (
                                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Updating...</p>
                                </div>
                            ) : filteredResources.length > 0 ? (
                                filteredResources.map((resource) => (
                                    <Link
                                        key={resource.id}
                                        href={`/resources/${resource.slug}`}
                                        className="group block rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                                    >
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row">
                                                {/* Left Icon Panel */}
                                                <div className="sm:w-32 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-6 sm:p-0 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
                                                    <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl shadow-sm transform group-hover:scale-110 transition-transform">
                                                        <ResourceIcon type={resource.resource_type} />
                                                    </div>
                                                </div>

                                                {/* Center Content */}
                                                <div className="flex-1 p-6 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase">
                                                            {resource.discipline}
                                                        </Badge>
                                                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-lg">
                                                            {resource.resource_type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{resource.skill_level}</span>
                                                    </div>

                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">
                                                        {resource.title}
                                                    </h3>

                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                        {resource.description}
                                                    </p>

                                                    <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                            <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                <Building2 className="h-3 w-3" />
                                                            </div>
                                                            {resource.author_org || resource.author_name}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {new Date(resource.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                            <Award className="h-3.5 w-3.5" />
                                                            {resource.license || 'Standard'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Interaction Panel */}
                                                <div className="sm:w-24 bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-6 flex sm:flex-col justify-around sm:justify-center items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800">
                                                    <button
                                                        onClick={(e) => handleInteraction(e, resource.id, 'upvote')}
                                                        className="flex flex-col items-center gap-1 group/vote"
                                                    >
                                                        <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover/vote:bg-blue-600 group-hover/vote:text-white transition-all shadow-sm">
                                                            <ThumbsUp className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{resource.upvote_count}</span>
                                                    </button>

                                                    <button
                                                        onClick={(e) => handleInteraction(e, resource.id, 'bookmark')}
                                                        className="flex flex-col items-center gap-1 group/save"
                                                    >
                                                        <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover/save:bg-amber-500 group-hover/save:text-white transition-all shadow-sm">
                                                            <Bookmark className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{resource.bookmark_count}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-6">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full w-fit mx-auto">
                                        <FileSearch className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No assets found</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any resources matching your search. Try adjusting the filters or search keywords.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={clearAllFilters}
                                        className="rounded-xl font-bold border-slate-200 dark:border-slate-700"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
