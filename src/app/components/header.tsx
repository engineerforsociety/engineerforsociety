
'use client';

import Link from 'next/link';
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { sampleUserProfile } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const topLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/forums', label: 'My Network', icon: Network },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/messages', label: 'Messaging', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

const secondaryLinks = [
    { href: '/projects', label: 'Projects', icon: GanttChartSquare},
    { href: '/podcasts', label: 'Podcasts', icon: Podcast},
    { href: '/resources', label: 'Resources', icon: BookOpen},
    { href: '/chapters', label: 'Chapters', icon: Users},
]

const allLinks = [...topLinks, ...secondaryLinks];


function DesktopNav() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background hidden md:block">
            <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                </Link>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search"
                    className="w-full rounded-lg bg-muted pl-8 md:w-[280px]"
                    />
                </div>
                </div>

                <nav className="flex-1 flex justify-center ml-12">
                    <div className="flex items-center space-x-1">
                        {allLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-24',
                            )}
                            >
                            <link.icon className="h-6 w-6" />
                            <span className="truncate">{link.label}</span>
                        </Link>
                        ))}
                </div>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center space-x-1 border-l pl-4 cursor-pointer">
                        <div className="flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground w-28 text-center">
                            <HeartHandshake className="h-6 w-6" />
                            <span className="text-amber-700 underline">Try Premium</span>
                        </div>
                    </div>
                    <UserNav />
                </div>
            </div>
        </header>
    )
}

function MobileNav() {
    const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background md:hidden">
                 <div className="container flex h-16 items-center px-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-3/4">
                           <div className="flex flex-col h-full">
                                <div className="p-4 border-b">
                                    <Link href="/profile" className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={profilePic?.imageUrl} alt={sampleUserProfile.name} />
                                            <AvatarFallback>{sampleUserProfile.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{sampleUserProfile.name}</p>
                                            <p className="text-xs text-muted-foreground">View Profile</p>
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
                                        {topLinks.map(link => (
                                            <SheetClose asChild key={link.href}>
                                                <Link href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                                    <link.icon className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-medium">{link.label}</span>
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="p-4 space-y-2">
                                        <h3 className="px-2 text-sm font-semibold text-muted-foreground">Work & More</h3>
                                        {secondaryLinks.map(link => (
                                             <SheetClose asChild key={link.href}>
                                                <Link href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                                    <link.icon className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-medium">{link.label}</span>
                                                </Link>
                                            </SheetClose>
                                        ))}
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
                                        <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                            <LogOut className="h-5 w-5 text-muted-foreground" />
                                            <span>Log out</span>
                                        </Link>
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
                        <Button variant="ghost" size="icon"><MessageSquare className="h-6 w-6" /></Button>
                    </div>
                 </div>
            </header>

            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
                <div className="grid h-16 grid-cols-5 items-center justify-items-center">
                     {topLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-full',
                            )}
                            >
                            <link.icon className="h-6 w-6" />
                            <span className="truncate sr-only">{link.label}</span>
                        </Link>
                     ))}
                </div>
            </nav>
        </>
    )
}

export function Header() {
    const isMobile = useIsMobile();
    if(isMobile === undefined) return <div className="h-16 w-full" />; // Placeholder to prevent layout shift

    return isMobile ? <MobileNav /> : <DesktopNav />;
}
