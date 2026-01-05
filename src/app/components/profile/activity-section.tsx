
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Repeat2, 
  Briefcase, 
  GraduationCap, 
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
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'comments'>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchProfileAndActivities();
  }, [userId, activeTab]);

  const fetchProfileAndActivities = async () => {
    setLoading(true);
    try {
      // Fetch profile info first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      setProfileInfo(profileData);

      // Then fetch activities
      let query = supabase
        .from('user_activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'post':
        return 'posted';
      case 'comment':
        return 'commented on';
      default:
        return 'performed an action';
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
          {activities.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </Badge>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-4 border-b">
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className={`rounded-none border-b-2 ${activeTab === 'all' ? 'border-primary' : 'border-transparent'} hover:border-primary/50`}
          >
            All
          </Button>
          <Button
            variant={activeTab === 'posts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('posts')}
            className={`rounded-none border-b-2 ${activeTab === 'posts' ? 'border-primary' : 'border-transparent'} hover:border-primary/50`}
          >
            Posts
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('comments')}
            className={`rounded-none border-b-2 ${activeTab === 'comments' ? 'border-primary' : 'border-transparent'} hover:border-primary/50`}
          >
            Comments
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
          activities.map((activity) => (
            <div key={activity.activity_id} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profileInfo?.avatar_url || undefined} alt={profileInfo?.full_name || 'User'} />
                  <AvatarFallback>
                    {(profileInfo?.full_name || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.activity_type)}
                    <span className="font-semibold">{profileInfo?.full_name || 'User'}</span>
                    <span className="text-muted-foreground text-sm">
                      {getActivityText(activity)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  
                  {/* Post Content */}
                  {activity.activity_data.post_title && (
                    <div className="bg-muted/50 rounded-lg p-3 mt-2 border-l-4 border-primary">
                      <Link 
                        href={`/forums/post/${activity.activity_data.post_slug || activity.activity_data.post_id}`}
                        className="hover:underline"
                      >
                        <h4 className="font-semibold text-sm mb-1">{activity.activity_data.post_title}</h4>
                      </Link>
                      {activity.activity_data.post_content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {activity.activity_data.post_content}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Comment Content */}
                  {activity.activity_data.comment_content && (
                     <div className="bg-muted/50 rounded-lg p-3 mt-2 border-l-4 border-green-500">
                        <p className="text-sm text-muted-foreground italic mb-2">commented on: 
                            <Link href={`/forums/post/${activity.activity_data.post_slug}`} className="font-semibold text-primary/80 hover:underline ml-1">
                                {activity.activity_data.post_title}
                            </Link>
                        </p>
                       <p className="text-sm">{activity.activity_data.comment_content}</p>
                     </div>
                  )}

                </div>
              </div>
              <Separator />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
