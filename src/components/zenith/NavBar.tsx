'use client';

import React from 'react';
import { Home, Compass, BookOpen, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export const NavBar = () => {
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'discover', icon: Compass, label: 'Discover', href: '/genres' },
    { id: 'library', icon: BookOpen, label: 'Library', href: '/bookmarks' },
    { id: 'me', icon: User, label: 'Me', href: '/profile' },
  ];

  return (
    <>
      {/* Mobile Bottom Floating Pill */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10" />
        <div className="relative flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-14 h-14 group"
              >
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse" />
                )}
                <div
                  className={`relative z-10 transition-all duration-300 transform ${
                    isActive
                      ? '-translate-y-1 text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                >
                  <item.icon
                    size={isActive ? 24 : 22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive ? 'drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : ''
                    }
                  />
                </div>

                {isActive && (
                  <span className="absolute bottom-2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_5px_currentColor]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 bg-gray-950/95 border-r border-white/5 flex-col items-center py-8 z-50 backdrop-blur-xl">
        {/* Logo Area */}
        <div className="mb-12">
          <Link
            href="/"
            className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(147,51,234,0.4)] group cursor-pointer hover:scale-105 transition-transform"
          >
            <Image
              src="/icon-192.png"
              alt="Inkora"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-6 w-full px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl group transition-all duration-300 ${
                  isActive
                    ? 'bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]'
                    : 'hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
                <item.icon
                  size={isActive ? 26 : 24}
                  className={`transition-all duration-300 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] scale-110' : 'text-gray-500 group-hover:text-gray-200'}`}
                />
                <span
                  className={`text-[10px] font-bold mt-1.5 transition-all duration-300 ${isActive ? 'text-blue-100 opacity-100' : 'text-gray-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-4">
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </>
  );
};
