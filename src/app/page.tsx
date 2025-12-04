'use client';

import { useState, useEffect } from 'react';
import { manhwaAPI } from '@/lib/api';
import { Provider, Manhwa } from '@/lib/types';
import ManhwaCard from '@/components/ManhwaCard';
import { ManhwaGridSkeleton } from '@/components/LoadingSkeleton';
import { Flame, TrendingUp, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getReadingHistory, getBookmarks, ReadingHistory, Bookmark } from '@/lib/storage';
import Pagination from '@/components/Pagination';
import { motion } from 'framer-motion';
import ContinueReading from '@/components/ContinueReading';
import HeroCarousel from '@/components/HeroCarousel';
import Navbar from '@/components/Navbar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function Home() {
  const router = useRouter();
  const [manhwaList, setManhwaList] = useState<Manhwa[]>([]);
  const [hotManhwa, setHotManhwa] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider] = useState<Provider>(Provider.MANHUAUS);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState<'latest' | 'bookmarks'>('latest');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    loadManhwa(1);
    loadHotManhwa();
    setBookmarks(getBookmarks());
  }, [provider, searchQuery]);

  const loadManhwa = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      manhwaAPI.setProvider(provider);

      const query = searchQuery;
      let result;
      
      if (query) {
        result = await manhwaAPI.search(query, pageNum);
      } else {
        result = await manhwaAPI.getLatestManhwa(pageNum);
      }
      
      setManhwaList(result.results);
      setHasNextPage(result.hasNextPage);
      setPage(pageNum);
      
      if (pageNum > 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError('Failed to load manhwa. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    loadManhwa(newPage);
  };

  const loadHotManhwa = async () => {
    try {
      manhwaAPI.setProvider(provider);
      const popularQueries = ['solo leveling', 'return', 'reincarnation', 'system'];
      const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
      const result = await manhwaAPI.search(randomQuery);
      setHotManhwa(result.results.slice(0, 8));
    } catch (err) {
      console.error('Failed to load hot manhwa:', err);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-24 md:pb-12">
      <Navbar onSearch={handleSearch} />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        {!searchQuery && hotManhwa.length > 0 && (
          <HeroCarousel manhwaList={hotManhwa} />
        )}

        {/* Continue Reading Section */}
        {!searchQuery && <ContinueReading />}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mt-8">
          {/* Main Content */}
          <div>
            {/* Section Header with Tabs */}
            <div className="flex items-center mb-6 space-x-6 border-b border-white/5 pb-1">
              <button
                onClick={() => setActiveTab('latest')}
                className={`flex items-center pb-4 border-b-2 transition-all ${
                  activeTab === 'latest'
                    ? 'border-primary text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <TrendingUp className={`w-5 h-5 mr-2 ${activeTab === 'latest' ? 'text-primary' : ''}`} />
                <span className="font-bold uppercase tracking-wide text-sm">Latest Updates</span>
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex items-center pb-4 border-b-2 transition-all ${
                  activeTab === 'bookmarks'
                    ? 'border-primary text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${activeTab === 'bookmarks' ? 'text-primary' : ''}`} />
                <span className="font-bold uppercase tracking-wide text-sm">Bookmarks</span>
                {bookmarks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs font-bold text-gray-300">
                    {bookmarks.length}
                  </span>
                )}
              </button>
            </div>

            {/* Error State */}
            {error && activeTab === 'latest' && (
              <div className="p-6 bg-red-500/10 border-l-4 border-red-500 rounded-xl text-red-400 mb-8 ring-1 ring-red-500/20">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">⚠️</div>
                  <div>
                    <p className="font-semibold">Error Loading Content</p>
                    <p className="text-sm text-red-400/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Grid */}
            {activeTab === 'latest' ? (
              loading ? (
                <ManhwaGridSkeleton />
              ) : manhwaList.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
                  <div className="text-7xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-3">No results found</h3>
                  <p className="text-gray-400 text-lg">
                    Try searching for something else or browse our collection
                  </p>
                </div>
              ) : (
                <>
                  <motion.div 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {manhwaList.map((manhwa, index) => (
                      <ManhwaCard 
                        key={manhwa.id} 
                        manhwa={manhwa} 
                        showNewBadge={index < 3}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Pagination */}
                  {activeTab === 'latest' && !loading && manhwaList.length > 0 && (
                    <div className="mt-12">
                      <Pagination
                        currentPage={page}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        isLoading={loading}
                      />
                    </div>
                  )}
                </>
              )
            ) : (
              // Bookmarks Grid
              bookmarks.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
                  <div className="text-7xl mb-6">💔</div>
                  <h3 className="text-2xl font-bold text-white mb-3">No bookmarks yet</h3>
                  <p className="text-gray-400 text-lg mb-6">
                    Save your favorite manhwa to access them quickly here
                  </p>
                  <button
                    onClick={() => setActiveTab('latest')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                  >
                    Browse Manhwa
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {bookmarks.map((bookmark) => (
                    <ManhwaCard
                      key={bookmark.id}
                      manhwa={{
                        id: bookmark.id,
                        title: bookmark.title,
                        image: bookmark.image,
                        status: 'Unknown',
                        latestChapter: '',
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </div>

          {/* Sidebar - Hot Manga (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Trending Widget */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Flame className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <h3 className="font-black text-lg uppercase tracking-wide">Trending Now</h3>
                </div>

                <div className="space-y-4">
                  {hotManhwa.slice(0, 5).map((manhwa, index) => (
                    <Link
                      key={manhwa.id}
                      href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
                      className="flex items-center group"
                    >
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                        {manhwa.image && (
                          <Image
                            src={manhwa.image}
                            alt={manhwa.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute top-0 left-0 w-6 h-6 bg-black/60 backdrop-blur-md flex items-center justify-center rounded-br-lg border-r border-b border-white/10">
                          <span className={`text-xs font-bold ${index < 3 ? 'text-primary' : 'text-white'}`}>
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-1">
                          {manhwa.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-400">
                          <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                          <span>9.{9 - index} Rating</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <button 
                  onClick={() => setSearchQuery('popular')}
                  className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all border border-white/5"
                >
                  View All Trending
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
