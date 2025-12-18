'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Shuffle, Loader2 } from 'lucide-react';
import { manhwaAPI } from '@/lib/api';
import { useGenres } from '@/hooks/useApi';
import SearchModal from './SearchModal';

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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { data: genresData, isLoading: loadingGenres } = useGenres();
  const genres = genresData || [];

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;

    const params = new URLSearchParams();
    if (finalQuery) params.append('query', finalQuery);
    if (status) params.append('status', status);
    if (sort) params.append('sort', sort);
    if (selectedGenres.length > 0) params.append('genres', selectedGenres.join(','));

    if (onSearch) {
      onSearch({ query: finalQuery, status, sort, genres: selectedGenres });
    } else {
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleSurpriseMe = async () => {
    setLoadingRandom(true);
    try {
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
      className={`bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl ${className}`}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2 text-white font-bold">
          <Filter className="w-5 h-5 text-red-500" />
          <span>Advanced Filters</span>
        </div>
        <div
          className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-400" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Search Button - Opens Modal */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Search
              <span className="ml-2 text-gray-600 normal-case font-normal">
                (Press Ctrl+K)
              </span>
            </label>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-black/40 border-2 border-white/10 hover:border-red-500/50 rounded-xl text-left transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 group"
            >
              <Search className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
              <span className="text-gray-500 group-hover:text-gray-400 transition-colors flex-1">
                {query || 'Search titles, authors, or tags...'}
              </span>
              <kbd className="px-2 py-0.5 text-xs text-gray-600 bg-white/5 rounded border border-white/10">
                Ctrl+K
              </kbd>
            </button>
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      sort === option.value
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/20 scale-105'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105'
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      status === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/20 scale-105'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105'
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                      isSelected
                        ? 'bg-white text-black border-white scale-110 shadow-lg shadow-white/20'
                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white hover:scale-105'
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loadingRandom ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shuffle className="w-5 h-5" />
                  <span>Surprise Me</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSearch()}
              className="flex-[2] px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search Results</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
