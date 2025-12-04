'use client';

import { Manhwa } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { BookOpen, Heart, Sparkles } from 'lucide-react';
import { isBookmarked } from '@/lib/storage';

import { motion } from 'framer-motion';

interface ManhwaCardProps {
  manhwa: Manhwa;
  showNewBadge?: boolean; // Show "New Chapter" badge
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

export default function ManhwaCard({ manhwa, showNewBadge = false }: ManhwaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookmarked(isBookmarked(manhwa.id));
  }, [manhwa.id]);

  return (
    <motion.div 
      className="group"
      variants={itemVariants}
    >
      {/* Image Container */}
      <Link href={`/manhwa/${encodeURIComponent(manhwa.id)}`}>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:-translate-y-1 hover:ring-red-500/50">
          {!imageError && manhwa.image ? (
            <Image
              src={manhwa.image}
              alt={manhwa.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
              <div className="text-center p-4">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500 line-clamp-2 font-medium">{manhwa.title}</p>
              </div>
            </div>
          )}

          {/* Bookmarked Badge */}
          {bookmarked && (
            <div className="absolute top-2 right-2 z-10">
              <div className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-red-500 ring-1 ring-white/10">
                <Heart className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          )}

          {/* Status badge - only show if not Unknown */}
          {manhwa.status && manhwa.status !== 'Unknown' && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white shadow-lg shadow-red-500/30">
                {manhwa.status}
              </span>
            </div>
          )}

          {/* New Chapter Badge */}
          {showNewBadge && (
            <div className="absolute bottom-2 left-2 z-10">
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-green-500/50 animate-pulse">
                <Sparkles className="w-3 h-3" />
                New
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Title */}
      <Link href={`/manhwa/${encodeURIComponent(manhwa.id)}`}>
        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight mt-3 group-hover:text-red-400 transition-colors">
          {manhwa.title}
        </h3>
      </Link>

      {/* Latest Chapters */}
      <div className="mt-2 space-y-1">
        {manhwa.latestChapters && manhwa.latestChapters.length > 0 ? (
          manhwa.latestChapters.slice(0, 2).map((chapter, index) => (
            <Link 
              key={index}
              href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
              className="block text-xs text-red-400 font-semibold hover:text-red-300 truncate transition-colors"
            >
              {chapter.title}
            </Link>
          ))
        ) : manhwa.latestChapter ? (
          <Link 
            href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
            className="block text-xs text-red-400 font-semibold hover:text-red-300 truncate transition-colors"
          >
            {manhwa.latestChapter}
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
