
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

import { Input } from '@/components/ui/input';

type EditPostModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    post: {
        id: string;
        content: string;
        title: string;
        post_type?: 'social' | 'forum';
    };
    onSuccess?: () => void;
};

export function EditPostModal({ isOpen, onOpenChange, post, onSuccess }: EditPostModalProps) {
    const profilePic = PlaceHolderImages.find((p) => p.id === 'profile-pic');
    const [postContent, setPostContent] = useState(post.content);
    const [title, setTitle] = useState(post.title || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const { toast } = useToast();
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            // Give a small delay for the Radix Dialog portal/content to mount
            const timer = setTimeout(() => {
                if (contentEditableRef.current) {
                    contentEditableRef.current.innerHTML = post.content;
                    setPostContent(post.content);
                }
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [isOpen, post.content]);

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
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

    const handleUpdate = async () => {
        if (!postContent.trim()) {
            toast({
                title: "Content required",
                description: "Please write something before updating.",
                variant: "destructive"
            });
            return;
        }

        if (post.post_type === 'forum' && !title.trim()) {
            toast({
                title: "Title required",
                description: "Forum posts must have a title.",
                variant: "destructive"
            });
            return;
        }

        setIsUpdating(true);

        try {
            if (post.post_type === 'social') {
                const { error } = await supabase.from('social_posts').update({
                    content: postContent,
                    updated_at: new Date().toISOString(),
                }).eq('id', post.id);

                if (error) throw error;
            } else {
                // Default to forum posts if generic or specified
                const { error } = await supabase.from('forum_posts').update({
                    content: postContent,
                    title: title,
                    updated_at: new Date().toISOString(),
                }).eq('id', post.id);

                if (error) throw error;
            }

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
                <div className="py-4 space-y-4">
                    {post.post_type === 'forum' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground px-1">Title</label>
                            <Input
                                placeholder="Discussion title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="text-lg font-bold border-none px-1 h-auto focus-visible:ring-0 placeholder:text-zinc-200"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        {post.post_type === 'forum' && <label className="text-xs font-bold uppercase text-muted-foreground px-1">Content</label>}
                        <div
                            ref={contentEditableRef}
                            contentEditable
                            className="min-h-[220px] max-h-[400px] overflow-y-auto outline-none text-xl text-foreground leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground font-medium p-2 border border-transparent focus:border-blue-100 rounded-xl transition-all"
                            data-placeholder="What do you want to talk about?"
                            onInput={(e) => setPostContent(e.currentTarget.innerHTML)}
                        />
                    </div>

                    {/* Inline Formatting Bar */}
                    <div className="flex items-center gap-1.5 border-t border-zinc-50 pt-4 mt-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-zinc-100 rounded-lg transition-colors" onClick={() => { document.execCommand('bold'); if (contentEditableRef.current) setPostContent(contentEditableRef.current.innerHTML); }}><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-zinc-100 rounded-lg transition-colors" onClick={() => { document.execCommand('italic'); if (contentEditableRef.current) setPostContent(contentEditableRef.current.innerHTML); }}><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-zinc-100 rounded-lg transition-colors" onClick={() => {
                            const url = prompt('URL:');
                            if (url) {
                                document.execCommand('createLink', false, url);
                                if (contentEditableRef.current) setPostContent(contentEditableRef.current.innerHTML);
                            }
                        }}><Link className="h-4 w-4" /></Button>
                    </div>
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
