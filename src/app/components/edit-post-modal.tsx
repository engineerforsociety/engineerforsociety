
'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createClient } from '@/lib/supabase/client';
import { Bold, Italic, Link, Code, List, ListOrdered, Quote, Image as ImageIcon, Smile, Youtube, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

type EditPostModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    post: {
        id: string;
        content: string;
        title: string;
    };
    onSuccess?: () => void;
};

export function EditPostModal({ isOpen, onOpenChange, post, onSuccess }: EditPostModalProps) {
    const profilePic = PlaceHolderImages.find((p) => p.id === 'profile-pic');
    const [postContent, setPostContent] = useState(post.content);
    const [isUpdating, setIsUpdating] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    useEffect(() => {
        setPostContent(post.content);
    }, [post]);

    // Safety cleanup for pointer-events
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                document.body.style.pointerEvents = '';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

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

    const handleUpdate = async () => {
        if (!postContent.trim()) {
            toast({
                title: "Content required",
                description: "Please write something before updating.",
                variant: "destructive"
            });
            return;
        }
        setIsUpdating(true);

        try {
            const title = postContent.substring(0, 50) + (postContent.length > 50 ? '...' : '');

            const { error } = await supabase.from('forum_posts').update({
                content: postContent,
                title: title,
                updated_at: new Date().toISOString(),
            }).eq('id', post.id);

            if (error) throw error;

            if (onSuccess) onSuccess();

            toast({
                title: "Post updated!",
                description: "Your post has been successfully updated.",
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error updating post",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-base font-semibold">Edit Post</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">Editing your contribution</DialogDescription>
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
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isUpdating}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={!postContent.trim() || isUpdating}>
                        {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
