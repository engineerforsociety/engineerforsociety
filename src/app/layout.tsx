import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainNav } from './components/main-nav';
import { UserNav } from './components/user-nav';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineer For Society',
  description: 'A platform for engineers to connect, collaborate, and contribute to social impact.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased")}>
        <SidebarProvider>
          <Sidebar>
            <MainNav />
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
              <SidebarTrigger className="flex md:hidden" />
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>
              <UserNav />
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
