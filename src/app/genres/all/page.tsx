'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Tag,
  Swords,
  Sparkles,
  Heart,
  Flame,
  Ghost,
  Cpu,
  BookOpen,
  Compass,
  Smile,
  Theater,
  Skull,
  Zap,
  Trophy,
  Moon,
  HelpCircle,
  HeartCrack,
} from 'lucide-react';
import { useGenres } from '@/hooks/useApi';
import { AtmosphericBackground } from '@/components/zenith/AtmosphericBackground';

// Genre icons mapping
const GENRE_ICONS: Record<string, React.ElementType> = {
  action: Swords,
  adventure: Compass,
  comedy: Smile,
  drama: Theater,
  fantasy: Sparkles,
  horror: Ghost,
  isekai: Zap,
  'martial-arts': Flame,
  mystery: HelpCircle,
  romance: Heart,
  'sci-fi': Cpu,
  'slice-of-life': BookOpen,
  sports: Trophy,
  supernatural: Moon,
  thriller: Skull,
  tragedy: HeartCrack,
};

const GRADIENT_COLORS = [
  'from-red-500 to-orange-500',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-green-500',
  'from-indigo-500 to-purple-500',
  'from-gray-700 to-gray-900',
  'from-amber-500 to-yellow-500',
  'from-violet-500 to-fuchsia-500',
  'from-teal-500 to-cyan-500',
  'from-rose-500 to-pink-500',
  'from-sky-500 to-blue-500',
  'from-lime-500 to-green-500',
  'from-orange-500 to-red-500',
  'from-purple-500 to-indigo-500',
  'from-cyan-500 to-teal-500',
  'from-fuchsia-500 to-pink-500',
];

export default function AllGenresPage() {
  // Use cached genres hook
  const { data: genresData, isLoading: loading } = useGenres();

  // Add color gradient and icons to each genre
  const genres = useMemo(() => {
    if (!genresData) return [];
    return genresData.map((genre, index) => ({
      ...genre,
      color: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
      icon: GENRE_ICONS[genre.slug] || Sparkles,
    }));
  }, [genresData]);

  return (
    <>
      <AtmosphericBackground />
      <div className="min-h-screen pb-32 animate-in fade-in duration-500">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 p-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              href="/genres"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back to Discover</span>
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              All Genres
            </h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : genres.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No genres available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {genres.map((genre) => {
                const IconComponent = genre.icon;
                return (
                  <Link
                    key={genre.slug}
                    href={`/genres/${genre.slug}`}
                    className="relative h-28 rounded-2xl overflow-hidden group hover:scale-105 transition-transform duration-300 block"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <IconComponent
                        size={32}
                        className="mb-2 drop-shadow-md transform group-hover:-translate-y-1 transition-transform text-white"
                        strokeWidth={2}
                      />
                      <span className="text-white font-bold text-sm drop-shadow-md tracking-wide text-center">
                        {genre.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
