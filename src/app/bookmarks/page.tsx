'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getBookmarks, clearBookmarks, removeBookmark, Bookmark } from '@/lib/storage';
import { Search, BookOpen, Trash2, ChevronRight, Heart, X, List } from 'lucide-react';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useLists } from '@/contexts/ListsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from '@/components/ui';
import { AddToListModal } from '@/components/AddToListModal';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [selectedManhwa, setSelectedManhwa] = useState<{
    id: string;
    title: string;
    image: string;
  } | null>(null);
  const { history } = useReadingHistory();
  const { getManhwaLists } = useLists();

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleClearBookmarks = () => {
    clearBookmarks();
    setBookmarks([]);
    setShowClearConfirm(false);
  };

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(id);
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const handleAddToList = (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedManhwa({
      id: bookmark.id,
      title: bookmark.title,
      image: bookmark.image,
    });
    setListModalOpen(true);
  };

  // Get reading progress for each bookmark
  const getBookmarkProgress = (manhwaId: string) => {
    const historyItem = history.find((h) => h.manhwaId === manhwaId);
    if (!historyItem) return null;

    const chaptersRead = historyItem.chaptersRead.length;
    const totalChapters = historyItem.totalChapters || chaptersRead;
    const percentage =
      totalChapters > 0 ? Math.round((chaptersRead / totalChapters) * 100) : 0;

    return {
      chaptersRead,
      totalChapters,
      percentage,
      lastChapter: historyItem.lastChapterTitle,
    };
  };

  // Filter bookmarks based on tab and search
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch = bookmark.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;

    const progress = getBookmarkProgress(bookmark.id);
    if (activeTab === 'reading') {
      return progress && progress.percentage > 0 && progress.percentage < 100;
    }
    if (activeTab === 'completed') {
      return progress && progress.percentage >= 100;
    }
    return true;
  });

  const readingCount = bookmarks.filter((b) => {
    const p = getBookmarkProgress(b.id);
    return p && p.percentage > 0 && p.percentage < 100;
  }).length;

  const completedCount = bookmarks.filter((b) => {
    const p = getBookmarkProgress(b.id);
    return p && p.percentage >= 100;
  }).length;

  const tabs = [
    { id: 'all', label: 'All', count: bookmarks.length },
    { id: 'reading', label: 'Reading', count: readingCount },
    { id: 'completed', label: 'Completed', count: completedCount },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 sm:pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-3">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 fill-pink-500" />
              My Library
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/lists"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors"
              >
                <List size={16} />
                <span className="hidden sm:inline">My Lists</span>
              </Link>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-xl transition-all ${showSearch ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Search size={20} />
              </button>
              {bookmarks.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5"
                  title="Clear All"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Search Input */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden py-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 pr-10"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'all' | 'reading' | 'completed')}
            variant="underline"
          />
        </div>

        {/* Content */}
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-600">
              <BookOpen size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Your library is empty</h2>
            <p className="text-gray-400 max-w-xs mb-8">
              Looks like you haven&apos;t added any series yet. Explore the collection to
              find your next adventure.
            </p>
            <Link
              href="/search"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 transition-all"
            >
              Explore Now
            </Link>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-medium">
            No series found in this category
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookmarks.map((bookmark) => {
              const progress = getBookmarkProgress(bookmark.id);
              return (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() =>
                    router.push(`/manhwa/${encodeURIComponent(bookmark.id)}`)
                  }
                  className="flex gap-4 p-4 bg-gray-900/40 border border-white/5 rounded-2xl cursor-pointer hover:bg-gray-800/60 hover:border-white/10 transition-all group relative"
                >
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => handleAddToList(bookmark, e)}
                      className={`p-1.5 rounded-full transition-colors ${
                        getManhwaLists(bookmark.id).length > 0
                          ? 'bg-purple-600 text-white'
                          : 'bg-black/60 text-gray-400 hover:text-purple-400'
                      }`}
                      title="Add to List"
                    >
                      <List size={14} />
                    </button>
                    <button
                      onClick={(e) => handleRemoveBookmark(bookmark.id, e)}
                      className="p-1.5 bg-black/60 rounded-full text-gray-400 hover:text-red-400"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden relative shadow-lg">
                    <Image
                      src={bookmark.image}
                      alt={bookmark.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="text-white font-bold text-base truncate mb-1 group-hover:text-blue-400 transition-colors">
                      {bookmark.title}
                    </h3>
                    {progress ? (
                      <>
                        <p className="text-gray-400 text-xs mb-3">
                          {progress.lastChapter}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                          <div
                            className="bg-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                          <span>{progress.percentage}% Read</span>
                          <span className="text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Continue <ChevronRight size={10} />
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-xs">Not started yet</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 z-50"
            >
              <h3 className="text-xl font-bold text-white mb-2">Clear Library?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will remove all {bookmarks.length} bookmarked series from your
                library. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearBookmarks}
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add to List Modal */}
      {selectedManhwa && (
        <AddToListModal
          isOpen={listModalOpen}
          onClose={() => {
            setListModalOpen(false);
            setSelectedManhwa(null);
          }}
          manhwa={selectedManhwa}
        />
      )}
    </div>
  );
}
