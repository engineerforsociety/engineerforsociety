
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
    Home,
    Users,
    Briefcase,
    MessageSquare,
    Bell,
    Search,
    GanttChartSquare,
    HeartHandshake,
    BookOpen,
    Podcast,
    Network,
    Plus,
    Menu,
    User,
    CreditCard,
    Settings,
    LogOut,
} from 'lucide-react';
import { Logo } from './icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/use-notifications';
import { useMessages } from '@/hooks/use-messages';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { sampleUserProfile } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';


const topLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/forums', label: 'Forums', icon: MessageSquare },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/messages', label: 'Messaging', icon: MessageSquare, countKey: 'messages' },
    { href: '/notifications', label: 'Notifications', icon: Bell, countKey: 'notifications' },
];

const mainNavLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/network', label: 'My Network', icon: Network },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/messages', label: 'Messaging', icon: MessageSquare, countKey: 'messages' },
    { href: '/notifications', label: 'Notifications', icon: Bell, countKey: 'notifications' },
    { href: '/projects', label: 'Projects', icon: GanttChartSquare },
];

const secondaryLinks = [
    { href: '/projects', label: 'Projects', icon: GanttChartSquare },
    { href: '/podcasts', label: 'Podcasts', icon: Podcast },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/chapters', label: 'Chapters', icon: Users },
]


function DesktopNav({ user, counts }: { user: SupabaseUser | null, counts: { notifications: number, messages: number } }) {
    const pathname = usePathname();
    const isAuthenticated = !!user;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background hidden md:block">
            <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                    </Link>
                    {isAuthenticated && (
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search"
                                className="w-full rounded-lg bg-muted pl-8 md:w-[280px]"
                            />
                        </div>
                    )}
                </div>

                {isAuthenticated ? (
                    <>
                        <nav className="flex-1 flex justify-center ml-12">
                            <div className="flex items-center space-x-1">
                                {mainNavLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    const count = link.countKey ? counts[link.countKey as keyof typeof counts] : 0;

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                'flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-24 relative',
                                                isActive && 'text-primary bg-accent/50'
                                            )}
                                        >
                                            <div className="relative">
                                                <link.icon className="h-6 w-6" />
                                                {count > 0 && (
                                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                                        {count > 9 ? '9+' : count}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="truncate">{link.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center space-x-1 border-l pl-4 cursor-pointer">
                                <div className="flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground w-28 text-center">
                                    <HeartHandshake className="h-6 w-6" />
                                    <span className="text-amber-700 underline">Try Premium</span>
                                </div>
                            </div>
                            <UserNav user={user} />
                        </div>
                    </>
                ) : (
                    <div className="ml-auto flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="ghost">Member login</Button>
                        </Link>
                        <Link href="/login">
                            <Button>Register now</Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}

function MobileNav({ user, counts }: { user: SupabaseUser | null, counts: { notifications: number, messages: number } }) {
    const supabase = createClient();
    const router = useRouter();
    const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
    const pathname = usePathname();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const displayName = user?.user_metadata?.full_name || user?.email || sampleUserProfile.name;
    const avatarUrl = user?.user_metadata?.avatar_url || profilePic?.imageUrl;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background md:hidden">
                <div className="container flex h-16 items-center px-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-3/4 flex flex-col">
                            <VisuallyHidden>
                                <SheetTitle>Navigation Menu</SheetTitle>
                            </VisuallyHidden>
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b">
                                    <Link href="/profile" className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={avatarUrl} alt={displayName} />
                                            <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{displayName}</p>
                                            <p className="text-xs text-muted-foreground">{user ? 'View Profile' : 'Not signed in'}</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="p-4">
                                    <Button variant="outline" className="w-full text-amber-700 border-amber-700">Try Premium for $0</Button>
                                </div>
                                <Separator />
                                <nav className="flex-1 overflow-y-auto">
                                    <div className="p-4 space-y-2">
                                        <h3 className="px-2 text-sm font-semibold text-muted-foreground">Navigation</h3>
                                        {topLinks.map(link => {
                                            const isActive = pathname === link.href;
                                            const count = link.countKey ? counts[link.countKey as keyof typeof counts] : 0;

                                            return (
                                                <SheetClose asChild key={link.href}>
                                                    <Link href={link.href} className={cn("flex items-center gap-3 p-2 rounded-md hover:bg-accent", isActive && 'bg-accent')}>
                                                        <div className="relative">
                                                            <link.icon className={cn("h-5 w-5 text-muted-foreground", isActive && 'text-primary')} />
                                                            {count > 0 && (
                                                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                                                    {count > 9 ? '9+' : count}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={cn("font-medium", isActive && "text-primary")}>{link.label}</span>
                                                    </Link>
                                                </SheetClose>
                                            )
                                        })}
                                    </div>
                                    <Separator />
                                    <div className="p-4 space-y-2">
                                        <h3 className="px-2 text-sm font-semibold text-muted-foreground">Work & More</h3>
                                        {secondaryLinks.map(link => {
                                            const isActive = pathname === link.href;
                                            return (
                                                <SheetClose asChild key={link.href}>
                                                    <Link href={link.href} className={cn("flex items-center gap-3 p-2 rounded-md hover:bg-accent", isActive && 'bg-accent')}>
                                                        <link.icon className={cn("h-5 w-5 text-muted-foreground", isActive && 'text-primary')} />
                                                        <span className={cn("font-medium", isActive && "text-primary")}>{link.label}</span>
                                                    </Link>
                                                </SheetClose>
                                            )
                                        })}
                                    </div>
                                </nav>
                                <Separator />
                                <div className="p-4 space-y-2">
                                    <SheetClose asChild>
                                        <Link href="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                            <Settings className="h-5 w-5 text-muted-foreground" />
                                            <span>Settings</span>
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <div
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                        >
                                            <LogOut className="h-5 w-5 text-muted-foreground" />
                                            <span>Log out</span>
                                        </div>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="mx-auto">
                        <Logo className="h-8 w-8 text-primary" />
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                        <Link href="/messages">
                            <Button variant="ghost" size="icon" className="relative">
                                <MessageSquare className="h-6 w-6" />
                                {counts.messages > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                        {counts.messages > 9 ? '9+' : counts.messages}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
            {/* Spacer to prevent content from jumping under fixed header on mobile */}
            <div className="h-16 md:hidden" aria-hidden="true" />


            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
                <div className="grid h-16 grid-cols-5 items-center justify-items-center">
                    {topLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const count = link.countKey ? counts[link.countKey as keyof typeof counts] : 0;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-full h-full relative',
                                    isActive && 'text-primary bg-accent/50'
                                )}
                            >
                                <link.icon className="h-6 w-6" />
                                {count > 0 && (
                                    <span className="absolute top-2 right-4 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                        {count > 9 ? '9+' : count}
                                    </span>
                                )}
                                <span className="truncate sr-only">{link.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}

export function Header() {
    const isMobile = useIsMobile();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const supabase = createClient();
    const { unreadCount: unreadNotifications } = useNotifications();
    const { unreadCount: unreadMessages } = useMessages();

    const counts = {
        notifications: unreadNotifications,
        messages: unreadMessages
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (isMobile === undefined) {
        return <div className="h-16 w-full hidden md:block" />;
    }

    return isMobile ? <MobileNav user={user} counts={counts} /> : <DesktopNav user={user} counts={counts} />;
}
