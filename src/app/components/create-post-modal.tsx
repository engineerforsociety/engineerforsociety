'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Code,
  List,
  Image as ImageIcon,
  Smile,
  Video,
  ChevronDown,
  X,
  FileText,
  BarChart2,
  Plus,
  MessageSquare,
  Share2,
  Megaphone,
  HelpCircle,
  Lightbulb,
  Wrench,
  Trophy,
  Users as UsersIcon,
  Search,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Globe,
  Star,
  Settings
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils';


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

// Helper for category icons - More premium feel
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('announce')) return Megaphone;
  if (n.includes('tech') || n.includes('dev')) return Code;
  if (n.includes('idea') || n.includes('suggest')) return Lightbulb;
  if (n.includes('discuss') || n.includes('general')) return Globe;
  if (n.includes('award') || n.includes('win')) return Trophy;
  if (n.includes('question') || n.includes('help')) return HelpCircle;
  if (n.includes('career') || n.includes('job')) return TrendingUp;
  if (n.includes('featured')) return Star;
  return MessageSquare;
}

export function CreatePostModal({ isOpen, onOpenChange, initialType, onSuccess, profile: initialProfile }: CreatePostModalProps) {
  const [internalPostType, setInternalPostType] = useState<'social' | 'forum'>(initialType || 'social');
  const [forumStep, setForumStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState('post');
  const [title, setTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Reset/Sync on open
  useEffect(() => {
    if (isOpen) {
      const type = initialType || 'social';
      setInternalPostType(type);
      setForumStep(1);
      setActiveTab('post');
      setTitle('');
      setPostContent('');
      setVideoLink('');
      setLinkUrl('');
      setImageFiles([]);
      setImagePreviews([]);
      setPollOptions(['', '']);
      setSelectedCategoryId('');
      setSearchQuery('');
    }
  }, [isOpen, initialType]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (data) setCategories(data);
    };
    if (isOpen) fetchCategories();
  }, [isOpen, supabase]);

  // Fetch User & Profile
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
    if (isOpen) getUserAndProfile();
  }, [isOpen, supabase]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handlePost = async () => {
    if (internalPostType === 'forum' && !selectedCategoryId) {
      toast({ title: "Topic required", description: "Please select a forum category.", variant: "destructive" });
      return;
    }
    if (internalPostType === 'forum' && !title.trim()) {
      toast({ title: "Title required", description: "Forum discussions need a clear title.", variant: "destructive" });
      return;
    }
    if (internalPostType === 'social' && !postContent.trim() && imageFiles.length === 0 && !videoLink) {
      toast({ title: "Content required", description: "Please write something or add media to your post.", variant: "destructive" });
      return;
    }

    setIsPosting(true);
    try {
      const userId = user?.id;
      if (!userId) throw new Error("You must be signed in to post.");

      let finalContent = postContent;
      if (activeTab === 'image_video' && videoLink) finalContent += `<p><br></p><p><b>Video:</b> <a href="${videoLink}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${videoLink}</a></p>`;
      if (activeTab === 'link' && linkUrl) finalContent += `<p><br></p><p><b>Link:</b> <a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${linkUrl}</a></p>`;
      if (activeTab === 'poll') {
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length >= 2) finalContent += `\n\n[Poll: ${validOptions.join(', ')}]`;
      }

      const postSlug = (title || postContent.substring(0, 30)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + `-${Date.now()}`;

      if (internalPostType === 'forum') {
        const { error } = await supabase.from('forum_posts').insert({
          content: finalContent,
          title: title,
          category_id: selectedCategoryId,
          author_id: userId,
          slug: postSlug,
          tags: []
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('social_posts').insert({
          content: finalContent || title || 'Untitled Post',
          author_id: userId,
          slug: postSlug
        });
        if (error) throw error;
      }

      if (onSuccess) onSuccess();
      toast({ title: "Successfully posted!", description: internalPostType === 'forum' ? "Your discussion is live in the forum." : "Your update has been shared." });
      onOpenChange(false);

    } catch (error: any) {
      console.error(error);
      toast({ title: "Post failed", description: error.message, variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
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

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) setPostContent(contentEditableRef.current.innerHTML);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Someone';
  const tagline = profile?.tagline;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] bg-white text-zinc-900 border-zinc-200 p-0 gap-0 overflow-hidden shadow-2xl rounded-3xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>Share a social update or start a forum discussion topic.</DialogDescription>
        </DialogHeader>

        {/* Header Navigation */}
        <div className="flex bg-zinc-50 border-b border-zinc-100 p-1 m-4 rounded-2xl flex-shrink-0">
          <button
            onClick={() => setInternalPostType('social')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-base font-bold transition-all",
              internalPostType === 'social' ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            <Share2 className="h-5 w-5" /> Start a post
          </button>
          <button
            onClick={() => {
              setInternalPostType('forum');
              setForumStep(1);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-base font-bold transition-all",
              internalPostType === 'forum' ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            <MessageSquare className="h-5 w-5" /> Forum Post
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="px-8 pb-8 flex-grow overflow-y-auto custom-scrollbar">
          {internalPostType === 'forum' && forumStep === 1 ? (
            /* STEP 1: CHOOSE CATEGORY */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-1 pt-2">
                <h3 className="text-2xl font-black text-zinc-800">Select a Topic</h3>
                <p className="text-zinc-400 font-bold text-base">Where does your discussion fit best?</p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 font-bold" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 bg-zinc-50/50 border-zinc-100 rounded-2xl h-12 text-base font-bold focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar pb-4">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(cat => {
                    const Icon = getCategoryIcon(cat.name);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setForumStep(2);
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white border border-zinc-100 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group text-center active:scale-95"
                      >
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-zinc-50 border border-zinc-50 flex items-center justify-center group-hover:bg-white group-hover:border-blue-100 transition-all">
                          <Icon className="h-6 w-6 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <span className="font-bold text-[14px] text-zinc-600 group-hover:text-blue-600 leading-tight">{cat.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center space-y-3">
                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-7 w-7 text-zinc-200" />
                    </div>
                    <p className="text-zinc-400 font-bold text-base uppercase tracking-widest pl-1">No topics match your search</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* STEP 2 / POST FORM */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* USER PROFILE SECTION */}
              <div className="flex items-center justify-between group pt-2">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-white ring-2 ring-blue-50 shadow-md">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-blue-600 text-white font-black text-lg">{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-lg text-zinc-800">{displayName}</h4>
                      <Badge variant="outline" className="h-6 px-2 text-[10px] font-black uppercase text-blue-600 border-blue-100 bg-blue-50/50">Author</Badge>
                    </div>
                    {tagline && <p className="text-xs font-bold text-zinc-400">{tagline}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-all">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>

              {internalPostType === 'forum' && (
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                  <button
                    onClick={() => setForumStep(1)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50/80 px-4 py-2 rounded-full border border-blue-100 hover:shadow-sm transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" /> Change Topic
                  </button>
                  <span className="text-zinc-200">|</span>
                  <span className="text-zinc-400 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100 flex items-center gap-2">
                    Topic: <strong className="text-zinc-700">{categories.find(c => c.id === selectedCategoryId)?.name}</strong>
                  </span>
                </div>
              )}

              {/* Tabs for content type */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-zinc-100/50 p-1.5 rounded-2xl h-14 flex">
                  <TabsTrigger value="post" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 font-black gap-2 text-sm"><FileText className="h-4 w-4" /> Text</TabsTrigger>
                  <TabsTrigger value="image_video" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 font-black gap-2 text-sm"><ImageIcon className="h-4 w-4" /> Media</TabsTrigger>
                  <TabsTrigger value="link" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 font-black gap-2 text-sm"><LinkIcon className="h-4 w-4" /> Link</TabsTrigger>
                  <TabsTrigger value="poll" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 font-black gap-2 text-sm"><BarChart2 className="h-4 w-4" /> Poll</TabsTrigger>
                </TabsList>

                <div className="mt-8 space-y-6">
                  {/* Title Input */}
                  <Input
                    placeholder={internalPostType === 'forum' ? "Discussion title*" : "Title (optional)"}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-transparent border-0 border-b-2 border-zinc-50 rounded-none px-0 h-14 text-2xl font-black placeholder:text-zinc-200 focus-visible:ring-0 focus-visible:border-blue-500 transition-all"
                  />

                  {/* Tab Content: POST */}
                  <TabsContent value="post" className="mt-0">
                    <div className="min-h-[220px] mt-4">
                      <div
                        ref={contentEditableRef}
                        contentEditable
                        className="min-h-[220px] outline-none text-xl text-zinc-700 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-200 font-medium"
                        data-placeholder={internalPostType === 'forum' ? "Tell us more about it..." : "What do you want to share?"}
                        onInput={(e) => setPostContent(e.currentTarget.innerHTML)}
                      />
                    </div>
                    {/* Inline Formatting Bar */}
                    <div className="flex items-center gap-1.5 border-t border-zinc-50 pt-6">
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-100 rounded-xl transition-colors" onClick={() => execCommand('bold')}><Bold className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-100 rounded-xl transition-colors" onClick={() => execCommand('italic')}><Italic className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-100 rounded-xl transition-colors" onClick={() => execCommand('createLink', prompt('URL:') || '')}><LinkIcon className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-100 rounded-xl transition-colors"><List className="h-5 w-5" /></Button>
                    </div>
                  </TabsContent>

                  {/* Tab Content: Media */}
                  <TabsContent value="image_video" className="mt-0 space-y-4">
                    <div className="border-2 border-zinc-100 rounded-3xl p-10 flex flex-col items-center justify-center bg-zinc-50/40 hover:bg-zinc-50/80 transition-all min-h-[220px]">
                      {imagePreviews.length === 0 && !videoLink ? (
                        <div className="text-center space-y-6">
                          <ImageIcon className="h-12 w-12 text-zinc-200 mx-auto" />
                          <p className="text-base font-black text-zinc-400">Add images or link a video</p>
                          <div className="flex gap-3 justify-center">
                            <Button variant="outline" className="rounded-2xl h-11 px-6 text-sm font-black border-zinc-200 bg-white shadow-sm" onClick={() => fileInputRef.current?.click()}>Upload Media</Button>
                            <Popover>
                              <PopoverTrigger asChild><Button variant="outline" className="rounded-2xl h-11 px-6 text-sm font-black border-zinc-200 bg-white shadow-sm">Video URL</Button></PopoverTrigger>
                              <PopoverContent className="w-80 p-5 rounded-3xl shadow-2xl border-zinc-100 z-[60]">
                                <Input placeholder="Paste Youtube URL..." value={videoLink} onChange={e => setVideoLink(e.target.value)} className="rounded-xl h-12 mb-3 font-bold text-base" />
                                <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest pl-1">Supports YouTube, Vimeo</p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                        </div>
                      ) : (
                        <div className="w-full space-y-4">
                          {imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {imagePreviews.map((url, idx) => (
                                <div key={url} className="relative h-28 w-28 rounded-2xl overflow-hidden group border-2 border-white shadow-lg transition-transform active:scale-95">
                                  <img src={url} className="h-full w-full object-cover" alt="Preview" />
                                  <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-6 w-6 text-white" /></button>
                                </div>
                              ))}
                              <button onClick={() => fileInputRef.current?.click()} className="h-28 w-28 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-300 hover:text-blue-500 hover:border-blue-300 transition-all"><Plus className="h-8 w-8" /></button>
                            </div>
                          )}
                          {videoLink && (
                            <div className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center justify-between shadow-md border-l-4 border-l-red-500">
                              <div className="flex items-center gap-4 overflow-hidden">
                                <div className="h-10 w-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0"><Video className="h-5 w-5" /></div>
                                <span className="text-sm font-black text-blue-600 truncate underline">{videoLink}</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setVideoLink('')} className="text-zinc-300 hover:text-red-500 rounded-full"><X className="h-5 w-5" /></Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab Content: Link */}
                  <TabsContent value="link" className="mt-0">
                    <Textarea
                      placeholder="Paste your URL link here..."
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      className="bg-zinc-50 border-zinc-100 rounded-3xl h-32 font-bold p-6 focus-visible:ring-0 focus-visible:border-blue-500 text-base"
                    />
                  </TabsContent>

                  {/* Tab Content: Poll */}
                  <TabsContent value="poll" className="mt-0">
                    <div className="bg-zinc-50/30 border border-zinc-100 rounded-3xl p-8 space-y-5">
                      <div className="space-y-3.5">
                        {pollOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-3">
                            <Input
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={e => {
                                const n = [...pollOptions]; n[idx] = e.target.value; setPollOptions(n);
                              }}
                              className="bg-white border-zinc-200 font-bold h-12 rounded-2xl text-base px-5"
                            />
                            {idx > 1 && <Button variant="ghost" size="icon" onClick={() => { const n = [...pollOptions]; n.splice(idx, 1); setPollOptions(n); }}><X className="h-5 w-5" /></Button>}
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setPollOptions([...pollOptions, ''])} className="text-blue-600 font-black hover:bg-blue-50 rounded-2xl text-sm px-4 h-10"><Plus className="h-4 w-4 mr-2" /> Add New Option</Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {(internalPostType === 'social' || (internalPostType === 'forum' && forumStep === 2)) && (
          <div className="px-8 py-6 border-t border-zinc-50 flex items-center justify-between bg-zinc-50/20 flex-shrink-0">
            <div className="flex gap-3">
              <span className="h-10 w-10 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-white transition-all"><Smile className="h-5 w-5 text-zinc-400" /></span>
              <Button variant="ghost" className="h-10 rounded-full text-zinc-400 font-black hover:text-zinc-600 text-xs uppercase tracking-widest px-4"><Plus className="h-4 w-4 mr-1.5" /> Add Tags</Button>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full px-8 font-black text-sm text-zinc-400 hover:text-zinc-900 transition-colors">Cancel</Button>
              <Button
                onClick={handlePost}
                disabled={isPosting}
                className="rounded-full px-10 h-12 bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isPosting ? 'Posting...' : internalPostType === 'forum' ? 'Publish Post' : 'Share Update'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
