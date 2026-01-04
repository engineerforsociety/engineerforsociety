import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from './components/header';
import { OnboardingModal } from './components/onboarding-modal';

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
      <body className={cn("font-body antialiased bg-muted/40")}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        {/* Add padding to the bottom to avoid content being hidden by the mobile nav */}
        <div className="pb-16 md:pb-0"></div>
        <OnboardingModal />
        <Toaster />
      </body>
    </html>
  );
}
