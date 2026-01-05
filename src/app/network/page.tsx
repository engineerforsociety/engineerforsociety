
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Users, Plus, MessageSquare, Check, X } from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

type Profile = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
    company: string | null;
}

type ConnectionRequest = {
    id: string;
    status: string;
    requester: Profile;
}

export default function NetworkPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [invitations, setInvitations] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingInvite, setProcessingInvite] = useState<string | null>(null);
    const supabase = createClient();

    const fetchNetworkData = useCallback(async (user: User) => {
        setLoading(true);
        try {
            const [profilesRes, invitesRes] = await Promise.all([
                supabase.from('profiles').select('*').not('id', 'eq', user.id),
                supabase
                    .from('connections')
                    .select(`
                        id,
                        status,
                        requester:profiles!connections_requester_fkey (
                            id,
                            username,
                            full_name,
                            avatar_url,
                            job_title,
                            company
                        )
                    `)
                    .eq('receiver_id', user.id)
                    .eq('status', 'pending')
            ]);
            
            if (profilesRes.error) throw profilesRes.error;
            if (invitesRes.error) throw invitesRes.error;

            setProfiles(profilesRes.data || []);
            setInvitations(invitesRes.data as any || []);

        } catch (error) {
            console.error("Error fetching network data:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);
    
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
                fetchNetworkData(user);
            } else {
                setLoading(false); // No user, stop loading
            }
        };
        getUser();
    }, [fetchNetworkData, supabase]);

    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase
            .channel('connections-realtime-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'connections',
                filter: `receiver_id=eq.${currentUser.id}`
            }, (payload) => {
                // Refetch invitations on any change
                fetchNetworkData(currentUser);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, supabase, fetchNetworkData]);


    const handleInviteAction = async (inviteId: string, newStatus: 'accepted' | 'declined') => {
        setProcessingInvite(inviteId);
        try {
            const { error } = await supabase
                .from('connections')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', inviteId);

            if (error) throw error;

            setInvitations(prev => prev.filter(invite => invite.id !== inviteId));

        } catch (err) {
            console.error(`Error ${newStatus === 'accepted' ? 'accepting' : 'ignoring'} invite:`, err);
        } finally {
            setProcessingInvite(null);
        }
    };


    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">My Network</h1>
                <p className="text-lg text-muted-foreground mt-2">Connect with other professionals in the community.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Invitations Card */}
                    {invitations.length > 0 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Invites received ({invitations.length})</CardTitle>
                                <Button variant="link" className="text-primary">Show all</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {invitations.map(invite => (
                                    <div key={invite.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-4">
                                            <Link href={`/profile?userId=${invite.requester.id}`}>
                                                <Avatar className="h-14 w-14">
                                                    <AvatarImage src={invite.requester.avatar_url || ''} alt={invite.requester.full_name || 'User'} />
                                                    <AvatarFallback>
                                                        {(invite.requester.full_name || 'U').substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <div>
                                                <Link href={`/profile?userId=${invite.requester.id}`}>
                                                    <p className="font-bold hover:underline">{invite.requester.full_name || invite.requester.username}</p>
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {invite.requester.job_title || 'Community Member'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleInviteAction(invite.id, 'declined')}
                                                disabled={processingInvite === invite.id}
                                                className="rounded-full h-9 w-9"
                                            >
                                                {processingInvite === invite.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-5 w-5"/>}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleInviteAction(invite.id, 'accepted')}
                                                disabled={processingInvite === invite.id}
                                                className="rounded-full h-9 w-9"
                                            >
                                                {processingInvite === invite.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5"/>}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* People You May Know */}
                    <h2 className="text-xl font-bold">People you may know</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {profiles.map(profile => (
                            <Card key={profile.id} className="text-center hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6 flex flex-col items-center">
                                    <Link href={`/profile?userId=${profile.id}`}>
                                        <Avatar className="h-24 w-24 mb-4 border-2 border-primary/20">
                                            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
                                            <AvatarFallback className="text-2xl">
                                                {(profile.full_name || profile.username || 'U').substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <Link href={`/profile?userId=${profile.id}`}>
                                        <p className="font-bold text-lg hover:underline">{profile.full_name || profile.username}</p>
                                    </Link>
                                    <p className="text-sm text-muted-foreground h-10 mt-1">
                                        {profile.job_title || 'Community Member'}
                                        {profile.company && ` @ ${profile.company}`}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2 p-4">
                                    <Button className="w-full">
                                        <Plus className="mr-2 h-4 w-4" /> Connect
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/messages?userId=${profile.id}`}>
                                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
