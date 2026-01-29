'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Upload, MapPin, Link as LinkIcon, Globe, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CreateSummitModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId?: string;
    onSuccess?: () => void;
}

export function CreateSummitModal({ isOpen, onOpenChange, currentUserId, onSuccess }: CreateSummitModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState('basic');

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        brief: '',
        type: 'online', // online, offline, hybrid
        category: 'conference',
        isExternal: false,
        externalOrganizer: '',
        externalUrl: '',
        proficiency: 'all', // beginner, intermediate, expert, all
        disciplines: [] as string[],

        // Dates
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        startTime: '09:00',
        endTime: '17:00',

        // Location
        venueName: '',
        venueAddress: '',
        virtualLink: '',

        // Research / CFP
        hasCfp: false,
        cfpDeadline: undefined as Date | undefined,
        cfpLink: '',

        // Logistics
        capacity: '',
        isPaid: false,
        price: '',
        coverImage: ''
    });



    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                brief: '',
                type: 'online',
                category: 'conference',
                isExternal: false,
                externalOrganizer: '',
                externalUrl: '',
                proficiency: 'all',
                disciplines: [],
                startDate: undefined,
                endDate: undefined,
                startTime: '09:00',
                endTime: '17:00',
                venueName: '',
                venueAddress: '',
                virtualLink: '',
                hasCfp: false,
                cfpDeadline: undefined,
                cfpLink: '',
                capacity: '',
                isPaid: false,
                price: '',
                coverImage: ''
            });
            setActiveTab('basic');
        }
    }, [isOpen]);

    const handleDisciplineToggle = (value: string) => {
        setFormData(prev => {
            const exists = prev.disciplines.includes(value);
            if (exists) return { ...prev, disciplines: prev.disciplines.filter(d => d !== value) };
            return { ...prev, disciplines: [...prev.disciplines, value] };
        });
    };

    const handleSubmit = async () => {
        if (!currentUserId) return;
        if (!formData.title || !formData.startDate || !formData.endDate) {
            toast({ title: "Missing Information", description: "Please fill in all required fields marked with *", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Construct timestamps
            const startDateTime = new Date(formData.startDate);
            const [startH, startM] = formData.startTime.split(':');
            startDateTime.setHours(parseInt(startH), parseInt(startM));

            const endDateTime = new Date(formData.endDate);
            const [endH, endM] = formData.endTime.split(':');
            endDateTime.setHours(parseInt(endH), parseInt(endM));

            const { error } = await supabase.from('professional_engagements').insert({
                organizer_id: currentUserId,
                engagement_title: formData.title,
                engagement_brief: formData.brief,
                engagement_type: formData.type,
                engagement_category: formData.category,

                is_external_event: formData.isExternal,
                external_organizer_name: formData.isExternal ? formData.externalOrganizer : null,
                external_url: formData.isExternal ? formData.externalUrl : null,

                target_disciplines: formData.disciplines,
                proficiency_level: formData.proficiency,

                commencement_time: startDateTime.toISOString(),
                conclusion_time: endDateTime.toISOString(),

                venue_name: formData.type !== 'online' ? formData.venueName : null,
                venue_address: formData.type !== 'online' ? formData.venueAddress : null,
                virtual_endpoint_url: ['online', 'hybrid'].includes(formData.type) ? formData.virtualLink : null,

                has_cfp: formData.hasCfp,
                cfp_deadline: formData.hasCfp && formData.cfpDeadline ? formData.cfpDeadline.toISOString() : null,
                cfp_submission_url: formData.hasCfp ? formData.cfpLink : null,

                delegate_capacity: formData.capacity ? parseInt(formData.capacity) : null,
                is_premium_access: formData.isPaid,
                access_fee: formData.isPaid && formData.price ? parseFloat(formData.price) : 0,
                branding_image_url: formData.coverImage,

                engagement_status: 'published' // Auto-publish for demo; in real app maybe 'draft'
            });

            if (error) throw error;

            toast({ title: "Success", description: "Summit initialized successfully." });
            onSuccess?.();
            onOpenChange(false);
            // Reset form (optional, or rely on unmount)
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message || "Failed to create summit.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-[#F8F9FA] dark:bg-[#0B0E14]">
                <DialogHeader className="p-6 pb-2 border-b bg-white dark:bg-[#161B22] sticky top-0 z-10">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Globe className="h-5 w-5 text-teal-500" />
                        Initialize Engagement
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="basic">Overview</TabsTrigger>
                            <TabsTrigger value="logistics">Logistics</TabsTrigger>
                            <TabsTrigger value="research">Research & CFP</TabsTrigger>
                        </TabsList>

                        {/* BASIC INFO */}
                        <TabsContent value="basic" className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold">Summit Title *</Label>
                                <Input
                                    placeholder="e.g. Global Infrastructure Symposium 2025"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="font-bold text-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Category</Label>
                                    <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="conference">Conference</SelectItem>
                                            <SelectItem value="symposium">Symposium</SelectItem>
                                            <SelectItem value="workshop">Workshop</SelectItem>
                                            <SelectItem value="webinar">Webinar</SelectItem>
                                            <SelectItem value="technical_meetup">Technical Meetup</SelectItem>
                                            <SelectItem value="hackathon">Hackathon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Format</Label>
                                    <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="online">Virtual (Online)</SelectItem>
                                            <SelectItem value="offline">Physical (Offline)</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Executive Brief</Label>
                                <Textarea
                                    placeholder="Describe the objective and scope of this engagement..."
                                    value={formData.brief}
                                    onChange={e => setFormData({ ...formData, brief: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center gap-2 border p-3 rounded-lg bg-white dark:bg-black/20">
                                <Switch
                                    checked={formData.isExternal}
                                    onCheckedChange={c => setFormData({ ...formData, isExternal: c })}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold">External Engagement?</p>
                                    <p className="text-xs text-muted-foreground">Enable if this is hosted by a third-party (e.g. IEEE, ASME) and you are listing it.</p>
                                </div>
                            </div>

                            {formData.isExternal && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label>Organizer Name</Label>
                                        <Input placeholder="e.g. IEEE Power Society" value={formData.externalOrganizer} onChange={e => setFormData({ ...formData, externalOrganizer: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Official URL</Label>
                                        <Input placeholder="https://..." value={formData.externalUrl} onChange={e => setFormData({ ...formData, externalUrl: e.target.value })} />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* LOGISTICS */}
                        <TabsContent value="logistics" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Start Date *</Label>
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 border-slate-200 dark:border-slate-800", !formData.startDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.startDate ? format(formData.startDate, "PPP") : <span>Select Date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.startDate}
                                                onSelect={d => setFormData({ ...formData, startDate: d })}
                                                initialFocus
                                                className="rounded-xl border shadow-2xl bg-white dark:bg-[#0F172A] [&_thead]:hidden"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">End Date *</Label>
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 border-slate-200 dark:border-slate-800", !formData.endDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.endDate ? format(formData.endDate, "PPP") : <span>Select Date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.endDate}
                                                onSelect={d => setFormData({ ...formData, endDate: d })}
                                                initialFocus
                                                className="rounded-xl border shadow-2xl bg-white dark:bg-[#0F172A] [&_thead]:hidden"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {(formData.type === 'offline' || formData.type === 'hybrid') && (
                                <div className="space-y-2 animate-in fade-in">
                                    <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Venue Details</Label>
                                    <Input placeholder="Venue Name (e.g. Convention Center)" value={formData.venueName} onChange={e => setFormData({ ...formData, venueName: e.target.value })} className="mb-2" />
                                    <Input placeholder="Full Address" value={formData.venueAddress} onChange={e => setFormData({ ...formData, venueAddress: e.target.value })} />
                                </div>
                            )}

                            {(formData.type === 'online' || formData.type === 'hybrid') && (
                                <div className="space-y-2 animate-in fade-in">
                                    <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Virtual Link</Label>
                                    <Input placeholder="Meeting URL (Zoom/Teams)" value={formData.virtualLink} onChange={e => setFormData({ ...formData, virtualLink: e.target.value })} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Target Disciplines</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['CSE', 'EEE', 'Civil', 'Mechanical', 'Architecture'].map(d => (
                                        <div
                                            key={d}
                                            onClick={() => handleDisciplineToggle(d)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold border cursor-pointer select-none transition-colors",
                                                formData.disciplines.includes(d) ? "bg-teal-500 text-white border-teal-500" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            )}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* RESEARCH */}
                        <TabsContent value="research" className="space-y-4">
                            <div className="flex items-center gap-2 border p-4 rounded-lg bg-teal-500/5 border-teal-500/20">
                                <Switch
                                    checked={formData.hasCfp}
                                    onCheckedChange={c => setFormData({ ...formData, hasCfp: c })}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-teal-900 dark:text-teal-400">Enable Call for Papers (CFP)</p>
                                    <p className="text-xs text-muted-foreground">If active, researchers will see deadline trackers.</p>
                                </div>
                            </div>

                            {formData.hasCfp && (
                                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Submission Deadline</Label>
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 border-slate-200 dark:border-slate-800", !formData.cfpDeadline && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formData.cfpDeadline ? format(formData.cfpDeadline, "PPP") : <span>Select Date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.cfpDeadline}
                                                    onSelect={d => setFormData({ ...formData, cfpDeadline: d })}
                                                    initialFocus
                                                    className="rounded-xl border shadow-2xl bg-white dark:bg-[#0F172A] [&_thead]:hidden"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Submission Portal / Guidelines URL</Label>
                                        <Input placeholder="https://..." value={formData.cfpLink} onChange={e => setFormData({ ...formData, cfpLink: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 pt-4 border-t">
                                <Label>Branding Image URL</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="https://..." value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} />
                                    <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="p-6 border-t bg-white dark:bg-[#161B22] flex justify-end gap-3 sticky bottom-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-black font-bold px-8">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Launch'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
