
'use client';

import { useState, useRef } from 'react';
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
import { useToast } from '@/hooks/use-toast';

type CreatePostModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function CreatePostModal({ isOpen, onOpenChange }: CreatePostModalProps) {
  const profilePic = PlaceHolderImages.find((p) => p.id === 'profile-pic');
  const [postContent, setPostContent] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    console.log('Posting content:', postContent);
    // Here you would typically call an API to save the post
    toast({
      title: "Post created!",
      description: "Your post has been successfully shared.",
    });
    setPostContent('');
    onOpenChange(false);
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        // In a real app, you'd upload this file and get a URL
        console.log('Selected file:', file.name);
        toast({
            title: "Image selected",
            description: `${file.name} is ready to be uploaded.`,
        });
    }
  }
  
  const handleYoutubeClick = () => {
    toast({
      title: "Feature coming soon!",
      description: "Pasting YouTube links will automatically embed videos in a future update.",
    });
  }

  const handleEmojiClick = () => {
      toast({
      title: "Feature coming soon!",
      description: "An emoji picker will be available here.",
    });
  }


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
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleImageClick}><ImageIcon className="text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" onClick={handleYoutubeClick}><Youtube className="text-muted-foreground" /></Button>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleEmojiClick}>
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
          <Button onClick={handlePost} disabled={!postContent.trim()}>Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
