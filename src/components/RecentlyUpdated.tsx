'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Manhwa } from '@/lib/types';

interface RecentlyUpdatedProps {
  manhwaList: Manhwa[];
}

// Helper function to get relative time
function getRelativeTime(date?: Date | string): string {
  if (!date) return 'Recently';
  
  const now = new Date();
  const updateTime = new Date(date);
  const diffMs = now.getTime() - updateTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return 'Recently';
}

export default function RecentlyUpdated({ manhwaList }: RecentlyUpdatedProps) {
  if (manhwaList.length === 0) {
    return null;
  }

  // Take first 6 items for recently updated
  const recentlyUpdated = manhwaList.slice(0, 6);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Clock className="w-6 h-6 mr-2 text-blue-500" />
          Recently Updated
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentlyUpdated.map((manhwa, index) => (
          <motion.div
            key={manhwa.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/manhwa/${encodeURIComponent(manhwa.id)}`}>
              <div className="group flex gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl ring-1 ring-white/10 hover:ring-blue-500/50 transition-all">
                {/* Thumbnail */}
                <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={manhwa.image}
                    alt={manhwa.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    sizes="64px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                    {manhwa.title}
                  </h3>
                  
                  {/* Latest Chapter */}
                  {manhwa.latestChapter && (
                    <div className="flex items-center gap-1 text-xs text-blue-400 mb-1">
                      <ChevronRight className="w-3 h-3" />
                      <span className="truncate">{manhwa.latestChapter}</span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{getRelativeTime()}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
