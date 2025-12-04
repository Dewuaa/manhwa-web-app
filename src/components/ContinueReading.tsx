'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Play } from 'lucide-react';
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
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Play className="w-6 h-6 mr-2 text-red-500" />
          Continue Reading
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                className="absolute top-1 right-1 z-10 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from Continue Reading"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <Link href={`/manhwa/${encodeURIComponent(item.manhwaId)}/read/${encodeURIComponent(item.lastChapterId)}`}>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={item.manhwaImage}
                    alt={item.manhwaTitle}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  
                  {/* Progress overlay */}
                  {progress && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                        <div 
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/80">
                        {progress.chaptersRead}/{progress.totalChapters} chapters
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                    {item.manhwaTitle}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {item.lastChapterTitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
