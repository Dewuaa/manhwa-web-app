'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, ChevronLeft, ChevronRight, MoreVertical, Check } from 'lucide-react';
import { ManhwaLink } from '../ManhwaLink';
import { Manhwa } from '@/lib/types';
import ImageWithFallback from '../ImageWithFallback';
import { getLatestUpdates } from '@/lib/api';

// Helper to format relative time like "2 hours ago", "37 minutes ago"
function getRelativeTime(timestamp: number | string | undefined): string {
  if (!timestamp) return 'Recently';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000) // Unix timestamp (seconds)
    : new Date(timestamp);
  
  if (isNaN(date.getTime())) return 'Recently';
  
  const now = Date.now();
  const diffMs = now - date.getTime();
  
  // Handle future dates (possibly wrong timezone), show as "Just now"
  if (diffMs < 0) return 'Just now';
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type TypeFilter = 'all' | 'manga' | 'manhwa' | 'manhua' | 'other';

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
  { value: 'other', label: 'Other' },
];

interface LatestUpdatesProps {
  initialData?: Manhwa[];
}

export const LatestUpdates: React.FC<LatestUpdatesProps> = ({ initialData = [] }) => {
  const [scope, setScope] = useState<'hot' | 'new'>('hot');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [manhwaList, setManhwaList] = useState<Manhwa[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowTypeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data when scope or page changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getLatestUpdates(page, scope, typeFilter);
        setManhwaList(data.results || []);
        setHasNextPage(data.hasNextPage);
      } catch (error) {
        console.error('Failed to fetch latest updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scope, page, typeFilter]);

  const handleScopeChange = (newScope: 'hot' | 'new') => {
    if (newScope !== scope) {
      setScope(newScope);
      setPage(1); // Reset to page 1 when switching tabs
    }
  };

  const handleTypeChange = (type: TypeFilter) => {
    setTypeFilter(type);
    setPage(1);
    setShowTypeMenu(false);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (hasNextPage) setPage(p => p + 1);
  };

  // Take first 10 items for display
  const displayList = manhwaList.slice(0, 10);

  return (
    <section className="mt-4 sm:mt-6 px-4 pb-8">
      {/* Header with title, tabs, and pagination */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-bold text-gray-100">Latest Updates</h2>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Hot/New Toggle - Smaller on mobile */}
          <div className="flex bg-gray-800/60 rounded-md sm:rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => handleScopeChange('hot')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                scope === 'hot'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Flame size={12} className="sm:w-3.5 sm:h-3.5" />
              HOT
            </button>
            <button
              onClick={() => handleScopeChange('new')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                scope === 'new'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
              NEW
            </button>
          </div>

          {/* Pagination Arrows - Larger on mobile for easier tapping */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className={`p-2 sm:p-2 rounded-lg border transition-all ${
                page <= 1
                  ? 'border-white/5 text-gray-600 cursor-not-allowed'
                  : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5 active:scale-95'
              }`}
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className={`p-2 sm:p-2 rounded-lg border transition-all ${
                !hasNextPage
                  ? 'border-white/5 text-gray-600 cursor-not-allowed'
                  : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5 active:scale-95'
              }`}
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
            
            {/* Type Filter Dropdown */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="p-2 sm:p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
              >
                <MoreVertical size={18} className="sm:w-5 sm:h-5" />
              </button>
              
              {/* Dropdown Menu */}
              {showTypeMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                  {TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTypeChange(option.value)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                        typeFilter === option.value
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {option.label}
                      {typeFilter === option.value && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayList.map((manga, i) => (
            <ManhwaLink
              key={`${manga.id}-${i}`}
              href={`/manhwa/${encodeURIComponent(manga.id)}`}
              className="group relative rounded-xl overflow-hidden bg-gray-900/60 border border-white/5 hover:border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Cover Image */}
              <div className="aspect-[3/4] relative overflow-hidden">
                <ImageWithFallback
                  src={manga.image}
                  alt={manga.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {/* Chapter badge */}
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-medium text-gray-200 backdrop-blur-sm">
                  Ch.{manga.latestChapter || '?'}
                </div>
                
                {/* Time badge */}
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-gray-300 backdrop-blur-sm">
                  {getRelativeTime(manga.updatedAt)}
                </div>
              </div>
              
              {/* Title overlay at bottom */}
              <div className="absolute bottom-0 inset-x-0 p-3 pt-8">
                <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {manga.title}
                </h3>
              </div>
            </ManhwaLink>
          ))}
        </div>
      )}

      {/* Bottom Pagination - Easy access without scrolling */}
      {!loading && displayList.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-6 pt-4 border-t border-white/5">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className={`flex-1 max-w-[160px] flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
              page <= 1
                ? 'border-white/5 text-gray-600 cursor-not-allowed bg-white/5'
                : 'border-white/10 text-gray-300 hover:text-white hover:bg-white/10 active:scale-95'
            }`}
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Previous</span>
          </button>
          <span className="text-gray-500 text-sm font-medium px-3">Page {page}</span>
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className={`flex-1 max-w-[160px] flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
              !hasNextPage
                ? 'border-white/5 text-gray-600 cursor-not-allowed bg-white/5'
                : 'border-white/10 text-gray-300 hover:text-white hover:bg-white/10 active:scale-95'
            }`}
          >
            <span className="text-sm font-medium">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  );
};

// Keep old export for backward compatibility
export const FreshUpdates = LatestUpdates;
