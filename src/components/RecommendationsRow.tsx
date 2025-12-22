'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ManhwaLink } from './ManhwaLink';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Manhwa } from '@/lib/types';
import {
  RecommendedManhwa,
  generateRecommendations,
  getQuickRecommendations,
} from '@/lib/recommendationService';
import ImageWithFallback from './ImageWithFallback';

interface RecommendationsRowProps {
  availableManhwa: Manhwa[];
  title?: string;
  showReason?: boolean;
}

export function RecommendationsRow({
  availableManhwa,
  title = 'For You',
  showReason = true,
}: RecommendationsRowProps) {
  const [recommendations, setRecommendations] = useState<RecommendedManhwa[]>([]);
  const [basedOn, setBasedOn] = useState<string | null>(null);
  const [displayTitle, setDisplayTitle] = useState(title);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // Use the quick recommendations function that handles history internally
    const { manhwa: recs, topGenre } = getQuickRecommendations(availableManhwa, 10);

    // Only show if there are real personalized recommendations
    if (recs.length > 0) {
      setRecommendations(recs);
      setHasHistory(true);
      setDisplayTitle(title);

      // Get the most common "based on" title
      const basedOnCounts: Record<string, number> = {};
      recs.forEach((rec) => {
        if (rec.reason.basedOn) {
          basedOnCounts[rec.reason.basedOn] =
            (basedOnCounts[rec.reason.basedOn] || 0) + 1;
        }
      });

      const topBasedOn = Object.entries(basedOnCounts).sort(([, a], [, b]) => b - a)[0];
      if (topBasedOn) {
        setBasedOn(topBasedOn[0]);
      }
    } else {
      // No reading history - don't show anything
      setRecommendations([]);
      setHasHistory(false);
    }
  }, [availableManhwa, title]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">{displayTitle}</h2>
            {basedOn && (
              <p className="text-xs text-gray-400">
                Because you read &quot;{basedOn}&quot;
              </p>
            )}
          </div>
        </div>
        <Link
          href="/search?type=recommendations"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          See all
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Horizontal Scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 pb-2">
          {recommendations.map((manhwa, index) => (
            <motion.div
              key={manhwa.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[140px] md:w-[160px]"
            >
              <ManhwaLink
                href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
                className="group block"
              >
                {/* Cover */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 mb-2 shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/10 transition-all group-hover:-translate-y-1">
                  <ImageWithFallback
                    src={manhwa.image}
                    alt={manhwa.title}
                    fill
                    sizes="160px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Recommendation badge */}
                  {showReason && manhwa.reason && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white/90 font-medium line-clamp-2">
                        {manhwa.reason.message}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {manhwa.title}
                </h3>

                {/* Reason tag on mobile */}
                {showReason && manhwa.reason && (
                  <p className="text-[10px] text-purple-400 mt-1 line-clamp-1 md:hidden">
                    {manhwa.reason.genre
                      ? manhwa.reason.genre.charAt(0).toUpperCase() +
                        manhwa.reason.genre.slice(1)
                      : manhwa.reason.type === 'similar'
                        ? 'Similar read'
                        : 'For you'}
                  </p>
                )}
              </ManhwaLink>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Compact version for sidebar/widgets
 */
export function RecommendationsWidget({
  availableManhwa,
}: {
  availableManhwa: Manhwa[];
}) {
  const [recommendations, setRecommendations] = useState<RecommendedManhwa[]>([]);

  useEffect(() => {
    // Use the quick recommendations function that handles history internally
    const { manhwa: recs } = getQuickRecommendations(availableManhwa, 5);
    setRecommendations(recs);
  }, [availableManhwa]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-bold text-white">Recommended for You</h3>
      </div>

      <div className="space-y-3">
        {recommendations.slice(0, 5).map((manhwa) => (
          <ManhwaLink
            key={manhwa.id}
            href={`/manhwa/${encodeURIComponent(manhwa.id)}`}
            className="flex gap-3 group"
          >
            <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative">
              <ImageWithFallback
                src={manhwa.image}
                alt={manhwa.title}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                {manhwa.title}
              </p>
              <p className="text-xs text-gray-500 truncate">{manhwa.reason.message}</p>
            </div>
          </ManhwaLink>
        ))}
      </div>
    </div>
  );
}
