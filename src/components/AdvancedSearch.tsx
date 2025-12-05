'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Shuffle } from 'lucide-react';
import { manhwaAPI } from '@/lib/api';
import { useGenres } from '@/hooks/useApi';

const SORT_OPTIONS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Popular', value: 'views' },
  { label: 'Trending', value: 'trending' },
  { label: 'Rating', value: 'rating' },
  { label: 'Alphabetical', value: 'alphabet' },
  { label: 'New', value: 'new-manga' },
];

const STATUS_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
];

interface AdvancedSearchProps {
  initialValues?: {
    query?: string;
    status?: string;
    sort?: string;
    genres?: string[];
  };
  onSearch?: (values: {
    query: string;
    status: string;
    sort: string;
    genres: string[];
  }) => void;
  className?: string;
}

export default function AdvancedSearch({
  initialValues,
  onSearch,
  className = '',
}: AdvancedSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValues?.query || '');
  const [status, setStatus] = useState(initialValues?.status || '');
  const [sort, setSort] = useState(initialValues?.sort || 'latest');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialValues?.genres || [],
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(false);

  // Use cached genres hook
  const { data: genresData, isLoading: loadingGenres } = useGenres();
  const genres = genresData || [];

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (status) params.append('status', status);
    if (sort) params.append('sort', sort);
    if (selectedGenres.length > 0) params.append('genres', selectedGenres.join(','));

    if (onSearch) {
      onSearch({ query, status, sort, genres: selectedGenres });
    } else {
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleSurpriseMe = async () => {
    setLoadingRandom(true);
    try {
      // Fetch a random page from latest updates (1-50)
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const results = await manhwaAPI.getLatestManhwa(randomPage);

      if (results.results.length > 0) {
        const randomManhwa =
          results.results[Math.floor(Math.random() * results.results.length)];
        router.push(`/manhwa/${encodeURIComponent(randomManhwa.id)}`);
      }
    } catch (error) {
      console.error('Failed to surprise you:', error);
    } finally {
      setLoadingRandom(false);
    }
  };

  return (
    <div
      className={`bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden ${className}`}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2 text-white font-bold">
          <Filter className="w-5 h-5 text-red-500" />
          <span>Advanced Filters</span>
        </div>
        <div
          className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-400" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Search Query */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sort */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sort === option.value
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatus(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      status === option.value
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Genres{' '}
              {loadingGenres && (
                <span className="text-xs text-gray-600">(Loading...)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const isSelected = selectedGenres.includes(genre.slug);
                return (
                  <button
                    key={genre.slug}
                    onClick={() => toggleGenre(genre.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <button
              onClick={handleSurpriseMe}
              disabled={loadingRandom}
              className="flex-1 px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingRandom ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shuffle className="w-5 h-5" />
                  <span>Surprise Me</span>
                </>
              )}
            </button>

            <button
              onClick={handleSearch}
              className="flex-[2] px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search Results</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
