'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Loader2,
  BookOpen,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { manhwaAPI, AdvancedSearchOptions } from '@/lib/api';
import { Manhwa } from '@/lib/types';
import ManhwaCard from '@/components/ManhwaCard';
import { useDebounce } from '@/hooks/useDebounce';

// Filter options
const TYPE_OPTIONS = [
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
  { value: 'manga', label: 'Manga' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'releasing', label: 'Ongoing' },
  { value: 'finished', label: 'Completed' },
  { value: 'on_hiatus', label: 'On Hiatus' },
  { value: 'discontinued', label: 'Discontinued' },
];

const DEMOGRAPHIC_OPTIONS = [
  { value: '2', label: 'Shounen' },
  { value: '1', label: 'Seinen' },
  { value: '3', label: 'Shoujo' },
  { value: '4', label: 'Josei' },
];

const SORT_OPTIONS = [
  { value: 'follows', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'created', label: 'Newest Added' },
  { value: 'year', label: 'Release Year' },
  { value: 'views_7d', label: 'Trending (7 days)' },
  { value: 'views_1mo', label: 'Trending (1 month)' },
];

const ALL_GENRES = [
  // Popular genres first
  { slug: 'action', name: 'Action' },
  { slug: 'adult', name: 'Adult' },
  { slug: 'adventure', name: 'Adventure' },
  { slug: 'boys-love', name: 'Boys Love' },
  { slug: 'comedy', name: 'Comedy' },
  { slug: 'crime', name: 'Crime' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'ecchi', name: 'Ecchi' },
  { slug: 'fantasy', name: 'Fantasy' },
  { slug: 'girls-love', name: 'Girls Love' },
  { slug: 'hentai', name: 'Hentai' },
  { slug: 'historical', name: 'Historical' },
  { slug: 'horror', name: 'Horror' },
  { slug: 'isekai', name: 'Isekai' },
  { slug: 'magical-girls', name: 'Magical Girls' },
  { slug: 'mature', name: 'Mature' },
  { slug: 'mecha', name: 'Mecha' },
  { slug: 'medical', name: 'Medical' },
  { slug: 'mystery', name: 'Mystery' },
  { slug: 'philosophical', name: 'Philosophical' },
  { slug: 'psychological', name: 'Psychological' },
  { slug: 'romance', name: 'Romance' },
  { slug: 'sci-fi', name: 'Sci-Fi' },
  { slug: 'slice-of-life', name: 'Slice of Life' },
  { slug: 'smut', name: 'Smut' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'superhero', name: 'Superhero' },
  { slug: 'thriller', name: 'Thriller' },
  { slug: 'tragedy', name: 'Tragedy' },
  { slug: 'wuxia', name: 'Wuxia' },
  // Themes
  { slug: 'harem', name: 'Harem' },
  { slug: 'martial-arts', name: 'Martial Arts' },
  { slug: 'school-life', name: 'School Life' },
  { slug: 'supernatural', name: 'Supernatural' },
  { slug: 'villainess', name: 'Villainess' },
  { slug: 'reincarnation', name: 'Reincarnation' },
  { slug: 'system', name: 'System' },
  { slug: 'regression', name: 'Regression' },
  { slug: 'cultivation', name: 'Cultivation' },
  { slug: 'murim', name: 'Murim' },
  { slug: 'dungeons', name: 'Dungeons' },
  { slug: 'game', name: 'Game' },
  { slug: 'monsters', name: 'Monsters' },
  { slug: 'post-apocalyptic', name: 'Post-Apocalyptic' },
  { slug: 'survival', name: 'Survival' },
];

