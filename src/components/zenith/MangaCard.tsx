import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { Manhwa } from '@/lib/types';
import ImageWithFallback from '../ImageWithFallback';

interface MangaCardProps {
  manhwa: Manhwa;
  rank?: number;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manhwa, rank }) => {
  return (
    <Link
      href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
      className="snap-center flex-none w-[130px] sm:w-[145px] md:w-[160px] lg:w-[180px] flex flex-col gap-2 sm:gap-3 group cursor-pointer"
    >
      <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl bg-gray-900 border border-white/5 group-hover:border-blue-500/30 transition-colors">
        <ImageWithFallback
          src={manhwa.image}
          alt={manhwa.title}
          fill
          sizes="(max-width: 640px) 160px, 180px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Rank Badge */}
        {rank && rank <= 3 && (
          <div
            className={`absolute top-0 left-0 backdrop-blur-md rounded-br-2xl border-r border-b border-white/10 px-3 py-1.5 ${rank === 1 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}
          >
            <span className="font-black text-lg drop-shadow-md">#{rank}</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          {/* Only show rating if it exists and is not null/undefined, otherwise show chapter */}
          {manhwa.rating != null && manhwa.rating !== 'N/A' ? (
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold mb-1">
              <Star size={12} fill="currentColor" />
              {typeof manhwa.rating === 'number'
                ? manhwa.rating.toFixed(1)
                : manhwa.rating}
            </div>
          ) : manhwa.latestChapter && manhwa.latestChapter !== 'Unknown' ? (
            <div className="text-blue-400 text-xs font-bold mb-1 truncate">
              {manhwa.latestChapter}
            </div>
          ) : null}
        </div>
      </div>
      <div>
        <h3 className="text-gray-100 font-semibold sm:font-bold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
          {manhwa.title}
        </h3>
        <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium truncate">
          {manhwa.genres?.[0] ||
            (manhwa.latestChapter && manhwa.latestChapter !== 'Unknown'
              ? manhwa.latestChapter
              : null)}
          {manhwa.status && manhwa.status !== 'Unknown' && <> • {manhwa.status}</>}
        </p>
      </div>
    </Link>
  );
};
