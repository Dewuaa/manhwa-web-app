import React from 'react';
import { ManhwaLink } from '../ManhwaLink';
import { Manhwa } from '@/lib/types';
import ImageWithFallback from '../ImageWithFallback';

interface MangaCardProps {
  manhwa: Manhwa;
  rank?: number;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manhwa, rank }) => {
  return (
    <ManhwaLink
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


        {/* Chapter number at bottom - like Comix.to */}
        <div className="absolute bottom-3 left-3 right-3">
          {manhwa.latestChapter && manhwa.latestChapter !== 'Unknown' ? (
            <div className="text-blue-400 text-xs font-bold mb-1 truncate drop-shadow-md">
              {typeof manhwa.latestChapter === 'number' 
                ? `Ch. ${manhwa.latestChapter}`
                : String(manhwa.latestChapter).replace('Chapter', 'Ch.')}
            </div>
          ) : null}
        </div>
      </div>
      <div className="px-0.5">
        <h3 className="text-gray-100 font-semibold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
          {manhwa.title}
        </h3>
        {manhwa.status && manhwa.status !== 'Unknown' && (
          <p className="text-gray-500 text-[10px] mt-0.5 font-medium capitalize">
            {manhwa.status.replace('_', ' ')}
          </p>
        )}
      </div>
    </ManhwaLink>
  );
};
