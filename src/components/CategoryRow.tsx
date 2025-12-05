'use client';

import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Manhwa } from '@/lib/types';
import { useRef } from 'react';
import ImageWithFallback from './ImageWithFallback';
import ManhwaCard from './ManhwaCard';

interface CategoryRowProps {
  title: string;
  icon?: React.ReactNode;
  manhwaList: Manhwa[];
  viewAllLink?: string;
  loading?: boolean;
}

export default function CategoryRow({
  title,
  icon,
  manhwaList,
  viewAllLink,
  loading = false,
}: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 800; // Increased scroll amount for larger cards
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <section className="mb-20 px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="min-w-[240px] h-[360px] bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (manhwaList.length === 0) return null;

  return (
    <section className="mb-20 group px-4 md:px-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 text-primary shadow-lg shadow-primary/10">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {title}
            </h2>
            <p className="text-gray-400 text-sm mt-1 font-medium tracking-wide uppercase opacity-60">
              Explore the best {title} manhwa
            </p>
          </div>
        </div>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="hidden md:flex items-center px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm font-bold text-gray-300 hover:text-white group/btn"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative -mx-4 md:-mx-8 px-4 md:px-8">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-black/80 hover:bg-primary backdrop-blur-md border border-white/10 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 -ml-7 hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {manhwaList.map((manhwa, index) => (
            <div
              key={manhwa.id}
              className="min-w-[160px] w-[40vw] sm:w-[200px] md:min-w-[220px] md:w-[220px] snap-start shrink-0"
            >
              <ManhwaCard
                manhwa={manhwa}
                rank={title.includes('Trending') ? index + 1 : undefined}
              />
            </div>
          ))}

          {/* "View All" Card at the end */}
          {viewAllLink && (
            <div className="min-w-[160px] w-[40vw] sm:w-[200px] md:min-w-[220px] md:w-[220px] snap-start shrink-0 flex items-center justify-center">
              <Link
                href={viewAllLink}
                className="w-full aspect-[3/4.5] rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center group/card transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 group-hover/card:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover/card:text-primary" />
                </div>
                <span className="text-gray-400 font-bold group-hover/card:text-white transition-colors">
                  View All
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-black/80 hover:bg-primary backdrop-blur-md border border-white/10 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 -mr-7 hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </section>
  );
}
