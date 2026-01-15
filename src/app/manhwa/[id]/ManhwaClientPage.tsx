'use client';

import { useEffect, useState, useCallback, useMemo, useTransition } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { manhwaAPI } from '@/lib/api';
import { ManhwaInfo, Provider } from '@/lib/types';
import {
  ArrowLeft,
  BookOpen,
  User,
  Heart,
  Share2,
  Star,
  Play,
  Check,
  Bookmark,
  Sparkles,
  Info,
  ListFilter,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Loader2,
  Calendar,
  MessageSquare,
  List,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';

// Lazy load heavy components
const Comments = dynamic(() => import('@/components/Comments'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: false,
});
import { toggleBookmark, isBookmarked } from '@/lib/storage';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useCloudSyncContext } from '@/contexts/CloudSyncContext';
import { useLists } from '@/contexts/ListsContext';
import { useEngagement } from '@/hooks/useEngagement';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { DetailPageSkeleton } from '@/components/LoadingSkeleton';
import ImageWithFallback from '@/components/ImageWithFallback';
import { AddToListModal } from '@/components/AddToListModal';
import { cleanDescription, formatRelativeDate } from '@/lib/utils';
import { ShareButton } from '@/components/ShareModal';

// Mock function for Gemini AI (replace with actual service if available)
const getGeminiRecommendation = async (title: string, description: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return `Analyzing **${title}**...\n\nBased on the synopsis, this series offers a compelling mix of action and character growth. If you enjoy stories with strong progression and high stakes, this is likely a good fit for you. The themes suggest a deep dive into power dynamics and personal evolution.`;
};

// Props interface for SSR data passing
interface ManhwaDetailPageProps {
  initialManhwa?: ManhwaInfo | null;
}

