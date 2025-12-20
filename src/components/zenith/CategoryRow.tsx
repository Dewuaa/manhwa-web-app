'use client';

import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Manhwa } from '@/lib/types';
import { SectionHeader } from './SectionHeader';
import { MangaCard } from './MangaCard';

interface CategoryRowProps {
  title: string;
  icon?: React.ReactNode;
  manhwaList: Manhwa[];
  viewAllLink?: string;
  loading?: boolean;
  layout?: 'scroll' | 'grid';
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  icon,
  manhwaList,
  viewAllLink,
  loading = false,
  layout = 'scroll',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <section className="mt-6 px-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        <div
          className={`flex gap-4 ${layout === 'scroll' ? 'overflow-hidden' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-full aspect-[3/4] bg-white/5 rounded-2xl animate-pulse shrink-0"
            />
          ))}
        </div>
      </section>
    );
  }

  if (manhwaList.length === 0) return null;

  return (
    <section className="mt-6 relative group">
      <SectionHeader
        title={title}
        icon={icon}
        actionText="See All"
        actionLink={viewAllLink}
      />

      {/* Scroll Buttons - Only for scroll layout */}
      {layout === 'scroll' && (
        <>
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 -translate-y-1/2 -translate-x-1/2"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 -translate-y-1/2 translate-x-1/2"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* List */}
      <div
        ref={scrollRef}
        className={
          layout === 'scroll'
            ? 'flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar px-4 pb-4 snap-x snap-mandatory md:gap-5 lg:gap-6'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 px-4 pb-4 md:gap-5 lg:gap-6'
        }
      >
        {manhwaList.map((manga, i) => (
          <div
            key={manga.id}
            className={layout === 'scroll' ? 'snap-center flex-none' : ''}
          >
            <MangaCard
              manhwa={manga}
              rank={title.includes('Trending') ? i + 1 : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
