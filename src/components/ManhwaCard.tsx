import Link from 'next/link';
import Image from 'next/image';
import { Manhwa } from '@/lib/types';
import { BookOpen, Star } from 'lucide-react';

interface ManhwaCardProps {
  manhwa: Manhwa;
  showNewBadge?: boolean;
}

const ManhwaCard = ({ manhwa, showNewBadge }: ManhwaCardProps) => {
  return (
    <Link href={`/manhwa/${encodeURIComponent(manhwa.id)}`} className="group relative block w-full">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-card border border-white/5 shadow-lg transition-all duration-300 group-hover:shadow-primary/20 group-hover:border-primary/30 group-hover:-translate-y-1">
        {/* Image */}
        {manhwa.image ? (
          <Image
            src={manhwa.image}
            alt={manhwa.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
            <BookOpen className="h-12 w-12 opacity-20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {showNewBadge && (
            <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg shadow-primary/20">
              New
            </span>
          )}
          {manhwa.rating && (
            <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md text-yellow-400 text-[10px] font-bold rounded-md flex items-center border border-white/10">
              <Star className="w-3 h-3 mr-0.5 fill-yellow-400" />
              {manhwa.rating}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight mb-1.5 group-hover:text-primary transition-colors">
            {manhwa.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-300">
            {manhwa.latestChapter && (
              <span className="flex items-center font-medium text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded">
                <BookOpen className="w-3 h-3 mr-1" />
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