export default function ManhwaDetailPage({ initialManhwa }: ManhwaDetailPageProps = {}) {

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [manhwa, setManhwa] = useState<ManhwaInfo | null>(initialManhwa || null);
  const [loading, setLoading] = useState(!initialManhwa);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // AI & Filter State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters');
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isAltTitlesExpanded, setIsAltTitlesExpanded] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  // Initialize scan group from sessionStorage (persists while navigating to reader and back)
  const [selectedScanGroup, setSelectedScanGroup] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`scanGroup_${id}`);
      return saved || 'all';
    }
    return 'all';
  });
  const [isScanGroupOpen, setIsScanGroupOpen] = useState(false);

  // Persist scan group selection to sessionStorage
  useEffect(() => {
    if (id) {
      sessionStorage.setItem(`scanGroup_${id}`, selectedScanGroup);
    }
  }, [id, selectedScanGroup]);

  const { success } = useToast();
  const { trackView, trackBookmark } = useEngagement();
  const { isChapterRead, getChapterProgress, history } = useReadingHistory();
  const { toggleBookmark: cloudToggleBookmark, isBookmarked: cloudIsBookmarked } =
    useCloudSyncContext();
  const { lists, getManhwaLists } = useLists();

  // Force re-render when history changes
  const [, forceUpdate] = useState({});

  // Scroll handler for sticky header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadManhwaInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      manhwaAPI.setProvider(Provider.COMIXTO);

      // Fetch manhwa info (cached by API layer)
      const info = await manhwaAPI.getManhwaInfo(decodeURIComponent(id));

      setManhwa(info);
      document.title = `${info.title} | Inkora`;

      // Enrich metadata in background (non-blocking) - tries AniList first
      manhwaAPI
        .enrichMetadata(info.title)
        .then((enrichment) => {
          if (enrichment) {
            setManhwa((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                // Use enriched data if current is missing or is a placeholder like "Unknown" or "updating"
                genres: prev.genres?.length ? prev.genres : enrichment.genres,
                // Disabled: enrichment matching is unreliable - may match wrong manga
                // authors: (prev.authors?.length && !['Unknown', 'updating', 'Updating', ''].includes(prev.authors[0])) 
                //   ? prev.authors 
                //   : (enrichment.authors?.length ? enrichment.authors : prev.authors),
                // releaseDate: prev.releaseDate || enrichment.releaseDate,
                // Keep original image - enrichment may match wrong manga
                // image: enrichment.image || prev.image,
                // Use better description from AniList if current is short
                description: 
                  (enrichment.description && enrichment.description.length > (prev.description?.length || 0))
                    ? enrichment.description
                    : prev.description,
                // Add AniList rating if available
                rating: enrichment.rating || prev.rating,
                // Store AniList URL for linking (using altTitles array as workaround)
                altTitles: enrichment.anilistUrl 
                  ? [...(prev.altTitles || []), `anilist:${enrichment.anilistUrl}`]
                  : prev.altTitles,
              };
            });
          }
        })
        .catch(() => {}); // Silently fail enrichment
    } catch (err) {
      console.error('[Manhwa Load] Failed to load manhwa:', err);
      
      // Try auto-migration if we have a saved title
      try {
        const history = JSON.parse(localStorage.getItem('manhwa_reading_history') || '[]');
        const bookmarks = JSON.parse(localStorage.getItem('manhwa_bookmarks') || '[]');
        const historyItem = history.find((h: { manhwaId: string }) => h.manhwaId === decodeURIComponent(id));
        const bookmarkItem = bookmarks.find((b: { id: string }) => b.id === decodeURIComponent(id));
        const savedTitle = historyItem?.manhwaTitle || bookmarkItem?.title;
        
        if (savedTitle) {
          console.log(`[Migration] Attempting auto-migration for: "${savedTitle}"`);
          
          // Import and use migration service dynamically
          const { tryMigrateByTitle } = await import('@/lib/migrationService');
          const newId = await tryMigrateByTitle(decodeURIComponent(id), savedTitle);
          
          if (newId) {
            console.log(`[Migration] Found new ID: ${newId}, redirecting...`);
            // Update saved data with new ID
            if (historyItem) {
              historyItem.manhwaId = newId;
              localStorage.setItem('manhwa_reading_history', JSON.stringify(history));
            }
            if (bookmarkItem) {
              bookmarkItem.id = newId;
              localStorage.setItem('manhwa_bookmarks', JSON.stringify(bookmarks));
            }
            // Redirect to new URL
            router.replace(`/manhwa/${encodeURIComponent(newId)}`);
            return;
          }
        }
      } catch (migrationErr) {
        console.error('[Migration] Auto-migration failed:', migrationErr);
      }
      
      setError('Failed to load manhwa details');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      // Only fetch if no initial data was provided (SSR didn't pass data)
      if (!initialManhwa) {
        loadManhwaInfo();
      } else {
        // Set document title from initial data
        document.title = `${initialManhwa.title} | Inkora`;
        
        // Still run enrichment if genres are missing (SSR only has basic data)
        if (!initialManhwa.genres || initialManhwa.genres.length === 0) {
          manhwaAPI.setProvider(Provider.COMIXTO);
          manhwaAPI
            .enrichMetadata(initialManhwa.title)
            .then((enrichment) => {
              if (enrichment) {
                setManhwa((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    genres: prev.genres?.length ? prev.genres : enrichment.genres,
                    description: 
                      (enrichment.description && enrichment.description.length > (prev.description?.length || 0))
                        ? enrichment.description
                        : prev.description,
                    rating: enrichment.rating || prev.rating,
                    altTitles: enrichment.anilistUrl 
                      ? [...(prev.altTitles || []), `anilist:${enrichment.anilistUrl}`]
                      : prev.altTitles,
                  };
                });
              }
            })
            .catch(() => {}); // Silently fail enrichment
        }
      }
      setBookmarked(cloudIsBookmarked(decodeURIComponent(id)));
      trackView(decodeURIComponent(id));
      // Force update to refresh progress display
      forceUpdate({});
    }
  }, [id, trackView, loadManhwaInfo, cloudIsBookmarked, initialManhwa]);


  // Re-render when history changes
  useEffect(() => {
    forceUpdate({});
  }, [history]);

  const handleBookmarkToggle = async () => {
    if (!manhwa) return;

    const newBookmarked = await cloudToggleBookmark({
      id: decodeURIComponent(id),
      title: manhwa.title,
      image: manhwa.image,
      addedAt: Date.now(),
    });

    setBookmarked(newBookmarked);
    trackBookmark(decodeURIComponent(id), newBookmarked);
    success(newBookmarked ? 'Added to Library' : 'Removed from Library');
  };

  const handleAskAI = async () => {
    if (aiInsight || !manhwa) return;
    setIsLoadingAi(true);
    try {
      const insight = await getGeminiRecommendation(manhwa.title, manhwa.description);
      setAiInsight(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleBack = () => {
    // Check window.history.length to determine if user has navigation history
    // If length is 1-2, user likely came directly to this page or from external link
    if (window.history.length <= 2) {
      router.push('/');
      return;
    }
    
    // Use router.back() but the click handler on the link will save origin
    // Check if we have a saved origin (set from list pages before navigation)
    const origin = sessionStorage.getItem('manhwa_back_origin');
    
    if (origin) {
      sessionStorage.removeItem('manhwa_back_origin');
      router.push(origin);
    } else {
      // Fallback: go back in history, but if that fails, go home
      router.back();
    }
  };

  const sortedChapters = useMemo(() => {
    if (!manhwa?.chapters) return [];

    // Create a copy to sort
    return [...manhwa.chapters].sort((a, b) => {
      // Extract numbers from titles or use IDs if available/numeric
      // This logic tries to be smart about chapter numbering if IDs aren't sequential
      const getNum = (str: string | number) => {
        if (typeof str === 'number') return str;
        const match = String(str).match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
      };

      const numA = getNum(a.title || a.id);
      const numB = getNum(b.title || b.id);

      if (sortOrder === 'newest') {
        return numB - numA;
      } else {
        return numA - numB;
      }
    });
  }, [manhwa, sortOrder]);

  // Extract available scan groups from all chapters
  const availableScanGroups = useMemo(() => {
    if (!manhwa?.chapters) return [];
    
    const groupMap = new Map<string, { id: string; name: string }>();
    
    manhwa.chapters.forEach(chapter => {
      // Add the main chapter's scan group
      if (chapter.scanGroup) {
        groupMap.set(String(chapter.scanGroup.id), {
          id: String(chapter.scanGroup.id),
          name: chapter.scanGroup.name
        });
      }
      
      // Add scan groups from versions
      if (chapter.versions) {
        chapter.versions.forEach(version => {
          if (version.scanGroup) {
            groupMap.set(String(version.scanGroup.id), {
              id: String(version.scanGroup.id),
              name: version.scanGroup.name
            });
          }
        });
      }
    });
    
    return Array.from(groupMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [manhwa?.chapters]);

  // Filter chapters based on selected scan group
  const filteredChapters = useMemo(() => {
    if (selectedScanGroup === 'all') return sortedChapters;
    
    return sortedChapters.map(chapter => {
      // Check if main chapter matches
      if (chapter.scanGroup && String(chapter.scanGroup.id) === selectedScanGroup) {
        return chapter;
      }
      
      // Check if any version matches and use that instead
      if (chapter.versions) {
        const matchingVersion = chapter.versions.find(
          v => v.scanGroup && String(v.scanGroup.id) === selectedScanGroup
        );
        if (matchingVersion) {
          return {
            ...matchingVersion,
            title: chapter.title, // Keep original title
          };
        }
      }
      
      return null;
    }).filter(Boolean);
  }, [sortedChapters, selectedScanGroup]);

  // Extract AniList URL from enrichment data (stored in altTitles with prefix)
  const anilistUrl = useMemo(() => {
    const anilistEntry = manhwa?.altTitles?.find(t => t.startsWith('anilist:'));
    return anilistEntry ? anilistEntry.replace('anilist:', '') : null;
  }, [manhwa?.altTitles]);

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error || !manhwa) {
    // Try to get the title from reading history or bookmarks for the error message
    const savedTitle = typeof window !== 'undefined' 
      ? (() => {
          try {
            const history = JSON.parse(localStorage.getItem('manhwa_reading_history') || '[]');
            const bookmark = JSON.parse(localStorage.getItem('manhwa_bookmarks') || '[]');
            const historyItem = history.find((h: { manhwaId: string }) => h.manhwaId === decodeURIComponent(id));
            const bookmarkItem = bookmark.find((b: { id: string }) => b.id === decodeURIComponent(id));
            return historyItem?.manhwaTitle || bookmarkItem?.title || null;
          } catch {
            return null;
          }
        })()
      : null;

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-xl font-bold text-white mb-2">Content Not Available</h2>
          <p className="text-gray-400 mb-4">
            {savedTitle 
              ? `"${savedTitle}" couldn't be loaded. It may have been moved or is no longer available.`
              : error || 'The manhwa you are looking for does not exist.'}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            This might happen if you had this saved from a previous version of the app.
          </p>
          <div className="flex flex-col gap-3">
            {savedTitle && (
              <Link
                href={`/browse?q=${encodeURIComponent(savedTitle)}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                <Search className="w-5 h-5 mr-2" />
                Search for &quot;{savedTitle.slice(0, 30)}{savedTitle.length > 30 ? '...' : ''}&quot;
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen pb-8 animate-in fade-in slide-in-from-bottom-8 duration-500 relative overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ImageWithFallback
          src={manhwa.image}
          fill
          sizes="100vw"
          className="object-cover opacity-20 blur-[100px] scale-125"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />
      </div>

      {/* Sticky Header */}
      <div
        className={`fixed top-0 left-0 right-0 px-3 sm:px-4 py-3 sm:py-4 z-50 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg' : ''}`}
      >
        <button
          onClick={handleBack}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/5 active:scale-95"
        >
          <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
        </button>
        <h1
          className={`text-white font-bold text-xs sm:text-sm md:text-lg transition-opacity duration-300 max-w-[50%] truncate ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        >
          {manhwa.title}
        </h1>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleBookmarkToggle}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors border border-white/5 active:scale-95 ${bookmarked ? 'bg-blue-600 text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
          >
            <Heart
              className="w-[18px] h-[18px] sm:w-5 sm:h-5"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={() => setIsListModalOpen(true)}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors border border-white/5 active:scale-95 ${
              getManhwaLists(decodeURIComponent(id)).length > 0
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
            }`}
          >
            <List size={20} />
          </button>
          <ShareButton
            manhwaId={decodeURIComponent(id)}
            manhwaTitle={manhwa.title}
            variant="icon"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/5"
          />
        </div>
      </div>

      {/* Desktop Wrapper */}
      <div className="relative z-10 md:max-w-6xl md:mx-auto md:pt-24 md:px-8">
        <div className="md:grid md:grid-cols-[300px_1fr] md:gap-12 lg:gap-16">
          {/* Left Column (Desktop Only - Sticky Cover) */}
          <div className="hidden md:block relative">
            <div className="sticky top-32">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group aspect-[2/3]">
                <ImageWithFallback
                  src={manhwa.image}
                  alt="Cover"
                  fill
                  sizes="300px"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <Link
                href={
                  manhwa.chapters.length > 0
                    ? `/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(manhwa.chapters[manhwa.chapters.length - 1].id))}`
                    : '#'
                }
                className="w-full mt-6 bg-white text-black h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all"
              >
                <Play size={20} fill="currentColor" /> Read First
              </Link>
              <button
                onClick={handleBookmarkToggle}
                className={`w-full mt-3 h-12 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  bookmarked
                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
              >
                <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                {bookmarked ? 'In Library' : 'Add to Library'}
              </button>
              <button
                onClick={() => setIsListModalOpen(true)}
                className={`w-full mt-3 h-12 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                  getManhwaLists(decodeURIComponent(id)).length > 0
                    ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
              >
                <List size={18} />
                {getManhwaLists(decodeURIComponent(id)).length > 0
                  ? `In ${getManhwaLists(decodeURIComponent(id)).length} List${getManhwaLists(decodeURIComponent(id)).length > 1 ? 's' : ''}`
                  : 'Add to List'}
              </button>
              {/* AniList Link */}
              {anilistUrl && (
                <a
                  href={anilistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 h-12 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all bg-[#02A9FF]/10 text-[#02A9FF] border-[#02A9FF]/30 hover:bg-[#02A9FF]/20"
                >
                  <svg className="w-5 h-5" viewBox="0 0 172 172" fill="currentColor">
                    <path d="M120.396 55.732L99.477 116.319H81.052L63.604 55.732H81.052L90.264 96.421L99.477 55.732H120.396Z"/>
                    <path d="M66.916 98.384C67.66 104.336 72.724 108.512 78.676 107.768C84.628 107.024 88.804 101.96 88.06 96.008C87.316 90.056 82.252 85.88 76.3 86.624C70.348 87.368 66.172 92.432 66.916 98.384Z"/>
                  </svg>
                  View on AniList
                </a>
              )}
            </div>
          </div>

          {/* Right Column (Mobile & Desktop Content) */}
          <div className="flex flex-col">
            {/* Mobile Header Image (Hidden on Desktop) */}
            <div className="md:hidden relative h-[40vh] sm:h-[45vh] w-full overflow-hidden -mt-16 sm:-mt-20 md:mt-0">
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={manhwa.image}
                  alt="Cover"
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
              </div>
            </div>

            {/* Info Card */}
            <div className="px-4 sm:px-6 -mt-28 sm:-mt-32 md:mt-0 md:px-0">
              <div className="flex gap-3.5 sm:gap-5 items-end md:items-start">
                {/* Mobile Thumbnail */}
                <div className="md:hidden relative group shrink-0">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-lg group-hover:bg-blue-500/30 transition-colors" />
                  <div className="relative w-28 h-40 sm:w-36 sm:h-52 rounded-lg sm:rounded-xl shadow-2xl border-2 border-white/10 overflow-hidden z-10">
                    <ImageWithFallback
                      src={manhwa.image}
                      alt="Cover"
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 pb-1 md:pb-0 min-w-0">
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-4">
                    {manhwa.genres && manhwa.genres.length > 0 ? (
                      <>
                        {manhwa.genres.slice(0, 5).map((genre) => (
                          <Link
                            key={genre}
                            href={`/search?genres=${genre}`}
                            className="text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg bg-white/10 text-blue-200 border border-white/5 backdrop-blur-md hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {genre}
                          </Link>
                        ))}
                        {manhwa.genres.length > 5 && (
                          <span className="text-[10px] md:text-xs font-medium px-2 py-0.5 md:py-1 rounded-lg bg-white/5 text-gray-400 border border-white/5">
                            +{manhwa.genres.length - 5} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 text-gray-500 border border-white/5">
                        No genres available
                      </span>
                    )}
                  </div>
                  {/* Title - expandable on mobile */}
                  <div className="relative">
                    <h2
                      onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                      className={`text-xl sm:text-2xl md:text-5xl font-black text-white leading-tight drop-shadow-xl mb-1.5 sm:mb-2 md:mb-4 cursor-pointer md:cursor-default ${
                        isTitleExpanded ? '' : 'line-clamp-2 md:line-clamp-none'
                      }`}
                    >
                      {manhwa.title}
                    </h2>
                    {/* Show tap hint only on mobile if title is long */}
                    {manhwa.title.length > 40 && (
                      <button
                        onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                        className="md:hidden text-blue-400 text-xs font-medium -mt-1 mb-2"
                      >
                        {isTitleExpanded ? 'Show less' : 'Tap to see full title'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <p className="text-gray-300 text-xs sm:text-sm md:text-lg font-medium flex items-center gap-1.5 sm:gap-2 truncate">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">
                        {manhwa.authors?.join(', ') || 'Unknown Author'}
                      </span>
                    </p>
                    {/* Show artists if different from authors */}
                    {manhwa.artists && manhwa.artists.length > 0 && 
                      manhwa.artists.join(',') !== manhwa.authors?.join(',') && (
                      <p className="text-gray-400 text-[11px] sm:text-xs md:text-base font-medium flex items-center gap-1.5 sm:gap-2 truncate">
                        <span className="text-gray-500 flex-shrink-0">Art:</span>
                        <span className="truncate">
                          {manhwa.artists.join(', ')}
                        </span>
                      </p>
                    )}
                    {manhwa.releaseDate && (
                      <p className="text-gray-400 text-[11px] sm:text-xs md:text-base font-medium flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                        <span>Released {manhwa.releaseDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5 sm:mt-8 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 md:bg-white/[0.03] md:p-6">
                <div className="text-center group">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-yellow-400 mb-0.5 sm:mb-1 group-hover:scale-110 transition-transform">
                    <span className="font-black text-base sm:text-lg md:text-2xl">
                      {manhwa.rating || 'N/A'}
                    </span>
                    <Star
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-5 md:h-5"
                      fill="currentColor"
                    />
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">
                    {manhwa.ratingCount ? `(${manhwa.ratingCount})` : 'Rating'}
                  </p>
                </div>
                <div className="text-center border-l border-white/10 group">
                  <div className="text-white font-black text-base sm:text-lg md:text-2xl mb-0.5 sm:mb-1 group-hover:text-blue-400 transition-colors">
                    {(() => {
                      const count = manhwa.follows || manhwa.views;
                      if (!count) return 'N/A';
                      if (typeof count === 'number') {
                        if (count > 1000000) return `${(count / 1000000).toFixed(1)}M`;
                        if (count > 1000) return `${(count / 1000).toFixed(1)}K`;
                        return count;
                      }
                      return count;
                    })()}
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">
                    {manhwa.follows ? 'Follows' : 'Views'}
                  </p>
                </div>
                <div className="text-center border-l border-white/10 group">
                  <div className="text-green-400 font-black text-base sm:text-lg md:text-2xl mb-0.5 sm:mb-1 group-hover:text-green-300 transition-colors">
                    {manhwa.totalChapters || manhwa.chapters?.length || 0}
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">
                    Chapters
                  </p>
                </div>
              </div>

              {/* Status & Type Row */}
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
                <span
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 ${
                    manhwa.status?.toLowerCase() === 'ongoing'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : manhwa.status?.toLowerCase() === 'completed'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}
                >
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {manhwa.status || 'Unknown'}
                </span>
                {/* Type Badge */}
                {manhwa.type && (
                  <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {manhwa.type}
                  </span>
                )}
                {/* Demographics Badge */}
                {manhwa.demographics && (
                  <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {manhwa.demographics}
                  </span>
                )}
                {manhwa.lastUpdate && (
                  <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold bg-white/5 text-gray-400 border border-white/10 flex items-center gap-1 sm:gap-1.5">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Updated {manhwa.lastUpdate}
                  </span>
                )}
              </div>

              {/* Alternative Titles (Collapsible) */}
              {manhwa.altTitles && manhwa.altTitles.filter(t => !t.startsWith('anilist:')).length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsAltTitlesExpanded(!isAltTitlesExpanded)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    <span>Alternative Titles ({manhwa.altTitles.filter(t => !t.startsWith('anilist:')).length})</span>
                    {isAltTitlesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {isAltTitlesExpanded && (
                    <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10">
                      {manhwa.altTitles.filter(t => !t.startsWith('anilist:')).map((title, idx) => (
                        <p key={idx} className="text-gray-300 text-sm leading-relaxed">
                          • {title}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Themes Section */}
              {manhwa.themes && manhwa.themes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Themes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {manhwa.themes.map((theme) => (
                      <span
                        key={theme}
                        className="text-[10px] md:text-xs font-medium px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight Section */}
              <div className="mt-5 md:mt-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-5 md:p-6 border border-indigo-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none">
                    <Sparkles size={64} className="text-indigo-400 blur-sm" />
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="text-indigo-200 font-bold text-sm tracking-wide">
                      Inkora AI Insight
                    </span>
                  </div>

                  {!aiInsight && !isLoadingAi && (
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <p className="text-indigo-100/70 text-sm md:text-base">
                        Curious about this series? Get a spoiler-free vibe check.
                      </p>
                      <button
                        onClick={handleAskAI}
                        className="text-xs md:text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 whitespace-nowrap w-fit"
                      >
                        Analyze Series
                      </button>
                    </div>
                  )}

                  {isLoadingAi && (
                    <div className="flex items-center gap-3 text-indigo-200 text-sm py-2">
                      <Loader2 size={18} className="animate-spin text-indigo-400" />
                      <span className="animate-pulse">Analyzing plot points...</span>
                    </div>
                  )}

                  {aiInsight && (
                    <div className="text-indigo-100 text-sm md:text-base leading-relaxed animate-in fade-in duration-500 relative z-10 font-medium">
                      {aiInsight.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0 min-h-[1rem]">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Synopsis */}
              <div className="mt-5 md:mt-6">
                <h3 className="text-white font-bold text-lg md:text-xl mb-3 flex items-center gap-2">
                  Synopsis
                  <Info size={14} className="text-gray-500" />
                </h3>
                <div className="relative">
                  <p
                    className={`text-gray-400 text-sm md:text-base leading-7 md:leading-8 ${
                      isDescriptionExpanded ? '' : 'line-clamp-4 md:line-clamp-none'
                    }`}
                  >
                    {cleanDescription(manhwa.description)}
                  </p>
                  {/* Show "See more" only on mobile if description is long */}
                  {cleanDescription(manhwa.description).length > 200 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="md:hidden mt-2 text-blue-400 text-sm font-semibold flex items-center gap-1 hover:text-blue-300 transition-colors"
                    >
                      {isDescriptionExpanded ? <>Show less</> : <>See more...</>}
                    </button>
                  )}
                  {/* Gradient fade overlay when collapsed on mobile */}
                  {!isDescriptionExpanded &&
                    cleanDescription(manhwa.description).length > 200 && (
                      <div className="md:hidden absolute bottom-6 left-0 right-0 h-8 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
                    )}
                </div>
              </div>

              {/* Mobile Floating Action Buttons */}
              <div className="md:hidden sticky bottom-8 z-40 mt-8 flex gap-3">
                <Link
                  href={
                    manhwa.chapters.length > 0
                      ? `/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(manhwa.chapters[manhwa.chapters.length - 1].id))}`
                      : '#'
                  }
                  className="flex-1 bg-white text-black h-14 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform active:scale-95 group"
                >
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </div>
                  Start Reading
                </Link>
                <button
                  onClick={handleBookmarkToggle}
                  className={`flex-none w-14 h-14 rounded-full backdrop-blur-md border flex items-center justify-center transition-colors active:scale-95 ${
                    bookmarked
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-gray-800/80 text-white border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <Bookmark size={24} fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Chapters / Comments Tabs */}
              <div className="mt-6 mb-6 md:mt-8">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setActiveTab('chapters')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      activeTab === 'chapters'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BookOpen size={16} />
                    Chapters
                    <span className="text-xs opacity-70">({manhwa.chapters.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      activeTab === 'comments'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare size={16} />
                    Comments
                  </button>
                </div>

                {/* Chapters Tab Content */}
                {activeTab === 'chapters' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-bold text-xl">Episodes</h3>

                      {/* Scan Group Dropdown & Filter & Count */}
                      <div className="flex items-center gap-2 md:gap-3 relative flex-wrap justify-end">
                        {/* Scan Group Dropdown */}
                        {availableScanGroups.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={() => setIsScanGroupOpen(!isScanGroupOpen)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${
                                selectedScanGroup !== 'all'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  : 'text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className="max-w-[100px] md:max-w-[150px] truncate">
                                {selectedScanGroup === 'all' 
                                  ? 'All Groups' 
                                  : availableScanGroups.find(g => g.id === selectedScanGroup)?.name || 'All Groups'}
                              </span>
                              {isScanGroupOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {isScanGroupOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setIsScanGroupOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto">
                                  <div className="p-2 space-y-1">
                                    <button
                                      onClick={() => {
                                        setSelectedScanGroup('all');
                                        setIsScanGroupOpen(false);
                                      }}
                                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedScanGroup === 'all' ? 'bg-purple-600/10 text-purple-400' : 'text-gray-300 hover:bg-white/5'}`}
                                    >
                                      All Groups
                                    </button>
                                    <div className="h-px bg-white/5 my-1" />
                                    {availableScanGroups.map((group) => (
                                      <button
                                        key={group.id}
                                        onClick={() => {
                                          setSelectedScanGroup(group.id);
                                          setIsScanGroupOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedScanGroup === group.id ? 'bg-purple-600/10 text-purple-400' : 'text-gray-300 hover:bg-white/5'}`}
                                      >
                                        {group.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Sort Filter */}
                        <div className="relative">
                          <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
                          >
                            <ListFilter size={18} />
                            <span className="text-xs font-bold hidden sm:inline">Sort</span>
                          </button>

                          {isFilterOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsFilterOpen(false)}
                              />
                              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 space-y-1">
                                  <button
                                    onClick={() => {
                                      setSortOrder('newest');
                                      setIsFilterOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortOrder === 'newest' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-white/5'}`}
                                  >
                                    <ArrowDownWideNarrow size={16} /> Newest First
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSortOrder('oldest');
                                      setIsFilterOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortOrder === 'oldest' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-white/5'}`}
                                  >
                                    <ArrowUpWideNarrow size={16} /> Oldest First
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 font-medium border-l border-white/10 pl-3">
                          {filteredChapters.length} / {manhwa.chapters.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {filteredChapters.map((chapter: any) => {
                        const chapterId = String(chapter.id);
                        const manhwaIdDecoded = decodeURIComponent(id);
                        const progress = getChapterProgress(manhwaIdDecoded, chapterId);
                        const isRead = isChapterRead(manhwaIdDecoded, chapterId);
                        const chapterNum =
                          chapter.title?.match(/(\d+)/)?.[0] || chapter.id;

                        return (
                          <Link
                            key={chapter.id}
                            href={`/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(chapter.id))}`}
                            className="group relative flex items-center p-4 md:p-6 rounded-2xl transition-all active:scale-[0.99] overflow-hidden bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 hover:border-white/10"
                          >
                            {/* Progress Bar (Bottom) */}
                            {progress > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                                <div
                                  className={`h-full w-full transition-all duration-300 ${progress >= 90 ? 'bg-blue-600' : 'bg-blue-500'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}

                            {/* Large Number */}
                            <div className="text-3xl md:text-4xl font-black text-gray-700 group-hover:text-blue-500/50 transition-colors w-16 md:w-20 text-center shrink-0">
                              {chapterNum}
                            </div>

                            <div className="flex-1 text-left px-4 z-10 min-w-0">
                              <p className="font-bold text-base md:text-lg text-white group-hover:text-blue-400 transition-colors truncate">
                                {chapter.title || `Chapter ${chapter.id}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <p className="text-gray-500 text-xs md:text-sm font-medium">
                                  {formatRelativeDate(chapter.releaseDate)}
                                </p>

                                {/* Scan Group Badge */}
                                {chapter.scanGroup && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span className="text-purple-400 text-xs font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                      {chapter.scanGroup.name}
                                    </span>
                                  </>
                                )}

                                {/* Status Indicators */}
                                {isRead ? (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span className="text-green-500 text-xs md:text-sm font-bold">
                                      Read
                                    </span>
                                  </>
                                ) : progress > 0 ? (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span className="text-blue-400 text-xs md:text-sm font-bold">
                                      {progress}%
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all bg-gray-800 text-gray-400 group-hover:bg-blue-600 group-hover:text-white shadow-lg">
                              <Play
                                size={18}
                                className="md:w-5 md:h-5 ml-0.5"
                                fill="currentColor"
                              />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Comments Tab Content */}
                {activeTab === 'comments' && (
                  <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden min-h-[400px]">
                    <Comments
                      manhwaId={decodeURIComponent(id)}
                      manhwaTitle={manhwa.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to List Modal */}
      <AddToListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        manhwa={{
          id: decodeURIComponent(id),
          title: manhwa.title,
          image: manhwa.image,
        }}
      />
    </div>
  );
}
