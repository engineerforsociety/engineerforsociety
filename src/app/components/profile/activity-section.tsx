
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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  MessageSquare, 
  FileText,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type Activity = {
  activity_id: string;
  user_id: string;
  activity_type: string;
  created_at: string;
  activity_data: {
    post_id?: string;
    post_title?: string;
    post_content?: string;
    post_slug?: string;
    comment_id?: string;
    comment_content?: string;
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'comments'>('posts');
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

      let query = supabase
        .from('user_activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(15);

      if (activeTab === 'posts') {
        query = query.eq('activity_type', 'post');
      } else if (activeTab === 'comments') {
        query = query.eq('activity_type', 'comment');
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
        <CardContent>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Activity</CardTitle>
          <p className="text-sm text-muted-foreground">{activities.length} activities</p>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('all')}
          >
            All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activities yet.</p>
            {isOwnProfile && (
              <p className="text-sm text-muted-foreground mt-2">
                Start posting or commenting to see your activity here!
              </p>
            )}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent>
              {activities.map((activity) => (
                <CarouselItem key={activity.activity_id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                       <CardHeader>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profileInfo?.avatar_url || undefined} alt={profileInfo?.full_name || 'User'} />
                              <AvatarFallback>
                                {(profileInfo?.full_name || 'U').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                               <p className="font-semibold text-sm">{profileInfo?.full_name}</p>
                               <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-auto"><MoreHorizontal className="h-4 w-4"/></Button>
                          </div>
                       </CardHeader>
                      <CardContent>
                         {activity.activity_type === 'post' && activity.activity_data.post_title && (
                             <div className="space-y-2">
                                <Link href={`/forums/post/${activity.activity_data.post_slug || activity.activity_data.post_id}`}>
                                    <h4 className="font-semibold text-sm hover:underline">{activity.activity_data.post_title}</h4>
                                </Link>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {activity.activity_data.post_content}
                                </p>
                             </div>
                         )}
                          {activity.activity_type === 'comment' && activity.activity_data.comment_content && (
                             <div className="space-y-2">
                               <p className="text-sm text-muted-foreground italic">commented on: 
                                    <Link href={`/forums/post/${activity.activity_data.post_slug}`} className="font-semibold text-primary/80 hover:underline ml-1">
                                        {activity.activity_data.post_title}
                                    </Link>
                                </p>
                               <p className="text-sm line-clamp-3">{activity.activity_data.comment_content}</p>
                             </div>
                         )}
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
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
