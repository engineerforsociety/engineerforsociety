// Database types for messages feature

export interface Profile {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
}

export interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    sender?: Profile;
    recipient?: Profile;
}

export interface Conversation {
    otherUser: Profile;
    lastMessage: Message;
    unreadCount: number;
}

export interface MessageInsert {
    sender_id: string;
    recipient_id: string;
    content: string;
}

export interface MessageUpdate {
    is_read?: boolean;
    read_at?: string;
}

// Supabase realtime payload types
export interface RealtimeMessagePayload {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Message;
    old: Message | null;
}
