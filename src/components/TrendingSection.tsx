'use client';

import { ManhwaLink } from './ManhwaLink';
import Image from 'next/image';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Manhwa } from '@/lib/types';
import { useEngagement } from '@/hooks/useEngagement';

interface TrendingSectionProps {
  manhwaList: Manhwa[];
}

export default function TrendingSection({ manhwaList }: TrendingSectionProps) {
  const { getTrendingScore, getTrendingIds } = useEngagement();
  
  if (manhwaList.length === 0) {
    return null;
  }

  // Sort by engagement score
  const trendingIds = getTrendingIds();
  const trending = manhwaList
    .map((manhwa) => ({
      ...manhwa,
      score: getTrendingScore(manhwa.id),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Flame className="w-6 h-6 mr-2 text-orange-500" />
          Trending Now
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {trending.map((manhwa, index) => (
          <motion.div
            key={manhwa.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <ManhwaLink href={`/manhwa/${encodeURIComponent(manhwa.id)}`}>
              <div className="group relative">
                {/* Trending Badge */}
                <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  #{index + 1}
                </div>

                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={manhwa.image}
                    alt={manhwa.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {manhwa.title}
                  </h3>
                </div>
              </div>
            </ManhwaLink>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
