'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { useGenres } from '@/hooks/useApi';

const GRADIENT_COLORS = [
  'from-red-500 to-orange-500',
  'from-orange-500 to-amber-500',
  'from-amber-500 to-yellow-500',
  'from-yellow-500 to-lime-500',
  'from-lime-500 to-green-500',
  'from-green-500 to-emerald-500',
  'from-emerald-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-sky-500',
  'from-sky-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-indigo-500 to-violet-500',
  'from-violet-500 to-purple-500',
  'from-purple-500 to-fuchsia-500',
  'from-fuchsia-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-rose-500 to-red-500',
];

export default function AllGenresPage() {
  // Use cached genres hook
  const { data: genresData, isLoading: loading } = useGenres();

  // Add color gradient to each genre
  const genres = useMemo(() => {
    if (!genresData) return [];
    return genresData.map((genre, index) => ({
      ...genre,
      color: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
    }));
  }, [genresData]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/genres"
              className="hidden md:inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Discover
            </Link>

            <h1 className="text-xl font-bold text-white flex items-center">
              <Tag className="w-5 h-5 mr-2 text-red-500" />
              All Genres{' '}
              {loading && (
                <span className="text-sm text-gray-500 ml-2">(Loading...)</span>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {genres.map((genre) => (
              <Link
                key={genre.slug}
                href={`/genres/${genre.slug}`}
                className="group relative overflow-hidden rounded-xl aspect-square flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all hover:-translate-y-1 ring-1 ring-white/10 hover:ring-white/30"
              >
                <div
                  className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-gradient-to-br ${genre.color}`}
                />
                <div className="relative z-10 text-center p-4">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/50 group-hover:text-white transition-colors" />
                  <h3 className="text-white font-bold text-lg group-hover:scale-110 transition-transform">
                    {genre.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
