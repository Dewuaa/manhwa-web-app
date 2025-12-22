'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  } | null;
}

interface UsePostCommentsOptions {
  postId: string;
}

export function usePostComments({ postId }: UsePostCommentsOptions) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabaseClient();
  const hasFetched = useRef(false);

  const fetchComments = useCallback(async () => {
    if (!supabase || !isConfigured || !postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch comments
      const { data: commentsData, error: fetchError } = await supabase
        .from('post_comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.id, p])
      );

      // Combine comments with profiles
      const commentsWithProfiles: PostComment[] = commentsData.map((comment) => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id) || null,
      }));

      setComments(commentsWithProfiles);
    } catch (err) {
      console.error('Error fetching post comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [supabase, isConfigured, postId]);

  const addComment = useCallback(async (content: string) => {
    if (!supabase || !user || !postId) {
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        })
        .select('id, post_id, user_id, content, created_at')
        .single();

      if (insertError) throw insertError;

      if (data) {
        // Fetch the user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level')
          .eq('id', user.id)
          .single();

        const newComment: PostComment = {
          ...data,
          profiles: profileData || null,
        };
        setComments((prev) => [...prev, newComment]);
      }

      return { error: null };
    } catch (err) {
      console.error('Error adding comment:', err);
      return { error: 'Failed to add comment' };
    }
  }, [supabase, user, postId]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!supabase || !user) return;

    try {
      const { error: deleteError } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (isConfigured && supabase && postId && !hasFetched.current) {
      hasFetched.current = true;
      fetchComments();
    }
  }, [isConfigured, supabase, postId, fetchComments]);

  const refetch = useCallback(() => {
    hasFetched.current = false;
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    refetch,
  };
}
