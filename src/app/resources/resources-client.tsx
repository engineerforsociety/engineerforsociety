'use client';

import { createClient } from '@/lib/supabase/client';

import { useState, useMemo, useTransition, useEffect } from 'react';
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
    Globe,
    TrendingUp,
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
    const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rated' | 'oldest'>('popular');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Search Suggestions State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const supabase = createClient();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // Show 12 resources per page

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
        setSortBy('popular');
        setCurrentPage(1); // Reset to first page
        updateURL('', 'All', 'All');
    };

    // Client-side filtering and sorting
    const filteredResources = useMemo(() => {
        let filtered = initialResources.filter(resource => {
            const matchesSearch = !searchQuery ||
                resource.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
            const matchesDiscipline = selectedDiscipline === 'All' || resource.discipline === selectedDiscipline;

            return matchesSearch && matchesCategory && matchesDiscipline;
        });

        // Sorting Logic
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return (b.view_count || 0) - (a.view_count || 0);
                case 'recent':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'rated':
                    return (b.upvote_count || 0) - (a.upvote_count || 0);
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                default:
                    return 0;
            }
        });

        // Reset to first page when filters change (but not necessarily just for sort)
        // Ideally we reset page on filter change, but maybe keep page on sort? 
        // For simplicity, reset page on any large list change makes sense, but resetting on sort is common too.
        // Actually, if simply sorting, user might want to stay on page if paginated? No, usually sort resets to page 1.

        return filtered;
    }, [initialResources, searchQuery, selectedCategory, selectedDiscipline, sortBy]);

    // Reset page when filters/sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedDiscipline, sortBy]);

    // Paginated resources
    const paginatedResources = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredResources.slice(startIndex, endIndex);
    }, [filteredResources, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredResources.length);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of results
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

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

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .rpc('get_search_suggestions', { search_term: query, suggestion_limit: 5 });

            if (error) {
                console.error('Error fetching suggestions:', error);
                return;
            }

            setSuggestions(data || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        fetchSuggestions(query);
        // Debounce URL update for better performance could be added here
        if (query === '') {
            updateURL('', selectedCategory, selectedDiscipline);
        }
    };

    const handleSearchSelect = (suggestion: string) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        updateURL(suggestion, selectedCategory, selectedDiscipline);
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
        <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-blue-500/30">
            <ResourceUploadModal
                isOpen={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onSuccess={() => router.refresh()}
            />

            {/* Premium Hero Section with Mesh Gradient */}
            <div className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="container mx-auto px-4 relative z-10 max-w-screen-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="space-y-8 flex-1">
                            <Badge className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-black uppercase tracking-widest">
                                Open Knowledge Ecosystem
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.9]">
                                Engineering <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500">Excellence</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">
                                Access a curated selection of the finest engineering resources, tools, and research papers dedicated to solving complex problems for society.
                            </p>

                            <div className="flex flex-wrap gap-8">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">5k+</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resources</span>
                                </div>
                                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">12+</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Disciplines</span>
                                </div>
                                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Free Access</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex flex-col gap-4 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
                                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg mb-2">
                                    <Plus className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white">Contribute Knowledge</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">Help grow the ecosystem by sharing verified engineering resources.</p>
                                <Button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all font-bold rounded-xl h-12"
                                >
                                    Share a Resource
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium DMCA Banner */}
            <div className="py-4 border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 max-w-screen-2xl">
                    <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <span className="font-black uppercase tracking-tighter text-slate-900 dark:text-white">Legal Verification:</span>
                        <span className="font-medium text-slate-500 italic">All content is strictly peer-verified and linked to original publishers.</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-screen-2xl">
                <div className="flex flex-col gap-8">
                    {/* 1. Mega Dropdown Filter System (High Impact & "Boro") */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* A. Active Filters & Reset Summary */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-28 w-full rounded-2xl border-2 flex flex-col items-start justify-center px-6 gap-3 transition-all duration-300 group relative overflow-hidden",
                                        (selectedCategory !== 'All' || selectedDiscipline !== 'All' || searchQuery)
                                            ? "bg-blue-50/50 dark:bg-blue-950/10 border-blue-500/50 dark:border-blue-500/50"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                                            (selectedCategory !== 'All' || selectedDiscipline !== 'All' || searchQuery)
                                                ? "bg-blue-600 text-white scale-110"
                                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
                                        )}>
                                            <Filter className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                Active Filters
                                            </span>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white truncate w-full text-left">
                                                {(selectedCategory !== 'All' || selectedDiscipline !== 'All' || searchQuery) ? 'Custom View' : 'Default View'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Bar */}
                                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full bg-blue-500 transition-all duration-500", (selectedCategory !== 'All' || selectedDiscipline !== 'All' || searchQuery) ? "w-full" : "w-[5%]")} />
                                    </div>

                                    <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-400 transition-colors">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[340px] p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 overflow-hidden" align="start">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Selection</span>
                                    {(selectedCategory !== 'All' || selectedDiscipline !== 'All' || searchQuery) && (
                                        <Button
                                            onClick={clearAllFilters}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold uppercase tracking-wider"
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                                <div className="p-4 space-y-4 bg-white dark:bg-slate-950">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Department</span>
                                            {selectedDiscipline !== 'All' ? (
                                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 pointer-events-none">
                                                    {selectedDiscipline}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">All Departments</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</span>
                                            {selectedCategory !== 'All' ? (
                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 pointer-events-none">
                                                    {selectedCategory}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">All Categories</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Search Query</span>
                                            {searchQuery ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 pointer-events-none">
                                                    "{searchQuery}"
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">None</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                                            Displaying <strong>&nbsp;{filteredResources.length}&nbsp;</strong> resources
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* B. Engineering Departments */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-28 w-full rounded-2xl border-2 flex flex-col items-start justify-center px-6 gap-3 transition-all duration-300 group relative overflow-hidden",
                                        selectedDiscipline !== 'All'
                                            ? "bg-purple-50/50 dark:bg-purple-950/10 border-purple-500/50 dark:border-purple-500/50"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                                            selectedDiscipline !== 'All'
                                                ? "bg-purple-600 text-white scale-110"
                                                : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white"
                                        )}>
                                            <Binary className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                Department
                                            </span>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white truncate w-full text-left">
                                                {selectedDiscipline === 'All' ? 'All Depts' : selectedDiscipline}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Bar */}
                                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full bg-purple-500 transition-all duration-500", selectedDiscipline !== 'All' ? "w-full" : "w-[25%]")} />
                                    </div>

                                    <div className="absolute top-4 right-4 text-slate-300 group-hover:text-purple-400 transition-colors">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[440px] p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 overflow-hidden" align="start">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    <div className="relative group/input">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-purple-500 transition-colors" />
                                        <Input
                                            placeholder="Find your department..."
                                            className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-purple-500/20"
                                            value={sidebarSearch.departments}
                                            onChange={(e) => setSidebarSearch({ ...sidebarSearch, departments: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <ScrollArea className="h-[320px] bg-white dark:bg-slate-950">
                                    <div className="grid grid-cols-2 gap-2 p-3">
                                        <DropdownMenuItem
                                            onClick={() => handleDisciplineChange('All')}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border h-24 text-center gap-2",
                                                selectedDiscipline === 'All'
                                                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md hover:shadow-purple-500/5"
                                            )}
                                        >
                                            <Hash className={cn("h-6 w-6", selectedDiscipline === 'All' ? "text-purple-600" : "text-slate-400")} />
                                            <span className={cn("font-bold text-xs uppercase tracking-tight", selectedDiscipline === 'All' ? "text-purple-700 dark:text-purple-300" : "text-slate-600 dark:text-slate-400")}>
                                                All Disciplines
                                            </span>
                                        </DropdownMenuItem>
                                        {DISCIPLINES.filter(d => d.name.toLowerCase().includes(sidebarSearch.departments.toLowerCase())).map(d => (
                                            <DropdownMenuItem
                                                key={d.name}
                                                onClick={() => handleDisciplineChange(d.name)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border h-24 text-center gap-2",
                                                    selectedDiscipline === d.name
                                                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md hover:shadow-purple-500/5"
                                                )}
                                            >
                                                <d.icon className={cn("h-6 w-6", selectedDiscipline === d.name ? "text-purple-600" : "text-slate-400 group-hover:text-purple-500")} />
                                                <span className={cn("font-bold text-xs uppercase tracking-tight line-clamp-2", selectedDiscipline === d.name ? "text-purple-700 dark:text-purple-300" : "text-slate-600 dark:text-slate-400")}>
                                                    {d.name}
                                                </span>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* C. Skill Level - Professional Gauge */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-28 w-full rounded-2xl border-2 flex flex-col items-start justify-center px-6 gap-3 transition-all duration-300 group relative overflow-hidden",
                                        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-lg hover:shadow-amber-500/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:bg-amber-600 group-hover:text-white text-amber-600 dark:text-amber-400">
                                            <TrendingUp className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                Difficulty
                                            </span>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white truncate w-full text-left">
                                                All Levels
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Bar */}
                                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full bg-amber-500 transition-all duration-500 w-[75%]")} />
                                    </div>

                                    <div className="absolute top-4 right-4 text-slate-300 group-hover:text-amber-400 transition-colors">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[300px] p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 overflow-hidden" align="start">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Expertise Level</span>
                                </div>
                                <div className="p-2 space-y-1 bg-white dark:bg-slate-950">
                                    {['Beginner', 'Intermediate', 'Advanced'].map((level, idx) => (
                                        <DropdownMenuItem key={level} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 group/level hover:border-amber-200 dark:hover:border-amber-800 border border-transparent transition-all">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{level}</span>
                                                <div className="flex gap-1">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className={cn("h-1 w-5 rounded-full", i <= idx ? (idx === 0 ? "bg-emerald-500" : idx === 1 ? "bg-amber-500" : "bg-rose-500") : "bg-slate-100 dark:bg-slate-800")} />
                                                    ))}
                                                </div>
                                            </div>
                                            {idx === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Easy</span>}
                                            {idx === 1 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Med</span>}
                                            {idx === 2 && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Hard</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* D. Resource Categories - Professional Library */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-28 w-full rounded-2xl border-2 flex flex-col items-start justify-center px-6 gap-3 transition-all duration-300 group relative overflow-hidden",
                                        selectedCategory !== 'All'
                                            ? "bg-cyan-50/50 dark:bg-cyan-950/10 border-cyan-500/50 dark:border-cyan-500/50"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-700 hover:shadow-lg hover:shadow-cyan-500/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                                            selectedCategory !== 'All'
                                                ? "bg-cyan-600 text-white scale-110"
                                                : "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white"
                                        )}>
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                Content Type
                                            </span>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white truncate w-full text-left">
                                                {selectedCategory === 'All' ? 'All Types' : selectedCategory}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Bar */}
                                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full bg-cyan-500 transition-all duration-500", selectedCategory !== 'All' ? "w-full" : "w-[50%]")} />
                                    </div>

                                    <div className="absolute top-4 right-4 text-slate-300 group-hover:text-cyan-400 transition-colors">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[480px] p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 overflow-hidden" align="end">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    <div className="relative group/input">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-cyan-500 transition-colors" />
                                        <Input
                                            placeholder="Find resource type..."
                                            className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-cyan-500/20"
                                            value={sidebarSearch.topics}
                                            onChange={(e) => setSidebarSearch({ ...sidebarSearch, topics: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-1 p-2 bg-white dark:bg-slate-950">
                                    <DropdownMenuItem
                                        onClick={() => handleCategoryChange('All')}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border border-transparent",
                                            selectedCategory === 'All'
                                                ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-800"
                                                : "hover:bg-cyan-50 dark:hover:bg-cyan-950/10 hover:border-cyan-100"
                                        )}
                                    >
                                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", selectedCategory === 'All' ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-400")}>
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn("font-bold text-sm", selectedCategory === 'All' ? "text-cyan-900 dark:text-cyan-100" : "text-slate-700 dark:text-slate-300")}>
                                                All Resource Types
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">Browse complete collection</span>
                                        </div>
                                        {selectedCategory === 'All' && <div className="ml-auto h-2 w-2 rounded-full bg-cyan-500" />}
                                    </DropdownMenuItem>

                                    {CATEGORIES.filter(c => c.name.toLowerCase().includes(sidebarSearch.topics.toLowerCase())).map(c => (
                                        <DropdownMenuItem
                                            key={c.name}
                                            onClick={() => handleCategoryChange(c.name)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border border-transparent",
                                                selectedCategory === c.name
                                                    ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-800"
                                                    : "hover:bg-cyan-50 dark:hover:bg-cyan-950/10 hover:border-cyan-100"
                                            )}
                                        >
                                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", selectedCategory === c.name ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-400")}>
                                                <c.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("font-bold text-sm", selectedCategory === c.name ? "text-cyan-900 dark:text-cyan-100" : "text-slate-700 dark:text-slate-300")}>
                                                    {c.name}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium">{c.description}</span>
                                            </div>
                                            {selectedCategory === c.name && <div className="ml-auto h-2 w-2 rounded-full bg-cyan-500" />}
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* 2. Integrated Search Bar (Full Width) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group/search">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover/search:opacity-100 transition-opacity pointer-events-none" />

                        <div className="relative space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        Search Resources
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Found <strong className="text-blue-600 dark:text-blue-400">{filteredResources.length}</strong> resources
                                        {(selectedCategory !== 'All' || selectedDiscipline !== 'All' || searchQuery) && (
                                            <span className="ml-1">matching selection</span>
                                        )}
                                    </p>
                                </div>

                                {/* Quick Sort - Integrated in Header */}
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-lg h-9 px-3 gap-2 text-xs font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                <ListFilter className="h-3.5 w-3.5" /> Sort
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                                            <DropdownMenuItem onClick={() => setSortBy('popular')} className={cn("font-medium cursor-pointer text-xs rounded-lg px-2.5 py-2", sortBy === 'popular' && "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400")}>
                                                📈 Most Popular
                                                {sortBy === 'popular' && <span className="ml-auto text-blue-600">✓</span>}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSortBy('recent')} className={cn("font-medium cursor-pointer text-xs rounded-lg px-2.5 py-2", sortBy === 'recent' && "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400")}>
                                                🆕 Recently Added
                                                {sortBy === 'recent' && <span className="ml-auto text-blue-600">✓</span>}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSortBy('rated')} className={cn("font-medium cursor-pointer text-xs rounded-lg px-2.5 py-2", sortBy === 'rated' && "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400")}>
                                                ⭐ Highest Rated
                                                {sortBy === 'rated' && <span className="ml-auto text-blue-600">✓</span>}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSortBy('oldest')} className={cn("font-medium cursor-pointer text-xs rounded-lg px-2.5 py-2", sortBy === 'oldest' && "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400")}>
                                                📅 Oldest First
                                                {sortBy === 'oldest' && <span className="ml-auto text-blue-600">✓</span>}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Compact Search Input */}
                            <div className="relative group max-w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    placeholder="Search by title, topic, or keyword..."
                                    className="pl-10 pr-10 h-11 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearchChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
                                        aria-label="Clear search"
                                    >
                                        <span className="text-[10px] font-bold">✕</span>
                                    </button>
                                )}

                                {/* Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 space-y-0.5">
                                            {suggestions.map((suggestion: any, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSearchSelect(suggestion.suggestion)}
                                                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors group/item"
                                                >
                                                    {suggestion.match_type === 'resource_title' && <FileText className="h-3.5 w-3.5 text-blue-500" />}
                                                    {suggestion.match_type === 'tag' && <Hash className="h-3.5 w-3.5 text-purple-500" />}
                                                    {suggestion.match_type === 'popular_search' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate flex-1 group-hover/item:text-slate-900 dark:group-hover/item:text-white">
                                                        {suggestion.suggestion}
                                                    </span>
                                                    {suggestion.match_type === 'resource_title' && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Resource</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* grid list of resources - Now in 2 columns for a balanced layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {isPending ? (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Updating...</p>
                            </div>
                        ) : paginatedResources.length > 0 ? (
                            paginatedResources.map((resource) => (
                                <Link
                                    key={resource.id}
                                    href={`/resources/${resource.slug}`}
                                    className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative"
                                >
                                    {/* Category Accent Strip */}
                                    <div className={cn(
                                        "absolute top-0 left-0 w-1.5 h-full",
                                        resource.category === 'Knowledge & Research' ? "bg-indigo-500" :
                                            resource.category === 'Code & Tools' ? "bg-emerald-500" : "bg-blue-500"
                                    )} />

                                    <CardContent className="p-0">
                                        <div className="flex flex-row h-full">
                                            {/* Left Icon Panel - More Professional */}
                                            <div className="w-24 sm:w-32 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center p-4 sm:p-0 border-r border-slate-100 dark:border-slate-800">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-lg group-hover:bg-blue-500/10 transition-colors"></div>
                                                    <div className="relative p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-700">
                                                        <ResourceIcon type={resource.resource_type} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Center Content - Optimized for 2-column grid */}
                                            <div className="flex-1 p-5 sm:p-6 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none rounded-md px-2 py-0.5 text-[9px] font-black uppercase">
                                                        {resource.discipline}
                                                    </Badge>
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {resource.resource_type.replace(/_/g, ' ')}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {resource.title}
                                                </h3>

                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                                                    {resource.description}
                                                </p>

                                                <div className="pt-2 flex items-center justify-between text-[10px]">
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold max-w-[150px] truncate">
                                                        <div className="h-5 w-5 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                            <Building2 className="h-3 w-3 text-blue-600" />
                                                        </div>
                                                        {resource.author_org || resource.author_name}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                                                            <ThumbsUp className="h-3 w-3" />
                                                            <span>{resource.upvote_count}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                                                            <Bookmark className="h-3 w-3" />
                                                            <span>{resource.bookmark_count}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full w-fit mx-auto">
                                    <FileSearch className="h-10 w-10 text-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No assets found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto text-sm">We couldn't find any resources matching your search. Try adjusting the filters or search keywords.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={clearAllFilters}
                                    className="rounded-xl font-black border-2 border-slate-200 dark:border-slate-800 text-xs uppercase"
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredResources.length > itemsPerPage && (
                        <div className="mt-8 space-y-6">
                            {/* Pagination Info */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-cyan-50/50 to-blue-50 dark:from-blue-950/30 dark:via-cyan-950/10 dark:to-blue-950/30 border-2 border-blue-200 dark:border-blue-900/50 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                        <Hash className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">
                                            Showing {startItem}-{endItem} of {filteredResources.length}
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 w-9 p-0 rounded-lg border-2 disabled:opacity-50"
                                    >
                                        <ChevronDown className="h-4 w-4 rotate-90" />
                                        <ChevronDown className="h-4 w-4 rotate-90 -ml-2" />
                                    </Button>

                                    <Button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 rounded-lg border-2 font-bold disabled:opacity-50"
                                    >
                                        <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
                                        Previous
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="hidden md:flex items-center gap-1">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    className={cn(
                                                        "h-9 w-9 p-0 rounded-lg font-bold border-2",
                                                        currentPage === pageNum
                                                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-600 shadow-lg"
                                                            : "border-slate-200 dark:border-slate-700"
                                                    )}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 rounded-lg border-2 font-bold disabled:opacity-50"
                                    >
                                        Next
                                        <ChevronDown className="h-4 w-4 ml-1 -rotate-90" />
                                    </Button>

                                    <Button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="sm"
                                        className="h-9 w-9 p-0 rounded-lg border-2 disabled:opacity-50"
                                    >
                                        <ChevronDown className="h-4 w-4 -rotate-90" />
                                        <ChevronDown className="h-4 w-4 -rotate-90 -ml-2" />
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Jump */}
                            <div className="flex items-center justify-center gap-3 text-sm">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Jump to page:</span>
                                <select
                                    value={currentPage}
                                    onChange={(e) => handlePageChange(Number(e.target.value))}
                                    className="px-3 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Page {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
