
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Pencil,
  Globe,
  MessageSquare as MessageIcon,
  Heart as HeartOutline,
  Repeat2,
  Send,
  Plus,
  MoreHorizontal,
  FileText,
  Briefcase,
  GraduationCap
} from 'lucide-react';

type Activity = {
  activity_id: string;
  user_id: string;
  activity_type: string;
  created_at: string;
  related_repost_id?: string;
  post_title?: string;
  post_content?: string;
  post_slug?: string;
  comment_content?: string;
  original_author_name?: string;
  original_author_avatar?: string;
  activity_data: {
    post_id?: string;
    post_title?: string;
    post_content?: string;
    post_slug?: string;
    comment_id?: string;
    comment_content?: string;
    reaction_type?: string;
  };
};

type ProfileInfo = {
  full_name: string | null;
  avatar_url: string | null;
}

type ActivitySectionProps = {
  userId: string;
  isOwnProfile?: boolean;
};

export function ActivitySection({ userId, isOwnProfile = false }: ActivitySectionProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'articles'>('posts');
  const supabase = createClient();

  useEffect(() => {
    fetchProfileAndActivities();
  }, [userId, activeTab]);

  const fetchProfileAndActivities = async () => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfileInfo(profileData);

      // Fetch follower count
      const { count, error: countError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (!countError) setFollowerCount(count || 0);

      let query = supabase
        .from('user_activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activeTab === 'posts') {
        // Fetch both 'post' (forum), 'social_post' (social), and 'repost'
        query = query.in('activity_type', ['post', 'social_post', 'repost']);
      } else if (activeTab === 'comments') {
        query = query.eq('activity_type', 'comment');
      } else if (activeTab === 'articles') {
        query = query.eq('activity_type', 'article');
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Activity</CardTitle>
        </CardHeader>
        <CardContent key="loading-content">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Activity</CardTitle>
            <p className="text-sm font-semibold text-primary hover:underline cursor-pointer">
              {followerCount} followers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full border-primary text-primary font-bold hover:bg-primary/5 px-4 h-9">
              Create a post
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Pencil className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('posts')}
            className={`rounded-full px-5 h-8 text-sm font-bold ${activeTab === 'posts' ? 'bg-emerald-800 hover:bg-emerald-900 border-none' : 'hover:bg-muted'}`}
          >
            Posts
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('comments')}
            className={`rounded-full px-5 h-8 text-sm font-bold ${activeTab === 'comments' ? 'bg-emerald-800 hover:bg-emerald-900 border-none' : 'hover:bg-muted'}`}
          >
            Comments
          </Button>
          <Button
            variant={activeTab === 'articles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('articles')}
            className={`rounded-full px-5 h-8 text-sm font-bold ${activeTab === 'articles' ? 'bg-emerald-800 hover:bg-emerald-900 border-none' : 'hover:bg-muted'}`}
          >
            Articles
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12" key="no-activity">
            {activeTab === 'articles' ? (
              <div className="space-y-3">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="text-lg font-bold text-muted-foreground">Articles Feature Coming Soon!</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  We are building a professional publishing platform for engineers to share in-depth research and technical insights.
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground">No activities yet.</p>
                {isOwnProfile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Start posting or commenting to see your activity here!
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full relative px-2"
          >
            <CarouselContent className="-ml-2">
              {activities.map((activity) => (
                <CarouselItem key={activity.activity_id} className="pl-2 md:basis-[48%]">
                  <div className="h-full py-2">
                    <Card className="h-full flex flex-col border border-border/60 hover:shadow-lg transition-all duration-300">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border border-border/30">
                              <AvatarImage src={profileInfo?.avatar_url || undefined} alt={profileInfo?.full_name || 'User'} />
                              <AvatarFallback className="bg-muted text-lg font-bold">
                                {(profileInfo?.full_name || 'U').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-[14px] hover:underline cursor-pointer truncate">
                                  {profileInfo?.full_name}
                                </p>
                                <span className="text-[14px] text-muted-foreground">• You</span>
                              </div>
                              <p className="text-[12px] text-muted-foreground line-clamp-1 italic">Professional Engineer</p>
                              <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                                <span>{formatDate(activity.created_at)}</span>
                                <span>•</span>
                                <Globe className="h-3 w-3" />
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 py-2 flex-1">
                        <div className="space-y-3">
                          <p className="text-[14px] leading-snug line-clamp-4">
                            {activity.activity_type === 'comment' ? (
                              <span className="italic block mb-2 text-muted-foreground text-[13px]">
                                Commented on "{activity.post_title}"
                              </span>
                            ) : null}
                            {activity.activity_type === 'comment' ? activity.comment_content : activity.post_content}
                          </p>

                          {activity.activity_type === 'repost' && (
                            <div className="border border-border/50 rounded-xl p-3 bg-muted/5 space-y-2 mt-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={activity.original_author_avatar} />
                                  <AvatarFallback className="text-[10px] bg-muted">{activity.original_author_name?.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[13px] font-bold block truncate">{activity.original_author_name}</span>
                                  <span className="text-[11px] text-muted-foreground block line-clamp-1">Professional Member</span>
                                </div>
                              </div>
                              <h4 className="font-bold text-[13px] line-clamp-1">{activity.post_title}</h4>
                              <p className="text-[12px] text-muted-foreground line-clamp-2">
                                {activity.post_content}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <div className="px-4 py-2 flex items-center justify-between border-t border-border/30 mt-auto bg-muted/[0.02]">
                        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground hover:text-emerald-700 h-10 py-1" asChild>
                          <Link href={`/forums/post/${activity.post_slug}${activity.activity_type === 'repost' ? `?repost=${activity.related_repost_id}` : ''}`}>
                            <HeartOutline className="h-5 w-5" />
                            <span className="hidden sm:inline text-[13px] font-semibold">Like</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground hover:text-emerald-700 h-10 py-1" asChild>
                          <Link href={`/forums/post/${activity.post_slug}${activity.activity_type === 'repost' ? `?repost=${activity.related_repost_id}` : ''}`}>
                            <MessageIcon className="h-5 w-5" />
                            <span className="hidden sm:inline text-[13px] font-semibold">Comment</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground hover:text-emerald-700 h-10 py-1" asChild>
                          <Link href={`/forums/post/${activity.post_slug}${activity.activity_type === 'repost' ? `?repost=${activity.related_repost_id}` : ''}`}>
                            <Repeat2 className="h-5 w-5" />
                            <span className="hidden sm:inline text-[13px] font-semibold">Repost</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground hover:text-emerald-700 h-10 py-1" asChild>
                          <Link href={`/forums/post/${activity.post_slug}${activity.activity_type === 'repost' ? `?repost=${activity.related_repost_id}` : ''}`}>
                            <Send className="h-5 w-5 text-muted-foreground" />
                            <span className="hidden sm:inline text-[13px] font-semibold">Send</span>
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 bg-background shadow-md hover:bg-muted border-border/60" />
            <CarouselNext className="-right-4 bg-background shadow-md hover:bg-muted border-border/60" />
          </Carousel>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        <Button variant="link" asChild>
          <Link href={`/users/${userId}/posts`}>Show all posts →</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
