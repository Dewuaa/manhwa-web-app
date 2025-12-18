'use client';

import { Clock, TrendingUp, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSuggestionsProps {
  isOpen: boolean;
  query: string;
  suggestions: string[];
  history: string[];
  trending: string[];
  onSelect: (query: string) => void;
  onRemoveHistory: (query: string) => void;
  onClearHistory: () => void;
}

export default function SearchSuggestions({
  isOpen,
  query,
  suggestions,
  history,
  trending,
  onSelect,
  onRemoveHistory,
  onClearHistory,
}: SearchSuggestionsProps) {
  if (!isOpen) return null;

  const hasHistory = history.length > 0;
  const hasSuggestions = suggestions.length > 0;
  const hasTrending = trending.length > 0;
  const showHistory = !query && hasHistory;
  const showTrending = !query && hasTrending;
  const showSuggestions = query && hasSuggestions;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
      >
        {/* Suggestions (when typing) */}
        {showSuggestions && (
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelect(suggestion)}
                className="w-full px-3 py-2.5 flex items-center space-x-3 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <Search className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                <span className="text-white text-sm flex-1 text-left truncate">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {showHistory && (
          <div className="p-2 border-b border-white/10">
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Recent Searches
              </div>
              <button
                onClick={onClearHistory}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => onSelect(item)}
                className="w-full px-3 py-2.5 flex items-center space-x-3 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <Clock className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                <span className="text-white text-sm flex-1 text-left truncate">
                  {item}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHistory(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-white" />
                </button>
              </button>
            ))}
          </div>
        )}

        {/* Trending Searches */}
        {showTrending && (
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Trending Now
            </div>
            {trending.map((item, index) => (
              <button
                key={index}
                onClick={() => onSelect(item)}
                className="w-full px-3 py-2.5 flex items-center space-x-3 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <TrendingUp className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors" />
                <span className="text-white text-sm flex-1 text-left truncate">
                  {item}
                </span>
                <span className="text-xs text-gray-500">#{index + 1}</span>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!showSuggestions && !showHistory && !showTrending && (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Start typing to search...</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
