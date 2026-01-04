
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
} from 'lucide-react';
import { Logo } from './icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
                        {topLinks.map((link) => (
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
                    <Sheet>
                        <SheetTrigger asChild>
                            <div className="hidden lg:flex items-center space-x-1 border-l pl-4 cursor-pointer">
                                <div className="flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground w-28 text-center">
                                    <HeartHandshake className="h-6 w-6" />
                                    <span className="text-amber-700 underline">Work & more</span>
                                </div>
                            </div>
                        </SheetTrigger>
                        <SheetContent>
                             <div className="grid grid-cols-2 gap-4 mt-8">
                                {secondaryLinks.map(link => (
                                    <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted hover:bg-accent transition-colors">
                                        <link.icon className="h-8 w-8 text-primary mb-2" />
                                        <span className="text-sm font-medium text-center">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                    <UserNav />
                </div>
            </div>
        </header>
    )
}

function MobileNav() {
    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background md:hidden">
                 <div className="container flex h-16 items-center px-4">
                     <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                    </Link>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                        <UserNav />
                    </div>
                 </div>
            </header>
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
                <div className="grid h-16 grid-cols-5 items-center justify-items-center">
                     {topLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                            )}
                            >
                            <link.icon className="h-6 w-6" />
                            <span className="truncate">{link.label}</span>
                        </Link>
                     ))}
                </div>
            </nav>
        </>
    )
}

export function Header() {
    const isMobile = useIsMobile();
    if(isMobile === undefined) return null; // Avoid hydration mismatch

    return isMobile ? <MobileNav /> : <DesktopNav />;
}
