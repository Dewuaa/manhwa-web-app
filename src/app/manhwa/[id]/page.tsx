'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { manhwaAPI } from '@/lib/api';
import { ManhwaInfo, Provider } from '@/lib/types';
import { ArrowLeft, BookOpen, User, Calendar, Heart, Share2, Star, Play, ChevronDown } from 'lucide-react';
import { toggleBookmark, isBookmarked } from '@/lib/storage';
import { useParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useEngagement } from '@/hooks/useEngagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManhwaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const provider = Provider.MANHUAUS;
  const [manhwa, setManhwa] = useState<ManhwaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { success } = useToast();
  const { trackView, trackBookmark } = useEngagement();

  useEffect(() => {
    if (id) {
      loadManhwaInfo();
      setBookmarked(isBookmarked(decodeURIComponent(id)));
      trackView(decodeURIComponent(id));
    }
  }, [id, trackView]);

  const loadManhwaInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      manhwaAPI.setProvider(provider);
      const info = await manhwaAPI.getManhwaInfo(decodeURIComponent(id));
      setManhwa(info);
      document.title = `${info.title} | Manhwa Reader`;
    } catch (err) {
      setError('Failed to load manhwa details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    success(newBookmarked ? 'Added to bookmarks ❤️' : 'Removed from bookmarks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-white/10 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !manhwa) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-xl font-bold text-white mb-2">Manhwa Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The manhwa you are looking for does not exist.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm md:backdrop-blur-none"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleBookmarkToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border border-white/5 ${
                bookmarked 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-black/40 backdrop-blur-md text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/5">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          {manhwa.image && (
            <NextImage
              src={manhwa.image}
              alt={manhwa.title}
              fill
              className="object-cover opacity-50 blur-sm scale-105"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-8 md:pb-12 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-8">
            {/* Cover Image (Mobile: Hidden/Small, Desktop: Visible) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:block w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 flex-shrink-0"
            >
              {manhwa.image && (
                <NextImage
                  src={manhwa.image}
                  alt={manhwa.title}
                  fill
                  className="object-cover"
                />
              )}
            </motion.div>

            <div className="flex-1">
              {/* Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-2 mb-3"
              >
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                  manhwa.status === 'Ongoing' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                }`}>
                  {manhwa.status}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                  {manhwa.rating || 'N/A'}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-gray-300 border border-white/10 flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {manhwa.chapters.length} Chapters
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 leading-tight drop-shadow-lg"
              >
                {manhwa.title}
              </motion.h1>

              {/* Author */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-sm md:text-lg font-medium mb-6 flex items-center"
              >
                <User className="w-4 h-4 mr-2 text-primary" />
                {manhwa.authors?.join(', ') || 'Unknown Author'}
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-3 md:space-x-4"
              >
                <Link
                  href={manhwa.chapters.length > 0 ? `/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(manhwa.chapters[manhwa.chapters.length - 1].id))}` : '#'}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Read First
                </Link>
                {manhwa.chapters.length > 0 && (
                   <Link
                   href={`/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(manhwa.chapters[0].id))}`}
                   className="flex-1 md:flex-none px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-bold flex items-center justify-center border border-white/10 transition-all hover:-translate-y-1"
                 >
                   Latest Ch.
                 </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div>
            {/* Genres */}
            {manhwa.genres && manhwa.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {manhwa.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/search?genres=${genre}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-colors border border-white/5"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-primary rounded-full mr-3" />
                Synopsis
              </h3>
              <div className="relative">
                <p className={`text-gray-300 leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
                  {manhwa.description}
                </p>
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 text-primary text-sm font-bold flex items-center hover:underline"
                >
                  {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Chapter List */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="w-1 h-6 bg-primary rounded-full mr-3" />
                  Chapters
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400 font-medium">
                    {manhwa.chapters.length} Total
                  </span>
                </div>
              </div>

              <div className="bg-card/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
                  {manhwa.chapters.map((chapter, index) => (
                    <Link
                      key={chapter.id}
                      href={`/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(chapter.id))}`}
                      className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 font-bold text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {manhwa.chapters.length - index}
                        </div>
                        <div>
                          <span className="text-white font-semibold group-hover:text-primary transition-colors block">
                            {chapter.title || `Chapter ${chapter.id}`}
                          </span>
                          <span className="text-gray-500 text-xs flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {(() => {
                              const date = new Date(chapter.releaseDate);
                              const isValidDate = !isNaN(date.getTime());
                              return isValidDate 
                                ? date.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : chapter.releaseDate;
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Play className="w-4 h-4 text-primary fill-current" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Desktop Only) */}
          <div className="hidden lg:block space-y-6">
            {/* Info Card */}
            <div className="glass-card rounded-2xl p-6">
              <h4 className="text-white font-bold mb-4">Information</h4>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className="text-white text-sm font-medium">{manhwa.status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">Released</span>
                  <span className="text-white text-sm font-medium">{manhwa.releaseDate || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">Author</span>
                  <span className="text-white text-sm font-medium text-right">{manhwa.authors?.join(', ') || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400 text-sm">Rating</span>
                  <span className="text-white text-sm font-medium flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                    {manhwa.rating || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
