'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { toggleBookmark, isBookmarked } from '@/lib/storage';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useEngagement } from '@/hooks/useEngagement';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { DetailPageSkeleton } from '@/components/LoadingSkeleton';
import ImageWithFallback from '@/components/ImageWithFallback';

// Mock function for Gemini AI (replace with actual service if available)
const getGeminiRecommendation = async (title: string, description: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `Analyzing **${title}**...\n\nBased on the synopsis, this series offers a compelling mix of action and character growth. If you enjoy stories with strong progression and high stakes, this is likely a good fit for you. The themes suggest a deep dive into power dynamics and personal evolution.`;
};

export default function ManhwaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const provider = Provider.MANHUAPLUS;
  
  const [manhwa, setManhwa] = useState<ManhwaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // AI & Filter State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { success } = useToast();
  const { trackView, trackBookmark } = useEngagement();
  const { isChapterRead, getChapterProgress, history } = useReadingHistory();
  
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
      manhwaAPI.setProvider(provider);
      
      // 1. Fetch from manhuaplus (chapters, images)
      const info = await manhwaAPI.getManhwaInfo(decodeURIComponent(id));
      console.log('📚 Manhwa Info (manhuaplus):', info);
      console.log('🏷️ Genres:', info.genres);
      console.log('✍️ Authors:', info.authors);
      console.log('📅 Release Date:', info.releaseDate);
      
      // 2. Enrich metadata from AniList if missing
      const needsEnrichment = !info.genres?.length || !info.authors?.length || !info.releaseDate;
      
      if (needsEnrichment) {
        console.log('🔍 Metadata incomplete, enriching from AniList...');
        const enrichment = await manhwaAPI.enrichMetadata(info.title);
        
        if (enrichment) {
          // Only fill in missing data, don't overwrite existing
          if (!info.genres?.length && enrichment.genres?.length) {
            info.genres = enrichment.genres;
            console.log('✅ Added genres:', enrichment.genres);
          }
          if (!info.authors?.length && enrichment.authors?.length) {
            info.authors = enrichment.authors;
            console.log('✅ Added authors:', enrichment.authors);
          }
          if (!info.releaseDate && enrichment.releaseDate) {
            info.releaseDate = enrichment.releaseDate;
            console.log('✅ Added release date:', enrichment.releaseDate);
          }
          if (!info.description && enrichment.description) {
            info.description = enrichment.description;
            console.log('✅ Enhanced description');
          }
        }
      }
      
      setManhwa(info);
      document.title = `${info.title} | Manhwa Reader`;
    } catch (err) {
      setError('Failed to load manhwa details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, provider]);

  useEffect(() => {
    if (id) {
      loadManhwaInfo();
      setBookmarked(isBookmarked(decodeURIComponent(id)));
      trackView(decodeURIComponent(id));
      // Force update to refresh progress display
      forceUpdate({});
    }
  }, [id, trackView, loadManhwaInfo]);
  
  // Re-render when history changes
  useEffect(() => {
    forceUpdate({});
  }, [history]);

  const handleBookmarkToggle = () => {
    if (!manhwa) return;

    const newBookmarked = toggleBookmark({
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
    // Always go to home from details page to avoid navigation loops
    router.push('/');
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

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error || !manhwa) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-xl font-bold text-white mb-2">Manhwa Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The manhwa you are looking for does not exist.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen pb-32 animate-in fade-in slide-in-from-bottom-8 duration-500 relative overflow-x-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ImageWithFallback
          src={manhwa.image}
          fill
          className="object-cover opacity-20 blur-[100px] scale-125"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />
      </div>

      {/* Sticky Header */}
      <div className={`fixed top-0 left-0 right-0 p-4 z-50 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg' : ''}`}>
        <button onClick={handleBack} className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/5">
          <ArrowLeft size={20} />
        </button>
        <h1 className={`text-white font-bold text-sm md:text-lg transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            {manhwa.title}
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={handleBookmarkToggle}
            className={`p-2.5 rounded-full transition-colors border border-white/5 ${bookmarked ? 'bg-blue-600 text-white' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'}`}
          >
            <Heart size={20} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/5">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Wrapper */}
      <div className="relative z-10 md:max-w-6xl md:mx-auto md:pt-24 md:px-8">
          
          <div className="md:grid md:grid-cols-[300px_1fr] md:gap-12 lg:gap-16">
              
              {/* Left Column (Desktop Only - Sticky Cover) */}
              <div className="hidden md:block relative">
                 <div className="sticky top-32">
                     <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group aspect-[2/3]">
                         <ImageWithFallback src={manhwa.image} alt="Cover" fill className="object-cover" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <Link 
                         href={manhwa.chapters.length > 0 ? `/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(manhwa.chapters[manhwa.chapters.length - 1].id))}` : '#'}
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
                         <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} /> 
                         {bookmarked ? 'In Library' : 'Add to Library'}
                     </button>
                 </div>
              </div>

              {/* Right Column (Mobile & Desktop Content) */}
              <div className="flex flex-col">
                  {/* Mobile Header Image (Hidden on Desktop) */}
                  <div className="md:hidden relative h-[45vh] w-full overflow-hidden -mt-20 md:mt-0">
                    <div className="absolute inset-0">
                      <ImageWithFallback
                        src={manhwa.image}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="px-6 -mt-32 md:mt-0 md:px-0">
                    <div className="flex gap-5 items-end md:items-start">
                      {/* Mobile Thumbnail */}
                      <div className="md:hidden relative group shrink-0">
                          <div className="absolute inset-0 bg-white/20 blur-xl rounded-lg group-hover:bg-blue-500/30 transition-colors" />
                          <div className="relative w-36 h-52 rounded-xl shadow-2xl border-2 border-white/10 overflow-hidden z-10">
                              <ImageWithFallback 
                                src={manhwa.image} 
                                alt="Cover" 
                                fill
                                className="object-cover"
                              />
                          </div>
                      </div>
                      
                      <div className="flex-1 pb-1 md:pb-0 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2 md:mb-4">
                            {manhwa.genres && manhwa.genres.length > 0 ? (
                              manhwa.genres.map(genre => (
                                <Link key={genre} href={`/search?genres=${genre}`} className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10 text-blue-200 border border-white/5 backdrop-blur-md hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap">
                                    {genre}
                                </Link>
                              ))
                            ) : (
                              <span className="text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 text-gray-500 border border-white/5">
                                No genres available
                              </span>
                            )}
                        </div>
                        <h2 className="text-2xl md:text-5xl font-black text-white leading-tight drop-shadow-xl line-clamp-2 mb-2 md:mb-4">{manhwa.title}</h2>
                        <div className="space-y-1.5">
                          <p className="text-gray-300 text-sm md:text-lg font-medium flex items-center gap-2 truncate">
                              <User size={16} className="text-gray-500 flex-shrink-0" /> 
                              <span className="truncate">{manhwa.authors?.join(', ') || 'Unknown Author'}</span>
                          </p>
                          {manhwa.releaseDate && (
                            <p className="text-gray-400 text-xs md:text-base font-medium flex items-center gap-2">
                                <Calendar size={14} className="text-gray-500 flex-shrink-0" /> 
                                <span>Released {manhwa.releaseDate}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 md:bg-white/[0.03] md:p-6">
                        <div className="text-center group">
                            <div className="flex items-center justify-center gap-1.5 text-yellow-400 mb-1 group-hover:scale-110 transition-transform">
                                <span className="font-black text-lg md:text-2xl">{manhwa.rating || 'N/A'}</span>
                                <Heart size={14} fill="currentColor" className="md:w-5 md:h-5" />
                            </div>
                            <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">Rating</p>
                        </div>
                        <div className="text-center border-l border-white/10 group">
                            <div className="text-white font-black text-lg md:text-2xl mb-1 group-hover:text-blue-400 transition-colors">
                                {manhwa.views ? (typeof manhwa.views === 'number' ? (manhwa.views > 1000 ? `${(manhwa.views / 1000).toFixed(1)}K` : manhwa.views) : 'N/A') : 'N/A'}
                            </div>
                            <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">Reads</p>
                        </div>
                        <div className="text-center border-l border-white/10 group">
                            <div className="text-green-400 font-black text-lg md:text-2xl mb-1 group-hover:text-green-300 transition-colors">{manhwa.status}</div>
                            <p className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">Status</p>
                        </div>
                    </div>

                    {/* AI Insight Section */}
                    <div className="mt-6 md:mt-8">
                        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-5 md:p-6 border border-indigo-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none">
                                <Sparkles size={64} className="text-indigo-400 blur-sm" />
                            </div>
                            
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <span className="text-indigo-200 font-bold text-sm tracking-wide">
                                     Gemini AI Insight
                                </span>
                            </div>

                            {!aiInsight && !isLoadingAi && (
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <p className="text-indigo-100/70 text-sm md:text-base">Curious about this series? Get a spoiler-free vibe check.</p>
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
                                        <p key={i} className="mb-2 last:mb-0 min-h-[1rem]">{line}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Synopsis */}
                    <div className="mt-8 md:mt-10">
                      <h3 className="text-white font-bold text-lg md:text-xl mb-3 flex items-center gap-2">
                          Synopsis
                          <Info size={14} className="text-gray-500" />
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base leading-7 md:leading-8">
                        {manhwa.description}
                      </p>
                    </div>

                    {/* Mobile Floating Action Buttons */}
                    <div className="md:hidden sticky bottom-8 z-40 mt-8 flex gap-3">
                       <Link 
                         href={manhwa.chapters.length > 0 ? `/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(manhwa.chapters[manhwa.chapters.length - 1].id))}` : '#'}
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
                         <Bookmark size={24} fill={bookmarked ? "currentColor" : "none"} />
                       </button>
                    </div>

                    {/* Chapters */}
                    <div className="mt-10 mb-8 md:mt-12">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold text-xl">Episodes</h3>
                        
                        {/* Filter & Count */}
                        <div className="flex items-center gap-3 relative">
                             <div className="relative">
                                <button 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
                                >
                                    <ListFilter size={18} />
                                    <span className="text-xs font-bold">Filter</span>
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
                                                    onClick={() => { setSortOrder('newest'); setIsFilterOpen(false); }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortOrder === 'newest' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-white/5'}`}
                                                >
                                                    <ArrowDownWideNarrow size={16} /> Newest First
                                                </button>
                                                <button
                                                    onClick={() => { setSortOrder('oldest'); setIsFilterOpen(false); }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortOrder === 'oldest' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-300 hover:bg-white/5'}`}
                                                >
                                                    <ArrowUpWideNarrow size={16} /> Oldest First
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                             </div>
                             <span className="text-sm text-gray-500 font-medium border-l border-white/10 pl-3">{manhwa.chapters.length} Total</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {sortedChapters.map((chapter) => {
                            const chapterId = String(chapter.id);
                            const manhwaIdDecoded = decodeURIComponent(id);
                            const progress = getChapterProgress(manhwaIdDecoded, chapterId);
                            const isRead = isChapterRead(manhwaIdDecoded, chapterId);
                            const chapterNum = chapter.title?.match(/(\d+)/)?.[0] || chapter.id;
                            
                            // Debug logging
                            if (progress > 0 || isRead) {
                              console.log(`Chapter ${chapterId}: progress=${progress}, isRead=${isRead}`);
                            }
                            
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
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <p className="text-gray-500 text-xs md:text-sm font-medium">
                                            {chapter.releaseDate ? new Date(chapter.releaseDate).toLocaleDateString() : 'Just now'}
                                        </p>
                                        
                                        {/* Status Indicators */}
                                        {isRead ? (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <span className="text-green-500 text-xs md:text-sm font-bold">Read</span>
                                            </>
                                        ) : progress > 0 ? (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <span className="text-blue-400 text-xs md:text-sm font-bold">{progress}%</span>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all bg-gray-800 text-gray-400 group-hover:bg-blue-600 group-hover:text-white shadow-lg">
                                        <Play size={18} className="md:w-5 md:h-5 ml-0.5" fill="currentColor" />
                                </div>
                            </Link>
                        )})}
                      </div>
                    </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
