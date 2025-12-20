'use client';

import { useState, memo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Trash2,
  Send,
  LogIn,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/hooks/useComments';
import { CommentWithProfile } from '@/lib/supabase/types';
import AuthModal from './AuthModal';

interface CommentsProps {
  manhwaId: string;
  chapterId?: string;
  manhwaTitle?: string;
  onClose?: () => void;
}

export default function Comments({
  manhwaId,
  chapterId,
  manhwaTitle,
  onClose,
}: CommentsProps) {
  const { user, profile, isConfigured } = useAuth();
  const { comments, loading, error, addComment, deleteComment, toggleLike, refetch } =
    useComments({
      manhwaId,
      chapterId,
    });
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // Detect if loading is taking too long (more than 8 seconds)
  useEffect(() => {
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setLoadingTooLong(true);
      }, 8000);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      setLoadingTooLong(false);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoadingTooLong(false);
    setRetryCount((prev) => prev + 1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSubmitting(true);
    const { error } = await addComment(newComment.trim());
    if (!error) {
      setNewComment('');
    }
    setSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSubmitting(true);
    const { error } = await addComment(replyContent.trim(), parentId);
    if (!error) {
      setReplyContent('');
      setReplyingTo(null);
    }
    setSubmitting(false);
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await toggleLike(commentId);
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  const renderComment = (comment: CommentWithProfile, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12 mt-3' : ''}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {comment.profiles?.avatar_url ? (
            <Image
              src={comment.profiles.avatar_url}
              alt={comment.profiles.username || 'User'}
              width={isReply ? 32 : 40}
              height={isReply ? 32 : 40}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm`}
            >
              {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">
              {comment.profiles?.username || 'Anonymous'}
            </span>
            {comment.profiles?.level && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                Lv.{comment.profiles.level}
              </span>
            )}
            <span className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Content */}
          <p className="text-gray-300 text-sm leading-relaxed mb-2">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.liked_by_user
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Heart size={14} className={comment.liked_by_user ? 'fill-current' : ''} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {!isReply && (
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors"
              >
                <MessageCircle size={14} />
                Reply
              </button>
            )}

            {user?.id === comment.user_id && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.profiles?.username || 'user'}...`}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitReply(comment.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || submitting}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageCircle size={20} />
          Comments
          {comments.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({comments.length})</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 disabled:opacity-50"
            title="Refresh comments"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Not Configured Message */}
      {!isConfigured ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium mb-2">Comments Coming Soon</p>
            <p className="text-gray-600 text-sm">This feature requires backend setup.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Comment Input */}
          <div className="p-4 border-b border-white/10">
            {user ? (
              <div className="flex gap-3">
                <div className="shrink-0">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.username || 'You'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {profile?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-xl transition-colors"
                  >
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogIn size={18} />
                Sign in to comment
              </button>
            )}
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {loading ? (
              // Skeleton loading with timeout feedback
              <div className="space-y-6">
                {loadingTooLong && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                    <AlertCircle size={16} className="text-yellow-500 shrink-0" />
                    <p className="text-yellow-400 text-xs">
                      Loading is taking longer than expected.{' '}
                      <button
                        onClick={handleRefresh}
                        className="underline hover:no-underline"
                      >
                        Try refreshing
                      </button>
                    </p>
                  </div>
                )}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-white/10 rounded" />
                      <div className="h-3 w-full bg-white/5 rounded" />
                      <div className="h-3 w-3/4 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto text-red-500/50 mb-3" />
                <p className="text-red-400 text-sm mb-3">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg transition-colors"
                >
                  {retryCount > 2 ? 'Try Again Later' : 'Try Again'}
                </button>
                {retryCount > 2 && (
                  <p className="text-gray-500 text-xs mt-2">
                    If the issue persists, the server may be temporarily unavailable.
                  </p>
                )}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-500">No comments yet</p>
                <p className="text-gray-600 text-sm">
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
