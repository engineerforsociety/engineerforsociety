
'use client';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sampleUserProfile } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Bold, Italic, Link, Code, List, ListOrdered, Quote, Image as ImageIcon, Smile, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type CreatePostModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function CreatePostModal({ isOpen, onOpenChange }: CreatePostModalProps) {
  const profilePic = PlaceHolderImages.find((p) => p.id === 'profile-pic');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profilePic?.imageUrl} alt={sampleUserProfile.name} />
              <AvatarFallback>{sampleUserProfile.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-base font-semibold">{sampleUserProfile.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">Post to anyone</p>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="What do you want to talk about?"
            className="min-h-[200px] border-none focus-visible:ring-0 text-base"
          />
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><ImageIcon className="text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon"><Youtube className="text-muted-foreground" /></Button>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Smile className="mr-2 h-4 w-4" />
                Emoji
            </Button>
        </div>
        <Separator />
        <div className="flex items-center gap-2 py-2">
            <Button variant="ghost" size="icon"><Bold /></Button>
            <Button variant="ghost" size="icon"><Italic /></Button>
            <Button variant="ghost" size="icon"><Link /></Button>
            <Button variant="ghost" size="icon"><Code /></Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="icon"><List /></Button>
            <Button variant="ghost" size="icon"><ListOrdered /></Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="icon"><Quote /></Button>
        </div>
        <DialogFooter>
          <Button disabled>Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
