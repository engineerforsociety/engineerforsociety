
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/app/components/icons';
import Link from 'next/link';
import Image from 'next/image';

export function LandingHero() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Text Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                                Welcome to your
                                <span className="block text-primary">professional community</span>
                            </h1>
                        </div>

                        <div className="space-y-3 max-w-md">
                            <Link href="/login" className="block">
                                <Button
                                    variant="default"
                                    className="w-full h-12 text-base flex items-center justify-center gap-3 rounded-full"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </Link>

                            <p className="text-sm text-center text-muted-foreground px-4">
                                By clicking Continue, you agree to Engineer For Society's{' '}
                                <Link href="/terms" className="text-primary hover:underline">
                                    User Agreement
                                </Link>
                                ,{' '}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                                , and{' '}
                                <Link href="/cookies" className="text-primary hover:underline">
                                    Cookie Policy
                                </Link>
                                .
                            </p>
                        </div>

                        <div className="pt-4">
                            <p className="text-sm">
                                New to Engineer For Society?{' '}
                                <Link href="/login" className="text-primary font-semibold hover:underline">
                                    Join now
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right side - Illustration */}
                    <div className="hidden lg:block">
                        <div className="relative w-full h-[600px]">
                            <svg
                                viewBox="0 0 900 700"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-full"
                            >
                                {/* Bookshelf */}
                                <rect x="550" y="100" width="300" height="400" fill="#f3f4f6" rx="8" />

                                {/* Books */}
                                <rect x="570" y="120" width="30" height="180" fill="#10b981" rx="2" />
                                <rect x="605" y="120" width="30" height="180" fill="#3b82f6" rx="2" />
                                <rect x="640" y="120" width="30" height="180" fill="#f59e0b" rx="2" />
                                <rect x="675" y="120" width="30" height="180" fill="#8b5cf6" rx="2" />
                                <rect x="710" y="120" width="30" height="180" fill="#ec4899" rx="2" />

                                {/* Decorative items */}
                                <circle cx="790" cy="140" r="30" fill="#fbbf24" />
                                <rect x="570" y="320" width="100" height="60" fill="#94a3b8" rx="4" />
                                <circle cx="800" cy="400" r="40" fill="#ef4444" />

                                {/* Guitar */}
                                <ellipse cx="730" cy="480" rx="25" ry="35" fill="#d97706" />
                                <rect x="725" y="420" width="10" height="100" fill="#92400e" />

                                {/* Desk */}
                                <rect x="100" y="450" width="500" height="15" fill="#a78bfa" rx="4" />
                                <rect x="120" y="465" width="15" height="180" fill="#7c3aed" />
                                <rect x="565" y="465" width="15" height="180" fill="#7c3aed" />

                                {/* Chair */}
                                <rect x="250" y="400" width="150" height="180" fill="#5b21b6" rx="8" />
                                <rect x="230" y="420" width="15" height="60" fill="#5b21b6" rx="4" />
                                <rect x="405" y="420" width="15" height="60" fill="#5b21b6" rx="4" />
                                <rect x="250" y="580" width="15" height="80" fill="#4c1d95" />
                                <rect x="385" y="580" width="15" height="80" fill="#4c1d95" />

                                {/* Person sitting */}
                                <circle cx="325" cy="320" r="50" fill="#a78bfa" />
                                <rect x="275" y="370" width="100" height="120" fill="#6d28d9" rx="8" />

                                {/* Laptop */}
                                <rect x="320" y="440" width="120" height="10" fill="#1e293b" />
                                <rect x="330" y="400" width="100" height="40" fill="#334155" rx="2" />

                                {/* Arms */}
                                <rect x="250" y="380" width="50" height="15" fill="#9333ea" transform="rotate(-20 275 387)" />
                                <rect x="350" y="380" width="50" height="15" fill="#9333ea" transform="rotate(20 375 387)" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom Topics Section */}
                <div className="mt-20 border-t pt-12">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">
                            Explore top Engineer For Society content
                        </h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Discover relevant posts, insights — curated by topic and in one place.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {[
                                'Career',
                                'Productivity',
                                'Finance',
                                'Soft Skills & Emotional Intelligence',
                                'Project Management',
                                'Education',
                                'Technology',
                                'Leadership',
                                'Ecommerce'
                            ].map((topic) => (
                                <Button
                                    key={topic}
                                    variant="outline"
                                    className="rounded-full px-6 py-2 h-auto hover:bg-primary/10"
                                >
                                    {topic}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
