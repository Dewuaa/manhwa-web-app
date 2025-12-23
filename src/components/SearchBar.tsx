'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { manhwaAPI } from '@/lib/api';
import { Manhwa } from '@/lib/types';
import { ManhwaLink } from './ManhwaLink';
import Image from 'next/image';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ initialQuery = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Manhwa[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await manhwaAPI.search(searchQuery);
      setSuggestions(result.results.slice(0, 5));
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    onSearch(''); // Optional: clear results on clear
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-md mx-8">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search thousands of manhwa..."
          className="w-full bg-white/5 text-sm rounded-full pl-11 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-white/10 text-white placeholder:text-gray-500 hover:bg-white/10 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((manhwa) => (
                <ManhwaLink
                  key={manhwa.id}
                  href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-14 bg-white/5 rounded overflow-hidden flex-shrink-0 mr-3 relative">
                    {manhwa.image && (
                      <Image
                        src={manhwa.image}
                        alt={manhwa.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">
                      {manhwa.title}
                    </h4>
                    {manhwa.latestChapter && (
                      <p className="text-xs text-gray-500 truncate">
                        {typeof manhwa.latestChapter === 'number' 
                          ? `Ch. ${manhwa.latestChapter}` 
                          : String(manhwa.latestChapter).replace('Chapter', 'Ch.')}
                      </p>
                    )}
                  </div>
                </ManhwaLink>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full text-center py-3 text-xs font-bold text-red-400 hover:text-red-300 border-t border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
              >
                View all results for &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
