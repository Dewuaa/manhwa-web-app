'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  TrendingUp,
  BookOpen,
  Clock,
  Star,
  Target,
  Flame,
  Zap,
  Crown,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  calculateReadingStats,
  checkAndAwardBadges,
  getAllBadges,
  getEarnedBadges,
  ReadingStats,
  Badge,
} from '@/lib/socialService';

/**
 * Displays reading statistics in a card format
 */
export function StatsCard() {
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    const s = calculateReadingStats();
    setStats(s);
  }, []);

  if (!stats || stats.totalManhwaRead === 0) {
    return null;
  }

  const statItems = [
    {
      icon: BookOpen,
      label: 'Manhwa Read',
      value: stats.totalManhwaRead,
      color: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'Chapters Read',
      value: stats.totalChaptersRead,
      color: 'text-green-400',
    },
    {
      icon: Star,
      label: 'Top Genre',
      value: stats.favoriteGenres[0] || 'N/A',
      color: 'text-yellow-400',
    },
    {
      icon: Flame,
      label: 'Completed',
      value: `${stats.completedSeries} series`,
      color: 'text-orange-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Reading Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-3 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <p className="text-lg font-bold text-white truncate">{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar for Genre Distribution */}
      {stats.favoriteGenres.length > 1 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-2">Top Genres</p>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteGenres.slice(0, 5).map((genre, i) => (
              <span
                key={genre}
                className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-300 border border-white/10"
                style={{
                  opacity: 1 - i * 0.15,
                }}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Mini stats row for compact display
 */
export function MiniStats() {
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    setStats(calculateReadingStats());
  }, []);

  if (!stats || stats.totalManhwaRead === 0) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-gray-400">
      <span className="flex items-center gap-1">
        <BookOpen size={14} className="text-blue-400" />
        {stats.totalManhwaRead} titles
      </span>
      <span className="flex items-center gap-1">
        <TrendingUp size={14} className="text-green-400" />
        {stats.totalChaptersRead} chapters
      </span>
      {stats.completedSeries > 0 && (
        <span className="flex items-center gap-1">
          <Flame size={14} className="text-orange-400" />
          {stats.completedSeries} completed
        </span>
      )}
    </div>
  );
}

/**
 * Badge icon component
 */
const BadgeIcon = ({ icon, className = '' }: { icon: string; className?: string }) => {
  const iconMap: Record<string, typeof Trophy> = {
    '📖': BookOpen,
    '📚': BookOpen,
    '🎯': Target,
    '⭐': Star,
    '🌟': Sparkles,
    '✨': Sparkles,
    '🏆': Trophy,
    '🦉': Clock, // Night owl
    '⚡': Zap, // Speed reader
    '👑': Crown,
    '🎖️': Award,
  };

  const IconComponent = iconMap[icon] || Award;
  return <IconComponent className={className} />;
};

/**
 * Displays earned badges with unlocked visual
 */
export function BadgesDisplay() {
  const [badges, setBadges] = useState<{
    all: Badge[];
    earned: Badge[];
  }>({ all: [], earned: [] });

  useEffect(() => {
    // Check for new badges first
    checkAndAwardBadges();

    setBadges({
      all: getAllBadges(),
      earned: getEarnedBadges(),
    });
  }, []);

  const earnedIds = useMemo(
    () => new Set(badges.earned.map((b) => b.id)),
    [badges.earned],
  );

  if (badges.all.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Achievements</h3>
        </div>
        <span className="text-sm text-gray-400">
          {badges.earned.length}/{badges.all.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {badges.all.map((badge, index) => {
          const isEarned = earnedIds.has(badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-2xl
                  border transition-all duration-300
                  ${
                    isEarned
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                      : 'bg-white/5 border-white/5 opacity-40 grayscale'
                  }
                `}
              >
                <BadgeIcon
                  icon={badge.icon}
                  className={`w-6 h-6 ${isEarned ? 'text-yellow-400' : 'text-gray-500'}`}
                />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <p className="text-sm font-medium text-white">{badge.name}</p>
                <p className="text-xs text-gray-400">{badge.description}</p>
                {isEarned && badge.earnedAt && !isNaN(new Date(badge.earnedAt).getTime()) && (
                  <p className="text-xs text-yellow-400 mt-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recently earned */}
      {badges.earned.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-2">Recently Earned</p>
          <div className="flex flex-wrap gap-2">
            {badges.earned.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
              >
                <BadgeIcon icon={badge.icon} className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-200">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Combined profile stats section
 */
export function ProfileStats() {
  return (
    <div className="space-y-4">
      <StatsCard />
      <BadgesDisplay />
    </div>
  );
}
