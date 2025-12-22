'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Heart,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Users,
  Loader2,
  Send,
  Trash2,
  MessageCircle,
  PenSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalComments, GlobalComment } from '@/hooks/useGlobalComments';
import { usePosts, Post } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { PostSkeleton, CommentSkeleton } from '@/components/LoadingSkeleton';

type TabType = 'posts' | 'comments';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const { comments, loading: commentsLoading, error: commentsError, hasMore: commentsHasMore, loadMore: loadMoreComments, toggleLike: toggleCommentLike, refetch: refetchComments } =
    useGlobalComments({ limit: 20 });
  const { posts, loading: postsLoading, error: postsError, hasMore: postsHasMore, loadMore: loadMorePosts, toggleLike: togglePostLike, refetch: refetchPosts, createPost, deletePost } =
    usePosts({ limit: 20 });
  const { user, profile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loading = activeTab === 'posts' ? postsLoading : commentsLoading;
  const hasMore = activeTab === 'posts' ? postsHasMore : commentsHasMore;
  const loadMore = activeTab === 'posts' ? loadMorePosts : loadMoreComments;
  const refetch = activeTab === 'posts' ? refetchPosts : refetchComments;

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const handlePostLike = async (postId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await togglePostLike(postId);
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await toggleCommentLike(commentId);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsPosting(true);
    const { error } = await createPost(newPostContent);
    if (!error) {
      setNewPostContent('');
    }
    setIsPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(postId);
    }
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  // Format manhwa_id into readable title
  const formatManhwaTitle = (manhwaId: string) => {
    const cleaned = manhwaId
      .replace(/-mg\d*$/i, '')
      .replace(/-mgeko$/i, '')
      .replace(/-raw$/i, '');
    
    return cleaned
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .slice(0, 50) + (cleaned.length > 50 ? '...' : '');
  };

  const formatChapter = (chapterId: string | null) => {
    if (!chapterId) return null;
    const match = chapterId.match(/chapter[- ]?(\d+)/i);
    if (match) return `Ch. ${match[1]}`;
    const nums = chapterId.match(/\d+/);
    return nums ? `Ch. ${nums[0]}` : null;
  };

  const getManhwaLink = (manhwaId: string, chapterId: string | null) => {
    if (chapterId) return `/manhwa/${manhwaId}/read/${chapterId}`;
    return `/manhwa/${manhwaId}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Community</h1>
                <p className="text-xs text-gray-400">Share & discuss</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'posts'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <PenSquare className="w-4 h-4" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'comments'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Discussions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Post Composer - Only show on Posts tab */}
        {activeTab === 'posts' && (
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
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none min-h-[80px]"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isPosting}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-white font-medium rounded-full transition-colors"
                    >
                      {isPosting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center justify-center gap-2 py-4 text-gray-400 hover:text-white transition-colors"
              >
                <PenSquare className="w-5 h-5" />
                Sign in to post
              </button>
            )}
          </div>
        )}

        {/* Error State */}
        {(postsError || commentsError) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{postsError || commentsError}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activeTab === 'posts' ? (
              // Posts Feed
              posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={handlePostLike}
                  onDelete={handleDeletePost}
                  formatTimeAgo={formatTimeAgo}
                  index={index}
                />
              ))
            ) : (
              // Comments Feed
              comments.map((comment, index) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onLike={handleCommentLike}
                  getManhwaLink={getManhwaLink}
                  formatTimeAgo={formatTimeAgo}
                  formatManhwaTitle={formatManhwaTitle}
                  formatChapter={formatChapter}
                  index={index}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {activeTab === 'posts' ? (
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            ) : (
              Array.from({ length: 4 }).map((_, i) => <CommentSkeleton key={i} />)
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && ((activeTab === 'posts' && posts.length === 0) || (activeTab === 'comments' && comments.length === 0)) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'posts' ? (
                <PenSquare className="w-8 h-8 text-gray-500" />
              ) : (
                <MessageSquare className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {activeTab === 'posts' ? 'No posts yet' : 'No discussions yet'}
            </h3>
            <p className="text-gray-400 text-sm">
              {activeTab === 'posts' ? 'Be the first to share something!' : 'Start reading and commenting!'}
            </p>
          </div>
        )}

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="h-10" />

        {/* End of Content */}
        {!hasMore && ((activeTab === 'posts' && posts.length > 0) || (activeTab === 'comments' && comments.length > 0)) && (
          <p className="text-center text-gray-500 text-sm py-4">
            You&apos;ve reached the end
          </p>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

// Post Card Component
function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  formatTimeAgo,
  index,
}: {
  post: Post;
  currentUserId?: string;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  formatTimeAgo: (date: string) => string;
  index: number;
}) {
  const profile = post.profiles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
    >
      {/* User Info */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {profile?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={profile.avatar_url}
                alt={profile.username || 'User'}
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
          {profile?.level && profile.level > 1 && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {profile.level}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white text-sm">
                {profile?.username || 'Anonymous'}
              </span>
              <span className="text-gray-500 text-xs">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>
            {currentUserId === post.user_id && (
              <button
                onClick={() => onDelete(post.id)}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Post Content */}
          <p className="text-gray-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                post.liked_by_user
                  ? 'text-red-400'
                  : 'text-gray-500 hover:text-red-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${post.liked_by_user ? 'fill-current' : ''}`}
              />
              <span>{post.likes || 0}</span>
            </button>
            <Link
              href={`/community/post/${post.id}`}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count || 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Comment Card Component (for discussions tab)
function CommentCard({
  comment,
  onLike,
  getManhwaLink,
  formatTimeAgo,
  formatManhwaTitle,
  formatChapter,
  index,
}: {
  comment: GlobalComment;
  onLike: (id: string) => void;
  getManhwaLink: (manhwaId: string, chapterId: string | null) => string;
  formatTimeAgo: (date: string) => string;
  formatManhwaTitle: (manhwaId: string) => string;
  formatChapter: (chapterId: string | null) => string | null;
  index: number;
}) {
  const profile = comment.profiles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {profile?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={profile.avatar_url}
                alt={profile.username || 'User'}
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
          {profile?.level && profile.level > 1 && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {profile.level}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-white text-sm truncate">
              {profile?.username || 'Anonymous'}
            </span>
            <span className="text-gray-500 text-xs">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          
          {/* Manhwa Title */}
          <Link
            href={getManhwaLink(comment.manhwa_id, comment.chapter_id)}
            className="text-primary/80 text-xs mb-2 block truncate hover:underline"
          >
            on <span className="font-medium">{formatManhwaTitle(comment.manhwa_id)}</span>
            {formatChapter(comment.chapter_id) && (
              <span className="text-gray-500"> • {formatChapter(comment.chapter_id)}</span>
            )}
          </Link>

          {/* Comment Text */}
          <p className="text-gray-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                comment.liked_by_user
                  ? 'text-red-400'
                  : 'text-gray-500 hover:text-red-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${comment.liked_by_user ? 'fill-current' : ''}`}
              />
              <span>{comment.likes || 0}</span>
            </button>

            <Link
              href={getManhwaLink(comment.manhwa_id, comment.chapter_id)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <span>View discussion</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
