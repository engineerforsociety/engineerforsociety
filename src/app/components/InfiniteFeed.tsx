'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { getSmartFeedAction } from '@/app/actions/smart-feed-actions';

interface InfiniteFeedProps {
    initialPosts: any[];
    currentUser: User | null;
    profile: any;
    PostCardComponent: any;
    onPostClick: (post: any) => void;
    onEdit: (post: any) => void;
}

export function InfiniteFeed({
    initialPosts,
    currentUser,
    profile,
    PostCardComponent,
    onPostClick,
    onEdit
}: InfiniteFeedProps) {
    const [posts, setPosts] = useState<any[]>(initialPosts);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialPosts.length >= 10); // Only false if initial load has less than 10
    const [seenIds, setSeenIds] = useState<string[]>(
        initialPosts.map(p => p.id) // Use raw ID, not feed_item_id for tracking
    );

    const observerTarget = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        console.log(`🧠 Smart Feed: Loading page ${page}...`);
        setLoading(true);
        try {
            // Pass the currently visible/seen IDs to the backend so it knows what to exclude (duplicate session filtering)
            // AND the backend will also check DB for historically seen items
            const result = await getSmartFeedAction(page, 10, seenIds);

            console.log(`📦 Received ${result.posts.length} posts`);

            if (result.posts.length > 0) {
                setPosts(prev => {
                    // Use a Map to ensure unique IDs (using feed_item_id which is type + id)
                    const postMap = new Map();
                    prev.forEach(p => postMap.set(p.feed_item_id, p));
                    result.posts.forEach(p => postMap.set(p.feed_item_id, p));
                    return Array.from(postMap.values());
                });

                const newIds = result.posts.map(p => p.id);
                setSeenIds(prev => [...new Set([...prev, ...newIds])]);
                setPage(prev => prev + 1);

                if (result.posts.length < 10) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more posts:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, seenIds]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    console.log('👀 Approaching bottom, pre-fetching next batch...');
                    loadMore();
                }
            },
            {
                threshold: 0,
                rootMargin: '1000px' // Start loading more 1000px before reaching the bottom
            }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [loadMore, hasMore, loading]);

    return (
        <>
            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCardComponent
                        key={post.feed_item_id || post.id}
                        post={post}
                        currentUserId={currentUser?.id}
                        onPostClick={onPostClick}
                        onEdit={onEdit}
                    />
                ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="py-8 flex justify-center">
                {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Finding fresh content for you...</span>
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <p className="text-sm text-muted-foreground">You've reached the end!</p>
                )}
                {posts.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground">No posts available</p>
                )}
            </div>
        </>
    );
}
