
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
import { createClient } from '@/lib/supabase/client';
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
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handlePost = async () => {
    if (!postContent.trim()) return;
    setIsPosting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to post.",
          variant: "destructive"
        });
        setIsPosting(false);
        return;
      }

      // Default category fallback (assuming 'general' exists or fetch first one)
      // For now we will just insert without category if constraint allows, or we need to query categories first.
      // Based on schema `category_id` is NOT NULL. We need a category. 
      // Ideally we fetch categories, but for MVP let's assume one exists or prompt user.
      // Let's create a 'General' category via SQL if not exists, but here we'll try to fetch one.

      // Quick fix: Fetch the first category available
      const { data: categories } = await supabase.from('forum_categories').select('id').limit(1);
      const categoryId = categories?.[0]?.id;

      if (!categoryId) {
        toast({
          title: "Error",
          description: "No forum categories found. Please contact admin.",
          variant: "destructive"
        });
        setIsPosting(false);
        return;
      }

      const { error } = await supabase.from('forum_posts').insert({
        content: postContent,
        title: postContent.substring(0, 50) + (postContent.length > 50 ? '...' : ''), // Derive title from content for now
        category_id: categoryId,
        author_id: user.id,
        slug: `post-${Date.now()}`, // Simple slug generation
        tags: [], // Empty tags for now
      });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been successfully shared.",
      });
      setPostContent('');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
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
          <Button onClick={handlePost} disabled={!postContent.trim() || isPosting}>
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
