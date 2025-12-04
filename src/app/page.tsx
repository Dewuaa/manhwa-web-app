'use client';

import { useState, useEffect } from 'react';
import { manhwaAPI } from '@/lib/api';
import { Provider, Manhwa } from '@/lib/types';
import Navbar from '@/components/Navbar';
import ManhwaCard from '@/components/ManhwaCard';
import { ManhwaGridSkeleton } from '@/components/LoadingSkeleton';
import { Flame, Search, ChevronRight, BookOpen, TrendingUp, Sparkles, Clock, Heart, History, Tag, Compass } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getReadingHistory, getBookmarks, ReadingHistory, Bookmark } from '@/lib/storage';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { motion } from 'framer-motion';
import ContinueReading from '@/components/ContinueReading';
import TrendingSection from '@/components/TrendingSection';
import RecentlyUpdated from '@/components/RecentlyUpdated';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const router = useRouter();
  const [manhwaList, setManhwaList] = useState<Manhwa[]>([]);
  const [hotManhwa, setHotManhwa] = useState<Manhwa[]>([]);
  const [recommended, setRecommended] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider] = useState<Provider>(Provider.MANHUAUS);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState<'latest' | 'bookmarks'>('latest');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    loadManhwa(1);
    loadHotManhwa();
    loadRecommended();
    setHistory(getReadingHistory());
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
      
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const loadRecommended = async () => {
    try {
      manhwaAPI.setProvider(provider);
      const queries = ['martial', 'magic', 'dungeon', 'hunter'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      const result = await manhwaAPI.search(randomQuery);
      setRecommended(result.results.slice(0, 12));
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Navigation */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">
                manhwa<span className="text-red-500">.</span>
              </h1>
            </Link>
            
            {/* Search Bar */}
            <SearchBar initialQuery={searchQuery} onSearch={handleSearch} />

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4 ml-4">
              <Link 
                href="/search"
                className="flex items-center text-gray-400 hover:text-white transition-colors font-medium"
              >
                <Compass className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Discover</span>
              </Link>
              <Link 
                href="/genres"
                className="flex items-center text-gray-400 hover:text-white transition-colors font-medium"
              >
                <Tag className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Genres</span>
              </Link>
              <Link 
                href="/bookmarks"
                className="flex items-center text-gray-400 hover:text-white transition-colors font-medium"
              >
                <Heart className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Bookmarks</span>
              </Link>
              <Link 
                href="/history"
                className="flex items-center text-gray-400 hover:text-white transition-colors font-medium"
              >
                <History className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Continue Reading Section with new component */}
        {!searchQuery && <ContinueReading />}

        {/* Trending Section */}
        {!searchQuery && manhwaList.length > 0 && (
          <TrendingSection manhwaList={manhwaList} />
        )}

        {/* Recently Updated Section */}
        {!searchQuery && manhwaList.length > 0 && (
          <RecentlyUpdated manhwaList={manhwaList} />
        )}

        {/* Recommended Manga Slider */}
        {!searchQuery && recommended.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-white flex items-center">
                  Recommend Manga
                  <ChevronRight className="w-6 h-6 ml-2 text-red-500" />
                </h2>
              </div>
            </div>
            
            <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
              <div className="flex gap-5" style={{ width: 'max-content' }}>
                {recommended.map((item) => (
                  <Link
                    key={item.id}
                    href={`/manhwa/${encodeURIComponent(item.id)}`}
                    className="group flex-shrink-0 w-[220px]"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-2xl hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-2 hover:ring-red-500/50">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="220px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                          <BookOpen className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-base line-clamp-2 leading-tight mb-2">
                            {item.title}
                          </h3>
                          {item.latestChapter && (
                            <p className="text-red-400 text-sm font-semibold flex items-center">
                              <BookOpen className="w-3 h-3 mr-1.5" />
                              {item.latestChapter}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div>
            {/* Section Header with Tabs */}
            <div className="flex items-center mb-6 space-x-6 border-b border-white/10 pb-1">
              <button
                onClick={() => setActiveTab('latest')}
                className={`flex items-center pb-4 border-b-2 transition-all ${
                  activeTab === 'latest'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <TrendingUp className={`w-5 h-5 mr-2 ${activeTab === 'latest' ? 'text-red-500' : ''}`} />
                <span className="font-bold uppercase tracking-wide">Latest Updates</span>
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex items-center pb-4 border-b-2 transition-all ${
                  activeTab === 'bookmarks'
                    ? 'border-pink-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${activeTab === 'bookmarks' ? 'text-pink-500' : ''}`} />
                <span className="font-bold uppercase tracking-wide">Bookmarks</span>
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
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5"
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
                    <>
                      <Pagination
                        currentPage={page}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                        isLoading={loading}
                      />
                      {!hasNextPage && (
                        <div className="text-center pb-8 text-gray-500 text-sm">
                          End of results
                        </div>
                      )}
                    </>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {bookmarks.map((bookmark) => (
                    <ManhwaCard
                      key={bookmark.id}
                      manhwa={{
                        id: bookmark.id,
                        title: bookmark.title,
                        image: bookmark.image,
                        status: 'Unknown', // We don't store status in bookmarks yet
                        latestChapter: '',
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </div>

          {/* Sidebar - Hot Manga */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              {/* Hot Manga Header */}
              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-5 py-3.5 rounded-t-2xl flex items-center shadow-lg shadow-red-500/20">
                <Flame className="w-5 h-5 mr-2 animate-pulse" />
                <h3 className="font-black text-base uppercase tracking-wide">Hot Manga</h3>
              </div>

              {/* Hot Manga List */}
              <div className="bg-white/5 border-x border-b border-white/10 rounded-b-2xl divide-y divide-white/5 backdrop-blur-sm">
                {hotManhwa.length > 0 ? (
                  hotManhwa.map((manhwa, index) => (
                    <Link
                      key={manhwa.id}
                      href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
                      className="flex items-start p-4 hover:bg-white/10 transition-all group"
                    >
                      {/* Rank Badge */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 shadow-lg shadow-red-500/30">
                        {index + 1}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-14 h-18 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 ring-1 ring-white/10 relative">
                        {manhwa.image ? (
                          <Image
                            src={manhwa.image}
                            alt={manhwa.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            📚
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="ml-3 flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors leading-tight">
                          {manhwa.title}
                        </h4>
                        {manhwa.latestChapter && (
                          <div className="mt-1.5">
                            <p className="text-xs text-red-400 font-semibold truncate">
                              {manhwa.latestChapter}
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Loading hot manga...
                  </div>
                )}
              </div>

              {/* More Button */}
              <button 
                onClick={() => setSearchQuery('popular')}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3.5 rounded-b-2xl font-bold text-sm transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
              >
                Explore More Popular Manga →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar hiding */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
