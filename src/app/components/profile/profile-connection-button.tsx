
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Check, UserCheck, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type Connection = {
    id: string;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    requester_id: string;
    receiver_id: string;
} | null;

type ProfileConnectionButtonProps = {
    targetUserId: string;
    currentUserId?: string;
    connection: Connection;
};

export function ProfileConnectionButton({ targetUserId, currentUserId, connection: initialConnection }: ProfileConnectionButtonProps) {
    const [connection, setConnection] = useState(initialConnection);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        setConnection(initialConnection);
    }, [initialConnection]);

    const handleSendRequest = async () => {
        if (!currentUserId) {
            toast({ title: "Please log in", description: "You need to be logged in to connect with others.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('connections')
                .insert({ requester_id: currentUserId, receiver_id: targetUserId, status: 'pending' })
                .select()
                .single();
            if (error) throw error;
            setConnection(data);
            toast({ title: "Request Sent!", description: "Your connection request has been sent." });
            router.refresh();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!connection) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('connections')
                .update({ status: 'accepted' })
                .eq('id', connection.id)
                .select()
                .single();
            if (error) throw error;
            setConnection(data);
            toast({ title: "Connection Accepted!", description: "You are now connected." });
            router.refresh();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing</Button>;
    }

    if (!currentUserId) {
        return <Button onClick={() => router.push('/login')}><Plus className="mr-2 h-4 w-4" /> Connect</Button>;
    }

    if (!connection) {
        return <Button onClick={handleSendRequest}><Plus className="mr-2 h-4 w-4" /> Connect</Button>;
    }

    if (connection.status === 'pending') {
        if (connection.requester_id === currentUserId) {
            return <Button variant="secondary" disabled><Clock className="mr-2 h-4 w-4" /> Pending</Button>;
        } else {
            return <Button onClick={handleAcceptRequest}><Check className="mr-2 h-4 w-4" /> Accept Request</Button>;
        }
    }

    if (connection.status === 'accepted') {
        return <Button variant="secondary" disabled><UserCheck className="mr-2 h-4 w-4" /> Connected</Button>;
    }

    // Default fallback, should ideally not be reached if logic is sound
    return <Button onClick={handleSendRequest}><Plus className="mr-2 h-4 w-4" /> Connect</Button>;
}
