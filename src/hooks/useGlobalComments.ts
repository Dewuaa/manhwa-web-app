'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GlobalComment {
  id: string;
  user_id: string;
  manhwa_id: string;
  chapter_id: string | null;
  content: string;
  likes: number;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  } | null;
  liked_by_user?: boolean;
}

interface UseGlobalCommentsOptions {
  limit?: number;
}

export function useGlobalComments({ limit = 50 }: UseGlobalCommentsOptions = {}) {
  const [comments, setComments] = useState<GlobalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabaseClient();
  const isMounted = useRef(true);
  const offsetRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchComments = useCallback(
    async (reset = false) => {
      if (!supabase) {
        setLoading(false);
        if (isConfigured) {
          setError('Comments are not available');
        }
        return;
      }

      if (reset) {
        offsetRef.current = 0;
        setComments([]);
        setHasMore(true);
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch recent comments across all manhwa (excluding replies)
        const { data, error: fetchError } = await supabase
          .from('comments')
          .select(
            `
            id,
            user_id,
            manhwa_id,
            chapter_id,
            content,
            likes,
            created_at,
            profiles:user_id (
              id,
              username,
              avatar_url,
              level
            )
          `
          )
          .is('parent_id', null) // Only top-level comments
          .order('created_at', { ascending: false })
          .range(offsetRef.current, offsetRef.current + limit - 1);

        if (fetchError) throw fetchError;

        if (!isMounted.current) return;

        if (!data || data.length === 0) {
          setHasMore(false);
          setLoading(false);
          return;
        }

        // Check if user has liked these comments
        let userLikes = new Set<string>();
        if (user) {
          const commentIds = data.map((c) => c.id);
          const { data: likesData } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', user.id)
            .in('comment_id', commentIds);

          if (likesData) {
            userLikes = new Set(likesData.map((l) => l.comment_id));
          }
        }

        const processedComments: GlobalComment[] = data.map((comment) => ({
          ...comment,
          liked_by_user: userLikes.has(comment.id),
        }));

        if (reset) {
          setComments(processedComments);
        } else {
          setComments((prev) => [...prev, ...processedComments]);
        }

        offsetRef.current += data.length;
        setHasMore(data.length === limit);
      } catch (err) {
        console.error('Error fetching global comments:', err);
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to load comments');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [supabase, limit, user, isConfigured]
  );

  // Fetch on mount
  useEffect(() => {
    fetchComments(true);
  }, [fetchComments]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchComments(false);
    }
  }, [loading, hasMore, fetchComments]);

  const toggleLike = async (commentId: string) => {
    if (!supabase || !user) {
      return { error: 'You must be logged in to like comments' };
    }

    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return { error: 'Comment not found' };

    const isLiked = comment.liked_by_user;

    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: isLiked ? c.likes - 1 : c.likes + 1,
              liked_by_user: !isLiked,
            }
          : c
      )
    );

    try {
      if (isLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        await supabase.rpc('decrement_likes', { comment_id: commentId });
      } else {
        await supabase
          .from('comment_likes')
          .insert({ user_id: user.id, comment_id: commentId });
        await supabase.rpc('increment_likes', { comment_id: commentId });
      }
      return { error: null };
    } catch (err) {
      // Rollback
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: isLiked ? c.likes + 1 : c.likes - 1,
                liked_by_user: isLiked,
              }
            : c
        )
      );
      return { error: err instanceof Error ? err.message : 'Failed to toggle like' };
    }
  };

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    toggleLike,
    refetch: () => fetchComments(true),
  };
}
