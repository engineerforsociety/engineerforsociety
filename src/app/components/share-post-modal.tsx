'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Repeat2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type SharePostModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  postId: string;
  currentUserId: string;
  onRepost?: () => void;
  isRepost?: boolean;
  repostId?: string;
};

type Follower = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
};

export function SharePostModal({ isOpen, onOpenChange, postId, currentUserId, onRepost, isRepost, repostId }: SharePostModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState<Set<string>>(new Set());
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && currentUserId) {
      fetchFollowers();
    } else {
      setSelectedFollowers(new Set());
    }
  }, [isOpen, currentUserId]);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      // Get users who are following the current user
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          profiles!user_follows_follower_id_fkey (
            id,
            full_name,
            avatar_url,
            job_title
          )
        `)
        .eq('following_id', currentUserId);

      if (error) throw error;

      const followersList = (data || [])
        .map((item: any) => item.profiles)
        .filter((profile: any) => profile !== null);

      setFollowers(followersList);
    } catch (error: any) {
      console.error('Error fetching followers:', error);
      toast({
        title: "Error",
        description: "Failed to load followers.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollower = (followerId: string) => {
    const newSelected = new Set(selectedFollowers);
    if (newSelected.has(followerId)) {
      newSelected.delete(followerId);
    } else {
      newSelected.add(followerId);
    }
    setSelectedFollowers(newSelected);
  };

  const handleShareToFollowers = async () => {
    if (selectedFollowers.size === 0) {
      toast({
        title: "No selection",
        description: "Please select at least one follower to share with.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create share records for each selected follower
      const shareRecords = Array.from(selectedFollowers).map(followerId => ({
        post_id: postId,
        user_id: followerId,
        share_type: 'message',
        is_from_repost: !!isRepost,
        repost_id: isRepost ? repostId : null
      }));

      const { error } = await supabase
        .from('forum_post_shares')
        .insert(shareRecords);

      if (error) throw error;

      toast({
        title: "Shared!",
        description: `Post shared with ${selectedFollowers.size} ${selectedFollowers.size === 1 ? 'person' : 'people'}.`
      });

      setSelectedFollowers(new Set());
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share post.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRepost = async () => {
    if (onRepost) {
      onRepost();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Share with your followers ({followers.length})
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No followers yet. Share this post to your profile instead!
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedFollowers.has(follower.id)
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                        }`}
                      onClick={() => handleToggleFollower(follower.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={follower.avatar_url || undefined} alt={follower.full_name || 'User'} />
                        <AvatarFallback>
                          {(follower.full_name || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{follower.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{follower.job_title || 'User'}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {follower.id.substring(0, 8)}...
                      </div>
                      {selectedFollowers.has(follower.id) && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleShareToFollowers}
              disabled={loading || selectedFollowers.size === 0}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Share with {selectedFollowers.size > 0 ? `${selectedFollowers.size} ` : ''}Selected
            </Button>

            <Button
              onClick={handleRepost}
              variant="outline"
              className="w-full"
            >
              <Repeat2 className="mr-2 h-4 w-4" />
              Repost to your profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