// Wrap the main page in Suspense for useSearchParams
export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  );
}

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);  // Start closed

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  // Default exclude adult content like Comix.to does
  const [excludedGenres, setExcludedGenres] = useState<string[]>(['adult', 'ecchi', 'hentai', 'smut']);
  const [minChapters, setMinChapters] = useState<string>('');
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('follows');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Read URL query parameter on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  const debouncedQuery = useDebounce(query, 400);

  const fetchResults = useCallback(async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    
    try {
      // Combine included and excluded genres (excluded have - prefix)
      const allGenres = [
        ...selectedGenres,
        ...excludedGenres.map(g => `-${g}`)
      ];

      const options: AdvancedSearchOptions = {
        query: debouncedQuery || undefined,
        page: currentPage,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        status: selectedStatus.length > 0 ? selectedStatus : undefined,
        demographics: selectedDemographics.length > 0 ? selectedDemographics : undefined,
        genres: allGenres.length > 0 ? allGenres : undefined,
        minChapters: minChapters ? parseInt(minChapters) : undefined,
        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
        yearTo: yearTo ? parseInt(yearTo) : undefined,
        sort: sortBy as AdvancedSearchOptions['sort'],
      };

      const data = await manhwaAPI.advancedSearch(options);
      
      if (resetPage) {
        setResults(data.results);
        setPage(1);
      } else if (currentPage === 1) {
        setResults(data.results);
      } else {
        setResults(prev => [...prev, ...data.results]);
      }
      
      setHasMore(data.hasNextPage);
      setTotalResults(data.totalResults || data.results.length);
    } catch (error) {
      console.error('Browse error:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, selectedTypes, selectedStatus, selectedDemographics, selectedGenres, excludedGenres, minChapters, yearFrom, yearTo, sortBy]);


  // Initial fetch and auto-trigger on filter changes
  useEffect(() => {
    fetchResults(true);
  }, [debouncedQuery, selectedTypes, selectedStatus, selectedDemographics, selectedGenres, excludedGenres, sortBy]);

  // Manual filters (min chapters, year) - don't auto-trigger
  const applyFilters = () => {
    fetchResults(true);
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedTypes([]);
    setSelectedStatus([]);
    setSelectedDemographics([]);
    setSelectedGenres([]);
    setExcludedGenres([]);
    setMinChapters('');
    setYearFrom('');
    setYearTo('');
    setSortBy('follows');
    setPage(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchResults(false);
    }
  }, [page]);

  const toggleArrayValue = (arr: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (arr.includes(value)) {
      setter(arr.filter(v => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  // Cycle through: none -> include -> exclude -> none
  const toggleGenre = (slug: string) => {
    if (selectedGenres.includes(slug)) {
      // Currently included -> move to excluded
      setSelectedGenres(prev => prev.filter(g => g !== slug));
      setExcludedGenres(prev => [...prev, slug]);
    } else if (excludedGenres.includes(slug)) {
      // Currently excluded -> remove (back to none)
      setExcludedGenres(prev => prev.filter(g => g !== slug));
    } else {
      // Not selected -> include
      setSelectedGenres(prev => [...prev, slug]);
    }
  };

  const getGenreState = (slug: string): 'none' | 'include' | 'exclude' => {
    if (selectedGenres.includes(slug)) return 'include';
    if (excludedGenres.includes(slug)) return 'exclude';
    return 'none';
  };

  const activeFilterCount = [
    selectedTypes.length > 0,
    selectedStatus.length > 0,
    selectedDemographics.length > 0,
    selectedGenres.length > 0 || excludedGenres.length > 0,
    minChapters !== '',
    yearFrom !== '' || yearTo !== '',
  ].filter(Boolean).length;

  // Mobile Filter Modal Content
  const MobileFilterContent = () => (
    <div className="space-y-5 pb-20">
      {/* Type - Horizontal chips */}
      <div>
        <h3 className="font-semibold text-white mb-3 text-sm">Type</h3>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleArrayValue(selectedTypes, opt.value, setSelectedTypes)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTypes.includes(opt.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status - Horizontal chips */}
      <div>
        <h3 className="font-semibold text-white mb-3 text-sm">Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleArrayValue(selectedStatus, opt.value, setSelectedStatus)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus.includes(opt.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Demographic - Horizontal chips */}
      <div>
        <h3 className="font-semibold text-white mb-3 text-sm">Demographic</h3>
        <div className="flex flex-wrap gap-2">
          {DEMOGRAPHIC_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleArrayValue(selectedDemographics, opt.value, setSelectedDemographics)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDemographics.includes(opt.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genres - Click cycles: none → include → exclude → none */}
      <div>
        <h3 className="font-semibold text-white mb-2 text-sm">Genres <span className="text-gray-500 text-xs font-normal">(tap to cycle)</span></h3>
        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map(genre => {
            const state = getGenreState(genre.slug);
            return (
              <button
                key={genre.slug}
                onClick={() => toggleGenre(genre.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  state === 'include'
                    ? 'bg-green-600 text-white'
                    : state === 'exclude'
                    ? 'bg-red-600/80 text-white line-through'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {state === 'include' && <span>✓</span>}
                {state === 'exclude' && <span>✕</span>}
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Chapters & Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-white mb-2 text-sm">Min Chapters</h3>
          <input
            type="number"
            value={minChapters}
            onChange={(e) => setMinChapters(e.target.value)}
            placeholder="e.g. 50"
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <h3 className="font-semibold text-white mb-2 text-sm">Year Range</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="From"
              className="w-1/2 bg-white/10 border border-white/10 rounded-lg px-2 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs"
            />
            <input
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="To"
              className="w-1/2 bg-white/10 border border-white/10 rounded-lg px-2 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Desktop Filter Sidebar Content  
  const DesktopFilterContent = () => (
    <div className="space-y-5">
      {/* Types */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <BookOpen size={16} /> Type
        </h3>
        <div className="space-y-2">
          {TYPE_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTypes.includes(opt.value)}
                onChange={() => toggleArrayValue(selectedTypes, opt.value, setSelectedTypes)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Filter size={16} /> Status
        </h3>
        <div className="space-y-2">
          {STATUS_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedStatus.includes(opt.value)}
                onChange={() => toggleArrayValue(selectedStatus, opt.value, setSelectedStatus)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Demographics */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="font-bold text-white mb-3">Demographic</h3>
        <div className="space-y-2">
          {DEMOGRAPHIC_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedDemographics.includes(opt.value)}
                onChange={() => toggleArrayValue(selectedDemographics, opt.value, setSelectedDemographics)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Genres - Click cycles: none → include → exclude → none */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="font-bold text-white mb-2">Genres <span className="text-gray-500 text-xs font-normal">(click to cycle)</span></h3>
        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map(genre => {
            const state = getGenreState(genre.slug);
            return (
              <button
                key={genre.slug}
                onClick={() => toggleGenre(genre.slug)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  state === 'include'
                    ? 'bg-green-600 text-white'
                    : state === 'exclude'
                    ? 'bg-red-600/80 text-white line-through'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                {state === 'include' && <span>✓</span>}
                {state === 'exclude' && <span>✕</span>}
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Chapters */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="font-bold text-white mb-3">Min Chapters</h3>
        <input
          type="number"
          value={minChapters}
          onChange={(e) => setMinChapters(e.target.value)}
          placeholder="e.g. 50"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Year Range */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h3 className="font-bold text-white mb-3">Release Year</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder="From"
            className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <input
            type="number"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder="To"
            className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Apply / Reset */}
      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={resetFilters}
          className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24 md:pb-0 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-sm md:text-base"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <SlidersHorizontal size={18} />
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Sort & Results Count */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs md:text-sm hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-400">Sort:</span>
                  <span className="font-medium">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showSortMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowSortMenu(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden py-1">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            sortBy === opt.value
                              ? 'bg-blue-600/10 text-blue-400 font-medium'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {totalResults > 0 && (
              <span className="text-xs md:text-sm text-gray-500">
                {totalResults.toLocaleString()} results
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/80" onClick={() => setShowFilters(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900 px-4 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-bold text-white text-lg">Filters</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-4 py-4">
              <MobileFilterContent />
            </div>
            
            {/* Fixed Bottom Buttons */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-4">
              <button
                onClick={() => { applyFilters(); setShowFilters(false); }}
                className="w-full bg-blue-600 active:scale-95 text-white font-bold py-3.5 rounded-xl text-base shadow-lg shadow-blue-600/20"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-4 py-4 md:py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar - Hidden on mobile */}
          {showFilters && (
            <div className="hidden md:block w-64 shrink-0">
              <DesktopFilterContent />
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1">
            {loading && results.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16 md:py-20 text-gray-500">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-50" />
                <p className="text-base md:text-lg">No results found</p>
                <p className="text-xs md:text-sm mt-1 md:mt-2 mb-6">Try adjusting your filters</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                  {results.map((manga) => (
                    <ManhwaCard key={manga.id} manhwa={manga} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-6 md:mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold rounded-xl transition-colors text-sm md:text-base"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ChevronDown size={18} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
