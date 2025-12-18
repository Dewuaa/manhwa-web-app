'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';

export default function SearchPageClient() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Auto-open modal on page load
  useEffect(() => {
    setIsSearchModalOpen(true);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
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

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsSearchModalOpen(true)}
        className="w-full flex items-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-2xl transition-all duration-300 group"
      >
        <Search className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
        <span className="text-lg text-gray-500 group-hover:text-gray-300 transition-colors">
          Search titles, authors, or tags...
        </span>
        <kbd className="ml-auto px-3 py-1 text-sm text-gray-600 bg-white/5 rounded-lg border border-white/10">
          Ctrl+K
        </kbd>
      </button>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
