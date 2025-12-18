'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Compass, label: 'Discover' },
    { path: '/bookmarks', icon: Heart, label: 'Saved' },
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

      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="flex items-center justify-around h-16 px-2">
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
                    className={`relative z-10 flex flex-col items-center space-y-1 transition-colors duration-200 ${
                      active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${active ? 'fill-current' : ''}`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-medium">{item.label}</span>
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
