'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { manhwaAPI } from '@/lib/api';
import { ManhwaInfo, Provider } from '@/lib/types';
import { ArrowLeft, BookOpen, User, Calendar, Heart } from 'lucide-react';
import { toggleBookmark, isBookmarked } from '@/lib/storage';
import { useParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useEngagement } from '@/hooks/useEngagement';

export default function ManhwaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const provider = Provider.MANHUAUS;
  const [manhwa, setManhwa] = useState<ManhwaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const { success } = useToast();
  const { trackView, trackBookmark } = useEngagement();

  useEffect(() => {
    if (id) {
      loadManhwaInfo();
      setBookmarked(isBookmarked(decodeURIComponent(id)));
      trackView(decodeURIComponent(id)); // Track view
    }
  }, [id, trackView]);

  const loadManhwaInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      manhwaAPI.setProvider(provider);
      const info = await manhwaAPI.getManhwaInfo(decodeURIComponent(id));
      setManhwa(info);
      
      // Update document title for SEO (client-side fallback)
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
    trackBookmark(decodeURIComponent(id), newBookmarked); // Track bookmark
    success(newBookmarked ? 'Added to bookmarks ❤️' : 'Removed from bookmarks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-white/10 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 font-medium">Loading...</p>
      </div>
    );
  }

  if (error || !manhwa) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <div className="text-red-400 text-xl mb-6 font-semibold">
            {error || 'Manhwa not found'}
          </div>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar - Cover */}
          <div>
            {manhwa.image ? (
              <div className="aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/50 relative">
                <NextImage
                  src={manhwa.image}
                  alt={manhwa.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            ) : (
              <div className="aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/5 flex items-center justify-center">
                <div className="text-center p-6">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm font-medium">{manhwa.title}</p>
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleBookmarkToggle}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-lg ${
                  bookmarked
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/20 hover:from-red-600 hover:to-pink-700'
                    : 'bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/10'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
              </button>

              <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-medium">Status</span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      manhwa.status === 'Ongoing' || manhwa.status === 'Unknown'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                    }`}
                  >
                    {manhwa.status === 'Unknown' ? 'Ongoing' : manhwa.status}
                  </span>
                </div>
              </div>

              {manhwa.authors && manhwa.authors.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 ring-1 ring-white/10 backdrop-blur-sm">
                  <div className="flex items-center text-gray-400 text-sm font-medium mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Author(s)
                  </div>
                  <p className="text-white font-medium text-sm">
                    {manhwa.authors.join(', ')}
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-red-500/10 to-pink-600/10 rounded-xl p-4 ring-1 ring-red-500/20 backdrop-blur-sm">
                <div className="flex items-center text-red-400 text-sm font-medium mb-2">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Total Chapters
                </div>
                <p className="text-white font-black text-3xl">
                  {manhwa.chapters.length}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {/* Title & Genres */}
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
                {manhwa.title}
              </h1>

              {manhwa.genres && manhwa.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {manhwa.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm font-medium ring-1 ring-white/10 hover:bg-white/10 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6 ring-1 ring-white/10 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-3">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed text-sm">
                {manhwa.description}
              </p>
            </div>

            {/* Chapters */}
            <div className="bg-white/5 rounded-2xl ring-1 ring-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">
                  Chapters
                </h2>
                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-500/20">
                  {manhwa.chapters.length} episodes
                </span>
              </div>

              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {manhwa.chapters.map((chapter, index) => {
                  return (
                    <Link
                      key={chapter.id}
                      href={`/manhwa/${encodeURIComponent(id)}/read/${encodeURIComponent(String(chapter.id))}`}
                      className="block p-4 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-500/20">
                            {manhwa.chapters.length - index}
                          </div>
                          <div>
                            <span className="text-white font-semibold group-hover:text-red-400 transition-colors block text-sm">
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
                        <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors rotate-180" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
