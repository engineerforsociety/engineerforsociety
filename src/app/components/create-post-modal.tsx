
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createClient } from '@/lib/supabase/client';
import { Bold, Italic, Link, Code, List, ListOrdered, Quote, Image as ImageIcon, Smile, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

type CreatePostModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialType?: 'social' | 'forum';
  onSuccess?: () => void;
};

export function CreatePostModal({ isOpen, onOpenChange, initialType, onSuccess }: CreatePostModalProps) {
  const profilePic = PlaceHolderImages.find((p) => p.id === 'profile-pic');
  const [postContent, setPostContent] = useState('');
  const [title, setTitle] = useState('');
  const [postType, setPostType] = useState<'social' | 'forum'>(initialType || 'social');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setPostType(initialType || 'social');
  }, [initialType, isOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('forum_categories').select('*').eq('is_active', true).order('display_order');
      if (data) {
        setCategories(data);
        if (data.length > 0) setSelectedCategoryId(data[0].id);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen, supabase]);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };

    if (isOpen) {
      getUserAndProfile();
    }
  }, [isOpen, supabase]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || profilePic?.imageUrl;

  const handlePost = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before posting.",
        variant: "destructive"
      });
      return;
    }
    setIsPosting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to post.");

      const postSlug = (postType === 'forum' ? title : postContent.substring(0, 50))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + `-${Date.now()}`;

      if (postType === 'forum') {
        if (!title.trim()) throw new Error("Title is required for discussions.");
        if (!selectedCategoryId) throw new Error("Please select a category.");

        const { error } = await supabase.from('forum_posts').insert({
          content: postContent,
          title: title,
          category_id: selectedCategoryId,
          author_id: user.id,
          slug: postSlug,
          tags: []
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('social_posts').insert({
          content: postContent,
          author_id: user.id,
          slug: postSlug
        });
        if (error) throw error;
      }

      if (onSuccess) onSuccess();

      toast({
        title: postType === 'forum' ? "Discussion started!" : "Post shared!",
        description: "Your content is now live in the community feed.",
      });
      setPostContent('');
      setTitle('');
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
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-base font-semibold">{displayName}</DialogTitle>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={postType === 'social' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs rounded-full"
                    onClick={() => setPostType('social')}
                  >
                    Post
                  </Button>
                  <Button
                    variant={postType === 'forum' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs rounded-full"
                    onClick={() => setPostType('forum')}
                  >
                    Discussion
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="py-2 space-y-4">
          {postType === 'forum' && (
            <div className="space-y-3 px-1">
              <input
                type="text"
                placeholder="Discussion Title"
                className="w-full text-xl font-bold border-none focus-visible:outline-none placeholder:text-muted-foreground/50 bg-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select
                className="text-xs bg-muted border-none rounded-md px-2 py-1 outline-none text-muted-foreground hover:bg-muted/80 transition-colors"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Separator />
            </div>
          )}
          <Textarea
            placeholder={postType === 'forum' ? "Start the discussion..." : "What do you want to talk about?"}
            className="min-h-[200px] border-none focus-visible:ring-0 text-base resize-none"
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
