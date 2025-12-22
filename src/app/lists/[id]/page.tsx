'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ManhwaLink } from '@/components/ManhwaLink';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Trash2,
  BookOpen,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  Heart,
  List,
  Sparkles,
  X,
  Play,
  Grid,
  LayoutList,
} from 'lucide-react';
import { useLists } from '@/contexts/ListsContext';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useToast } from '@/contexts/ToastContext';
import ImageWithFallback from '@/components/ImageWithFallback';

// Icon mapping
const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  'book-open': BookOpen,
  clock: Clock,
  'check-circle': CheckCircle,
  'pause-circle': PauseCircle,
  'x-circle': XCircle,
  heart: Heart,
  list: List,
  sparkles: Sparkles,
};

const iconColorMap: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
  pink: 'text-pink-400',
  orange: 'text-orange-400',
  cyan: 'text-cyan-400',
};

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const { lists, getListItems, removeFromList, isLoading } = useLists();
  const { getProgress, history } = useReadingHistory();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemMenu, setItemMenu] = useState<string | null>(null);

  const list = lists.find((l) => l.id === listId);
  const items = getListItems(listId);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const handleRemoveItem = async (manhwaId: string) => {
    await removeFromList(listId, manhwaId);
    success('Removed from list');
    setItemMenu(null);
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || List;
  };

  const getItemProgress = (manhwaId: string) => {
    const historyItem = history.find((h) => h.manhwaId === manhwaId);
    if (!historyItem) return null;

    const progress = getProgress(manhwaId);
    return {
      ...progress,
      lastChapter: historyItem.lastChapterTitle,
      lastChapterId: historyItem.lastChapterId,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <List className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">List not found</h2>
        <p className="text-gray-500 mb-6">This list may have been deleted</p>
        <Link
          href="/lists"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          Back to Lists
        </Link>
      </div>
    );
  }

  const Icon = getIcon(list.icon);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.push('/lists')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 ${iconColorMap[list.color]}`}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{list.name}</h1>
                <p className="text-xs text-gray-500">{items.length} items</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-full transition-colors ${
                  showSearch
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Search size={20} />
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {viewMode === 'grid' ? <LayoutList size={20} /> : <Grid size={20} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search in list..."
                      autoFocus
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Icon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? 'No matches found' : 'This list is empty'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Add manhwa to this list from their detail pages'}
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors inline-block"
            >
              Browse Manhwa
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item, index) => {
              const progress = getItemProgress(item.manhwaId);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative"
                >
                  <ManhwaLink href={`/manhwa/${encodeURIComponent(item.manhwaId)}`}>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800">
                      {item.image ? (
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-600" />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Progress Bar */}
                      {progress &&
                        progress.progress !== undefined &&
                        progress.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                        )}

                      {/* Continue Reading Button */}
                      {progress?.lastChapterId && (
                        <ManhwaLink
                          href={`/manhwa/${encodeURIComponent(item.manhwaId)}/read/${encodeURIComponent(progress.lastChapterId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
                        >
                          <div className="bg-white rounded-full p-3">
                            <Play size={20} className="text-black fill-black ml-0.5" />
                          </div>
                        </ManhwaLink>
                      )}
                    </div>

                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      {progress && (
                        <p className="text-xs text-gray-500 mt-1">
                          {progress.chaptersRead}/{progress.totalChapters || '?'} chapters
                        </p>
                      )}
                    </div>
                  </ManhwaLink>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setItemMenu(itemMenu === item.id ? null : item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <MoreVertical size={14} />
                  </button>

                  <AnimatePresence>
                    {itemMenu === item.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-10 right-2 bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-xl z-20"
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveItem(item.manhwaId);
                          }}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                          <Trash2 size={14} />
                          Remove from list
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredItems.map((item, index) => {
              const progress = getItemProgress(item.manhwaId);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <ManhwaLink href={`/manhwa/${encodeURIComponent(item.manhwaId)}`}>
                    <div className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors">
                      {/* Image */}
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <ImageWithFallback
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <BookOpen className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        {progress?.lastChapter && (
                          <p className="text-sm text-gray-500 truncate">
                            {progress.lastChapter}
                          </p>
                        )}
                        {progress && progress.progress !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(progress.progress || 0)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Continue Button */}
                      {progress?.lastChapterId && (
                        <ManhwaLink
                          href={`/manhwa/${encodeURIComponent(item.manhwaId)}/read/${encodeURIComponent(progress.lastChapterId)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                        >
                          <Play size={16} className="fill-white ml-0.5" />
                        </ManhwaLink>
                      )}

                      {/* Menu */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setItemMenu(itemMenu === item.id ? null : item.id);
                        }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </ManhwaLink>

                  <AnimatePresence>
                    {itemMenu === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex justify-end py-2">
                          <button
                            onClick={() => handleRemoveItem(item.manhwaId)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                            Remove from list
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {itemMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setItemMenu(null)} />
      )}
    </div>
  );
}
