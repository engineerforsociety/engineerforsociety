
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Building, GraduationCap, MapPin, Mail, MessageSquare, Plus, Check, Clock, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { AboutSection } from '@/app/components/profile/about-section';
import { ExperienceSection } from '@/app/components/profile/experience-section';
import { EducationSection } from '@/app/components/profile/education-section';
import { SkillsSection } from '@/app/components/profile/skills-section';
import { ActivitySection } from '@/app/components/profile/activity-section';
import { ProfileConnectionButton } from '@/app/components/profile/profile-connection-button';
import { ProfileHeaderActions } from '@/app/components/profile/profile-header-actions';

async function getProfileData(userId: string, currentUserId?: string) {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        return { profile: null, experiences: [], educations: [], connection: null };
    }

    const experiencesPromise = supabase.from('experiences').select('*').eq('profile_id', userId).order('start_date', { ascending: false });
    const educationsPromise = supabase.from('educations').select('*').eq('profile_id', userId).order('start_date', { ascending: false });

    let connectionPromise: any = Promise.resolve({ data: null, error: null });
    if (currentUserId && currentUserId !== userId) {
        connectionPromise = supabase
            .from('connections')
            .select('id, status, requester_id, receiver_id')
            .or(`and(requester_id.eq.${currentUserId},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${currentUserId})`)
            .maybeSingle();
    }

    const followerCountPromise = supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

    const connectionCountPromise = supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    const [experiencesRes, educationsRes, connectionRes, followerCountRes, connectionCountRes] = await Promise.all([
        experiencesPromise,
        educationsPromise,
        connectionPromise,
        followerCountPromise,
        connectionCountPromise
    ]);

    return {
        profile,
        experiences: experiencesRes.data || [],
        educations: educationsRes.data || [],
        connection: connectionRes.data,
        followerCount: followerCountRes.count || 0,
        connectionCount: connectionCountRes.count || 0
    };
}


export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { userId } = await params;
    const { profile, experiences, educations, connection, followerCount, connectionCount } = await getProfileData(userId, currentUser?.id);

    if (!profile) {
        notFound();
    }

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="bg-muted/40">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                <div className="space-y-6">
                    {/* --- Profile Header Card --- */}
                    <Card className="overflow-hidden">
                        <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary/20 to-secondary/20">
                            {profile.cover_url && (
                                <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="md:-mt-16 -mt-12 flex-shrink-0">
                                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background bg-muted">
                                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                                        <AvatarFallback className="text-4xl">
                                            {(profile.full_name || 'U').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 pt-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start">
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold">{profile.full_name}</h1>
                                            <p className="text-md font-medium text-foreground/80">{profile.job_title}</p>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-3">
                                                {profile.engineering_field && (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary rounded-md font-medium border border-primary/10">
                                                        <Briefcase className="h-3.5 w-3.5" /> {profile.engineering_field}
                                                    </div>
                                                )}
                                                {profile.company && (
                                                    <div className="flex items-center gap-1.5"><Building className="h-4 w-4" /> {profile.company}</div>
                                                )}
                                                {profile.location && (
                                                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.location}</div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-primary font-semibold hover:underline cursor-pointer">
                                                    <Mail className="h-4 w-4" /> Contact info
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="text-sm font-semibold text-primary hover:underline cursor-pointer">
                                                    {connectionCount} connections
                                                </div>
                                                <div className="text-sm font-semibold text-muted-foreground">
                                                    {followerCount} followers
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
                                            {isOwnProfile ? (
                                                <ProfileHeaderActions isOwnProfile={isOwnProfile} profile={profile} />
                                            ) : (
                                                <>
                                                    <ProfileConnectionButton
                                                        targetUserId={profile.id}
                                                        connection={connection}
                                                        currentUserId={currentUser?.id}
                                                    />
                                                    <Button variant="secondary" asChild>
                                                        <a href={`/messages?userId=${profile.id}`}>
                                                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                                                        </a>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <ActivitySection userId={userId} isOwnProfile={isOwnProfile} />
                            <AboutSection bio={profile.bio} isOwnProfile={isOwnProfile} />
                            <ExperienceSection experiences={experiences} isOwnProfile={isOwnProfile} />
                            <EducationSection educations={educations} isOwnProfile={isOwnProfile} />
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <SkillsSection skills={profile.skills} isOwnProfile={isOwnProfile} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
