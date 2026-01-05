
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './use-toast';
import type { Conversation } from '@/lib/types/messages';

export function useMessages() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { toast } = useToast();

    const fetchConversations = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('messages')
            .select(`*, sender:profiles!messages_sender_id_fkey(*), recipient:profiles!messages_recipient_id_fkey(*)`)
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
            return;
        }

        const conversationsMap = new Map<string, Conversation>();
        let totalUnread = 0;

        data.forEach((msg: any) => {
            const otherUser = msg.sender_id === user.id ? msg.recipient : msg.sender;
            if (!otherUser) return;

            if (!conversationsMap.has(otherUser.id)) {
                 const convUnreadCount = data.filter(
                    (m) => m.sender_id === otherUser.id && m.recipient_id === user.id && !m.is_read
                ).length;

                conversationsMap.set(otherUser.id, {
                    otherUser,
                    lastMessage: msg,
                    unreadCount: convUnreadCount,
                });

                totalUnread += convUnreadCount;
            }
        });
        
        const sortedConversations = Array.from(conversationsMap.values())
          .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());


        setConversations(sortedConversations);
        setUnreadCount(sortedConversations.reduce((acc, c) => acc + c.unreadCount, 0));
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchConversations();

        let channel: any;
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            channel = supabase
                .channel('public:messages:unread')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'messages',
                        filter: `recipient_id=eq.${user.id}`,
                    },
                    () => {
                        fetchConversations();
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase, fetchConversations]);

    return {
        conversations,
        unreadCount,
        loading,
        refresh: fetchConversations,
    };
}
