'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './use-toast';

export type Notification = {
    id: string;
    user_id: string;
    type: string;
    title: string;
    content: string;
    action_url: string;
    is_read: boolean;
    created_at: string;
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { toast } = useToast();

    const playNotificationSound = useCallback(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(err => console.error('Error playing sound:', err));
    }, []);

    const fetchNotifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
            return;
        }

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchNotifications();

        let channel: any;

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            channel = supabase
                .channel('public:notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        const newNotification = payload.new as Notification;
                        setNotifications(prev => [newNotification, ...prev]);
                        setUnreadCount(prev => prev + 1);

                        // Play sound
                        playNotificationSound();

                        // Show toast
                        toast({
                            title: newNotification.title,
                            description: newNotification.content,
                        });
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase, fetchNotifications, playNotificationSound, toast]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Error marking as read:', error);
            return;
        }

        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all as read:', error);
            return;
        }

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
    };
}
