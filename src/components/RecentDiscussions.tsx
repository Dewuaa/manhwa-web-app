'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ManhwaLink } from './ManhwaLink';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommentSkeleton } from '@/components/LoadingSkeleton';

interface RecentComment {
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
}

export function RecentDiscussions() {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConfigured } = useAuth();
  const supabase = getSupabaseClient();
  const hasFetched = useRef(false);

  const fetchRecentComments = useCallback(async () => {
    if (!supabase || hasFetched.current) return;
    hasFetched.current = true;

    try {
      const { data, error } = await supabase
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
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) {
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching recent comments:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isConfigured && supabase) {
      fetchRecentComments();
    } else {
      setLoading(false);
    }
  }, [isConfigured, supabase, fetchRecentComments]);

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  // Format manhwa_id into readable title (e.g., "solo-leveling" -> "Solo Leveling")
  const formatManhwaTitle = (manhwaId: string) => {
    // Remove common URL suffixes
    const cleaned = manhwaId
      .replace(/-mg\d*$/i, '')  // Remove -mg, -mg1, -mg2, etc.
      .replace(/-mgeko$/i, '')  // Remove -mgeko
      .replace(/-raw$/i, '');   // Remove -raw
    
    return cleaned
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .slice(0, 40) + (cleaned.length > 40 ? '...' : '');
  };

  // Format chapter_id into readable format (e.g., "chapter-10" -> "Ch. 10")
  const formatChapter = (chapterId: string | null) => {
    if (!chapterId) return null;
    const match = chapterId.match(/chapter[- ]?(\d+)/i);
    if (match) {
      return `Ch. ${match[1]}`;
    }
    // Fallback: just extract numbers
    const nums = chapterId.match(/\d+/);
    return nums ? `Ch. ${nums[0]}` : null;
  };

  // Don't render if not configured or no comments
  if (!isConfigured || (comments.length === 0 && !loading)) {
    return null;
  }

  return (
    <section className="mt-8 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Recent Discussions</h2>
            <p className="text-xs text-gray-400">Join the community</p>
          </div>
        </div>
        <Link
          href="/community"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          See All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Comments List */}
      {!loading && comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ManhwaLink
                href={`/manhwa/${comment.manhwa_id}`}
                className="block bg-white/5 hover:bg-white/8 backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {comment.profiles?.avatar_url ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden">
                        <Image
                          src={comment.profiles.avatar_url}
                          alt={comment.profiles.username || 'User'}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-white text-sm truncate">
                        {comment.profiles?.username || 'Anonymous'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-primary/80 text-xs mb-1 truncate">
                      on <span className="font-medium">{formatManhwaTitle(comment.manhwa_id)}</span>
                      {formatChapter(comment.chapter_id) && (
                        <span className="text-gray-500"> • {formatChapter(comment.chapter_id)}</span>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm line-clamp-1">
                      {comment.content}
                    </p>
                  </div>

                  {/* Likes */}
                  {comment.likes > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Heart className="w-3 h-3" />
                      <span>{comment.likes}</span>
                    </div>
                  )}
                </div>
              </ManhwaLink>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State - Link to community */}
      {!loading && comments.length === 0 && isConfigured && (
        <Link
          href="/community"
          className="block bg-white/5 hover:bg-white/8 rounded-xl p-6 border border-white/5 text-center transition-all"
        >
          <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No discussions yet</p>
          <p className="text-primary text-xs mt-1">Be the first to comment!</p>
        </Link>
      )}
    </section>
  );
}
