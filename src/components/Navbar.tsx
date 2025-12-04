'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Compass, Heart, History, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-lg'
          : 'bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            manhwa<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 mx-6">
          <Link 
            href="/search"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Compass className="w-4 h-4 mr-2" />
            Discover
          </Link>
          <Link 
            href="/genres"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Tag className="w-4 h-4 mr-2" />
            Genres
          </Link>
          <Link 
            href="/bookmarks"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Heart className="w-4 h-4 mr-2" />
            Bookmarks
          </Link>
          <Link 
            href="/history"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Link>
        </div>

        {/* Search Bar - Compact on Desktop */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar initialQuery={searchQuery} onSearch={handleSearch} />
        </div>

        {/* Mobile Spacer */}
        <div className="md:hidden w-8" />
      </div>
    </nav>
  );
}
