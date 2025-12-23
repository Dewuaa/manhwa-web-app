'use client';

import { ManhwaLink } from './ManhwaLink';
import { X, Play, BookOpen, Clock } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { motion } from 'framer-motion';
import { SectionHeader } from './zenith/SectionHeader';
import { useRef } from 'react';

export default function ContinueReading() {
  const { getRecentlyRead, removeFromHistory, getProgress } = useReadingHistory();
  const recentlyRead = getRecentlyRead(10);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (recentlyRead.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 relative group">
      <SectionHeader
        title="Jump Back In"
        icon={<Clock size={18} className="text-blue-500" />}
      />

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar px-4 pb-4 snap-x snap-mandatory md:gap-6"
      >
        {recentlyRead.map((item, index) => {
          const progress = getProgress(item.manhwaId);

          return (
            <motion.div
              key={`${item.manhwaId}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="snap-center flex-none w-[260px] sm:w-[280px] md:w-[320px] group/card relative"
            >
              <div className="flex gap-3 sm:gap-4 bg-gray-900/60 backdrop-blur-sm border border-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 hover:bg-gray-800/60 transition-colors cursor-pointer h-full relative overflow-hidden">
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromHistory(item.manhwaId);
                  }}
                  className="absolute top-2 right-2 z-20 w-6 h-6 bg-black/40 hover:bg-red-500/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all"
                  title="Remove"
                >
                  <X className="w-3 h-3 text-white" />
                </button>

                <ManhwaLink
                  href={`/manhwa/${encodeURIComponent(item.manhwaId)}/read/${encodeURIComponent(item.lastChapterId)}`}
                  className="flex gap-3 sm:gap-4 w-full"
                >
                  <div className="relative w-16 h-24 sm:w-20 sm:h-28 shrink-0 rounded-lg overflow-hidden shadow-lg group-hover/card:scale-105 transition-transform">
                    {item.manhwaImage ? (
                      <ImageWithFallback
                        src={item.manhwaImage}
                        alt={item.manhwaTitle}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <BookOpen className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-1.5">
                        <Play size={12} className="text-black fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="text-white font-semibold sm:font-bold text-xs sm:text-sm truncate group-hover/card:text-blue-400 transition-colors mb-0.5 sm:mb-1">
                      {item.manhwaTitle}
                    </h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs mb-2 sm:mb-3 truncate">
                      {item.lastChapterTitle}
                    </p>

                    {/* Progress Bar */}
                    {progress && (
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    )}
                    {progress && (
                      <span className="text-[10px] text-gray-500 mt-1 font-medium text-right">
                        {Math.round(progress.progress)}%
                      </span>
                    )}
                  </div>
                </ManhwaLink>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
