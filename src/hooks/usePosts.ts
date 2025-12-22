'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes: number;
  comments_count: number;
  created_at: string;
  liked_by_user: boolean;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  } | null;
}

interface UsePostsOptions {
  limit?: number;
}

export function usePosts({ limit = 20 }: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabaseClient();
  const offsetRef = useRef(0);
  const hasFetched = useRef(false);

  const fetchPosts = useCallback(async (reset = false) => {
    if (!supabase || !isConfigured) {
      setLoading(false);
      return;
    }

    if (reset) {
      offsetRef.current = 0;
      hasFetched.current = false;
    }

    if (hasFetched.current && !reset) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      setError(null);

      // Fetch posts without join first
      const { data: postsData, error: fetchError } = await supabase
        .from('posts')
        .select('id, user_id, content, image_url, likes, comments_count, created_at')
        .order('created_at', { ascending: false })
        .range(offsetRef.current, offsetRef.current + limit - 1);

      if (fetchError) throw fetchError;

      if (!postsData || postsData.length === 0) {
        if (reset) setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(postsData.map((p) => p.user_id))];

      // Fetch profiles separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .in('id', userIds);

      // Create a map of profiles
      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.id, p])
      );

      // Fetch user likes if logged in
      let userLikes: Set<string> = new Set();
      if (user) {
        const postIds = postsData.map((p) => p.id);
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        if (likesData) {
          userLikes = new Set(likesData.map((l) => l.post_id));
        }
      }

      // Combine posts with profiles
      const postsWithProfiles: Post[] = postsData.map((post) => ({
        ...post,
        liked_by_user: userLikes.has(post.id),
        profiles: profilesMap.get(post.user_id) || null,
      }));

      if (reset) {
        setPosts(postsWithProfiles);
      } else {
        setPosts((prev) => [...prev, ...postsWithProfiles]);
      }

      setHasMore(postsData.length === limit);
      offsetRef.current += postsData.length;
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [supabase, isConfigured, user, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      hasFetched.current = false;
      fetchPosts();
    }
  }, [loading, hasMore, fetchPosts]);

  const refetch = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const createPost = useCallback(async (content: string, imageUrl?: string) => {
    if (!supabase || !user) {
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl || null,
        })
        .select('id, user_id, content, image_url, likes, comments_count, created_at')
        .single();

      if (insertError) throw insertError;

      if (data) {
        // Fetch the user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level')
          .eq('id', user.id)
          .single();

        const newPost: Post = {
          ...data,
          liked_by_user: false,
          profiles: profileData || null,
        };
        setPosts((prev) => [newPost, ...prev]);
      }

      return { error: null };
    } catch (err) {
      console.error('Error creating post:', err);
      return { error: 'Failed to create post' };
    }
  }, [supabase, user]);

  const deletePost = useCallback(async (postId: string) => {
    if (!supabase || !user) return;

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  }, [supabase, user]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!supabase || !user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked_by_user: !p.liked_by_user,
              likes: p.liked_by_user ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );

    try {
      if (post.liked_by_user) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked_by_user: post.liked_by_user,
                likes: post.likes,
              }
            : p
        )
      );
      console.error('Error toggling like:', err);
    }
  }, [supabase, user, posts]);

  useEffect(() => {
    if (isConfigured && supabase) {
      fetchPosts(true);
    }
  }, [isConfigured, supabase]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    createPost,
    deletePost,
    toggleLike,
  };
}
