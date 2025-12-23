'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { manhwaAPI } from '@/lib/api';
import ReaderImage from '@/components/ReaderImage';
import { ChapterPage, Provider, ManhwaInfo } from '@/lib/types';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Settings,
  Bookmark,
  Check,
  Maximize2,
  Minimize2,
  List,
  X,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  Loader2,
} from 'lucide-react';
import { addToHistory, isBookmarked, toggleBookmark } from '@/lib/storage';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useCloudSyncContext } from '@/contexts/CloudSyncContext';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import { useToast } from '@/contexts/ToastContext';
import Comments from '@/components/Comments';

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

// Reading mode types
type ReadingMode = 'vertical' | 'paged';
type ImageFitMode = 'contained' | 'full';
type ColorMode = 'normal' | 'sepia' | 'dark';

export default function ChapterReaderPage({ params }: PageProps) {
  const router = useRouter();

  // Data State
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [manhwaInfo, setManhwaInfo] = useState<ManhwaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ID State
  const [manhwaId, setManhwaId] = useState<string>('');
  const [chapterId, setChapterId] = useState<string>('');

  // UI State
  const [showControls, setShowControls] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [bookmarked, setBookmarked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');

  // Reader Settings
  const [imageFit, setImageFit] = useState<ImageFitMode>('contained');
  const [readingMode, setReadingMode] = useState<ReadingMode>('vertical');
  const [colorMode, setColorMode] = useState<ColorMode>('normal');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Preloading state
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  // Swipe gesture state
  const swipeX = useMotionValue(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const { success } = useToast();
  const { markChapterRead, getChapterProgress } = useReadingHistory();
  const { updateProgress, isEnabled: cloudSyncEnabled } = useCloudSyncContext();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasRestoredScroll = useRef(false);

  // Load Params
  useEffect(() => {
    params.then((p) => {
      setManhwaId(p.id);
      setChapterId(p.chapterId);
    });
  }, [params]);

  // Initial Load
  useEffect(() => {
    if (manhwaId && chapterId) {
      loadChapter();
      loadManhwaInfo();
      setBookmarked(isBookmarked(decodeURIComponent(manhwaId)));

      // Reset scroll restoration flag when chapter changes
      hasRestoredScroll.current = false;

      // Load saved settings
      const savedFit = localStorage.getItem('reader_image_fit') as ImageFitMode;
      const savedMode = localStorage.getItem('reader_mode') as ReadingMode;
      const savedColor = localStorage.getItem('reader_color_mode') as ColorMode;

      if (savedFit) setImageFit(savedFit);
      if (savedMode) setReadingMode(savedMode);
      if (savedColor) setColorMode(savedColor);
    }
  }, [chapterId, manhwaId]);

  // Preload next chapter images
  useEffect(() => {
    if (!manhwaInfo || currentChapterIndex <= 0 || isPreloading) return;

    const preloadNextChapter = async () => {
      const nextChapter = manhwaInfo.chapters[currentChapterIndex - 1];
      if (!nextChapter) return;

      // Check if already preloaded
      if (preloadedImages.has(nextChapter.id)) return;

      setIsPreloading(true);
      try {
        // Pass source provider for consistent fetching
        const nextPages = await manhwaAPI.getChapterPages(
          nextChapter.id,
          manhwaInfo.provider,
        );

        // Preload first 5 images of next chapter
        const imagesToPreload = nextPages.slice(0, 5);
        await Promise.all(
          imagesToPreload.map((page) => {
            return new Promise((resolve) => {
              const img = new window.Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = page.img;
            });
          }),
        );

        setPreloadedImages((prev) => new Set([...prev, nextChapter.id]));
        console.log('✅ Preloaded next chapter:', nextChapter.id);
      } catch {
        console.log('Failed to preload next chapter');
      } finally {
        setIsPreloading(false);
      }
    };

    // Start preloading when user is 70% through current chapter
    if (scrollProgress > 70) {
      preloadNextChapter();
    }
  }, [manhwaInfo, currentChapterIndex, scrollProgress, isPreloading, preloadedImages]);

  // Restore scroll position from saved progress
  useEffect(() => {
    if (!pages.length || hasRestoredScroll.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const savedProgress = getChapterProgress(
      decodeURIComponent(manhwaId),
      decodeURIComponent(chapterId),
    );

    if (savedProgress > 0 && savedProgress < 100) {
      // Wait a bit for images to start loading
      setTimeout(() => {
        const { scrollHeight, clientHeight } = container;
        const targetScroll = (savedProgress / 100) * (scrollHeight - clientHeight);

        console.log('Restoring scroll position:', {
          savedProgress,
          scrollHeight,
          clientHeight,
          targetScroll,
        });

        container.scrollTop = targetScroll;
        hasRestoredScroll.current = true;
      }, 500); // Wait 500ms for images to start rendering
    } else {
      // No saved progress or finished chapter, start from top
      container.scrollTop = 0;
      hasRestoredScroll.current = true;
    }
  }, [pages, manhwaId, chapterId, getChapterProgress]);

  // Controls Auto-Hide
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

  // Scroll Handler for Progress
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Avoid division by zero
      if (scrollHeight === clientHeight) return;

      // Only calculate if container is properly loaded (has content)
      if (scrollHeight <= clientHeight) return;

      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      const clampedProgress = Math.min(100, Math.max(0, progress));

      // Debug logging
      console.log('Scroll calculation:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        calculatedProgress: clampedProgress,
      });

      setScrollProgress(clampedProgress);

      resetControlsTimeout();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [resetControlsTimeout]);

  // Save Progress on Scroll (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if we have valid data
      if (!manhwaInfo || !chapterId) return;

      const decodedChapterId = decodeURIComponent(chapterId);
      const currentChapter = manhwaInfo.chapters.find((ch) => ch.id === decodedChapterId);

      if (currentChapter && scrollProgress >= 0) {
        const roundedProgress = Math.round(scrollProgress);
        console.log(
          'Saving progress:',
          roundedProgress,
          'for chapter:',
          decodedChapterId,
        );

        markChapterRead(
          decodeURIComponent(manhwaId),
          manhwaInfo.title,
          manhwaInfo.image,
          decodedChapterId,
          currentChapter.title || `Chapter ${decodedChapterId}`,
          manhwaInfo.chapters.length,
          roundedProgress,
        );

        // Sync to cloud if enabled (debounced - only sync every 10% or on completion)
        if (cloudSyncEnabled && (roundedProgress % 10 === 0 || roundedProgress >= 90)) {
          updateProgress({
            manhwaId: decodeURIComponent(manhwaId),
            manhwaTitle: manhwaInfo.title,
            manhwaImage: manhwaInfo.image,
            lastChapterId: decodedChapterId,
            lastChapterTitle: currentChapter.title || `Chapter ${decodedChapterId}`,
            timestamp: Date.now(),
            chaptersRead: roundedProgress >= 90 ? [decodedChapterId] : [],
            chapterProgress: { [decodedChapterId]: roundedProgress },
            totalChapters: manhwaInfo.chapters.length,
          });
        }
      }
    }, 1000); // Save every 1 second of inactivity or scroll pause

    return () => clearTimeout(timer);
  }, [
    scrollProgress,
    manhwaId,
    chapterId,
    manhwaInfo,
    markChapterRead,
    cloudSyncEnabled,
    updateProgress,
  ]);

  const toggleControls = () => setShowControls((prev) => !prev);

  const updateSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const toggleImageFit = (fit: ImageFitMode) => {
    setImageFit(fit);
    updateSetting('reader_image_fit', fit);
  };

  const toggleReadingMode = (mode: ReadingMode) => {
    setReadingMode(mode);
    updateSetting('reader_mode', mode);
    if (mode === 'paged') {
      setCurrentPageIndex(0);
    }
  };

  const toggleColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    updateSetting('reader_color_mode', mode);
  };

  // Swipe gesture handlers for mobile
  const handleSwipeEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 && hasPrevChapter) {
        // Swiped right - go to previous chapter
        setSwipeDirection('right');
        setTimeout(() => {
          navigateToPrevChapter();
          setSwipeDirection(null);
        }, 200);
      } else if (offset < 0 && hasNextChapter) {
        // Swiped left - go to next chapter
        setSwipeDirection('left');
        setTimeout(() => {
          navigateToNextChapter();
          setSwipeDirection(null);
        }, 200);
      }
    }
    swipeX.set(0);
  };

  // Page mode navigation
  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else if (hasNextChapter) {
      navigateToNextChapter();
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    } else if (hasPrevChapter) {
      navigateToPrevChapter();
    }
  };

  // Color mode CSS filter
  const getColorFilter = () => {
    switch (colorMode) {
      case 'sepia':
        return 'sepia(30%) brightness(0.95)';
      case 'dark':
        return 'brightness(0.8) contrast(1.1)';
      default:
        return 'none';
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push(`/manhwa/${encodeURIComponent(manhwaId)}`);
      else if (e.key === 'm') toggleControls();
      else if (readingMode === 'paged') {
        // Paged mode: arrows navigate pages
        if (e.key === 'ArrowLeft') goToPrevPage();
        else if (e.key === 'ArrowRight') goToNextPage();
      } else {
        // Vertical mode: arrows navigate chapters
        if (e.key === 'ArrowLeft') navigateToPrevChapter();
        else if (e.key === 'ArrowRight') navigateToNextChapter();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    manhwaId,
    currentChapterIndex,
    manhwaInfo,
    readingMode,
    currentPageIndex,
    pages.length,
  ]);

  // Logic: Load Manhwa Info
  const loadManhwaInfo = async () => {
    try {
      manhwaAPI.setProvider(Provider.COMIXTO);
      const info = await manhwaAPI.getManhwaInfo(decodeURIComponent(manhwaId));
      setManhwaInfo(info);

      const decodedChapterId = decodeURIComponent(chapterId);
      const index = info.chapters.findIndex((ch) => ch.id === decodedChapterId);
      setCurrentChapterIndex(index);

      // Add to history
      const currentChapter = info.chapters.find((ch) => ch.id === decodedChapterId);
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

  // Logic: Load Chapter Pages
  const loadChapter = async () => {
    try {
      setLoading(true);
      setError(null);
      manhwaAPI.setProvider(Provider.COMIXTO);
      const decodedChapterId = decodeURIComponent(chapterId);
      // Pass the source provider from manhwaInfo if available
      const sourceProvider = manhwaInfo?.provider;
      const chapterPages = await manhwaAPI.getChapterPages(
        decodedChapterId,
        sourceProvider,
      );

      // Filter out mgeko promotional images only
      const filteredPages = chapterPages.filter((page) => {
        const imgUrl = page.img.toLowerCase();
        return !imgUrl.includes('mgeko');
      });

      setPages(filteredPages);
    } catch (err) {
      setError('Failed to load chapter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const navigateToPrevChapter = () => {
    if (manhwaInfo && currentChapterIndex < manhwaInfo.chapters.length - 1) {
      const prev = manhwaInfo.chapters[currentChapterIndex + 1];
      router.push(
        `/manhwa/${encodeURIComponent(manhwaId)}/read/${encodeURIComponent(String(prev.id))}`,
      );
    }
  };

  const navigateToNextChapter = () => {
    if (manhwaInfo && currentChapterIndex > 0) {
      const next = manhwaInfo.chapters[currentChapterIndex - 1];
      router.push(
        `/manhwa/${encodeURIComponent(manhwaId)}/read/${encodeURIComponent(String(next.id))}`,
      );
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
    success(newBookmarked ? 'Added to Library' : 'Removed from Library');
  };

  const hasPrevChapter =
    manhwaInfo && currentChapterIndex < manhwaInfo.chapters.length - 1;
  const hasNextChapter = manhwaInfo && currentChapterIndex > 0;
  const currentChapter = manhwaInfo?.chapters[currentChapterIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-6 text-sm font-bold animate-pulse">
          Loading Chapter...
        </p>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <p className="text-red-500 text-xl font-bold mb-4">
          {error || 'Failed to load chapter'}
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-white/10 rounded-xl text-white font-bold hover:bg-white/20 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar */}
      <motion.div
        initial={false}
        animate={{ y: showControls ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute top-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md p-4 flex justify-between items-center z-50 border-b border-white/5"
      >
        <div className="flex items-center gap-4 text-white">
          <button
            onClick={() => router.push(`/manhwa/${encodeURIComponent(manhwaId)}`)}
            className="hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold truncate w-48 md:w-auto">
              {manhwaInfo?.title}
            </span>
            <span className="text-xs text-gray-400">
              {currentChapter?.title || `Chapter ${chapterId}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleBookmarkToggle}
            className={`transition-colors ${bookmarked ? 'text-blue-500' : 'text-white hover:text-blue-400'}`}
          >
            <Bookmark size={24} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`transition-colors ${showSettings ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Settings Menu Popup */}
      <AnimatePresence>
        {showSettings && showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 right-4 z-[60] w-72 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 space-y-5"
          >
            {/* Reading Mode */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Reading Mode
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleReadingMode('vertical')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${readingMode === 'vertical' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <Smartphone className="w-5 h-5 mb-2" />
                  <span className="text-xs font-bold">Scroll</span>
                </button>
                <button
                  onClick={() => toggleReadingMode('paged')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${readingMode === 'paged' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <Monitor className="w-5 h-5 mb-2" />
                  <span className="text-xs font-bold">Paged</span>
                </button>
              </div>
            </div>

            {/* Display Mode */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Display Size
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleImageFit('contained')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${imageFit === 'contained' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <Minimize2 className="w-5 h-5 mb-2" />
                  <span className="text-xs font-bold">Fit Width</span>
                </button>
                <button
                  onClick={() => toggleImageFit('full')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${imageFit === 'full' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <Maximize2 className="w-5 h-5 mb-2" />
                  <span className="text-xs font-bold">Full Size</span>
                </button>
              </div>
            </div>

            {/* Color Mode */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Color Mode
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => toggleColorMode('normal')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${colorMode === 'normal' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <div className="w-5 h-5 mb-2 rounded-full bg-white border-2 border-gray-300" />
                  <span className="text-xs font-bold">Normal</span>
                </button>
                <button
                  onClick={() => toggleColorMode('sepia')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${colorMode === 'sepia' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <Sun className="w-5 h-5 mb-2 text-amber-400" />
                  <span className="text-xs font-bold">Sepia</span>
                </button>
                <button
                  onClick={() => toggleColorMode('dark')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${colorMode === 'dark' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                >
                  <Moon className="w-5 h-5 mb-2" />
                  <span className="text-xs font-bold">Dark</span>
                </button>
              </div>
            </div>

            {/* Preload indicator */}
            {isPreloading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-white/10">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Preloading next chapter...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Indicator Overlays */}
      <AnimatePresence>
        {swipeDirection === 'left' && hasNextChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-y-0 right-0 w-20 bg-gradient-to-l from-blue-600/30 to-transparent z-40 flex items-center justify-center"
          >
            <ChevronRight className="w-10 h-10 text-white animate-pulse" />
          </motion.div>
        )}
        {swipeDirection === 'right' && hasPrevChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-y-0 left-0 w-20 bg-gradient-to-r from-blue-600/30 to-transparent z-40 flex items-center justify-center"
          >
            <ChevronLeft className="w-10 h-10 text-white animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Area */}
      <motion.div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto scroll-smooth hide-scrollbar relative h-full ${readingMode === 'paged' ? 'overflow-hidden' : ''}`}
        style={{ filter: getColorFilter() }}
        onClick={toggleControls}
        drag={readingMode === 'vertical' ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipeEnd}
      >
        {readingMode === 'vertical' ? (
          // Vertical Scroll Mode
          <div
            className={`mx-auto bg-black min-h-full shadow-2xl transition-all duration-300 ${imageFit === 'contained' ? 'max-w-2xl border-x border-white/5' : 'w-full'}`}
          >
            {pages.map((page, index) => (
              <ReaderImage
                key={index}
                src={page.img}
                alt={`Page ${index + 1}`}
                priority={index < 3}
              />
            ))}

            {/* Next Chapter Button at bottom */}
            <div className="p-12 flex flex-col items-center gap-6 bg-gray-950 text-white border-t border-white/5">
              {/* Inkora Banner */}
              <div className="w-full max-w-md bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-white/10 mb-4">
                <div className="text-center">
                  <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    Inkora
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">Your Premium Manhwa Reader</p>
                  <div className="flex justify-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">⚡ Fast Updates</span>
                    <span className="flex items-center gap-1">📚 Huge Library</span>
                    <span className="flex items-center gap-1">💜 Ad-Free</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-500 text-sm font-medium">
                You&apos;ve reached the end of the chapter
              </p>
              {hasNextChapter ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToNextChapter();
                  }}
                  className="px-12 py-4 bg-blue-600 rounded-full font-bold w-full max-w-xs hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
                >
                  Next Chapter
                </button>
              ) : (
                <p className="text-blue-400 font-bold bg-blue-400/10 px-6 py-2 rounded-full">
                  Latest Chapter Reached
                </p>
              )}
            </div>

            {/* Padding for bottom bar */}
            <div className="h-32"></div>
          </div>
        ) : (
          // Paged Mode
          <div className="h-full flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="h-full flex items-center justify-center p-4"
              >
                {pages[currentPageIndex] && (
                  <ReaderImage
                    src={pages[currentPageIndex].img}
                    alt={`Page ${currentPageIndex + 1}`}
                    priority={true}
                    className={`max-h-full w-auto h-auto object-contain ${imageFit === 'full' ? 'max-w-none' : 'max-w-2xl'}`}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Page Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevPage();
              }}
              disabled={currentPageIndex === 0 && !hasPrevChapter}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md rounded-full transition-all ${
                currentPageIndex === 0 && !hasPrevChapter
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-black/80 hover:scale-110'
              }`}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextPage();
              }}
              disabled={currentPageIndex === pages.length - 1 && !hasNextChapter}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md rounded-full transition-all ${
                currentPageIndex === pages.length - 1 && !hasNextChapter
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-black/80 hover:scale-110'
              }`}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Page Counter */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
              {currentPageIndex + 1} / {pages.length}
            </div>
          </div>
        )}
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        initial={false}
        animate={{ y: showControls ? 0 : '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md px-6 py-4 z-50 border-t border-white/5"
      >
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-800 rounded-full mb-4 relative max-w-3xl mx-auto cursor-pointer group">
          <div className="absolute -top-2 -bottom-2 w-full bg-transparent z-10" />
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-150 group-hover:h-1.5 group-hover:-mt-0.5"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-gray-400 max-w-md mx-auto">
          <button
            onClick={navigateToPrevChapter}
            disabled={!hasPrevChapter}
            className={`flex flex-col items-center gap-1 transition-colors p-2 rounded-lg ${!hasPrevChapter ? 'opacity-30 cursor-not-allowed' : 'hover:text-white hover:bg-white/5'}`}
          >
            <ChevronLeft size={20} />
            <span className="text-[10px]">Prev</span>
          </button>

          <button
            onClick={() => setShowChapterDrawer(true)}
            className="flex flex-col items-center gap-1 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <Menu size={20} />
            <span className="text-[10px]">Chapters</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex flex-col items-center gap-1 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg relative"
          >
            <MessageSquare size={20} />
            <span className="text-[10px]">Comments</span>
          </button>

          <button
            onClick={navigateToNextChapter}
            disabled={!hasNextChapter}
            className={`flex flex-col items-center gap-1 transition-colors p-2 rounded-lg ${!hasNextChapter ? 'opacity-30 cursor-not-allowed' : 'hover:text-white hover:bg-white/5'}`}
          >
            <ChevronRight size={20} />
            <span className="text-[10px]">Next</span>
          </button>
        </div>
      </motion.div>

      {/* Chapter Drawer Overlay */}
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {manhwaInfo?.chapters
                  .filter(
                    (ch) =>
                      ch.title?.toLowerCase().includes(chapterSearch.toLowerCase()) ||
                      ch.id.includes(chapterSearch),
                  )
                  .map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/manhwa/${encodeURIComponent(manhwaId)}/read/${encodeURIComponent(chapter.id)}`}
                      onClick={() => setShowChapterDrawer(false)}
                      className={`block px-4 py-3 rounded-xl text-sm transition-all ${
                        chapter.id === decodeURIComponent(chapterId)
                          ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">
                          {chapter.title || `Chapter ${chapter.id}`}
                        </span>
                        {chapter.id === decodeURIComponent(chapterId) && (
                          <Check className="w-4 h-4 text-blue-400 ml-2" />
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[70] w-full sm:w-96 bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="font-bold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  Comments
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Comments
                  manhwaId={decodeURIComponent(manhwaId)}
                  chapterId={decodeURIComponent(chapterId)}
                  manhwaTitle={manhwaInfo?.title}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
