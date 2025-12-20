'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { CommentWithProfile } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseCommentsOptions {
  manhwaId: string;
  chapterId?: string;
}

// Simple in-memory cache for comments
const commentsCache = new Map<
  string,
  { data: CommentWithProfile[]; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useComments({ manhwaId, chapterId }: UseCommentsOptions) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabaseClient();
  const isMounted = useRef(true);
  const fetchIdRef = useRef(0); // Track fetch requests to handle race conditions
  const hasFetchedRef = useRef(false); // Track if we've attempted a fetch

  const cacheKey = useMemo(
    () => `${manhwaId}-${chapterId || 'main'}`,
    [manhwaId, chapterId],
  );

  // Store user ID in ref to avoid dependency changes
  const userIdRef = useRef(user?.id);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // Check cache on mount and set loading state immediately
  useEffect(() => {
    const cached = commentsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setComments(cached.data);
      setLoading(false);
      hasFetchedRef.current = true;
    }
  }, [cacheKey]);

  // Set loading to false immediately if not configured
  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
    }
  }, [isConfigured, supabase]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchComments = useCallback(
    async (force = false) => {
      // Increment fetch ID to track this specific request
      const currentFetchId = ++fetchIdRef.current;
      hasFetchedRef.current = true;

      // Check cache first (unless forced)
      if (!force) {
        const cached = commentsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isMounted.current) {
            setComments(cached.data);
            setLoading(false);
          }
          return;
        }
      }

      if (!supabase) {
        console.log('useComments: supabase client is null');
        if (isMounted.current) {
          setLoading(false);
          // Don't show error if just not configured - it's expected
          if (isConfigured) {
            setError('Comments are not available');
          }
        }
        return;
      }

      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      try {
        console.log('useComments: Fetching comments for', manhwaId);
        // Single optimized query to get all comments with their profiles
        let query = supabase
          .from('comments')
          .select(
            `
            *,
            profiles:user_id (
              id,
              username,
              avatar_url,
              level
            )
          `,
          )
          .eq('manhwa_id', manhwaId)
          .order('created_at', { ascending: false });

        // Filter by chapter
        if (chapterId) {
          query = query.eq('chapter_id', chapterId);
        } else {
          query = query.is('chapter_id', null);
        }

        // Execute query
        const { data: allComments, error: commentsError } = await query;

        console.log(
          'useComments: Query complete, comments:',
          allComments?.length ?? 0,
          'error:',
          commentsError,
        );

        // Check if this fetch is still the latest one (handles race conditions)
        if (currentFetchId !== fetchIdRef.current || !isMounted.current) {
          console.log('useComments: Fetch cancelled (stale)');
          return;
        }

        if (commentsError) throw commentsError;

        if (!allComments || allComments.length === 0) {
          setComments([]);
          commentsCache.set(cacheKey, { data: [], timestamp: Date.now() });
          setLoading(false);
          return;
        }

        // Get all comment IDs for batch like check
        const commentIds = allComments.map((c) => c.id);

        // Batch fetch user likes if logged in (use ref to avoid dependency)
        let userLikes = new Set<string>();
        const currentUserId = userIdRef.current;
        if (currentUserId && commentIds.length > 0) {
          try {
            const { data: likesData } = await supabase
              .from('comment_likes')
              .select('comment_id')
              .eq('user_id', currentUserId)
              .in('comment_id', commentIds);

            if (likesData) {
              userLikes = new Set(likesData.map((l) => l.comment_id));
            }
          } catch (e) {
            // Silently handle like fetch errors - comments still work
            console.log('Error batch fetching likes:', e);
          }
        }

        // Check again if this fetch is still relevant
        if (currentFetchId !== fetchIdRef.current || !isMounted.current) {
          return;
        }

        // Organize comments into parent/child structure efficiently
        const parentComments: CommentWithProfile[] = [];
        const childComments = new Map<string, CommentWithProfile[]>();

        for (const comment of allComments) {
          const processedComment: CommentWithProfile = {
            ...comment,
            liked_by_user: userLikes.has(comment.id),
            replies: [],
          };

          if (comment.parent_id) {
            const existing = childComments.get(comment.parent_id) || [];
            existing.push(processedComment);
            childComments.set(comment.parent_id, existing);
          } else {
            parentComments.push(processedComment);
          }
        }

        // Attach replies to parents
        const commentsWithReplies = parentComments.map((parent) => ({
          ...parent,
          replies: (childComments.get(parent.id) || []).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          ),
        }));

        setComments(commentsWithReplies);
        commentsCache.set(cacheKey, {
          data: commentsWithReplies,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Error in fetchComments:', err);
        if (isMounted.current && currentFetchId === fetchIdRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load comments');
        }
      } finally {
        if (isMounted.current && currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [manhwaId, chapterId, supabase, cacheKey, isConfigured],
  );

  // Fetch on mount - with safety timeout
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isMounted.current) {
        console.warn(
          'Comments: Safety timeout triggered - forcing loading state to false',
        );
        setLoading(false);
        setError('Loading timed out. Please try refreshing.');
      }
    }, 15000); // 15 second safety net

    fetchComments().finally(() => {
      clearTimeout(safetyTimeout);
    });

    return () => clearTimeout(safetyTimeout);
  }, [fetchComments]);

  // Additional safety: if supabase becomes available after initial mount, retry
  useEffect(() => {
    if (supabase && isConfigured && !hasFetchedRef.current) {
      fetchComments();
    }
  }, [supabase, isConfigured, fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!supabase) {
      return { error: 'Comments are not available' };
    }
    if (!user) {
      return { error: 'You must be logged in to comment' };
    }

    // Optimistic update - add comment immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentWithProfile = {
      id: tempId,
      user_id: user.id,
      manhwa_id: manhwaId,
      chapter_id: chapterId || null,
      content,
      parent_id: parentId || null,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
        level: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chapters_read: 0,
      },
      liked_by_user: false,
      replies: [],
    };

    if (parentId) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), optimisticComment],
            };
          }
          return comment;
        }),
      );
    } else {
      setComments((prev) => [optimisticComment, ...prev]);
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
          profiles:user_id (
            id,
            username,
            avatar_url,
            level
          )
        `,
        )
        .single();

      if (error) throw error;

      // Replace temp comment with real one
      const realComment: CommentWithProfile = {
        ...data,
        liked_by_user: false,
        replies: [],
      };

      if (parentId) {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: (comment.replies || []).map((r) =>
                  r.id === tempId ? realComment : r,
                ),
              };
            }
            return comment;
          }),
        );
      } else {
        setComments((prev) => prev.map((c) => (c.id === tempId ? realComment : c)));
      }

      // Update cache
      commentsCache.delete(cacheKey);

      return { error: null };
    } catch (err) {
      // Rollback optimistic update
      if (parentId) {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: (comment.replies || []).filter((r) => r.id !== tempId),
              };
            }
            return comment;
          }),
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== tempId));
      }
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

    // Optimistic delete
    const previousComments = [...comments];
    setComments((prev) =>
      prev
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== commentId),
        })),
    );

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update cache
      commentsCache.delete(cacheKey);

      return { error: null };
    } catch (err) {
      // Rollback
      setComments(previousComments);
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

    // Find current like state
    let isLiked = false;
    for (const c of comments) {
      if (c.id === commentId) {
        isLiked = c.liked_by_user || false;
        break;
      }
      for (const r of c.replies || []) {
        if (r.id === commentId) {
          isLiked = r.liked_by_user || false;
          break;
        }
      }
    }

    // Optimistic update
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            likes: isLiked ? c.likes - 1 : c.likes + 1,
            liked_by_user: !isLiked,
          };
        }
        return {
          ...c,
          replies: c.replies?.map((r) =>
            r.id === commentId
              ? {
                  ...r,
                  likes: isLiked ? r.likes - 1 : r.likes + 1,
                  liked_by_user: !isLiked,
                }
              : r,
          ),
        };
      }),
    );

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        await supabase.rpc('decrement_likes', { comment_id: commentId });
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({ user_id: user.id, comment_id: commentId });

        await supabase.rpc('increment_likes', { comment_id: commentId });
      }

      return { error: null };
    } catch (err) {
      // Rollback
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              likes: isLiked ? c.likes + 1 : c.likes - 1,
              liked_by_user: isLiked,
            };
          }
          return {
            ...c,
            replies: c.replies?.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    likes: isLiked ? r.likes + 1 : r.likes - 1,
                    liked_by_user: isLiked,
                  }
                : r,
            ),
          };
        }),
      );
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
    refetch: () => fetchComments(true),
  };
}
