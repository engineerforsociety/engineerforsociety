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
import { CreditCard, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { sampleUserProfile } from '@/lib/data';
import { cn } from '@/lib/utils';

export function UserNav() {
    const profilePic = PlaceHolderImages.find(p => p.id === 'profile-pic');
  return (
    <div className="flex items-center">
        <Link href="/profile" className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-l-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer h-full'
        )}>
            <Avatar className="h-6 w-6">
                <AvatarImage src={profilePic?.imageUrl} alt={sampleUserProfile.name} data-ai-hint={profilePic?.imageHint} />
                <AvatarFallback>{sampleUserProfile.name.substring(0,2)}</AvatarFallback>
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
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{sampleUserProfile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    alex.doe@example.com
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
