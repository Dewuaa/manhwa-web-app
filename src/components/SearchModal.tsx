'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  TrendingUp,
  Hash,
  ChevronRight,
  Sparkles,
  Loader2,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { manhwaAPI } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useGenres } from '@/hooks/useApi';
import { Manhwa } from '@/lib/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Manhwa[]>([]);
  const [trendingManhwa, setTrendingManhwa] = useState<Manhwa[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const { history, addToHistory } = useSearchHistory();
  const { data: genresData } = useGenres();
  const genres = genresData || [];

  // Fetch trending manhwa on mount
  useEffect(() => {
    if (isOpen && trendingManhwa.length === 0) {
      const fetchTrending = async () => {
        setLoadingTrending(true);
        try {
          const results = await manhwaAPI.getLatestManhwa(1);
          setTrendingManhwa(results.results.slice(0, 5));
        } catch (error) {
          console.error('Failed to fetch trending:', error);
        } finally {
          setLoadingTrending(false);
        }
      };
      fetchTrending();
    }
  }, [isOpen, trendingManhwa.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        setQuery('');
        setActiveFilter(null);
        setSearchResults([]);
      }, 200);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery && !activeFilter) {
        setSearchResults([]);
        return;
      }

      setLoadingResults(true);
      try {
        let results;
        if (activeFilter && !debouncedQuery) {
          // Filter by genre only
          results = await manhwaAPI.getGenre(activeFilter, 1);
        } else if (debouncedQuery) {
          // Search by query
          results = await manhwaAPI.search(debouncedQuery, 1);
        }

        if (results) {
          setSearchResults(results.results.slice(0, 10));
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, activeFilter]);

  const handleSelect = (id: string) => {
    if (query.trim()) {
      addToHistory(query);
    }
    router.push(`/manhwa/${encodeURIComponent(id)}`);
    onClose();
  };

  const handleFilterClick = (slug: string) => {
    if (activeFilter === slug) {
      setActiveFilter(null);
    } else {
      setActiveFilter(slug);
    }
    inputRef.current?.focus();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showTrending =
    query === '' && activeFilter === null && searchResults.length === 0;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/95 backdrop-blur-2xl animate-in fade-in duration-200 flex flex-col">
      {/* Search Header */}
      <div className="flex items-center gap-4 p-4 md:p-6 border-b border-white/5 bg-gray-950/50">
        <div className="flex-1 relative group">
          <Search
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors"
            size={24}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, or tags..."
            className="w-full bg-transparent text-white text-xl md:text-2xl font-medium placeholder-gray-600 outline-none pl-10 py-2 caret-red-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
            >
              <div className="bg-white/10 rounded-full p-0.5">
                <X size={14} />
              </div>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white font-medium text-sm md:text-base px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Filter Chips */}
      <div className="py-4 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 md:px-6">
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              activeFilter === null
                ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp size={14} /> All
          </button>
          {genres.slice(0, 15).map((genre) => (
            <button
              key={genre.slug}
              type="button"
              onClick={() => handleFilterClick(genre.slug)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeFilter === genre.slug
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {activeFilter === genre.slug ? <Hash size={14} /> : null}
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        {/* Loading State */}
        {loadingResults && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}

        {/* Trending / Empty State */}
        {!loadingResults && showTrending && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-white font-bold text-lg">Trending Searches</h3>
            </div>

            {loadingTrending ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                    <span className="font-black text-lg w-6 text-gray-700">{i}</span>
                    <div className="w-14 h-20 bg-white/10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {trendingManhwa.map((manhwa, i) => (
                  <div
                    key={manhwa.id}
                    onClick={() => handleSelect(manhwa.id)}
                    className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-black text-xl w-6 text-center ${
                          i === 0
                            ? 'text-amber-500'
                            : i === 1
                              ? 'text-gray-400'
                              : i === 2
                                ? 'text-amber-700'
                                : 'text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="relative w-14 h-20 rounded-xl overflow-hidden shadow-lg">
                        <Image
                          src={manhwa.image}
                          alt={manhwa.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-white font-bold group-hover:text-red-400 transition-colors truncate max-w-[200px] sm:max-w-[300px]">
                          {manhwa.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 text-xs">
                            {manhwa.status || 'Manhwa'}
                          </span>
                          <span className="text-gray-600">•</span>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-gray-400 text-xs font-medium">4.9</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-600 group-hover:text-white transition-colors shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-10">
                <h3 className="text-white font-bold text-lg mb-4">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {history.slice(0, 8).map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-full text-sm font-medium border border-white/5 hover:border-white/20 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <h3 className="text-white font-bold text-lg mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 12).map((genre) => (
                  <button
                    key={genre.slug}
                    type="button"
                    onClick={() => handleFilterClick(genre.slug)}
                    className="px-4 py-2 bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-400 rounded-full text-sm font-medium border border-white/5 hover:border-red-500/30 transition-all"
                  >
                    # {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!loadingResults && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((manhwa) => (
              <div
                key={manhwa.id}
                onClick={() => handleSelect(manhwa.id)}
                className="flex gap-4 p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="relative w-16 h-24 sm:w-20 sm:h-28 shrink-0 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={manhwa.image}
                    alt={manhwa.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 flex flex-col min-w-0 py-1">
                  <h4 className="text-white font-bold text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-red-400 transition-colors">
                    {manhwa.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-gray-500 text-xs">
                      {manhwa.status || 'Ongoing'}
                    </span>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-gray-400 text-xs font-medium">4.8</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 truncate">
                    {manhwa.latestChapter || 'Latest Chapter'}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <div className="p-2 bg-white/5 rounded-full text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loadingResults &&
          !showTrending &&
          searchResults.length === 0 &&
          (query || activeFilter) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                <Search size={32} />
              </div>
              <h3 className="text-white font-bold text-lg">No matches found</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-[250px]">
                Try searching for a different title or genre.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
