'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, BookOpen, User, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Compass, label: 'Discover' },
    { path: '/bookmarks', icon: BookOpen, label: 'Library' },
    { path: '/profile', icon: User, label: 'Me' },
  ];

  const bottomItems = [{ path: '/settings', icon: Settings, label: 'Settings' }];

  // Hide sidebar on reader pages
  if (pathname?.includes('/read/')) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col w-16 bg-[#0a0a0a] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 mb-4">
        <Link href="/" className="group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path} className="relative w-full group">
              {active && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div
                className={`relative z-10 flex flex-col items-center justify-center py-3 rounded-xl transition-colors duration-200 ${
                  active
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${active ? 'text-primary' : ''}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center gap-2 px-2 pb-4">
        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path} className="relative w-full group">
              {active && (
                <motion.div
                  layoutId="sidebarBottomIndicator"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div
                className={`relative z-10 flex flex-col items-center justify-center py-3 rounded-xl transition-colors duration-200 ${
                  active
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${active ? 'text-primary' : ''}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
