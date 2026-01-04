import Link from 'next/link';
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  GanttChartSquare,
  HeartHandshake
} from 'lucide-react';
import { Logo } from './icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { Input } from '@/components/ui/input';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/forums', label: 'My Network', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/messages', label: 'Messaging', icon: MessageSquare },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
          </Link>
          <div className="relative hidden md:block">
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
                {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        'flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-24',
                        // Add active styles here based on pathname
                    )}
                    >
                    <link.icon className="h-6 w-6" />
                    <span className="truncate">{link.label}</span>
                </Link>
                ))}
          </div>
        </nav>

        <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center space-x-1 border-l pl-4">
                <Link href="/for-business" className="flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-24 text-center">
                    <GanttChartSquare className="h-6 w-6" />
                    <span className="truncate">For Business</span>
                </Link>
                <Link href="/social-impact" className="flex flex-col items-center justify-center gap-1 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-28 text-center">
                    <HeartHandshake className="h-6 w-6" />
                    <span className="text-amber-700 underline">Try Premium</span>
                </Link>
            </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
