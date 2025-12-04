'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { manhwaAPI } from '@/lib/api';
import { ChapterPage, Provider, ManhwaInfo } from '@/lib/types';
import { ArrowLeft, ChevronLeft, ChevronRight, List, X, Heart, Settings, Check, Maximize2, Minimize2 } from 'lucide-react';
import { addToHistory, isBookmarked, toggleBookmark } from '@/lib/storage';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/contexts/ToastContext';

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
  const [imageFit, setImageFit] = useState<'contained' | 'full'>('contained');
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  const { success } = useToast();
  
  // Reading history tracking
  const { markChapterRead } = useReadingHistory();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [chapterId, manhwaId]);

  // Auto-hide controls logic
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (showControls && !showSettings && !showChapterDrawer) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [showControls, showSettings, showChapterDrawer]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      resetControlsTimeout();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [resetControlsTimeout]);

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
      } else if (e.key === 'm') {
        toggleControls();
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
      
      const decodedChapterId = decodeURIComponent(chapterId);
      const index = info.chapters.findIndex(ch => ch.id === decodedChapterId);
      setCurrentChapterIndex(index);

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

  const handleBookmarkToggle = () => {
    if (!manhwaInfo) return;
    
    const newBookmarked = toggleBookmark({
      id: decodeURIComponent(manhwaId),
      title: manhwaInfo.title,
      image: manhwaInfo.image,
      addedAt: Date.now(),
    });
    
    setBookmarked(newBookmarked);
    success(newBookmarked ? 'Added to bookmarks ❤️' : 'Removed from bookmarks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-white/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-6 text-sm font-medium animate-pulse">Loading chapter...</p>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <p className="text-red-400 text-xl mb-6 font-semibold">{error || 'Failed to load chapter'}</p>
          <Link
            href={`/manhwa/${encodeURIComponent(manhwaId)}`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Details
          </Link>
        </div>
      </div>
    );
  }

  const hasPrevChapter = manhwaInfo && currentChapterIndex < manhwaInfo.chapters.length - 1;
  const hasNextChapter = manhwaInfo && currentChapterIndex > 0;

  return (
    <div className="min-h-screen bg-black relative selection:bg-primary/30">
      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0.5 }}
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </motion.div>

      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div className="bg-gradient-to-b from-black/90 to-transparent backdrop-blur-xl border-b border-white/5 pb-2 pt-2">
              <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/manhwa/${encodeURIComponent(manhwaId)}`}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div className="hidden md:block">
                    <h1 className="text-white font-bold text-sm line-clamp-1">{manhwaInfo?.title}</h1>
                    <p className="text-gray-400 text-xs">
                      Chapter {manhwaInfo?.chapters.length && currentChapterIndex >= 0 
                        ? manhwaInfo.chapters.length - currentChapterIndex 
                        : '...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBookmarkToggle}
                    className={`p-2 rounded-full transition-all border border-white/5 ${
                      bookmarked 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full transition-all border border-white/5 ${
                      showSettings ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Menu */}
      <AnimatePresence>
        {showSettings && showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 right-4 z-50 w-72 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Display Mode</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toggleImageFit('contained')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      imageFit === 'contained'
                        ? 'bg-primary/10 border-primary/50 text-primary'
                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Minimize2 className="w-5 h-5 mb-2" />
                    <span className="text-xs font-medium">Fit Width</span>
                  </button>
                  <button
                    onClick={() => toggleImageFit('full')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      imageFit === 'full'
                        ? 'bg-primary/10 border-primary/50 text-primary'
                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Maximize2 className="w-5 h-5 mb-2" />
                    <span className="text-xs font-medium">Full Size</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Click to toggle controls */}
      <div 
        className="min-h-screen w-full cursor-pointer"
        onClick={toggleControls}
      >
        <div className={`w-full mx-auto transition-all duration-300 ${
          imageFit === 'contained' ? 'max-w-3xl' : 'max-w-full'
        }`}>
          {pages.map((page, index) => (
            <div key={page.page} className="relative w-full">
              <Image
                src={page.img}
                alt={`Page ${page.page}`}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto select-none"
                loading={index < 3 ? 'eager' : 'lazy'}
                quality={90}
                priority={index < 2}
              />
            </div>
          ))}
        </div>
        
        {/* Bottom Padding for Controls */}
        <div className="h-32" />
      </div>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-gradient-to-t from-black/90 to-transparent backdrop-blur-xl border-t border-white/5 pb-6 pt-4">
              <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
                <button
                  onClick={(e) => { e.stopPropagation(); navigateToPrevChapter(); }}
                  disabled={!hasPrevChapter}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all ${
                    hasPrevChapter
                      ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); setShowChapterDrawer(true); }}
                  className="h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                  <List className="w-5 h-5" />
                  <span className="hidden sm:inline">Chapters</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); navigateToNextChapter(); }}
                  disabled={!hasNextChapter}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all ${
                    hasNextChapter
                      ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Drawer */}
      <AnimatePresence>
        {showChapterDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChapterDrawer(false)}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[70] w-80 bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="font-bold text-white flex items-center">
                  <List className="w-5 h-5 mr-2 text-primary" />
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
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
                      className={`block px-4 py-3 rounded-xl text-sm transition-all ${
                        chapter.id === decodeURIComponent(chapterId)
                          ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">{chapter.title || `Chapter ${chapter.id}`}</span>
                        {chapter.id === decodeURIComponent(chapterId) && (
                          <Check className="w-4 h-4 text-primary ml-2" />
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
