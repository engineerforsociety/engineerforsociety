'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Building,
  GitFork,
  Lightbulb,
  Sigma,
  UserPlus,
  Briefcase,
  Search,
  MessageSquare,
  Filter,
  Users,
  Eye,
  Clock,
  Plus,
  Zap,
  Settings,
  Code,
  FlaskConical,
  Plane,
  Github,
  Puzzle,
  Microscope,
  Globe,
  ChevronUp,
  Shirt,
  Factory,
  UserCheck,
  Laptop,
  Award,
  GraduationCap,
  Leaf,
  Scale,
  AlertTriangle,
  HeartPulse,
  Home,
  PencilRuler,
  BookOpen,
  Binary,
  Layout,
  Map,
  Rocket,
  Mic,
  Coffee,
  Wrench,
  HelpCircle,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreatePostModal } from '@/app/components/create-post-modal';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Map icon strings to components for dynamic rendering
const ICON_MAP: Record<string, any> = {
  'Building': Building,
  'GitFork': GitFork,
  'Lightbulb': Lightbulb,
  'Sigma': Sigma,
  'UserPlus': UserPlus,
  'Briefcase': Briefcase,
  'Zap': Zap,
  'Settings': Settings,
  'Code': Code,
  'FlaskConical': FlaskConical,
  'Plane': Plane,
  'Github': Github,
  'Puzzle': Puzzle,
  'Microscope': Microscope,
  'Globe': Globe,
  'Shirt': Shirt,
  'Factory': Factory,
  'UserCheck': UserCheck,
  'Laptop': Laptop,
  'Award': Award,
  'GraduationCap': GraduationCap,
  'Leaf': Leaf,
  'Scale': Scale,
  'AlertTriangle': AlertTriangle,
  'HeartPulse': HeartPulse,
  'Home': Home,
  'PencilRuler': PencilRuler,
  'BookOpen': BookOpen,
  'Binary': Binary,
  'Layout': Layout,
  'Map': Map,
  'Rocket': Rocket,
  'Mic': Mic,
  'Coffee': Coffee,
  'Wrench': Wrench,
  'HelpCircle': HelpCircle
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  category_group: string;
  post_count?: number;
};

type ForumThread = {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  view_count: number;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_title: string;
  category_name?: string; // We might need to join this in the query or view
  like_count: number;
  comment_count: number;
  tags: string[];
  is_liked: boolean; // Add this to track state
};

