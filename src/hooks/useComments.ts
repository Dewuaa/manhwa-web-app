'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { CommentWithProfile } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseCommentsOptions {
  manhwaId: string;
  chapterId?: string;
}

export function useComments({ manhwaId, chapterId }: UseCommentsOptions) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabaseClient();
  const hasFetched = useRef(false);
  const lastFetchKey = useRef('');

  const fetchComments = useCallback(
    async (force = false) => {
      const fetchKey = `${manhwaId}-${chapterId}`;

      // Skip if already fetched for this manhwa/chapter unless forced
      if (!force && hasFetched.current && lastFetchKey.current === fetchKey) {
        return;
      }

      if (!supabase) {
        setLoading(false);
        setError('Comments are not available');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching comments for manhwa:', manhwaId, 'chapter:', chapterId);
        let query = supabase
          .from('comments')
          .select(
            `
          *,
          profiles (
            id,
            username,
            avatar_url,
            level
          )
        `,
          )
          .eq('manhwa_id', manhwaId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        // Filter by chapter_id: if chapterId provided, get chapter comments
        // If no chapterId, get only manhwa-level comments (where chapter_id is null)
        if (chapterId) {
          query = query.eq('chapter_id', chapterId);
        } else {
          query = query.is('chapter_id', null);
        }

        const { data: commentsData, error: commentsError } = await query;
        console.log('Comments response:', { data: commentsData, error: commentsError });

        if (commentsError) throw commentsError;

        // Fetch replies for each comment
        const commentsWithReplies: CommentWithProfile[] = await Promise.all(
          (commentsData || []).map(async (comment) => {
            let replies: any[] = [];
            try {
              const { data: repliesData } = await supabase
                .from('comments')
                .select(
                  `
                *,
                profiles (
                  id,
                  username,
                  avatar_url,
                  level
                )
              `,
                )
                .eq('parent_id', comment.id)
                .order('created_at', { ascending: true });
              replies = repliesData || [];
            } catch (e) {
              console.log('Error fetching replies:', e);
            }

            // Check if user liked this comment
            let likedByUser = false;
            if (user) {
              try {
                const { data: likeData } = await supabase
                  .from('comment_likes')
                  .select('id')
                  .eq('comment_id', comment.id)
                  .eq('user_id', user.id)
                  .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no row found
                likedByUser = !!likeData;
              } catch (e) {
                console.log('Error checking like:', e);
              }
            }

            return {
              ...comment,
              replies,
              liked_by_user: likedByUser,
            };
          }),
        );

        setComments(commentsWithReplies);
        hasFetched.current = true;
        lastFetchKey.current = `${manhwaId}-${chapterId}`;
      } catch (err) {
        console.error('Error in fetchComments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    },
    [manhwaId, chapterId, supabase, user],
  );

  // Only fetch once on mount
  useEffect(() => {
    fetchComments();
  }, []); // Empty deps - only run once on mount

  const addComment = async (content: string, parentId?: string) => {
    if (!supabase) {
      return { error: 'Comments are not available' };
    }
    if (!user) {
      return { error: 'You must be logged in to comment' };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          manhwa_id: manhwaId,
          chapter_id: chapterId || null,
          content,
          parent_id: parentId || null,
        })
        .select(
          `
          *,
          profiles (
            id,
            username,
            avatar_url,
            level
          )
        `,
        )
        .single();

      if (error) throw error;

      if (parentId) {
        // Add reply to existing comment
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data],
              };
            }
            return comment;
          }),
        );
      } else {
        // Add new top-level comment
        setComments((prev) => [{ ...data, replies: [], liked_by_user: false }, ...prev]);
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to add comment' };
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!supabase) {
      return { error: 'Comments are not available' };
    }
    if (!user) {
      return { error: 'You must be logged in' };
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.id !== commentId),
          })),
      );

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete comment' };
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!supabase) {
      return { error: 'Comments are not available' };
    }
    if (!user) {
      return { error: 'You must be logged in to like comments' };
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        await supabase.rpc('decrement_likes', { comment_id: commentId });

        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, likes: c.likes - 1, liked_by_user: false };
            }
            return {
              ...c,
              replies: c.replies?.map((r) =>
                r.id === commentId
                  ? { ...r, likes: r.likes - 1, liked_by_user: false }
                  : r,
              ),
            };
          }),
        );
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({ user_id: user.id, comment_id: commentId });

        await supabase.rpc('increment_likes', { comment_id: commentId });

        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, likes: c.likes + 1, liked_by_user: true };
            }
            return {
              ...c,
              replies: c.replies?.map((r) =>
                r.id === commentId
                  ? { ...r, likes: r.likes + 1, liked_by_user: true }
                  : r,
              ),
            };
          }),
        );
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to toggle like' };
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    toggleLike,
    refetch: () => fetchComments(true), // Force refetch
  };
}
