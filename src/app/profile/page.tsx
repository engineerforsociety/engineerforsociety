
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
    Briefcase,
    MessageSquare,
    Edit,
    GraduationCap,
    MapPin,
    Plus,
    Share2,
    Link as LinkIcon,
    Award,
    ChevronRight,
    Users,
    Eye
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Separator } from '@/components/ui/separator';

// New Modals
import { EditIntroModal } from '@/app/components/profile/edit-intro-modal';
import { EditAboutModal } from '@/app/components/profile/edit-about-modal';
import { AddExperienceModal } from '@/app/components/profile/add-experience-modal';
import { AddEducationModal } from '@/app/components/profile/add-education-modal';
import { EditSkillsModal } from '@/app/components/profile/edit-skills-modal';
import { ActivitySection } from '@/app/components/profile/activity-section';

type UserProfile = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    engineering_field: string | null;
    job_title: string | null;
    company: string | null;
    years_of_experience: number;
    cover_url: string | null;
    is_onboarding_complete: boolean;
    skills: string[];
}

type Experience = {
    id: string;
    title: string;
    company_name: string;
    location: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string;
}

type Education = {
    id: string;
    school_name: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
}

function ProfileSidebar() {
    return (
        <aside className="space-y-6">
            <Card className="shadow-sm border-none text-left">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                        Analytics <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div>
                        <p className="text-xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Profile views</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="text-xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Post impressions</p>
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}

function ProfileHeaderCard({
    onEditClick,
    user,
    profile,
    isOwnProfile,
    connectionStatus,
    onConnect,
    onAccept,
    isProcessing
}: {
    onEditClick: () => void,
    user: User | null,
    profile: UserProfile | null,
    isOwnProfile: boolean,
    connectionStatus: 'pending_sent' | 'pending_received' | 'accepted' | 'none',
    onConnect: () => void,
    onAccept: () => void,
    isProcessing: boolean
}) {
    const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || profilePic?.imageUrl;
    const coverUrl = profile?.cover_url || null;

    return (
        <Card className="overflow-hidden border-none shadow-sm">
            <div className="relative h-32 md:h-44 w-full bg-muted flex items-center justify-center overflow-hidden">
                {coverUrl ? (
                    <Image src={coverUrl} alt="Cover" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/5 to-secondary/5" />
                )}
            </div>
            <CardContent className="relative pt-0 px-6 pb-6 mt-[-40px] md:mt-[-60px]">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 text-left">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md">
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                {displayName?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{displayName}</h1>
                            <p className="text-lg text-muted-foreground font-medium">
                                {profile?.job_title || 'No headline set'}
                                {profile?.company ? ` @ ${profile.company}` : ''}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile?.location || 'Location not set'}</span>
                                <span className="flex items-center gap-1.5 text-primary font-semibold cursor-pointer hover:underline">
                                    <LinkIcon className="h-4 w-4" /> Contact Info
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto mb-2">
                        {isOwnProfile ? (
                            <>
                                <Button variant="default" className="flex-1 md:flex-none">Open to</Button>
                                <Button variant="outline" size="icon" onClick={onEditClick}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                {connectionStatus === 'none' && (
                                    <Button variant="default" className="flex-1 md:flex-none" onClick={onConnect} disabled={isProcessing}>
                                        <Plus className="mr-1.5 h-4 w-4" /> Connect
                                    </Button>
                                )}
                                {connectionStatus === 'pending_sent' && (
                                    <Button variant="outline" className="flex-1 md:flex-none" disabled>
                                        Pending
                                    </Button>
                                )}
                                {connectionStatus === 'pending_received' && (
                                    <Button variant="default" className="flex-1 md:flex-none" onClick={onAccept} disabled={isProcessing}>
                                        Accept Request
                                    </Button>
                                )}
                                {connectionStatus === 'accepted' && (
                                    <Button variant="default" className="flex-1 md:flex-none" asChild>
                                        <Link href={`/messages?userId=${profile?.id}`}>
                                            <MessageSquare className="mr-1.5 h-4 w-4" /> Message
                                        </Link>
                                    </Button>
                                )}
                                <Button variant="outline" className="flex-1 md:flex-none">More</Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


function ProfileContent() {
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('userId');

    const [modals, setModals] = useState({
        intro: false,
        about: false,
        experience: false,
        education: false,
        skills: false
    });

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [educations, setEducations] = useState<Education[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'pending_sent' | 'pending_received' | 'accepted' | 'none'>('none');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    const fetchAllData = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        // If no targetUserId and no authUser, redirect to login
        if (!targetUserId && !authUser) {
            router.push('/login');
            return;
        }

        setCurrentUser(authUser);

        // Use targetUserId if provided, otherwise fallback to current logged in user
        const profileId = targetUserId || authUser?.id;

        if (!profileId) {
            setLoading(false);
            return;
        }

        // Parallel fetching for the specific profileId
        const [prof, exp, edu, conn] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', profileId).single(),
            supabase.from('experiences').select('*').eq('profile_id', profileId).order('start_date', { ascending: false }),
            supabase.from('educations').select('*').eq('profile_id', profileId).order('start_date', { ascending: false }),
            targetUserId ? supabase.from('connections').select('*').or(`and(requester_id.eq.${authUser?.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${authUser?.id})`).maybeSingle() : Promise.resolve({ data: null })
        ]);

        setProfile(prof.data);
        setExperiences(exp.data || []);
        setEducations(edu.data || []);

        // Logic for connection status
        if (conn.data) {
            if (conn.data.status === 'accepted') {
                setConnectionStatus('accepted');
            } else if (conn.data.status === 'pending') {
                if (conn.data.requester_id === authUser?.id) {
                    setConnectionStatus('pending_sent');
                } else {
                    setConnectionStatus('pending_received');
                }
            }
        } else {
            setConnectionStatus('none');
        }

        setLoading(false);
    };

    const handleConnect = async () => {
        if (!currentUser || !profile || targetUserId === currentUser.id) return;
        setIsProcessing(true);
        try {
            const { error } = await supabase.from('connections').insert({
                requester_id: currentUser.id,
                receiver_id: profile.id,
                status: 'pending'
            });
            if (error) throw error;
            setConnectionStatus('pending_sent');
        } catch (error) {
            console.error('Error connecting:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAccept = async () => {
        if (!currentUser || !profile) return;
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('connections')
                .update({ status: 'accepted' })
                .eq('requester_id', profile.id)
                .eq('receiver_id', currentUser.id);

            if (error) throw error;
            setConnectionStatus('accepted');
        } catch (error) {
            console.error('Error accepting connection:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [targetUserId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-vh-60 h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile?.id;

    const toggleModal = (modal: keyof typeof modals, state: boolean) => {
        setModals(prev => ({ ...prev, [modal]: state }));
    };

    return (
        <div className="bg-muted/30 min-h-screen py-6 md:py-10 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Modals - only render/functional for own profile */}
                {isOwnProfile && (
                    <>
                        <EditIntroModal isOpen={modals.intro} onOpenChange={(s) => toggleModal('intro', s)} profile={profile} />
                        <EditAboutModal isOpen={modals.about} onOpenChange={(s) => toggleModal('about', s)} currentBio={profile?.bio || ''} />
                        <AddExperienceModal isOpen={modals.experience} onOpenChange={(s) => toggleModal('experience', s)} />
                        <AddEducationModal isOpen={modals.education} onOpenChange={(s) => toggleModal('education', s)} />
                        <EditSkillsModal isOpen={modals.skills} onOpenChange={(s) => toggleModal('skills', s)} currentSkills={profile?.skills || []} />
                    </>
                )}

                <div className="grid lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-3 space-y-6">
                        <ProfileHeaderCard
                            onEditClick={() => toggleModal('intro', true)}
                            user={isOwnProfile ? currentUser : null}
                            profile={profile}
                            isOwnProfile={isOwnProfile}
                            connectionStatus={connectionStatus}
                            onConnect={handleConnect}
                            onAccept={handleAccept}
                            isProcessing={isProcessing}
                        />

                        {/* About Section */}
                        <Card className="shadow-sm border-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl font-bold">About</CardTitle>
                                {isOwnProfile && (
                                    <Button variant="ghost" size="icon" onClick={() => toggleModal('about', true)}><Edit className="h-4 w-4" /></Button>
                                )}
                            </CardHeader>
                            <CardContent className="text-left">
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {profile?.bio || (isOwnProfile ? 'Add a bio to tell the community about yourself.' : 'No bio available.')}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Experience Section */}
                        <Card className="shadow-sm border-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl font-bold">Experience</CardTitle>
                                {isOwnProfile && (
                                    <Button variant="ghost" size="icon" onClick={() => toggleModal('experience', true)}><Plus className="h-4 w-4" /></Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6 text-left">
                                {experiences.length > 0 ? experiences.map((exp) => (
                                    <div key={exp.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                        <div className="bg-primary/10 p-2 rounded-lg h-fit"><Briefcase className="h-6 w-6 text-primary" /></div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg">{exp.title}</p>
                                            <p className="text-sm font-medium">{exp.company_name} &middot; {exp.location}</p>
                                            <p className="text-xs text-muted-foreground uppercase">{exp.start_date || 'N/A'} - {exp.is_current ? 'Present' : (exp.end_date || 'N/A')}</p>
                                            <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground italic">No experience details added yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Education Section */}
                        <Card className="shadow-sm border-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl font-bold">Education</CardTitle>
                                {isOwnProfile && (
                                    <Button variant="ghost" size="icon" onClick={() => toggleModal('education', true)}><Plus className="h-4 w-4" /></Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6 text-left">
                                {educations.length > 0 ? educations.map((edu) => (
                                    <div key={edu.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                        <div className="bg-primary/10 p-2 rounded-lg h-fit"><GraduationCap className="h-6 w-6 text-primary" /></div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg">{edu.school_name}</p>
                                            <p className="text-sm font-medium">{edu.degree}, {edu.field_of_study}</p>
                                            <p className="text-xs text-muted-foreground uppercase">{edu.start_date} - {edu.end_date}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground italic">No education details added yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Skills Section */}
                        <Card className="shadow-sm border-none text-center p-8 bg-primary/5 border border-primary/10">
                            <CardContent className="space-y-4">
                                <div className="mx-auto bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center">
                                    <Award className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-bold">Featured Skills</CardTitle>
                                    <CardDescription>Industry knowledge and tools you excel at</CardDescription>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 pt-4">
                                    {profile?.skills && profile.skills.length > 0 ? profile.skills.map(skill => (
                                        <Badge key={skill} variant="secondary" className="px-4 py-1 text-sm bg-background border hover:bg-muted cursor-default transition-colors">
                                            {skill}
                                        </Badge>
                                    )) : (
                                        <p className="text-sm text-muted-foreground italic">No skills added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="justify-center border-t border-primary/10 mt-6 pt-6 pb-0">
                                {isOwnProfile ? (
                                    <Button variant="link" className="text-primary font-bold" onClick={() => toggleModal('skills', true)}>
                                        Manage Skills <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button variant="link" className="text-primary font-bold">
                                        Endorse Skills <Plus className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>

                        {/* Activity Section - LinkedIn Style */}
                        {profile && (
                            <ActivitySection userId={profile.id} isOwnProfile={isOwnProfile} />
                        )}
                    </div>

                    <div className="lg:col-span-1 hidden lg:block sticky top-24">
                        <ProfileSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-vh-60 h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
