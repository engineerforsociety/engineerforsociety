
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { createClient } from '@/lib/supabase/client';
import {
  Bold,
  Italic,
  Link,
  Code,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Smile,
  Youtube,
  ChevronLeft,
  X
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Category = {
  id: string;
  name: string;
  category_group?: string;
  display_order?: number;
  is_active?: boolean;
};

type CreatePostModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialType?: 'social' | 'forum';
  onSuccess?: () => void;
  profile?: any;
};

export function CreatePostModal({ isOpen, onOpenChange, initialType, onSuccess, profile: initialProfile }: CreatePostModalProps) {
  // Use a default icon or null instead of the dummy Unsplash placeholder
  const [postContent, setPostContent] = useState('');
  const [title, setTitle] = useState('');
  const [postType, setPostType] = useState<'social' | 'forum'>(initialType || 'social');
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setPostType(initialType || 'social');
    setStep(1);
  }, [initialType, isOpen]);

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
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (data) {
        setCategories(data);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen, supabase]);

  // Clean up blob URLs when component unmounts or isOpen changes
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

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
  }, [isOpen, supabase, initialProfile]);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  /* HTML to Markdown converter helper */
  const htmlToMarkdown = (html: string) => {
    let text = html;
    // Replace breaks with newlines
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<div>/gi, '\n');
    text = text.replace(/<\/div>/gi, '');

    // Bold
    text = text.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    text = text.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');

    // Italic
    text = text.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    text = text.replace(/<em>(.*?)<\/em>/gi, '*$1*');

    // Links
    text = text.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');

    // Clean up HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');

    return text.trim();
  };

  /* State for toolbar active styling */
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const checkFormats = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
  };

  /* Textarea replacement with ContentEditable */
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) {
      setPostContent(contentEditableRef.current.innerText); // Store raw text for validation
    }
    checkFormats();
    contentEditableRef.current?.focus();
  };

  const handlePost = async () => {
    // Get content from contentEditable
    const htmlContent = contentEditableRef.current?.innerHTML || '';
    const markdownContent = htmlToMarkdown(htmlContent);

    if (!markdownContent.trim()) {
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

      const postSlug = (postType === 'forum' ? title : markdownContent.substring(0, 50))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + `-${Date.now()}`;

      if (postType === 'forum') {
        if (!title.trim()) throw new Error("Title is required for discussions.");
        if (!selectedCategoryId) throw new Error("Please select a topic.");

        const { error } = await supabase.from('forum_posts').insert({
          content: markdownContent,
          title: title,
          category_id: selectedCategoryId,
          author_id: user.id,
          slug: postSlug,
          tags: []
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('social_posts').insert({
          content: markdownContent,
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

      // Reset content
      if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
      setPostContent('');
      setTitle('');
      setSelectedCategoryId('');
      setImageFiles([]);
      setImagePreviews([]);
      setStep(1);
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

  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.category_group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...newPreviews]);

      toast({
        title: `${files.length} image(s) selected`,
        description: "Images are ready to be attached to your post.",
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index]);
      updated.splice(index, 1);
      return updated;
    });
    setImageFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleLinkClick = () => {
    const url = window.prompt("Enter the URL:");
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      execCommand('createLink', formattedUrl);
    }
  };

  const handleLinkSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (linkUrl) {
      const formattedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      execCommand('createLink', formattedUrl);
      setLinkUrl('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    execCommand('insertText', emoji);
  };

  const handleYoutubeClick = () => {
    const url = window.prompt("Enter YouTube video URL:");
    if (url) {
      // Ideally we'd insert an embed, but for markdown compatibility let's insert a link or placeholder
      execCommand('insertText', ` [YouTube Video](${url}) `);
    }
  };

  const COMMON_EMOJIS = ['😊', '😂', '🥰', '👍', '🔥', '🙌', '🎉', '🚀', '🤔', '👀', '✨', '💻', '💡', '✅'];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${postType === 'forum' && step === 1 ? 'sm:max-w-[800px]' : 'sm:max-w-[625px]'} transition-all duration-300`}>
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
                    onClick={() => {
                      setPostType('social');
                      setStep(1);
                    }}
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
            {postType === 'forum' && step === 2 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs h-8 gap-1 pr-3">
                <ChevronLeft className="h-4 w-4" /> Change Topic
              </Button>
            )}
          </div>
        </DialogHeader>

        {postType === 'forum' && step === 1 ? (
          <div className="py-4 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">What will your discussion be about?</h2>
              <p className="text-sm text-muted-foreground">Select a professional niche to help other engineers discover your content.</p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              {Object.keys(groupedCategories).sort().map(group => (
                <div key={group} className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-[0.2em]">{group}</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {groupedCategories[group].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${selectedCategoryId === cat.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                          : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground hover:border-border'
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-8">
              <Button
                variant="default"
                className="rounded-full px-12 h-11 font-bold shadow-lg"
                disabled={!selectedCategoryId}
                onClick={() => setStep(2)}
              >
                Continue to Post
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="py-2 space-y-4">
              {postType === 'forum' && (
                <div className="space-y-4 px-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-full px-3 py-1 font-bold">
                      #{selectedCategory?.name}
                    </Badge>
                  </div>
                  <input
                    type="text"
                    placeholder="Title of your discussion..."
                    className="w-full text-3xl font-extrabold border-none focus-visible:outline-none placeholder:text-muted-foreground/20 bg-transparent tracking-tight"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                  <Separator className="opacity-50" />
                </div>
              )}

              {/* WYSIWYG Editor Area */}
              <div
                className="min-h-[250px] relative cursor-text"
                onClick={() => contentEditableRef.current?.focus()}
              >
                <div
                  ref={contentEditableRef}
                  contentEditable
                  className="min-h-[250px] w-full border-none focus:outline-none text-lg resize-none leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  data-placeholder={postType === 'forum' ? "Start the conversation here..." : "What's on your mind today?"}
                  onInput={(e) => {
                    setPostContent(e.currentTarget.innerText);
                    checkFormats();
                  }}
                  onKeyUp={checkFormats}
                  onMouseUp={checkFormats}
                  onKeyDown={(e) => {
                    // Basic support for keyboard shortcuts if needed, browser handles most ctrl+b/i natively
                  }}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                />
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                  {imagePreviews.map((url, idx) => (
                    <div key={url} className="relative group rounded-lg overflow-hidden border border-border/50 bg-muted/50">
                      <img src={url} alt="Preview" className="h-24 w-24 object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            <div className="flex items-center justify-between bg-muted/20 p-2.5 rounded-xl border border-border/10">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleImageClick} className="hover:bg-background h-9 w-9" title="Add Image"><ImageIcon className="h-5 w-5 text-primary" /></Button>

                <Button
                  variant={isBold ? "default" : "ghost"}
                  size="icon"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('bold')}
                  className={`h-9 w-9 transition-all ${isBold ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20' : 'hover:bg-background'}`}
                  title="Bold text"
                >
                  <Bold className="h-4 w-4" />
                </Button>

                <Button
                  variant={isItalic ? "default" : "ghost"}
                  size="icon"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('italic')}
                  className={`h-9 w-9 transition-all ${isItalic ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20' : 'hover:bg-background'}`}
                  title="Italic text"
                >
                  <Italic className="h-4 w-4" />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-background h-9 w-9" title="Add link">
                      <Link className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" side="top" align="start">
                    <form onSubmit={(e: React.FormEvent) => handleLinkSubmit(e)} className="flex gap-2">
                      <Input
                        placeholder="Paste or type a link..."
                        value={linkUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
                        className="h-9 focus-visible:ring-1"
                        autoFocus
                      />
                      <Button type="submit" size="sm" className="h-9 px-4">Add</Button>
                    </form>
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand('insertHTML', '<code>' + window.getSelection() + '</code>')} className="hover:bg-background h-9 w-9" title="Code snippet"><Code className="h-4 w-4" /></Button>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-background h-9 rounded-full px-4">
                    <Smile className="mr-2 h-4 w-4 text-amber-500" />
                    Emoji
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="grid grid-cols-7 gap-1">
                    {COMMON_EMOJIS.map(emoji => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        className="h-8 w-8 p-0 text-lg"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <DialogFooter className="mt-8">
              <Button
                onClick={handlePost}
                disabled={!postContent.trim() || (postType === 'forum' && !title.trim()) || isPosting}
                className="rounded-full px-12 h-11 font-extrabold shadow-xl hover:scale-105 transition-transform"
              >
                {isPosting ? 'Publishing...' : postType === 'forum' ? 'Post to Community' : 'Share Post'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
