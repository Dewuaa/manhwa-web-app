'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tag, Heart, History } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 z-50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive('/') ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link
          href="/genres"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive('/genres') ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px] font-medium">Genres</span>
        </Link>
        
        <Link
          href="/bookmarks"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive('/bookmarks') ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Bookmarks</span>
        </Link>
        
        <Link
          href="/history"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive('/history') ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">History</span>
        </Link>
      </div>
    </div>
  );
}
