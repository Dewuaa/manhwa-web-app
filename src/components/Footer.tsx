'use client';

import Link from 'next/link';
import {
  Github,
  Twitter,
  Heart,
  Sparkles,
  Home,
  Search,
  BookMarked,
  History,
  Info,
  Shield,
  FileText,
  Zap,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 mt-6 bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-[1600px] mx-auto px-4 py-10 md:py-16">
        {/* Mobile Layout - Stacked and Compact */}
        <div className="md:hidden space-y-8">
          {/* Brand - Mobile */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)]">
                <span className="text-white font-black text-xl">墨</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-bold tracking-tight text-lg">
                  Inkora
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                  Manga & Manhwa
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">
              Your ultimate destination for reading Korean manhwa with a premium
              experience.
            </p>
          </div>

          {/* Quick Links Grid - Mobile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3 text-blue-500" />
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genres"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Genres
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookmarks"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    Bookmarks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/history"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5" />
                    History
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Info className="w-3 h-3 text-purple-500" />
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/advanced-search"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Links - Mobile */}
          <div className="flex justify-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright - Mobile */}
          <div className="pt-6 border-t border-white/5 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>for the community</span>
            </div>
            <p className="text-gray-600 text-xs">
              © {currentYear} Inkora. All rights reserved.
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-12 mb-12">
            {/* Brand - Desktop */}
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_25px_rgba(147,51,234,0.5)] group-hover:shadow-[0_0_35px_rgba(147,51,234,0.7)] transition-all duration-300">
                  <span className="text-white font-black text-2xl">墨</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold tracking-tight text-xl">
                    Inkora
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium tracking-wider uppercase">
                    Manga & Manhwa
                  </span>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md text-sm">
                Your ultimate destination for reading Korean manhwa. Browse thousands of
                titles, track your reading progress, and discover new favorites in a
                premium reading environment.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links - Desktop */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-blue-500 transition-colors" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genres"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-blue-500 transition-colors" />
                    Genres
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookmarks"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-blue-500 transition-colors" />
                    Bookmarks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/history"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-blue-500 transition-colors" />
                    Reading History
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources - Desktop */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-500" />
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/advanced-search"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-purple-500 transition-colors" />
                    Advanced Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-purple-500 transition-colors" />
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-purple-500 transition-colors" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 mr-3 group-hover:bg-purple-500 transition-colors" />
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright - Desktop */}
          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              © {currentYear} Inkora. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>for the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
