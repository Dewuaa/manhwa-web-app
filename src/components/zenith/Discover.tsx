'use client';

import React from 'react';
import {
  Search,
  Crown,
  Star,
  ChevronRight,
  Swords,
  Sparkles,
  Heart,
  Flame,
  Cpu,
  Ghost,
} from 'lucide-react';
import Link from 'next/link';
import { Manhwa } from '@/lib/types';
import ImageWithFallback from '../ImageWithFallback';

interface DiscoverProps {
  topManhwa: Manhwa[];
  loading?: boolean;
}

export const Discover: React.FC<DiscoverProps> = ({ topManhwa = [], loading }) => {
  const genres = [
    { name: 'Action', color: 'from-red-500 to-orange-500', icon: Swords, slug: 'action' },
    {
      name: 'Fantasy',
      color: 'from-blue-500 to-cyan-500',
      icon: Sparkles,
      slug: 'fantasy',
    },
    { name: 'Romance', color: 'from-pink-500 to-rose-500', icon: Heart, slug: 'romance' },
    {
      name: 'Murim',
      color: 'from-emerald-500 to-green-500',
      icon: Flame,
      slug: 'martial-arts',
    },
    { name: 'System', color: 'from-indigo-500 to-purple-500', icon: Cpu, slug: 'isekai' },
    { name: 'Horror', color: 'from-gray-700 to-black', icon: Ghost, slug: 'horror' },
  ];

  const collections = [
    {
      id: 'leveling',
      title: 'Zero to Hero: Leveling Up',
      subtitle: 'COLLECTION',
      gradient: 'from-blue-900/80 via-blue-900/40',
      color: 'blue',
    },
    {
      id: 'villainess',
      title: 'Villainess Returns',
      subtitle: 'STAFF PICKS',
      gradient: 'from-purple-900/80 via-purple-900/40',
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 p-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black text-white tracking-tight">Discover</h1>
          <Link
            href="/search"
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
          >
            <Search size={20} />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
        {/* Genre Grid */}
        <section>
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-xl font-bold text-white">Browse by Genre</h2>
            <Link
              href="/genres/all"
              className="text-xs text-blue-400 font-bold flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {genres.map((genre) => {
              const IconComponent = genre.icon;
              return (
                <Link
                  key={genre.name}
                  href={`/genres/${genre.slug}`}
                  className="relative h-24 rounded-2xl overflow-hidden group hover:scale-105 transition-transform duration-300 block"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <IconComponent
                      size={28}
                      className="mb-1 drop-shadow-md transform group-hover:-translate-y-1 transition-transform text-white"
                      strokeWidth={2.5}
                    />
                    <span className="text-white font-bold text-sm drop-shadow-md tracking-wide">
                      {genre.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Weekly Top 10 */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Crown size={20} className="text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-bold text-white">Weekly Top 10</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : topManhwa.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400">No top manhwa available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topManhwa.slice(0, 9).map((manga, index) => (
                <Link
                  key={manga.id}
                  href={`/manhwa/${encodeURIComponent(manga.id)}`}
                  className="flex gap-4 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 cursor-pointer group"
                >
                  <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden shadow-lg">
                    <ImageWithFallback
                      src={manga.image}
                      alt={manga.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    <div
                      className={`absolute top-0 left-0 w-6 h-6 flex items-center justify-center rounded-br-lg font-black text-xs ${
                        index === 0
                          ? 'bg-amber-500 text-black'
                          : index === 1
                            ? 'bg-gray-300 text-black'
                            : index === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-black/60 text-white backdrop-blur-sm'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 py-1 flex flex-col min-w-0">
                    <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-blue-400 transition-colors mb-1">
                      {manga.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-2 truncate">
                      {manga.latestChapter || 'Latest chapter'}
                    </p>
                    <div className="mt-auto flex items-center gap-3 text-xs font-medium text-gray-500">
                      {manga.rating && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star size={10} fill="currentColor" /> {manga.rating}
                        </span>
                      )}
                      {manga.rating && manga.status && manga.status !== 'Unknown' && (
                        <span>•</span>
                      )}
                      {manga.status && manga.status !== 'Unknown' && (
                        <span>{manga.status}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Curated Lists */}
        <section>
          <h2 className="text-xl font-bold text-white mb-5">Curated for You</h2>
          <div className="space-y-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="relative h-48 rounded-3xl overflow-hidden cursor-pointer group bg-gradient-to-br from-gray-800 to-gray-900"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                </div>

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${collection.gradient} to-transparent`}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8">
                  <span
                    className={`text-${collection.color}-400 font-bold text-xs uppercase tracking-widest mb-2`}
                  >
                    {collection.subtitle}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white max-w-xs leading-tight mb-4">
                    {collection.title}
                  </h3>
                  <div className="flex items-center text-white text-sm font-bold gap-2 group-hover:gap-3 transition-all">
                    Explore Collection{' '}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
