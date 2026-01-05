
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Users, Plus, MessageSquare } from 'lucide-react';
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

export default function NetworkPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndProfiles = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .not('id', 'eq', user.id) // Exclude current user
                    .order('full_name');
                
                if (error) {
                    console.error("Error fetching profiles:", error);
                } else {
                    setProfiles(data || []);
                }
            }
            setLoading(false);
        };

        fetchUserAndProfiles();
    }, [supabase]);

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
                            <CardFooter className="flex flex-col gap-2">
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
            )}
        </div>
    );
}
