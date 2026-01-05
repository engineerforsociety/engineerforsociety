'use client';

import { useNotifications, Notification } from '@/hooks/use-notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Bell,
    UserPlus,
    MessageSquare,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Trash2,
    Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead
    } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'connection_request':
                return <UserPlus className="h-5 w-5 text-blue-500" />;
            case 'connection_accepted':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'new_message':
                return <MessageSquare className="h-5 w-5 text-primary" />;
            default:
                return <Bell className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const formatDate = (date: string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'just now';
        }
    };

    return (
        <div className="bg-muted/30 min-h-screen py-6 md:py-10 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold">Notifications</CardTitle>
                            {unreadCount > 0 && (
                                <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-primary hover:text-primary/80 font-semibold"
                            >
                                Mark all as read
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="divide-y">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="p-4 flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="bg-muted p-6 rounded-full">
                                    <Bell className="h-12 w-12 text-muted-foreground opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold">No notifications yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        We'll notify you when something important happens.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 flex gap-4 transition-colors hover:bg-muted/50 relative",
                                            !notification.is_read && "bg-primary/5"
                                        )}
                                    >
                                        <div className="mt-1">
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center relative">
                                                {getIcon(notification.type)}
                                                {!notification.is_read && (
                                                    <span className="absolute top-0 right-0 h-3 w-3 bg-primary border-2 border-background rounded-full" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <Link
                                                    href={notification.action_url || '#'}
                                                    className="block group"
                                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                                >
                                                    <p className={cn(
                                                        "text-sm font-semibold group-hover:text-primary transition-colors",
                                                        notification.is_read ? "text-foreground" : "text-foreground"
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                                        {notification.content}
                                                    </p>
                                                </Link>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {!notification.is_read && (
                                                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                                                <Check className="mr-2 h-4 w-4" /> Mark as read
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {formatDate(notification.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
