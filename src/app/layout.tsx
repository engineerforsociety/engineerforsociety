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

import { Inter, Source_Sans_3, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

import { createClient } from '@/lib/supabase/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable, sourceSans.variable, jetbrains.variable)}>
        <Header initialUser={user} />
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
