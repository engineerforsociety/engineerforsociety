'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    Calendar,
    MapPin,
    Link as LinkIcon,
    Share2,
    MoreHorizontal,
    Users,
    Clock,
    CheckCircle2,
    Building2,
    ArrowLeft,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function EventDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [isAttending, setIsAttending] = useState(false);
    const [organizer, setOrganizer] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!id) return;
            setLoading(true);

            // 1. Fetch Event
            const { data: eventData, error } = await supabase
                .from('professional_engagements')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching event:', error);
                toast({ title: "Error", description: "Event not found.", variant: "destructive" });
                return;
            }
            setEvent(eventData);

            // 2. Fetch Organizer Profile
            if (eventData.organizer_id) {
                const { data: orgData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', eventData.organizer_id)
                    .single();
                setOrganizer(orgData);
            }

            // 3. Fetch Attendee Count
            const { count } = await supabase
                .from('engagement_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('engagement_id', id);
            setAttendeeCount(count || 0);

            // 4. Check if current user is attending
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                const { data: isReg } = await supabase
                    .from('engagement_registrations')
                    .select('id')
                    .eq('engagement_id', id)
                    .eq('user_id', currentUser.id)
                    .single();
                setIsAttending(!!isReg);
            }

            setLoading(false);
        };

        fetchEventDetails();
    }, [id, supabase, toast]);

    const handleAttend = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to attend events." });
            return;
        }

        if (isAttending) {
            // Unattend logic (optional, keeping it simple: just toggle off)
            const { error } = await supabase
                .from('engagement_registrations')
                .delete()
                .eq('engagement_id', id)
                .eq('user_id', user.id);

            if (!error) {
                setIsAttending(false);
                setAttendeeCount(prev => Math.max(0, prev - 1));
                toast({ title: "Registration Cancelled", description: "You are no longer attending this event." });
            }
        } else {
            // Attend logic
            const { error } = await supabase
                .from('engagement_registrations')
                .insert({ engagement_id: id, user_id: user.id });

            if (!error) {
                setIsAttending(true);
                setAttendeeCount(prev => prev + 1);
                toast({ title: "Success!", description: "You are now registered for this event." });
            }
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied", description: "Event link copied to clipboard." });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0E14] pb-20">
            {/* Cover Image */}
            <div className="relative w-full h-[300px] md:h-[400px] bg-gray-200 dark:bg-gray-800">
                <Image
                    src={event.branding_image_url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070'}
                    alt={event.engagement_title}
                    fill
                    className="object-cover"
                    priority
                />
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-6 left-6 rounded-full bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left Col) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl overflow-hidden rounded-[20px]">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-none font-bold uppercase tracking-wider text-[10px]">
                                    HAPPENING SOON
                                </Badge>
                                <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold uppercase text-[10px]">
                                    {event.engagement_category.replace('_', ' ')}
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight tracking-tight">
                                {event.engagement_title}
                            </h1>
                            <div className="flex items-center gap-2 pt-2 text-muted-foreground font-medium">
                                <span className="text-sm">Engagement by</span>
                                {organizer ? (
                                    <div className="flex items-center gap-1.5 text-foreground font-bold">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={organizer.avatar_url} />
                                            <AvatarFallback>{organizer.full_name?.[0] || 'O'}</AvatarFallback>
                                        </Avatar>
                                        {organizer.full_name}
                                    </div>
                                ) : (
                                    <span className="font-bold text-foreground">{event.external_organizer_name || 'Engineer for Society'}</span>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 pt-4 space-y-6">

                            {/* Key Info Grid */}
                            <div className="grid gap-5">
                                {/* Date & Time */}
                                <div className="flex gap-4 items-start">
                                    <div className="bg-muted/30 p-2.5 rounded-xl text-muted-foreground">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base text-foreground">
                                            {format(new Date(event.commencement_time), 'EEEE, MMMM d, yyyy')}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {format(new Date(event.commencement_time), 'h:mm a')} - {format(new Date(event.conclusion_time), 'h:mm a')} {event.timezone_id}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex gap-4 items-start">
                                    <div className="bg-muted/30 p-2.5 rounded-xl text-muted-foreground">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base text-foreground">
                                            {event.engagement_type === 'online' ? 'Virtual Event' : event.venue_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-medium max-w-md">
                                            {event.engagement_type === 'online' ? 'Online via ' + (event.venue_name || 'Link') : event.venue_address}
                                        </p>
                                    </div>
                                </div>

                                {/* Link */}
                                {(event.virtual_endpoint_url || event.external_url) && (
                                    <div className="flex gap-4 items-start">
                                        <div className="bg-muted/30 p-2.5 rounded-xl text-muted-foreground">
                                            <LinkIcon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <Link
                                                href={event.virtual_endpoint_url || event.external_url || '#'}
                                                target="_blank"
                                                className="font-bold text-base text-teal-600 hover:underline break-all"
                                            >
                                                {event.virtual_endpoint_url ? 'Join Meeting' : 'Official Website'}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">Click to navigate</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attendees */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex -space-x-3 overflow-hidden">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                            <Users className="h-4 w-4 opacity-50" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    <span className="font-bold text-foreground">{attendeeCount > 0 ? attendeeCount + 128 : 129} attendees</span> registered
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    size="lg"
                                    className={cn(
                                        "flex-1 font-black text-base rounded-xl h-12 shadow-lg transition-all",
                                        isAttending ? "bg-green-600 hover:bg-green-700 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
                                    )}
                                    onClick={handleAttend}
                                >
                                    {isAttending ? (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" /> Attending
                                        </>
                                    ) : (
                                        "Attend Summit"
                                    )}
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-xl h-12 px-6 gap-2 font-bold" onClick={handleShare}>
                                    <Share2 className="h-5 w-5" /> Share
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 border">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details & Comments Tabs */}
                    <div className="bg-white dark:bg-[#161B22] rounded-[20px] shadow-sm p-2">
                        <Tabs defaultValue="details">
                            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 px-4 space-x-6">
                                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500 data-[state=active]:shadow-none px-0 font-bold text-muted-foreground data-[state=active]:text-foreground text-sm">
                                    About Summit
                                </TabsTrigger>
                                <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500 data-[state=active]:shadow-none px-0 font-bold text-muted-foreground data-[state=active]:text-foreground text-sm">
                                    Comments
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="p-6 animate-in slide-in-from-bottom-2">
                                <h3 className="text-lg font-black mb-4">Description</h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {event.engagement_brief || "No detailed description provided for this summit."}
                                </p>

                                {event.target_disciplines && event.target_disciplines.length > 0 && (
                                    <div className="mt-8">
                                        <h4 className="text-sm font-black mb-3 text-foreground uppercase tracking-wider">Target Disciplines</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {event.target_disciplines.map((d: string) => (
                                                <Badge key={d} variant="secondary" className="px-3 py-1 bg-muted font-bold text-muted-foreground">
                                                    {d}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="comments" className="p-6 text-center text-muted-foreground animate-in slide-in-from-bottom-2">
                                <div className="py-12 flex flex-col items-center">
                                    <div className="bg-muted p-4 rounded-full mb-4">
                                        <MessageSquare className="h-8 w-8 opacity-50" />
                                    </div>
                                    <p className="font-bold">Discussion thread is empty</p>
                                    <p className="text-sm opacity-70">Be the first to ask a question about this summit.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Host Card */}
                    <Card className="border-none shadow-lg overflow-hidden relative bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-[20px]">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-white/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                        <CardContent className="p-6 relative z-10">
                            <h3 className="text-xl font-black mb-2 leading-tight">Host an event on Engineer For Society</h3>
                            <p className="text-teal-100 text-sm mb-6 leading-relaxed font-medium opacity-90">
                                Invite your network and manage your professional summit with our advanced tools.
                            </p>
                            <Button className="w-full bg-white text-teal-800 hover:bg-teal-50 font-black shadow-lg border-none" onClick={() => router.push('/events?action=create')}>
                                Create Summit
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="border-none shadow-lg bg-white dark:bg-[#161B22] rounded-[20px]">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black">Other summits for you</h3>
                                <Link href="/events" className="text-xs font-bold text-teal-600 hover:underline">See all</Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-2 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 group cursor-pointer hover:bg-muted/30 p-2 rounded-xl transition-colors -mx-2">
                                    <div className="h-16 w-16 bg-muted rounded-xl flex-shrink-0 relative overflow-hidden">
                                        <Image src={`https://images.unsplash.com/photo-${1515000000000 + i}?q=80&w=200`} alt="Thumb" fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-teal-600 uppercase mb-0.5 truncate">Thu, Oct {12 + i}</p>
                                        <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-2 group-hover:text-teal-600 transition-colors">
                                            Future of AI in Structural Engineering
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                            243 attendees • Online
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
