'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Play, BookOpen } from 'lucide-react';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { motion } from 'framer-motion';

export default function ContinueReading() {
  const { getRecentlyRead, removeFromHistory, getProgress } = useReadingHistory();
  const recentlyRead = getRecentlyRead(6);

  if (recentlyRead.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white flex items-center uppercase tracking-wide">
          <Play className="w-5 h-5 mr-2 text-primary fill-primary" />
          Continue Reading
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recentlyRead.map((item, index) => {
          const progress = getProgress(item.manhwaId);
          
          return (
            <motion.div
              key={item.manhwaId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromHistory(item.manhwaId);
                }}
                className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 border border-white/10"
                title="Remove from Continue Reading"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <Link href={`/manhwa/${encodeURIComponent(item.manhwaId)}/read/${encodeURIComponent(item.lastChapterId)}`}>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-white/5 shadow-lg transition-all duration-300 group-hover:shadow-primary/20 group-hover:border-primary/30 group-hover:-translate-y-1">
                  {item.manhwaImage ? (
                    <Image
                      src={item.manhwaImage}
                      alt={item.manhwaTitle}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <BookOpen className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                  )}
                  
                  {/* Progress overlay */}
                  {progress && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-primary transition-all duration-500 ease-out"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-medium truncate pr-2">{item.lastChapterTitle}</span>
                        <span className="text-primary font-bold whitespace-nowrap">
                          {Math.round(progress.progress)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {item.manhwaTitle}
                  </h3>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
