'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, User, List } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/bookmarks') {
      return pathname === path || pathname?.startsWith('/lists');
    }
    return pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Compass, label: 'Discover' },
    { path: '/lists', icon: List, label: 'Lists' },
    { path: '/bookmarks', icon: Heart, label: 'Library' },
    { path: '/profile', icon: User, label: 'Me' },
  ];

  // Hide bottom nav on reader pages
  if (pathname?.includes('/read/')) {
    return null;
  }

  return (
    <>
      {/* Gradient Fade for Content */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none z-40 md:hidden" />

      <div className="fixed bottom-3 left-3 right-3 z-50 md:hidden safe-area-bottom">
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="flex items-center justify-around h-[60px] sm:h-16 px-1 sm:px-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="relative flex flex-col items-center justify-center w-full h-full group"
                >
                  {active && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 bg-white/5 rounded-xl mx-2 my-2"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div
                    className={`relative z-10 flex flex-col items-center space-y-0.5 sm:space-y-1 transition-colors duration-200 ${
                      active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  >
                    <item.icon
                      className={`w-[18px] h-[18px] sm:w-5 sm:h-5 ${active ? 'fill-current' : ''}`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="text-[9px] sm:text-[10px] font-medium">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
