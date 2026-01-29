'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, MapPin, Clock, Video, Users, Search, Target, Trophy, Heart, Briefcase,
    Globe, Plus, ArrowRight, Filter, CheckCircle2, CalendarDays, Download, Share2,
    Bookmark, ChevronRight, Monitor, Building2, Award, FileText, Timer, ExternalLink,
    GraduationCap, History, AlertCircle, Network, Cpu, Layers, ShieldCheck, Zap, DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CreateSummitModal } from '@/app/components/create-summit-modal';

// --- Types ---
type Event = any;

interface EventsClientProps {
    initialEvents: Event[];
    initialGrants: any[];
}

export default function EventsClient({ initialEvents, initialGrants }: EventsClientProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // We use initial data passed from server, so no client-side loading state needed initally
    const [events] = useState<Event[]>(initialEvents);
    const [grants] = useState<any[]>(initialGrants);

    // Keyboard support for search focus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for CTRL + L or CMD + L
            if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
                e.preventDefault(); // Prevent browser address bar focus
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredEvents = useMemo(() => {
        if (!events || !Array.isArray(events)) return [];
        return events.filter(event => {
            const matchesSearch = (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTab = activeTab === 'all' || event.category === activeTab;
            return matchesSearch && matchesTab;
        });
    }, [events, searchQuery, activeTab]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0E14] pb-24 font-sans">
            {/* --- Premium Hero Section (Blueprint Style) --- */}
            <div className="relative min-h-[450px] md:h-[550px] bg-[#0F172A] overflow-hidden flex items-center pt-20 pb-12">
                {/* Technical Blueprint Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: `radial-gradient(circle, #334155 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-transparent to-transparent z-0" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full">
                    <div className="animate-in fade-in slide-in-from-left-10 duration-1000">
                        <Badge className="mb-6 bg-teal-500 hover:bg-teal-600 text-black font-black px-4 py-1.5 rounded-lg tracking-widest text-[10px] uppercase">
                            Professional Engineering Coordination
                        </Badge>
                        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[1] uppercase">
                            Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Summits</span> <br /> & Tech Circles
                        </h1>
                        <p className="text-blue-100/70 text-base md:text-xl max-w-2xl font-medium leading-relaxed mb-10 border-l-2 border-teal-500/50 pl-6">
                            Connect with global pioneers, track research deadlines, and earn professional development credits in your specialized discipline.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="h-12 md:h-14 px-6 md:px-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm md:text-base shadow-xl shadow-teal-500/20 transition-all hover:scale-105" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-5 w-5" /> INITIALIZE ENGAGEMENT
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-10 rounded-xl border-white/60 text-white hover:bg-white/20 bg-white/5 font-black backdrop-blur-md text-sm md:text-base tracking-wide transition-all">
                                REPOSITORY ARCHIVE
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="w-full max-w-[1900px] mx-auto px-4 md:px-6 py-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">

                    {/* Left Sidebar - Discovery Menu Style (Narrower) */}
                    <aside className="hidden lg:block lg:col-span-2 space-y-6">
                        <div className="sticky top-24 space-y-6">

                            <div className="px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-4 flex items-center gap-2">
                                    <div className="h-[2px] w-4 bg-teal-500 rounded-full" /> DISCOVERY
                                </h3>

                                <nav className="space-y-1">
                                    {[
                                        { id: 'all', label: 'All Events', icon: <Layers className="h-4 w-4" /> },
                                        { id: 'conference', label: 'Conferences', icon: <Users className="h-4 w-4" /> },
                                        { id: 'workshop', label: 'Workshops', icon: <Cpu className="h-4 w-4" /> },
                                        { id: 'webinar', label: 'Webinars', icon: <Monitor className="h-4 w-4" /> },
                                        { id: 'hackathon', label: 'Hackathons', icon: <Target className="h-4 w-4" /> },
                                        { id: 'bootcamp', label: 'Bootcamps', icon: <GraduationCap className="h-4 w-4" /> },
                                        { id: 'competition', label: 'Competitions', icon: <Trophy className="h-4 w-4" /> },
                                        { id: 'research', label: 'Research', icon: <FileText className="h-4 w-4" /> },
                                        { id: 'networking', label: 'Networking', icon: <Network className="h-4 w-4" /> },
                                        { id: 'meetup', label: 'Meetups', icon: <MapPin className="h-4 w-4" /> }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 group",
                                                activeTab === item.id
                                                    ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 translate-x-1"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <span className={cn(
                                                "transition-transform duration-300 group-hover:scale-110",
                                                activeTab === item.id ? "text-slate-950" : "text-teal-500"
                                            )}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="px-1 space-y-4">
                                <Separator className="opacity-20" />


                                <Card className="bg-teal-500/5 border-teal-500/10 p-4 rounded-2xl border backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="h-3 w-3 text-teal-500" />
                                        <h4 className="text-[9px] font-black uppercase text-teal-600 dark:text-teal-400">PRO TIP</h4>
                                    </div>
                                    <p className="text-[10px] font-bold leading-relaxed text-muted-foreground uppercase opacity-80">
                                        Use <strong>discipline filters</strong> for niche symposiums.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </aside>

                    {/* Main Feed (Massive Center Area) */}
                    <main className="lg:col-span-8 space-y-6">

                        {/* Global Intelligence Search (Moved Here) */}
                        <div className="relative group z-30">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-purple-500/20 to-teal-500/20 rounded-[1.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative flex items-center bg-white dark:bg-[#161B22] rounded-[1.2rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="pl-6 text-muted-foreground">
                                    <Search className="h-5 w-5" />
                                </div>
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Search active deployments, engineering domains, or locations..."
                                    className="border-none shadow-none h-14 bg-transparent font-bold text-sm tracking-wide placeholder:text-muted-foreground/50 focus-visible:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="pr-4 hidden md:block">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 select-none shadow-sm group-focus-within:border-teal-500/30 group-focus-within:bg-teal-500/5 transition-all">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">CTRL</span>
                                        <span className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700"></span>
                                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">L</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-teal-500 decoration-4 underline-offset-8">
                                    Active Deployments
                                </h2>
                            </div>
                            <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase">
                                {(filteredEvents || []).length} READY
                            </Badge>
                        </div>

                        {(filteredEvents || []).length > 0 ? (
                            <div className="space-y-6">
                                {filteredEvents.map((event, idx) => (
                                    <EventCard key={event.id} event={event} idx={idx} />
                                ))}
                            </div>
                        ) : (
                            <Card className="p-20 text-center bg-muted/10 border-2 border-dashed rounded-[3rem] space-y-4">
                                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground/30" />
                                <h4 className="text-xl font-black uppercase text-muted-foreground">No Engagements Found</h4>
                                <p className="text-sm font-bold text-muted-foreground/60 italic">"Be the catalyst. Initialize the first circle in your field."</p>
                            </Card>
                        )}
                    </main>

                    {/* Right Sidebar - Compact Widgets */}
                    <aside className="hidden lg:block lg:col-span-2 space-y-6">
                        {/* 1. Grant Pipeline */}
                        <Card className="bg-[#0F172A] text-white p-5 rounded-[1.5rem] shadow-xl relative overflow-hidden group border-none">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all text-sm" />
                            <h3 className="text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-teal-400">
                                <Trophy className="h-3.5 w-3.5" /> Grants
                            </h3>
                            <div className="space-y-4">
                                {grants.length > 0 ? grants.map((grant: any) => (
                                    <div key={grant.id} className="border-l-2 border-teal-500/30 pl-3 hover:border-teal-500 transition-colors cursor-pointer group/item">
                                        <p className="text-[10px] font-bold group-hover/item:text-teal-400 transition-colors line-clamp-1 leading-tight">{grant.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-teal-500 uppercase">
                                                ${grant.amount ? Number(grant.amount).toLocaleString() : 'VARIES'}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-bold text-gray-500 italic uppercase">No active grants found.</p>
                                )}
                            </div>
                            <Button variant="link" className="text-white/50 p-0 h-auto mt-4 font-black text-[9px] uppercase tracking-widest hover:text-white transition-colors">
                                View All <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </Card>

                        {/* 2. Global Impact */}
                        <Card className="p-5 rounded-[1.5rem] bg-gradient-to-br from-teal-500 to-emerald-600 text-slate-950 shadow-xl border-none">
                            <h4 className="text-xs font-black mb-2 flex items-center gap-2 uppercase tracking-widest">
                                <Globe className="h-3.5 w-3.5" /> Impact
                            </h4>
                            <p className="text-[10px] font-bold opacity-80 mb-4 leading-relaxed uppercase">
                                1,200+ Global Engineers.
                            </p>
                            <Button className="w-full h-8 bg-slate-950 text-white hover:bg-slate-900 rounded-lg font-black text-[9px] uppercase shadow-lg border-none">
                                Map View
                            </Button>
                        </Card>
                    </aside>

                </div>
            </div>

            {/* Modal for Creating Summit */}
            <CreateSummitModal
                isOpen={isCreateModalOpen}
                onOpenChange={(open) => {
                    setIsCreateModalOpen(open);
                    if (!open) {
                        // Force cleanup of Radix UI scroll locks/pointer events
                        document.body.style.pointerEvents = "auto";
                        document.body.style.overflow = "auto";

                        // "Auto Refresh" as requested to prevent any freeze/stuck state
                        setTimeout(() => {
                            window.location.reload();
                        }, 200);
                    }
                }}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
}

function EventCard({ event, idx }: { event: any, idx: number }) {
    const isCfpOpen = event.cfp_deadline && new Date(event.cfp_deadline) > new Date();

    return (
        <Link href={`/events/${event.id}`} className="block group">
            <Card className="border-none shadow-md hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-[#161B22] animate-in fade-in slide-in-from-bottom-5" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex flex-col md:flex-row min-h-[240px]">

                    {/* Visual Side */}
                    <div className="relative w-full md:w-[280px] h-[180px] md:h-auto overflow-hidden">
                        <Image
                            src={event.cover_image_url || `https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000`}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-60" />

                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <Badge className={cn(
                                "font-black tracking-widest text-[9px] px-3 py-1.5 backdrop-blur-md border-none rounded-lg uppercase",
                                event.event_type === 'online' ? "bg-blue-600/90 text-white" : "bg-teal-400 text-black"
                            )}>
                                {event.event_type}
                            </Badge>
                            {event.is_paid && (
                                <Badge className="bg-amber-500 text-black font-black text-[9px] px-3 py-1.5 rounded-lg border-none uppercase">
                                    PREMIUM ACCESS
                                </Badge>
                            )}
                        </div>

                        {event.has_certificate && (
                            <div className="absolute bottom-4 left-4">
                                <div className="bg-white/90 dark:bg-black/90 p-2 rounded-lg backdrop-blur-md shadow-lg flex items-center gap-2">
                                    <Award className="h-4 w-4 text-teal-500" />
                                    <span className="text-[9px] font-black uppercase tracking-tight">Accredited Cert</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Side */}
                    <div className="flex-1 p-8 flex flex-col">
                        <div className="flex flex-wrap items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                                <Calendar className="h-3.5 w-3.5" /> {format(new Date(event.start_time), 'MMM dd, yyyy')}
                            </div>
                            <span className="opacity-20">|</span>
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" /> {format(new Date(event.start_time), 'h:mm a')}
                            </div>
                            <span className="opacity-20">|</span>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" /> {event.location_name || 'Virtual'}
                            </div>
                        </div>

                        <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase group-hover:text-teal-600 transition-colors leading-none">
                            {event.title}
                        </h3>

                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground font-bold leading-relaxed line-clamp-2 italic opacity-80">
                                "{event.description || 'No specialized description provided for this session.'}"
                            </p>
                        </div>

                        <div className="mt-auto pt-6 border-t flex flex-wrap items-center justify-between gap-6">
                            <div className="flex flex-wrap gap-2">
                                {(event.discipline || []).map((d: string) => (
                                    <Badge key={d} variant="outline" className="px-3 py-1 font-black text-[9px] border-none bg-muted px-2 rounded-lg text-muted-foreground group-hover:bg-teal-500/10 group-hover:text-teal-600 transition-colors">
                                        #{d.toUpperCase()}
                                    </Badge>
                                ))}
                                <Badge className="bg-[#1F3A5F]/10 text-[#1F3A5F] dark:bg-blue-900/40 dark:text-blue-200 font-black text-[9px] px-3 py-1 rounded-lg border-none uppercase">
                                    LVL: {event.skill_level}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-teal-500/10 hover:text-teal-600">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                                <Button className="h-11 px-8 rounded-xl bg-slate-950 text-white hover:bg-slate-900 font-black text-[11px] uppercase shadow-lg group-hover:bg-teal-600 transition-colors">
                                    RSVP STATUS
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* CFP Tracker Side (Desktop Only) */}
                    {isCfpOpen && (
                        <div className="hidden xl:flex w-24 flex-col items-center justify-center border-l bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors p-4">
                            <Zap className="h-5 w-5 text-teal-600 animate-pulse mb-2" />
                            <span className="text-[9px] font-black uppercase text-center text-teal-700 dark:text-teal-400">CFP <br /> Open</span>
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    );
}
