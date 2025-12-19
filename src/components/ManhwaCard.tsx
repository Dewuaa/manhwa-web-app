import Link from 'next/link';
import { Manhwa } from '@/lib/types';
import { BookOpen, Star, Eye, TrendingUp } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface ManhwaCardProps {
  manhwa: Manhwa;
  showNewBadge?: boolean;
  rank?: number;
}

const ManhwaCard = ({ manhwa, showNewBadge, rank }: ManhwaCardProps) => {
  return (
    <Link
      href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
      className="group relative block w-full h-full"
    >
      <div className="relative aspect-[3/4.5] overflow-hidden rounded-2xl bg-card border border-white/5 shadow-lg transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:border-primary/30 group-hover:-translate-y-2">
        {/* Image */}
        {manhwa.image ? (
          <ImageWithFallback
            src={manhwa.image}
            alt={manhwa.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
            <BookOpen className="h-12 w-12 opacity-20" />
          </div>
        )}

        {/* Gradient Overlay - Stronger at bottom for text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

        {/* Hover Overlay - Primary Tint */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {rank && (
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/90 backdrop-blur-md text-white font-black text-sm shadow-lg ring-1 ring-white/20">
              #{rank}
            </div>
          )}
          {showNewBadge && (
            <span className="px-2.5 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-primary/20 animate-pulse">
              New
            </span>
          )}
          {manhwa.isTrending && (
            <span className="px-2 py-1 bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center border border-white/10 shadow-lg">
              <TrendingUp className="w-3 h-3 mr-1" />
              Hot
            </span>
          )}
        </div>

        {/* Badges - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {manhwa.rating && (
            <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-yellow-400 text-[10px] font-bold rounded-lg flex items-center border border-white/10 shadow-lg">
              <Star className="w-3 h-3 mr-1 fill-yellow-400" />
              {manhwa.rating}
            </span>
          )}
          {manhwa.viewsFormatted && (
            <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-blue-400 text-[10px] font-bold rounded-lg flex items-center border border-white/10 shadow-lg">
              <Eye className="w-3 h-3 mr-1" />
              {manhwa.viewsFormatted}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors drop-shadow-md">
            {manhwa.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-gray-300">
            {manhwa.latestChapter && (
              <span className="flex items-center font-medium text-white/90 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                <BookOpen className="w-3 h-3 mr-1.5 text-primary" />
                {manhwa.latestChapter.replace('Chapter', 'Ch.')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ManhwaCard;
