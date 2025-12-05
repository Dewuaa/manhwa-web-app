'use client';

import { useState, useEffect } from 'react';
import { manhwaAPI } from '@/lib/api';
import { Provider, Manhwa } from '@/lib/types';
import {
  Flame,
  Swords,
  Heart,
  Sparkles,
  Laugh,
  Star,
  CheckCircle,
  Search,
  Bell,
  Frown,
  Zap,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/zenith/Hero';
import { CategoryRow } from '@/components/zenith/CategoryRow';
import { AtmosphericBackground } from '@/components/zenith/AtmosphericBackground';
import { SectionHeader } from '@/components/zenith/SectionHeader';
import ContinueReading from '@/components/ContinueReading';
import { FreshUpdates } from '@/components/zenith/FreshUpdates';

const CATEGORIES = [
  'Popular',
  'New',
  'Action',
  'Romance',
  'Fantasy',
  'Comedy',
  'Completed',
];

export default function Home() {
  const router = useRouter();
  const [provider] = useState<Provider>(Provider.MANHUAPLUS);
  const [activeCategory, setActiveCategory] = useState('Popular');

  // State for each section
  const [heroManhwa, setHeroManhwa] = useState<Manhwa[]>([]);
  const [trendingManhwa, setTrendingManhwa] = useState<Manhwa[]>([]);
  const [freshUpdatesManhwa, setFreshUpdatesManhwa] = useState<Manhwa[]>([]);
  const [actionManhwa, setActionManhwa] = useState<Manhwa[]>([]);
  const [romanceManhwa, setRomanceManhwa] = useState<Manhwa[]>([]);
  const [fantasyManhwa, setFantasyManhwa] = useState<Manhwa[]>([]);
  const [comedyManhwa, setComedyManhwa] = useState<Manhwa[]>([]);
  const [topRatedManhwa, setTopRatedManhwa] = useState<Manhwa[]>([]);
  const [completedManhwa, setCompletedManhwa] = useState<Manhwa[]>([]);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    hero: true,
    trending: true,
    freshUpdates: true,
    action: true,
    romance: true,
    fantasy: true,
    comedy: true,
    topRated: true,
    completed: true,
  });

  useEffect(() => {
    loadAllSections();
  }, [provider]);

  const loadAllSections = async () => {
    manhwaAPI.setProvider(provider);

    // Load all sections in parallel with different data sources
    Promise.all([
      loadHeroSection(),
      loadTrendingSection(),
      loadFreshUpdatesSection(),
      loadGenreSectionWithSearch('martial arts', setActionManhwa, 'action'),
      loadRomanceSection(),
      loadFantasySection(),
      loadGenreSectionWithSearch('comedy', setComedyManhwa, 'comedy'),
      loadTopRatedSection(),
      loadCompletedSection(),
    ]);
  };

  const loadHeroSection = async () => {
    try {
      const popularQueries = ['solo leveling', 'return', 'reincarnation', 'system'];
      const randomQuery =
        popularQueries[Math.floor(Math.random() * popularQueries.length)];
      const result = await manhwaAPI.search(randomQuery);
      setHeroManhwa(result.results.slice(0, 8));
    } catch (err) {
      console.error('Failed to load hero:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, hero: false }));
    }
  };

  const loadTrendingSection = async () => {
    try {
      // Get trending manhwa by combining results from multiple popular search terms
      const popularTerms = ['revenge', 'reincarnation', 'dungeon', 'system', 'martial'];
      const allResults: Manhwa[] = [];

      // Fetch from multiple search terms in parallel
      const searchPromises = popularTerms.map((term) =>
        manhwaAPI.search(term, 1).catch(() => ({ results: [] })),
      );

      const responses = await Promise.all(searchPromises);

      // Combine all results
      responses.forEach((response) => {
        if (response.results) {
          allResults.push(...response.results);
        }
      });

      // Remove duplicates by id and shuffle
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );

      // Shuffle the results for variety
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);

      setTrendingManhwa(shuffled.slice(0, 15));
    } catch (err) {
      console.error('Failed to load trending:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, trending: false }));
    }
  };

  const loadFreshUpdatesSection = async () => {
    try {
      // Get actual latest/new releases from the scraper
      const result = await manhwaAPI.getLatestManhwa(1);
      setFreshUpdatesManhwa(result.results.slice(0, 12));
    } catch (err) {
      console.error('Failed to load fresh updates:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, freshUpdates: false }));
    }
  };

  // Use search with specific terms for each genre to get different results
  const loadGenreSectionWithSearch = async (
    searchTerm: string,
    setter: React.Dispatch<React.SetStateAction<Manhwa[]>>,
    loadingKey: string,
  ) => {
    try {
      const result = await manhwaAPI.search(searchTerm, 1);
      setter(result.results.slice(0, 15));
    } catch (err) {
      console.error(`Failed to load ${searchTerm}:`, err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const loadFantasySection = async () => {
    try {
      // Get fantasy manhwa by combining results from multiple fantasy-related terms
      const fantasyTerms = [
        'fantasy',
        'magic',
        'dragon',
        'isekai',
        'mage',
        'sword',
        'hero',
      ];
      const allResults: Manhwa[] = [];

      // Fetch from multiple search terms in parallel
      const searchPromises = fantasyTerms.map((term) =>
        manhwaAPI.search(term, 1).catch(() => ({ results: [] })),
      );

      const responses = await Promise.all(searchPromises);

      // Combine all results
      responses.forEach((response) => {
        if (response.results) {
          allResults.push(...response.results);
        }
      });

      // Remove duplicates by id and shuffle
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );

      // Shuffle the results for variety
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);

      setFantasyManhwa(shuffled.slice(0, 15));
    } catch (err) {
      console.error('Failed to load fantasy:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, fantasy: false }));
    }
  };

  const loadRomanceSection = async () => {
    try {
      // Get romance manhwa by combining results from multiple romance-related terms
      const romanceTerms = [
        'romance',
        'love',
        'marriage',
        'empress',
        'princess',
        'duke',
        'villainess',
      ];
      const allResults: Manhwa[] = [];

      // Fetch from multiple search terms in parallel
      const searchPromises = romanceTerms.map((term) =>
        manhwaAPI.search(term, 1).catch(() => ({ results: [] })),
      );

      const responses = await Promise.all(searchPromises);

      // Combine all results
      responses.forEach((response) => {
        if (response.results) {
          allResults.push(...response.results);
        }
      });

      // Remove duplicates by id and shuffle
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );

      // Shuffle the results for variety
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);

      setRomanceManhwa(shuffled.slice(0, 15));
    } catch (err) {
      console.error('Failed to load romance:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, romance: false }));
    }
  };

  const loadTopRatedSection = async () => {
    try {
      // Use search with popular terms as proxy for "top rated"
      const result = await manhwaAPI.search('murim');
      setTopRatedManhwa(result.results.slice(0, 15));
    } catch (err) {
      console.error('Failed to load top rated:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, topRated: false }));
    }
  };

  const loadCompletedSection = async () => {
    try {
      const result = await manhwaAPI.advancedSearch({
        status: 'completed',
        page: 1,
      });
      setCompletedManhwa(result.results.slice(0, 15));
    } catch (err) {
      console.error('Failed to load completed:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, completed: false }));
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <AtmosphericBackground />

      {/* Home Header */}
      <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center px-4 h-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            {/* Logo visible only on mobile, moved to sidebar on desktop */}
            <div className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <span className="text-white font-black text-lg leading-none">墨</span>
            </div>
            <div className="flex flex-col md:hidden">
              <span className="text-white font-bold tracking-tight text-lg leading-none">
                Inkora
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                Manga & Manhwa
              </span>
            </div>

            {/* Desktop Welcome Message */}
            <div className="hidden md:flex flex-col">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Welcome Back
              </span>
              <span className="text-white font-bold text-lg">Traveler</span>
            </div>
          </div>

          {/* Desktop Categories (Center) */}
          <div className="hidden md:flex gap-2">
            {CATEGORIES.slice(0, 5).map((cat, i) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${
                  activeCategory === cat
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Link
              href="/search"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <Search size={20} />
            </Link>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/5 relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
            </button>
          </div>
        </div>

        {/* Categories Scroll (Mobile Only) */}
        <div className="md:hidden overflow-x-auto hide-scrollbar flex gap-2.5 px-4 pb-3 pt-1">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${
                activeCategory === cat
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Hero Section - Always visible or filtered? Keep it visible but maybe filtered. 
            For now, let's keep it static or random as per current implementation. 
        */}
        {!loadingStates.hero && heroManhwa.length > 0 && (
          <Hero featuredManga={heroManhwa} />
        )}

        {/* Continue Reading - Only on Popular/Home */}
        {activeCategory === 'Popular' && <ContinueReading />}

        {/* Dynamic Content Area */}
        {(() => {
          // Determine which data to show based on activeCategory
          let currentList: Manhwa[] = [];
          let loading = false;
          let title = '';
          let icon = null;

          switch (activeCategory) {
            case 'Popular':
              currentList = trendingManhwa;
              loading = loadingStates.trending;
              title = 'Trending Now';
              icon = <Flame className="w-6 h-6 text-orange-500" />;
              break;
            case 'New':
              // Use fresh updates (page 2 of latest) for New category
              currentList = freshUpdatesManhwa;
              loading = loadingStates.freshUpdates;
              title = 'Latest Releases';
              icon = <Clock className="w-6 h-6 text-blue-400" />;
              break;
            case 'Action':
              currentList = actionManhwa;
              loading = loadingStates.action;
              title = 'Top Action';
              icon = <Swords className="w-6 h-6 text-red-500" />;
              break;
            case 'Romance':
              currentList = romanceManhwa;
              loading = loadingStates.romance;
              title = 'Top Romance';
              icon = <Heart className="w-6 h-6 text-pink-500" />;
              break;
            case 'Fantasy':
              currentList = fantasyManhwa;
              loading = loadingStates.fantasy;
              title = 'Top Fantasy';
              icon = <Sparkles className="w-6 h-6 text-purple-500" />;
              break;
            case 'Comedy':
              currentList = comedyManhwa;
              loading = loadingStates.comedy;
              title = 'Top Comedy';
              icon = <Laugh className="w-6 h-6 text-yellow-500" />;
              break;
            case 'Completed':
              currentList = completedManhwa;
              loading = loadingStates.completed;
              title = 'Completed Series';
              icon = <CheckCircle className="w-6 h-6 text-green-500" />;
              break;
            default:
              currentList = trendingManhwa;
              loading = loadingStates.trending;
              title = `Top ${activeCategory}`;
              icon = <Flame className="w-6 h-6 text-orange-500" />;
          }

          return (
            <>
              {/* Main Grid Section */}
              <CategoryRow
                title={title}
                icon={icon}
                manhwaList={currentList}
                viewAllLink={`/genres/${activeCategory.toLowerCase()}`}
                loading={loading}
                layout="scroll"
              />

              {/* Fresh Updates Section - Using latest manhwa updates */}
              <FreshUpdates
                manhwaList={freshUpdatesManhwa}
                loading={loadingStates.freshUpdates}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}
