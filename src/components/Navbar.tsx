'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  Heart,
  History,
  Tag,
  Menu,
  X,
  User,
  List,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import SearchModal from './SearchModal';
import { NotificationBell } from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const navLinks = [
    { href: '/search', label: 'Discover', icon: Compass },
    { href: '/genres', label: 'Genres', icon: Tag },
    { href: '/lists', label: 'Lists', icon: List },
    { href: '/bookmarks', label: 'Bookmarks', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-white/5 shadow-lg'
            : 'bg-linear-to-b from-black/90 to-transparent backdrop-blur-[2px] border-b border-white/0'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight hidden sm:block">
              Inkora<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary' : ''}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Search Button - Opens Modal */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex-1 max-w-md hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
          >
            <Search className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            <span className="text-sm text-gray-500 group-hover:text-gray-400">
              Search manhwa...
            </span>
            <kbd className="ml-auto px-2 py-0.5 text-xs text-gray-600 bg-white/5 rounded border border-white/10">
              Ctrl+K
            </kbd>
          </button>

          {/* Notification Bell - Desktop */}
          <div className="hidden md:block">
            <NotificationBell />
          </div>

          {/* Mobile Search & Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-4 md:hidden"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-4 rounded-xl text-lg font-bold transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-6 h-6 mr-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
