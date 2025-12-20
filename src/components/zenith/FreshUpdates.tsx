import React from 'react';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { Manhwa } from '@/lib/types';
import { SectionHeader } from './SectionHeader';
import ImageWithFallback from '../ImageWithFallback';

interface FreshUpdatesProps {
  manhwaList: Manhwa[];
  loading?: boolean;
}

export const FreshUpdates: React.FC<FreshUpdatesProps> = ({ manhwaList, loading }) => {
  if (loading) {
    return (
      <section className="mt-4 px-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (manhwaList.length === 0) return null;

  // Duplicate list to make it look fuller if small results
  const displayList = manhwaList.length < 3 ? manhwaList : manhwaList.slice(0, 9);

  return (
    <section className="mt-4 px-4 pb-8">
      <SectionHeader
        title="Fresh Updates"
        icon={<Zap size={18} className="text-blue-500" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {displayList.map((manga, i) => (
          <Link
            key={`${manga.id}-${i}`}
            href={`/manhwa/${encodeURIComponent(manga.id)}`}
            className="flex gap-3 sm:gap-4 bg-gray-900/40 border border-white/5 p-2 sm:p-2.5 rounded-xl hover:bg-gray-800/80 hover:border-white/10 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 relative">
              <ImageWithFallback
                src={manga.image}
                alt={manga.title}
                fill
                sizes="64px"
                className="object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex-1 py-0.5 sm:py-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-gray-200 font-semibold sm:font-bold text-xs sm:text-sm truncate group-hover:text-blue-400 transition-colors">
                  {manga.title}
                </h4>
                <span className="text-[9px] sm:text-[10px] text-gray-500 whitespace-nowrap bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                  {manga.latestChapters?.[0]?.releaseDate || 'Today'}
                </span>
              </div>
              <p className="text-blue-400 text-[11px] sm:text-xs font-medium mt-0.5 sm:mt-1">
                {manga.latestChapter && manga.latestChapter !== 'Unknown'
                  ? manga.latestChapter
                  : 'New Update'}
              </p>
              {/* Tags are not available in list view usually, so we might skip or use status */}
              {manga.status && manga.status !== 'Unknown' && (
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    {manga.status}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
