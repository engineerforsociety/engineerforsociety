import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, ChevronDown, User, GanttChartSquare, CreditCard, ShieldCheck, HelpCircle, Languages, Bookmark } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function UserNav({ user }: { user: SupabaseUser | null }) {
    const supabase = createClient();
    const router = useRouter();
    const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const displayName = user?.user_metadata?.full_name || user?.email || 'User';
    const avatarUrl = user?.user_metadata?.avatar_url || profilePic?.imageUrl;

    return (
        <div className="flex items-center">
            <Link href="/profile" className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-l-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer h-full'
            )}>
                <Avatar className="h-6 w-6">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="flex items-center">
                    Me
                </span>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-l-none h-full px-2">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={avatarUrl} alt={displayName} />
                                <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || 'Full-Stack Developer @EFS'}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <div className="p-2">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/profile">View Profile</Link>
                        </Button>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">Account</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4 text-amber-600" />
                            <span className="text-amber-700 font-semibold">Try Premium for $0</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings & Privacy</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Help</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Languages className="mr-2 h-4 w-4" />
                            <span>Language</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">Manage</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href="/profile/activity" className="flex items-center w-full">
                                <GanttChartSquare className="mr-2 h-4 w-4" />
                                <span>Posts & Activity</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/profile/saved" className="flex items-center w-full">
                                <Bookmark className="mr-2 h-4 w-4" />
                                <span>Saved posts</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/jobs/manage" className="flex items-center w-full">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Job Posting Account</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
