'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Play, History } from 'lucide-react';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { getBookmarks, removeBookmark, Bookmark } from '@/lib/storage';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { Tabs } from '@/components/ui';

type Tab = 'bookmarks' | 'history' | 'completed';

export default function LibraryPage() {
  const router = useRouter();
  const { getProgress, history } = useReadingHistory();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('bookmarks');

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  // Get reading history for each bookmark to show progress
  const getBookmarkWithProgress = (bookmark: Bookmark) => {
    const historyItem = history.find((h) => h.manhwaId === bookmark.id);
    const progress = getProgress(bookmark.id);

    return {
      ...bookmark,
      lastChapterId: historyItem?.lastChapterId || '',
      lastChapterTitle: historyItem?.lastChapterTitle || 'Start Reading',
      timestamp: historyItem?.timestamp || 0,
      progress: progress?.progress || 0,
      chaptersRead: progress?.chaptersRead || 0,
      totalChapters: progress?.totalChapters || 0,
    };
  };

  const bookmarksWithProgress = bookmarks.map(getBookmarkWithProgress);

  // Get history items with progress
  const historyWithProgress = history.map((item) => {
    const progress = getProgress(item.manhwaId);
    return {
      id: item.manhwaId,
      title: item.manhwaTitle,
      image: item.manhwaImage,
      lastChapterId: item.lastChapterId,
      lastChapterTitle: item.lastChapterTitle,
      timestamp: item.timestamp,
      progress: progress?.progress || 0,
      chaptersRead: progress?.chaptersRead || 0,
      totalChapters: progress?.totalChapters || 0,
    };
  });

  // Separate lists
  const bookmarksList = bookmarksWithProgress;
  const historyList = historyWithProgress.filter((item) => item.progress < 100);
  const completedList = historyWithProgress.filter((item) => item.progress >= 100);

  const currentList =
    activeTab === 'bookmarks'
      ? bookmarksList
      : activeTab === 'history'
        ? historyList
        : completedList;

  const handleRemoveFromLibrary = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark(id);
    setBookmarks(getBookmarks());
  };

  const tabs = [
    { id: 'bookmarks', label: 'Bookmarks', count: bookmarksList.length },
    { id: 'history', label: 'History', count: historyList.length },
    { id: 'completed', label: 'Completed', count: completedList.length },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 sm:pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={() => router.push('/')}
              className="p-1.5 sm:p-2 -ml-1.5 sm:-ml-2 text-gray-400 hover:text-white transition-colors rounded-lg sm:rounded-xl hover:bg-white/5 active:scale-95"
            >
              <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
              <History className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
              My Library
            </h1>
            <div className="w-8 sm:w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 pt-4 sm:pt-6">
        <div className="mb-4 sm:mb-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as Tab)}
            variant="underline"
          />
        </div>
        {currentList.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
              {activeTab === 'bookmarks' ? '📚' : activeTab === 'history' ? '📖' : '✅'}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {activeTab === 'bookmarks'
                ? 'No bookmarks yet'
                : activeTab === 'history'
                  ? 'No reading history'
                  : 'No completed series'}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 px-4">
              {activeTab === 'bookmarks'
                ? 'Add manhwa to your library to see them here!'
                : activeTab === 'history'
                  ? 'Start reading some manhwa to see them here!'
                  : 'Complete a series to see it here!'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base active:scale-95"
            >
              Browse Manhwa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
            {currentList.map((item) => {
              return (
                <div
                  key={item.id}
                  className="group bg-white/5 rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 relative active:scale-[0.98]"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveFromLibrary(item.id, e)}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from Library"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>

                  {/* Cover Image */}
                  <Link
                    href={`/manhwa/${encodeURIComponent(item.id)}`}
                    className="relative block aspect-2/3 overflow-hidden bg-black/20"
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <Link
                      href={`/manhwa/${encodeURIComponent(item.id)}`}
                      className="font-bold text-white text-sm line-clamp-2 hover:text-blue-400 transition-colors mb-2 block"
                    >
                      {item.title}
                    </Link>

                    {item.lastChapterId && (
                      <div className="text-xs text-blue-400 font-medium mb-2">
                        {item.lastChapterTitle}
                      </div>
                    )}

                    {/* Progress Bar */}
                    {item.totalChapters > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {item.chaptersRead}/{item.totalChapters}
                          </span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Continue/Start Button */}
                    <Link
                      href={
                        item.lastChapterId
                          ? `/manhwa/${encodeURIComponent(item.id)}/read/${encodeURIComponent(item.lastChapterId)}`
                          : `/manhwa/${encodeURIComponent(item.id)}`
                      }
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs transition-all active:scale-95"
                    >
                      <Play size={12} fill="currentColor" />
                      {item.lastChapterId ? 'Continue' : 'Start Reading'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