export default function ForumsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    // In a real app, you'd also count posts per category here
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', 'true')
      .order('display_order');

    if (data) setCategories(data);
  }, [supabase]);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using feed_posts_view but filtering strictly for Forums
      let query = supabase
        .from('feed_posts_view')
        .select('*')
        .eq('post_type', 'forum')
        .eq('item_type', 'post') // NO REPOSTS
        .order('feed_created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        // The view might not have category_id directly exposed as a top-level column 
        // depending on recent changes, but let's assume valid join or filter via category_slug if available.
        // If the view doesn't have it, we might filter client side or update view. 
        // For now, let's look at what columns we see in previous steps. 
        // feed_posts_view has category_slug from the previous "professional_repost_system.sql" view definition!
        query = query.eq('category_slug', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setThreads(data || []);
    } catch (error: any) {
      console.error('Error loading threads:', error);
      toast({ title: 'Error', description: 'Failed to load discussions.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedCategory, searchQuery, toast]);

  const handleVote = async (e: React.MouseEvent, thread: ForumThread) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    // Optimistic UI update
    const isLiked = thread.is_liked;
    const newCount = isLiked ? Math.max(0, thread.like_count - 1) : thread.like_count + 1;

    setThreads(current =>
      current.map(t =>
        t.id === thread.id
          ? { ...t, is_liked: !isLiked, like_count: newCount }
          : t
      )
    );

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to vote." });
        return;
      }

      if (isLiked) {
        await supabase.from('forum_post_reactions')
          .delete()
          .eq('post_id', thread.id)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like');
      } else {
        await supabase.from('forum_post_reactions')
          .insert({ post_id: thread.id, user_id: user.id, reaction_type: 'like' });
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revert on error
      fetchThreads();
    }
  };

  // Group categories helper
  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.category_group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professional Forums</h1>
          <p className="text-muted-foreground mt-1">
            A space for engineers to share knowledge, ask questions, and collaborate.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Start Discussion
        </Button>
      </div>

      <div className="flex flex-col gap-6">

        {/* Top Section: Search & Categories */}
        <div className="space-y-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 py-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl px-6 h-10 font-bold shadow-sm transition-all"
              onClick={() => setSelectedCategory('all')}
            >
              All Discussions
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              {Object.keys(groupedCategories).sort().map(group => {
                const groupItems = groupedCategories[group];
                const isGroupActive = groupItems.some(cat => cat.slug === selectedCategory);
                const activeCategoryName = groupItems.find(cat => cat.slug === selectedCategory)?.name;

                return (
                  <DropdownMenu key={group}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isGroupActive ? "secondary" : "outline"}
                        size="sm"
                        className={cn(
                          "rounded-xl gap-2 h-10 px-4 border-muted transition-all",
                          isGroupActive ? "bg-primary/10 text-primary border-primary/20 font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {isGroupActive ? (
                          <>
                            <span className="text-[10px] uppercase opacity-60 mr-1">{group}:</span>
                            {activeCategoryName}
                          </>
                        ) : (
                          <>
                            {group}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 rounded-xl p-2 shadow-xl border-muted/50">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">
                        {group} Specializations
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <ScrollArea className="max-h-[300px]">
                        {groupItems.map(cat => {
                          const Icon = ICON_MAP[cat.icon_name] || MessageSquare;
                          return (
                            <DropdownMenuItem
                              key={cat.id}
                              className={cn(
                                "rounded-lg flex items-center gap-3 py-3 cursor-pointer",
                                selectedCategory === cat.slug ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                              )}
                              onClick={() => setSelectedCategory(cat.slug)}
                            >
                              <div className={cn(
                                "p-1.5 rounded-md",
                                selectedCategory === cat.slug ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                              )}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="flex-1">{cat.name}</span>
                              {selectedCategory === cat.slug && <Zap className="h-3 w-3 fill-current" />}
                            </DropdownMenuItem>
                          )
                        })}
                      </ScrollArea>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content: Thread List */}
        <main className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">No discussions found</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a conversation in this category!</p>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>Start Discussion</Button>
            </div>
          ) : (
            threads.map((thread: any) => (
              <Link href={`/forums/post/${thread.slug}`} key={thread.feed_item_id || thread.id}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Vote/Score Column (StackOverflow Style - Interactive) */}
                      <div className="hidden sm:flex flex-col items-center gap-2 text-muted-foreground min-w-[60px]">
                        <button
                          onClick={(e) => handleVote(e, thread)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${thread.is_liked ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                        >
                          <ChevronUp className={`h-6 w-6 ${thread.is_liked ? 'stroke-[3px]' : ''}`} />
                          <span className="text-lg font-bold leading-none">{thread.like_count || 0}</span>
                        </button>

                        <div className={`text-center px-2 py-1 rounded text-xs mt-1 ${thread.comment_count > 0 ? 'bg-muted font-medium' : ''}`}>
                          <span className="block font-bold">{thread.comment_count || 0}</span>
                          <span>ans</span>
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {thread.category_name && (
                            <Badge variant="outline" className="text-xs font-normal">
                              {thread.category_name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(thread.feed_created_at || thread.created_at))} ago
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary">
                          {thread.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {thread.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={thread.author_avatar} />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium hover:underline">
                              {thread.author_name}
                            </span>
                            {thread.author_title && (
                              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                • {thread.author_title}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {thread.view_count || 0} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </main>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        initialType="forum"
        onSuccess={fetchThreads}
      />
    </div >
  );
}
