'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { manhwaAPI } from '@/lib/api';
import { ChapterPage, Provider, ManhwaInfo } from '@/lib/types';
import { ArrowLeft, ChevronLeft, ChevronRight, List, X, Heart, Settings, Check } from 'lucide-react';
import { addToHistory, isBookmarked, toggleBookmark } from '@/lib/storage';
import { useReadingHistory } from '@/hooks/useReadingHistory';

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default function ChapterReaderPage({ params }: PageProps) {
  const router = useRouter();
  const provider = Provider.MANHUAUS;
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [manhwaInfo, setManhwaInfo] = useState<ManhwaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manhwaId, setManhwaId] = useState<string>('');
  const [chapterId, setChapterId] = useState<string>('');
  const [showControls, setShowControls] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [bookmarked, setBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [imageFit, setImageFit] = useState<'contained' | 'full'>('contained');
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  
  // Reading history tracking
  const { markChapterRead, getProgress } = useReadingHistory();

  useEffect(() => {
    // Load settings
    const savedFit = localStorage.getItem('reader_image_fit');
    if (savedFit === 'full' || savedFit === 'contained') {
      setImageFit(savedFit);
    }
  }, []);

  const toggleImageFit = (fit: 'contained' | 'full') => {
    setImageFit(fit);
    localStorage.setItem('reader_image_fit', fit);
    setShowSettings(false);
  };

  useEffect(() => {
    params.then((p) => {
      setManhwaId(p.id);
      setChapterId(p.chapterId);
    });
  }, [params]);

  useEffect(() => {
    if (manhwaId && chapterId) {
      loadChapter();
      loadManhwaInfo();
      setBookmarked(isBookmarked(decodeURIComponent(manhwaId)));
      window.scrollTo(0, 0);
    }
  }, [chapterId, manhwaId, provider]);

  // Auto-hide controls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleInteraction = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!showSettings) { // Don't hide if settings menu is open
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [showSettings]);

  // Scroll progress tracking
  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push(`/manhwa/${encodeURIComponent(manhwaId)}`);
      } else if (e.key === 'ArrowLeft') {
        navigateToPrevChapter();
      } else if (e.key === 'ArrowRight') {
        navigateToNextChapter();
      } else if (e.key === ' ') {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [manhwaId, currentChapterIndex, manhwaInfo]);

  const loadManhwaInfo = async () => {
    try {
      manhwaAPI.setProvider(provider);
      const info = await manhwaAPI.getManhwaInfo(decodeURIComponent(manhwaId));
      setManhwaInfo(info);
      
      // Find current chapter index
      const decodedChapterId = decodeURIComponent(chapterId);
      const index = info.chapters.findIndex(ch => ch.id === decodedChapterId);
      setCurrentChapterIndex(index);

      // Add to history
      const currentChapter = info.chapters.find(ch => ch.id === decodedChapterId);
      if (currentChapter) {
        addToHistory({
          manhwaId: decodeURIComponent(manhwaId),
          manhwaTitle: info.title,
          manhwaImage: info.image,
          chapterId: decodedChapterId,
          chapterTitle: currentChapter.title || `Chapter ${decodedChapterId}`,
          lastReadAt: Date.now(),
        });
      }
    } catch (err) {
      console.error('Failed to load manhwa info:', err);
    }
  };

  const loadChapter = async () => {
    try {
      setLoading(true);
      setError(null);
      manhwaAPI.setProvider(provider);
      const decodedChapterId = decodeURIComponent(chapterId);
      const chapterPages = await manhwaAPI.getChapterPages(decodedChapterId);
      setPages(chapterPages);
    } catch (err) {
      setError('Failed to load chapter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mark chapter as read once both manhwaInfo and pages are loaded
  useEffect(() => {
    if (manhwaInfo && pages.length > 0 && chapterId && manhwaId) {
      const decodedChapterId = decodeURIComponent(chapterId);
      const currentChapter = manhwaInfo.chapters.find(
        (ch) => String(ch.id) === decodedChapterId
      );
      
      if (currentChapter) {
        markChapterRead(
          decodeURIComponent(manhwaId),
          manhwaInfo.title,
          manhwaInfo.image,
          decodedChapterId,
          currentChapter.title || `Chapter ${decodedChapterId}`,
          manhwaInfo.chapters.length
        );
      }
    }
  }, [manhwaInfo, pages, chapterId, manhwaId, markChapterRead]);

  const navigateToPrevChapter = () => {
    if (manhwaInfo && currentChapterIndex < manhwaInfo.chapters.length - 1) {
      const prevChapter = manhwaInfo.chapters[currentChapterIndex + 1];
      router.push(`/manhwa/${encodeURIComponent(manhwaId)}/read/${encodeURIComponent(String(prevChapter.id))}`);
    }
  };

  const navigateToNextChapter = () => {
    if (manhwaInfo && currentChapterIndex > 0) {
      const nextChapter = manhwaInfo.chapters[currentChapterIndex - 1];
      router.push(`/manhwa/${encodeURIComponent(manhwaId)}/read/${encodeURIComponent(String(nextChapter.id))}`);
    }
  };

  const goBack = () => {
    router.push(`/manhwa/${encodeURIComponent(manhwaId)}`);
  };

  const handleBookmarkToggle = () => {
    if (!manhwaInfo) return;
    
    const newBookmarked = toggleBookmark({
      id: decodeURIComponent(manhwaId),
      title: manhwaInfo.title,
      image: manhwaInfo.image,
      addedAt: Date.now(),
    });
    
    setBookmarked(newBookmarked);
    setToastMessage(newBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 border-t-red-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 mt-6 text-lg font-medium">Loading chapter...</p>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <p className="text-red-400 text-xl mb-6 font-semibold">
            {error || 'Failed to load chapter'}
          </p>
          <p className="text-gray-500 mb-8">
            The chapter content could not be loaded. Please try again later.
          </p>
          <Link
            href={`/manhwa/${encodeURIComponent(manhwaId)}`}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Chapters
          </Link>
        </div>
      </div>
    );
  }

  const hasPrevChapter = manhwaInfo && currentChapterIndex < manhwaInfo.chapters.length - 1;
  const hasNextChapter = manhwaInfo && currentChapterIndex > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-pink-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Navigation */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-black/80 backdrop-blur-xl border-b border-white/5 mt-1">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ring-1 ring-white/10">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-gray-500 text-sm hidden sm:inline">Reading</span>
              <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-500/20">
                Chapter {manhwaInfo?.chapters.length && currentChapterIndex >= 0 
                  ? manhwaInfo.chapters.length - currentChapterIndex 
                  : '...'}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center space-x-2 ring-1 ring-white/10 ${
                  bookmarked 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
                title={bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
              >
                <Heart className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline font-medium">{bookmarked ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => setShowChapterDrawer(true)}
                className="p-2 sm:px-4 sm:py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center space-x-2 ring-1 ring-white/10"
                title="Chapter List"
              >
                <List className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Chapters</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center space-x-2 ring-1 ring-white/10 ${
                    showSettings 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                  title="Reading Settings"
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Settings</span>
                </button>

                {/* Settings Dropdown */}
                {showSettings && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                    <div className="p-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Image Fit</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleImageFit('contained')}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            imageFit === 'contained'
                              ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span>Fit to Width (Recommended)</span>
                          {imageFit === 'contained' && <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleImageFit('full')}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            imageFit === 'full'
                              ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span>Full Screen</span>
                          {imageFit === 'full' && <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div className={`w-full mx-auto pt-1 transition-all duration-300 ${
        imageFit === 'contained' ? 'max-w-3xl' : 'max-w-full'
      }`}>
        <div className="flex flex-col items-center">
          {pages.map((page, index) => (
            <div
              key={page.page}
              className="relative w-full flex justify-center"
            >
              <Image
                src={page.img}
                alt={`Page ${page.page}`}
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, 768px"
                className="select-none w-full h-auto"
                style={{
                  imageRendering: 'crisp-edges',
                }}
                loading={index < 3 ? 'eager' : 'lazy'}
                draggable={false}
              />
              {/* Page Number Overlay */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-lg ring-1 ring-white/10">
                {page.page} / {pages.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-black/60 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Previous Chapter */}
              <button
                onClick={navigateToPrevChapter}
                disabled={!hasPrevChapter}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  hasPrevChapter
                    ? 'bg-white/5 hover:bg-white/10 text-white ring-1 ring-white/10 hover:ring-white/20'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed ring-1 ring-white/5'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Back to Chapters (Toggle Drawer) */}
              <button
                onClick={() => setShowChapterDrawer(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20"
              >
                <List className="w-5 h-5" />
                <span>Chapters</span>
              </button>

              {/* Next Chapter */}
              <button
                onClick={navigateToNextChapter}
                disabled={!hasNextChapter}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  hasNextChapter
                    ? 'bg-white/5 hover:bg-white/10 text-white ring-1 ring-white/10 hover:ring-white/20'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed ring-1 ring-white/5'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="mt-3 text-center text-xs text-gray-500 hidden sm:block">
              <span className="inline-flex items-center space-x-4">
                <span>← Prev</span>
                <span>→ Next</span>
                <span>Space Scroll</span>
                <span>Esc Exit</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-80 bg-[#1a1a1a] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showChapterDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <h3 className="font-bold text-white flex items-center">
              <List className="w-5 h-5 mr-2 text-red-500" />
              Chapters
            </h3>
            <button
              onClick={() => setShowChapterDrawer(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-white/10">
            <input
              type="text"
              placeholder="Search chapters..."
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {manhwaInfo?.chapters
              .filter(ch => ch.title?.toLowerCase().includes(chapterSearch.toLowerCase()) || ch.id.includes(chapterSearch))
              .map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manhwa/${encodeURIComponent(manhwaId)}/read/${encodeURIComponent(chapter.id)}`}
                  onClick={() => setShowChapterDrawer(false)}
                  className={`block px-4 py-3 rounded-lg text-sm transition-all ${
                    chapter.id === decodeURIComponent(chapterId)
                      ? 'bg-red-500/10 text-red-400 font-medium ring-1 ring-red-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{chapter.title || `Chapter ${chapter.id}`}</span>
                    {chapter.id === decodeURIComponent(chapterId) && (
                      <div className="w-2 h-2 rounded-full bg-red-500 ml-2" />
                    )}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {showChapterDrawer && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setShowChapterDrawer(false)}
        />
      )}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="bg-black/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl shadow-red-500/20 ring-1 ring-white/10 flex items-center space-x-3">
          <div className={`p-1 rounded-full ${bookmarked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <Heart className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </div>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}
