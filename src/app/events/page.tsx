'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Video,
  Users,
  Search,
  BookOpen,
  Trophy,
  Heart,
  Briefcase,
  Globe,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  CalendarDays,
  Download,
  Share2,
  Bookmark,
  ChevronRight,
  Monitor,
  Building2,
  Award,
  FileText,
  Timer,
  ExternalLink,
  GraduationCap,
  History,
  AlertCircle,
  Network
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { CreateSummitModal } from '@/app/components/create-summit-modal';
import { createClient } from '@/lib/supabase/client';

// --- DATA STRUCTURE MAPPED TO NEW SQL SCHEMA ---

// ENGAGEMENTS_DATA removed in favor of DB fetch

const PROCEEDINGS_INDEX = [
  { year: 2024, title: "Hydraulic Systems & Logic", volume: "Vol. 12" },
  { year: 2024, title: "Hardware-Software Co-Design", volume: "Vol. 11" },
  { year: 2023, title: "Logistics Optimization", volume: "Vol. 09" },
];

export default function SummitsPage() {
  const [viewMode, setViewMode] = useState<'summit' | 'normal'>('summit'); // New State
  const [activeTab, setActiveTab] = useState('learning'); // Simplified tabs logic if needed, or keep existing but filter available tabs based on ViewMode
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [engagements, setEngagements] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    const fetchEngagements = async () => {
      const { data, error } = await supabase
        .from('professional_engagements')
        .select('*')
        .order('commencement_time', { ascending: true });
      if (data) setEngagements(data);
    };
    getUser();
    fetchEngagements();
  }, [supabase]);

  // Logic to filter based on ViewMode
  const filteredEngagements = useMemo(() => {
    return engagements.filter(item => {
      // 1. Filter by View Mode
      const isSummit = ['conference', 'symposium'].includes(item.engagement_category);
      if (viewMode === 'summit' && !isSummit) return false;
      if (viewMode === 'normal' && isSummit) return false;

      // 2. Filter by Active Tab (if relevant, or just show all for that view)
      // We can adapt tabs dynamically, but for now let's keep it simple:
      // If viewMode is 'summit', we might ignore tabs or only show 'academic'.
      // If 'normal', we show 'learning' and 'networking'.
      // For simplicity, let's just use Search and ViewMode mostly.

      const matchesSearch = item.engagement_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.engagement_brief.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [viewMode, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0E14] pb-24">
      {/* Premium Summit Header */}
      <div className="relative h-[340px] bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <Image
          src={viewMode === 'summit'
            ? "https://images.unsplash.com/photo-1475721027785-f74dea327912?q=80&w=2070"
            : "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070"}
          alt="Banner"
          fill
          className="object-cover opacity-60 grayscale-[0.5] contrast-125 transition-all duration-1000"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-8 h-full flex flex-col justify-center animate-in fade-in slide-in-from-left-8 duration-1000">
          <Badge className="w-fit mb-6 bg-teal-500 hover:bg-teal-600 text-black font-black px-4 py-1.5 rounded-full tracking-widest text-[10px]">
            {viewMode === 'summit' ? 'ELITE ENGAGEMENTS' : 'COMMUNITY EVENTS'}
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 leading-none uppercase">
            {viewMode === 'summit' ? (
              <>Global <span className="text-teal-400 block md:inline">Summits</span></>
            ) : (
              <>Local <span className="text-teal-400 block md:inline">Events</span></>
            )}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-bold leading-relaxed border-l-4 border-teal-500 pl-6 py-2">
            {viewMode === 'summit'
              ? "The nexus of engineering innovation, peer-reviewed research, and professional coordination."
              : "Seminars, Workshops, and Meetups to grow your skills and network daily."}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="h-14 px-10 rounded-2xl bg-teal-500 hover:bg-teal-400 text-black font-black text-base shadow-2xl shadow-teal-500/20"
              onClick={() => setIsCreateModalOpen(true)}
            >
              {viewMode === 'summit' ? 'INITIALIZE ENGAGEMENT' : 'CREATE EVENT'}
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold backdrop-blur-md">
              REPOSITORY ARCHIVE
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-30">
        {/* VIEW MODE TOGGLE */}
        <div className="bg-white dark:bg-[#161B22] p-2 rounded-full shadow-2xl mb-8 flex items-center w-fit mx-auto md:mx-0">
          <button
            onClick={() => setViewMode('summit')}
            className={cn(
              "px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all",
              viewMode === 'summit' ? "bg-[#1F3A5F] text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Summits
          </button>
          <button
            onClick={() => setViewMode('normal')}
            className={cn(
              "px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all",
              viewMode === 'normal' ? "bg-teal-500 text-black shadow-lg" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Normal Events
          </button>
        </div>

        {/* Navigation - Engineering Terminology */}
        <Card className="border-none shadow-2xl bg-white dark:bg-[#161B22] p-2 rounded-[2.5rem] mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-1 md:grid-cols-3 h-auto gap-3 bg-transparent p-3">
              <TabsTrigger value="learning" className="rounded-3xl py-5 flex flex-col gap-2 data-[state=active]:bg-[#1F3A5F] data-[state=active]:text-white transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <Monitor className="h-6 w-6 text-teal-400" />
                  <span className="font-black text-lg">Technical Symposiums</span>
                </div>
                <p className="text-[10px] opacity-70 font-black uppercase tracking-[0.2em]">Workshops • Tool Certifications</p>
              </TabsTrigger>
              <TabsTrigger value="networking" className="rounded-3xl py-5 flex flex-col gap-2 data-[state=active]:bg-[#1F3A5F] data-[state=active]:text-white transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <Network className="h-6 w-6 text-teal-400" />
                  <span className="font-black text-lg">Professional Circles</span>
                </div>
                <p className="text-[10px] opacity-70 font-black uppercase tracking-[0.2em]">Coordination • Industry Tours</p>
              </TabsTrigger>
              <TabsTrigger value="academic" className="rounded-3xl py-5 flex flex-col gap-2 data-[state=active]:bg-[#1F3A5F] data-[state=active]:text-white transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-teal-400" />
                  <span className="font-black text-lg">Research Summits</span>
                </div>
                <p className="text-[10px] opacity-70 font-black uppercase tracking-[0.2em]">Peer Review • Global Conferences</p>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-4">
              <div className="space-y-1">
                <h3 className="text-3xl font-black italic tracking-tighter">
                  {viewMode === 'summit' ? 'Active Summits' : 'Upcoming Community Events'}
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  Showing {filteredEngagements.length} results
                </p>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-teal-500 transition-colors" />
                <Input
                  placeholder="Search Summits..."
                  className="pl-12 h-12 w-[180px] md:w-[260px] bg-white dark:bg-[#161B22] border-none shadow-sm rounded-xl font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredEngagements.length > 0 ? (
              <div className="space-y-6">
                {filteredEngagements.map((item, idx) => (
                  <EngagementCard key={item.id} data={item} idx={idx} />
                ))}
              </div>
            ) : (
              <Card className="p-20 text-center bg-muted/20 border-2 border-dashed rounded-[3rem] space-y-4">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h4 className="text-2xl font-black">No Active Engagements</h4>
                <p className="text-sm font-medium text-muted-foreground">Try adjusting your refine parameters or check the archive.</p>
              </Card>
            )}
          </div>

          {/* Premium Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {activeTab === 'academic' && (
              <>
                {/* CFP Tracker */}
                <Card className="bg-[#0F172A] text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-700" />
                  <div className="flex items-center gap-3 mb-8">
                    <Timer className="h-7 w-7 text-teal-400" />
                    <h4 className="text-2xl font-black tracking-tight">Paper Deadlines</h4>
                  </div>
                  <div className="space-y-6">
                    {engagements.filter(e => e.cfp_deadline).map((e: any) => (
                      <div key={e.id} className="relative pl-6 border-l-2 border-teal-500/30 hover:border-teal-500 transition-colors cursor-pointer">
                        <p className="text-xs font-black text-teal-400 uppercase tracking-[0.15em] mb-1">{e.engagement_title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-300">CFP Deadline</span>
                          <Badge className="bg-red-500 text-white font-black text-[10px]">
                            {differenceInDays(new Date(e.cfp_deadline!), new Date())}D REMAINING
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="text-teal-400 mt-8 font-black p-0 hover:text-white transition-colors">
                    VIEW FULL CFP CALENDAR <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Card>

                {/* Proceedings */}
                <Card className="p-8 rounded-[3rem] shadow-xl border-none space-y-6">
                  <h4 className="text-xl font-black flex items-center gap-2">
                    <History className="h-6 w-6 text-muted-foreground" />
                    Summit Records
                  </h4>
                  <div className="space-y-4">
                    {PROCEEDINGS_INDEX.map(p => (
                      <div key={p.title} className="p-4 rounded-3xl border border-muted hover:border-teal-500 hover:bg-teal-500/5 transition-all group cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded uppercase">{p.year}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">{p.volume}</span>
                        </div>
                        <p className="text-sm font-black group-hover:text-teal-600 transition-colors uppercase">{p.title}</p>
                        <Button variant="link" className="p-0 h-auto text-[10px] font-black text-muted-foreground group-hover:text-teal-500">DOWNLOAD PDF</Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* focal Section */}
            <Card className="bg-gradient-to-br from-teal-500 to-teal-700 p-8 rounded-[3rem] shadow-2xl text-black relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <h4 className="text-2xl font-black mb-4 leading-tight">Can&apos;t find a relevant Summit?</h4>
              <p className="text-sm font-bold mb-8 opacity-80 leading-relaxed">
                Initialize your own engagement for your niche industry. Lead technical circles or organize tool symposiums.
              </p>
              <Button
                className="w-full h-14 bg-black text-white hover:bg-zinc-800 font-black rounded-2xl text-base shadow-xl"
                onClick={() => setIsCreateModalOpen(true)}
              >
                HOST A SUMMIT
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <CreateSummitModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}


function EngagementCard({ data, idx }: { data: any, idx: number }) {
  return (
    <Link href={`/events/${data.id}`} className="block">
      <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white dark:bg-[#161B22] rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
        <div className="flex flex-col md:flex-row min-h-[260px]">
          {/* Visual Brand Section */}
          <div className="relative w-full md:w-[320px] h-[200px] md:h-auto overflow-hidden">
            <Image
              src={data.branding_image_url}
              alt={data.engagement_title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <Badge className={cn(
                "font-black tracking-[0.2em] text-[9px] px-3 py-1.5 backdrop-blur-md border-none rounded-lg",
                data.engagement_type === 'online' ? "bg-blue-600/90 text-white" : "bg-teal-400 text-black"
              )}>
                {data.engagement_type.toUpperCase()}
              </Badge>
            </div>
            {data.certification_eligible && (
              <div className="absolute top-6 right-6">
                <div className="bg-yellow-400 text-black h-10 w-10 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-400/50" title="Accredited Certification">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>

          {/* Intelligence Section */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black text-[11px] uppercase tracking-widest">
                <Calendar className="h-4 w-4" />
                {format(new Date(data.commencement_time), 'MMM dd, yyyy')}
              </div>
              <div className="h-4 w-px bg-muted opacity-50" />
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-widest">
                <Clock className="h-4 w-4" />
                {format(new Date(data.commencement_time), 'h:mm a')}
              </div>
            </div>

            <h3 className="text-2xl font-black mb-3 leading-[1.1] tracking-tighter uppercase group-hover:text-teal-600 transition-colors">
              {data.engagement_title}
            </h3>

            <p className="text-sm text-muted-foreground font-bold leading-relaxed line-clamp-2 italic mb-6">
              &quot;{data.engagement_brief}&quot;
            </p>

            <Separator className="mb-6 opacity-30" />

            <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                {data.target_disciplines.map((d: string) => (
                  <Badge key={d} variant="outline" className="px-3 py-1 font-black text-[9px] border-none bg-muted/50 rounded-lg text-muted-foreground">
                    #{d.toUpperCase()}
                  </Badge>
                ))}
                <Badge className="px-3 py-1 font-black text-[9px] border-none bg-[#1F3A5F]/10 text-[#1F3A5F] dark:text-teal-400 rounded-lg">
                  LVL: {data.proficiency_level.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" className="h-12 w-12 rounded-2xl flex items-center justify-center hover:bg-muted text-muted-foreground">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button className="h-12 px-10 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm shadow-xl shadow-black/10">
                  RSVP NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

