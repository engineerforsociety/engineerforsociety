'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Search,
  MessageSquare,
  Users,
  Check,
  CheckCheck,
  Loader2,
  UserPlus,
  ArrowLeft,
  ArrowDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
}

interface Message {
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

interface Conversation {
  otherUser: Profile;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchUser();
    fetchConversations();
    fetchAllUsers();
  }, []);

  // Separate effect for realtime subscription that depends on user
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for user:', user.id);

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime event (sent):', payload);
          handleRealtimeMessage(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime event (received):', payload);
          handleRealtimeMessage(payload);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedConversation?.id]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Instant scroll on new messages to prevent layout jump issues
    scrollToBottom(false);
  }, [messages, selectedConversation]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isBottom);
    }
  };

  const scrollToBottom = (smooth = true) => {
    // Small timeout to ensure DOM is ready
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      }
    }, 100);
  };

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all messages involving the current user
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url, job_title),
          recipient:profiles!messages_recipient_id_fkey(id, username, full_name, avatar_url, job_title)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationsMap = new Map<string, Conversation>();

      messagesData?.forEach((msg: any) => {
        const isReceived = msg.recipient_id === user.id;
        const otherUser = isReceived ? msg.sender : msg.recipient;

        if (!otherUser) return;

        const existingConv = conversationsMap.get(otherUser.id);

        if (!existingConv || new Date(msg.created_at) > new Date(existingConv.lastMessage.created_at)) {
          const unreadCount = messagesData?.filter(
            (m: any) => m.sender_id === otherUser.id && m.recipient_id === user.id && !m.is_read
          ).length || 0;

          conversationsMap.set(otherUser.id, {
            otherUser,
            lastMessage: msg,
            unreadCount
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url, job_title),
          recipient:profiles!messages_recipient_id_fkey(id, username, full_name, avatar_url, job_title)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read
      const unreadMessages = data?.filter(
        (msg: any) => msg.recipient_id === user.id && !msg.is_read
      );

      if (unreadMessages && unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', unreadMessages.map((msg: any) => msg.id));

        if (!updateError) {
          fetchConversations(); // Refresh to update unread counts
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, job_title')
        .order('username');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRealtimeMessage = async (payload: any) => {
    console.log('Processing realtime payload:', payload);

    if (payload.eventType === 'INSERT') {
      const newMsg = payload.new;
      console.log('New message inserted:', newMsg);

      // If message is for current conversation, add it
      if (selectedConversation &&
        ((newMsg.sender_id === selectedConversation.id && newMsg.recipient_id === user?.id) ||
          (newMsg.sender_id === user?.id && newMsg.recipient_id === selectedConversation.id))) {

        // Fetch the complete message with profile data
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, username, full_name, avatar_url, job_title),
            recipient:profiles!messages_recipient_id_fkey(id, username, full_name, avatar_url, job_title)
          `)
          .eq('id', newMsg.id)
          .single();

        if (data && !error) {
          console.log('Adding message to conversation:', data);
          setMessages(prev => {
            // Prevent duplicates
            if (prev.some(msg => msg.id === data.id)) {
              return prev;
            }
            return [...prev, data];
          });

          // Mark as read if it's for us
          if (data.recipient_id === user?.id && !data.is_read) {
            console.log('Auto-marking message as read');
            await supabase
              .from('messages')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', data.id);
          }
        }
      }

      // Refresh conversations list
      console.log('Refreshing conversations list');
      fetchConversations();
    } else if (payload.eventType === 'UPDATE') {
      console.log('Message updated:', payload.new);
      // Update message read status
      setMessages(prev =>
        prev.map(msg =>
          msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
        )
      );
      // Refresh to update unread counts
      fetchConversations();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedConversation.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = (profile: Profile) => {
    setSelectedConversation(profile);
    setShowNewMessage(false);
    setSearchQuery('');
  };

  const filteredUsers = allUsers
    .filter(u => u.id !== user?.id)
    .filter(u =>
      !searchQuery ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredConversations = conversations.filter(conv =>
    !searchQuery ||
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-7xl pb-20 md:pb-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Connect and collaborate with the community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Conversations List - Hidden on mobile when chat is open */}
        <Card className={`lg:col-span-4 flex flex-col h-[600px] md:h-[700px] ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-xl">Conversations</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowNewMessage(!showNewMessage)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <Separator />

          <ScrollArea className="flex-1 overflow-y-auto scrollbar-gray">
            <div className="p-4 space-y-2">
              {showNewMessage ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Start New Conversation</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewMessage(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  {filteredUsers.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => startNewConversation(profile)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {profile.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{profile.full_name || profile.username}</p>
                        {profile.job_title && (
                          <p className="text-xs text-muted-foreground">{profile.job_title}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-1">Start chatting with someone!</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.otherUser.id}
                        onClick={() => setSelectedConversation(conv.otherUser)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${selectedConversation?.id === conv.otherUser.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted'
                          }`}
                      >
                        <Avatar>
                          <AvatarImage src={conv.otherUser.avatar_url || undefined} />
                          <AvatarFallback>
                            {conv.otherUser.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {conv.otherUser.full_name || conv.otherUser.username}
                            </p>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs truncate ${conv.unreadCount > 0 && conv.lastMessage.recipient_id === user?.id
                              ? 'font-semibold text-foreground'
                              : 'text-muted-foreground'
                              }`}>
                              {conv.lastMessage.sender_id === user?.id && 'You: '}
                              {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && conv.lastMessage.recipient_id === user?.id && (
                              <Badge variant="default" className="ml-2 shrink-0 h-5 min-w-[20px] flex items-center justify-center px-1.5">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Messages Area - Full width on mobile when conversation selected */}
        <Card className={`lg:col-span-8 flex flex-col h-[600px] md:h-[700px] ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={selectedConversation.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedConversation.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base md:text-lg">
                      {selectedConversation.full_name || selectedConversation.username}
                    </CardTitle>
                    {selectedConversation.job_title && (
                      <CardDescription className="text-xs md:text-sm">{selectedConversation.job_title}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <Separator />

              {/* Messages Area Wrapper */}
              <div className="flex-1 relative min-h-0 flex flex-col">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 p-4 overflow-y-auto scrollbar-gray"
                >
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isOwn && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedConversation.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {selectedConversation.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div
                                className={`rounded-2xl px-4 py-2 ${isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                                  }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                </span>
                                {isOwn && (
                                  <span className="text-muted-foreground">
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3 text-primary" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Scroll to Bottom Button - Now floated correctly */}
                {showScrollButton && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 z-20 animate-in fade-in zoom-in duration-200 border border-primary/20"
                    onClick={() => scrollToBottom(true)}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 md:p-4 border-t bg-background sticky bottom-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="flex-1 h-10 md:h-auto"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="icon"
                    className="shrink-0 h-10 w-10"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the list or start a new one</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
