'use client';

import { useState, useEffect } from 'react';
import { ManhwaLink } from './ManhwaLink';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Calendar, BookOpen } from 'lucide-react';
import { Manhwa } from '@/lib/types';
import ImageWithFallback from './ImageWithFallback';

interface HeroCarouselProps {
  manhwaList: Manhwa[];
}

export default function HeroCarousel({ manhwaList }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = manhwaList.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  return (
    <div className="relative w-full h-[55vh] md:h-[60vh] lg:h-[70vh] overflow-hidden rounded-2xl md:rounded-3xl mb-8 group ring-1 ring-white/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {featured[currentIndex].image ? (
              <ImageWithFallback
                src={featured[currentIndex].image}
                alt={featured[currentIndex].title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
                showIcon={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-12 lg:p-16 z-10 bg-linear-to-t from-black via-black/80 to-transparent pt-32">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2 mb-3 md:mb-4"
              >
                <span className="px-3 py-1 bg-primary text-white text-[10px] md:text-xs font-black rounded-lg uppercase tracking-wider shadow-lg shadow-primary/20">
                  Featured
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] md:text-xs font-bold rounded-lg flex items-center border border-white/10">
                  <Star className="w-3 h-3 mr-1.5 text-yellow-400 fill-yellow-400" />
                  Top Rated
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-3 md:mb-6 leading-tight line-clamp-2 drop-shadow-2xl tracking-tight"
              >
                {featured[currentIndex].title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-4 md:space-x-6 text-gray-200 mb-6 md:mb-8 text-xs md:text-sm font-medium"
              >
                {featured[currentIndex].latestChapter && (
                  <span className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                    <BookOpen className="w-4 h-4 mr-2 text-primary" />
                    {featured[currentIndex].latestChapter}
                  </span>
                )}
                <span className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Updated Recently
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-3 md:space-x-4"
              >
                <ManhwaLink
                  href={`/manhwa/${encodeURIComponent(featured[currentIndex].id)}`}
                  className="flex-1 md:flex-none px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 text-sm md:text-base group/btn"
                >
                  Read Now
                  <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </ManhwaLink>
                <button className="flex-1 md:flex-none px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-xl font-bold border border-white/10 transition-all hover:-translate-y-1 text-sm md:text-base hover:border-white/20">
                  More Info
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 flex space-x-1.5 md:space-x-2 z-20">
        {featured.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 md:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary w-4 md:w-8'
                : 'bg-white/20 hover:bg-white/40 w-1.5 md:w-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
