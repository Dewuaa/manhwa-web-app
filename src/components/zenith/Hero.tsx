'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Star, ChevronRight, PlayCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Manhwa } from '@/lib/types';

interface HeroProps {
  featuredManga: Manhwa[];
}

export const Hero: React.FC<HeroProps> = ({ featuredManga }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (featuredManga.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev === featuredManga.length - 1 ? 0 : prev + 1));
      }, 6000);
    }

    return () => resetTimeout();
  }, [activeIndex, featuredManga.length]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === featuredManga.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? featuredManga.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    resetTimeout();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!featuredManga || featuredManga.length === 0) return null;

  return (
    <div
      className="relative w-full h-[55vh] sm:h-[60vh] md:h-[600px] overflow-hidden bg-gray-950 group select-none rounded-2xl md:rounded-3xl shadow-2xl mb-6 mx-0 md:mx-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {featuredManga.map((manga, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={manga.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with Slow Zoom */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-linear ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
              style={{ backgroundImage: `url(${manga.image})` }}
            />

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-transparent to-gray-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-gray-950/20 md:via-gray-950/40" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 pb-16 sm:p-6 sm:pb-20 md:justify-center md:pl-24 md:pb-0 md:w-2/3 lg:w-1/2">
              <div
                className={`transition-all duration-700 delay-100 transform ${
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                {/* Badges */}
                <div className="flex items-center gap-3 mb-4">
                  {manga.rating && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 shadow-lg">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-white">{manga.rating}</span>
                    </div>
                  )}
                  {manga.status && manga.status !== 'Unknown' && (
                    <span className="text-sm text-gray-300 font-medium drop-shadow-md bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md">
                      {manga.status}
                    </span>
                  )}
                </div>

                {/* Title */}
                <Link href={`/manhwa/${encodeURIComponent(manga.id)}`}>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-3 md:mb-4 drop-shadow-2xl line-clamp-2 cursor-pointer hover:text-blue-100 transition-colors">
                    {manga.title}
                  </h1>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 md:mt-6">
                  <Link
                    href={`/manhwa/${encodeURIComponent(manga.id)}`}
                    className="bg-white text-black px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all group text-sm sm:text-base"
                  >
                    <PlayCircle
                      size={18}
                      className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"
                      fill="currentColor"
                    />
                    <span>Read Now</span>
                  </Link>
                  <button className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 active:scale-95 transition-all">
                    <Sparkles
                      size={18}
                      className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Desktop Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-12 md:w-auto z-20 flex items-center justify-center gap-2">
        {featuredManga.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'w-6 md:w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                : 'w-1.5 md:w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
