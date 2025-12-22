'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Heart,
  Send,
  Trash2,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePostComments, PostComment } from '@/hooks/usePostComments';
import AuthModal from '@/components/AuthModal';

interface PostData {
  id: string;
  user_id: string;
  content: string;
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { user, profile, isConfigured } = useAuth();
  const supabase = getSupabaseClient();
  const { comments, loading: commentsLoading, addComment, deleteComment } = usePostComments({ postId });

  // Fetch post data
  const fetchPost = useCallback(async () => {
    if (!supabase || !isConfigured || !postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: postData, error } = await supabase
        .from('posts')
        .select('id, user_id, content, likes, comments_count, created_at')
        .eq('id', postId)
        .single();

      if (error) throw error;

      if (postData) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level')
          .eq('id', postData.user_id)
          .single();

        // Check if liked
        let likedByUser = false;
        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          likedByUser = !!likeData;
        }

        setPost({
          ...postData,
          liked_by_user: likedByUser,
          profiles: profileData || null,
        });
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, isConfigured, postId, user]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!supabase || !post) return;

    // Optimistic update
    setPost((prev) =>
      prev
        ? {
            ...prev,
            liked_by_user: !prev.liked_by_user,
            likes: prev.liked_by_user ? prev.likes - 1 : prev.likes + 1,
          }
        : null
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
      setPost((prev) =>
        prev
          ? {
              ...prev,
              liked_by_user: post.liked_by_user,
              likes: post.likes,
            }
          : null
      );
      console.error('Error toggling like:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSubmitting(true);
    const { error } = await addComment(newComment);
    if (!error) {
      setNewComment('');
      // Update comments count
      setPost((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : null
      );
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Delete this comment?')) {
      await deleteComment(commentId);
      setPost((prev) =>
        prev ? { ...prev, comments_count: Math.max(0, prev.comments_count - 1) } : null
      );
    }
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Post not found</p>
        <Link href="/community" className="text-primary hover:underline">
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Post</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Post */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
          {/* Author */}
          <div className="flex items-start gap-3 mb-3">
            <div className="shrink-0">
              {post.profiles?.avatar_url ? (
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={post.profiles.avatar_url}
                    alt={post.profiles.username || 'User'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {post.profiles?.username || 'Anonymous'}
                </span>
                {post.profiles?.level && post.profiles.level > 1 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                    Lv.{post.profiles.level}
                  </span>
                )}
              </div>
              <span className="text-gray-500 text-sm">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-100 text-base leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Stats & Actions */}
          <div className="flex items-center gap-6 pt-3 border-t border-white/5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                post.liked_by_user
                  ? 'text-red-400'
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count}</span>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
          {user ? (
            <div className="flex gap-3">
              <div className="shrink-0">
                {profile?.avatar_url ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.username || 'You'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  className="p-2 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-full transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors"
            >
              Sign in to comment
            </button>
          )}
        </div>

        {/* Comments */}
        <div className="space-y-3">
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No comments yet</p>
              <p className="text-gray-600 text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <AnimatePresence>
              {comments.map((comment, index) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onDelete={handleDeleteComment}
                  formatTimeAgo={formatTimeAgo}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  formatTimeAgo,
  index,
}: {
  comment: PostComment;
  currentUserId?: string;
  onDelete: (id: string) => void;
  formatTimeAgo: (date: string) => string;
  index: number;
}) {
  const profile = comment.profiles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex gap-3"
    >
      <div className="shrink-0">
        {profile?.avatar_url ? (
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={profile.avatar_url}
              alt={profile.username || 'User'}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm">
              {profile?.username || 'Anonymous'}
            </span>
            <span className="text-gray-500 text-xs">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          {currentUserId === comment.user_id && (
            <button
              onClick={() => onDelete(comment.id)}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-gray-300 text-sm">{comment.content}</p>
      </div>
    </motion.div>
  );
}
