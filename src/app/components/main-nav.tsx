'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  BookCopy,
  Briefcase,
  HeartHandshake,
  Home,
  Map,
  MessageSquare,
  Mic,
  Settings,
  User,
} from 'lucide-react';
import { Logo } from './icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/forums', label: 'Forums', icon: MessageSquare },
  { href: '/social-impact', label: 'Social Impact', icon: HeartHandshake },
  { href: '/podcasts', label: 'Podcasts', icon: Mic },
  { href: '/resources', label: 'Resources', icon: BookCopy },
  { href: '/chapters', label: 'Chapters & Events', icon: Map },
  { href: '/jobs', label: 'Job Board', icon: Briefcase },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="p-1 size-9 bg-sidebar-accent hover:bg-sidebar-accent/90" asChild>
            <Link href="/" aria-label="Home">
              <Logo className="size-6 text-sidebar-accent-foreground" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-semibold tracking-tight text-sidebar-foreground">
              Engineer For Society
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === link.href}
              className={cn(
                'group-data-[collapsible=icon]:justify-center',
                pathname === link.href && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground'
              )}
              tooltip={{
                children: link.label,
                className: "bg-primary text-primary-foreground",
              }}
            >
              <Link href={link.href}>
                <link.icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="group-data-[collapsible=icon]:justify-center"
              tooltip={{
                children: 'Settings',
                 className: "bg-primary text-primary-foreground",
              }}
            >
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
