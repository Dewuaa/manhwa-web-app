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
  Frown,
  Zap,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/zenith/Hero';
import { CategoryRow } from '@/components/zenith/CategoryRow';
import { AtmosphericBackground } from '@/components/zenith/AtmosphericBackground';
import { SectionHeader } from '@/components/zenith/SectionHeader';
import ContinueReading from '@/components/ContinueReading';
import { FreshUpdates } from '@/components/zenith/FreshUpdates';
import { RecommendationsRow } from '@/components/RecommendationsRow';
import { NotificationBell } from '@/components/NotificationBell';
import { RecentDiscussions } from '@/components/RecentDiscussions';

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
  // Use Mgeko provider directly
  const [provider] = useState<Provider>(Provider.MGEKO);
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
      loadActionSection(),
      loadRomanceSection(),
      loadFantasySection(),
      loadComedySection(),
      loadTopRatedSection(),
      loadCompletedSection(),
    ]);
  };

  const loadHeroSection = async () => {
    try {
      // Get fresh latest updates for hero - more variety than searching specific titles
      const [page1, page2] = await Promise.all([
        manhwaAPI.getLatestManhwa(1),
        manhwaAPI.getLatestManhwa(2),
      ]);

      // Combine and deduplicate by ID AND title (to catch duplicates with different IDs)
      const allResults = [...page1.results, ...page2.results];
      const seen = new Set<string>();
      const uniqueResults = allResults.filter((item) => {
        const normalizedTitle = item.title.toLowerCase().trim();
        if (seen.has(item.id) || seen.has(normalizedTitle)) {
          return false;
        }
        seen.add(item.id);
        seen.add(normalizedTitle);
        return true;
      });

      // Shuffle and take top 8 for hero carousel
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
      setHeroManhwa(shuffled.slice(0, 8));
    } catch (err) {
      console.error('Failed to load hero:', err);
      // Fallback to latest
      try {
        const latest = await manhwaAPI.getLatestManhwa(1);
        setHeroManhwa(latest.results.slice(0, 8));
      } catch {}
    } finally {
      setLoadingStates((prev) => ({ ...prev, hero: false }));
    }
  };

  const loadTrendingSection = async () => {
    try {
      // Load multiple pages in parallel to get more content variety
      const [page1, page2, page3] = await Promise.all([
        manhwaAPI.getLatestManhwa(1),
        manhwaAPI.getLatestManhwa(2),
        manhwaAPI.getLatestManhwa(3),
      ]);

      // Combine all results
      const allResults = [...page1.results, ...page2.results, ...page3.results];

      // Remove duplicates and shuffle
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
      setTrendingManhwa(shuffled.slice(0, 20));
    } catch (err) {
      console.error('Failed to load trending:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, trending: false }));
    }
  };

  const loadFreshUpdatesSection = async () => {
    try {
      // Get multiple pages for more fresh updates
      const [page1, page2] = await Promise.all([
        manhwaAPI.getLatestManhwa(1),
        manhwaAPI.getLatestManhwa(2),
      ]);
      const allResults = [...page1.results, ...page2.results];
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );
      setFreshUpdatesManhwa(uniqueResults.slice(0, 18));
    } catch (err) {
      console.error('Failed to load fresh updates:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, freshUpdates: false }));
    }
  };

  const loadActionSection = async () => {
    try {
      // Search for action-related manhwa
      const actionTerms = ['dungeon', 'hunter', 'martial', 'battle'];
      const results = await Promise.all(
        actionTerms.map((term) => manhwaAPI.search(term).catch(() => ({ results: [] }))),
      );
      const allResults = results.flatMap((r) => r.results);
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
      setActionManhwa(shuffled.slice(0, 20));
    } catch (err) {
      console.error('Failed to load action:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, action: false }));
    }
  };

  const loadComedySection = async () => {
    try {
      // Search for comedy-related manhwa
      const comedyTerms = ['comedy', 'funny', 'gag'];
      const results = await Promise.all(
        comedyTerms.map((term) => manhwaAPI.search(term).catch(() => ({ results: [] }))),
      );
      const allResults = results.flatMap((r) => r.results);
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );
      // If no comedy results, fallback to latest
      if (uniqueResults.length === 0) {
        const latest = await manhwaAPI.getLatestManhwa(4);
        setComedyManhwa(latest.results.slice(0, 15));
      } else {
        const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
        setComedyManhwa(shuffled.slice(0, 20));
      }
    } catch (err) {
      console.error('Failed to load comedy:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, comedy: false }));
    }
  };

  const loadFantasySection = async () => {
    try {
      // Search for fantasy-related manhwa
      const fantasyTerms = ['magic', 'dragon', 'isekai', 'fantasy'];
      const results = await Promise.all(
        fantasyTerms.map((term) => manhwaAPI.search(term).catch(() => ({ results: [] }))),
      );
      const allResults = results.flatMap((r) => r.results);
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
      setFantasyManhwa(shuffled.slice(0, 20));
    } catch (err) {
      console.error('Failed to load fantasy:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, fantasy: false }));
    }
  };

  const loadRomanceSection = async () => {
    try {
      // Search for romance-related manhwa
      const romanceTerms = ['romance', 'love', 'marriage', 'dating'];
      const results = await Promise.all(
        romanceTerms.map((term) => manhwaAPI.search(term).catch(() => ({ results: [] }))),
      );
      const allResults = results.flatMap((r) => r.results);
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );
      // If no romance results, fallback to latest
      if (uniqueResults.length === 0) {
        const latest = await manhwaAPI.getLatestManhwa(5);
        setRomanceManhwa(latest.results.slice(0, 15));
      } else {
        const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
        setRomanceManhwa(shuffled.slice(0, 20));
      }
    } catch (err) {
      console.error('Failed to load romance:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, romance: false }));
    }
  };

  const loadTopRatedSection = async () => {
    try {
      // Search for top/popular manhwa keywords
      const topTerms = ['strongest', 'legendary', 'supreme', 'king'];
      const results = await Promise.all(
        topTerms.map((term) => manhwaAPI.search(term).catch(() => ({ results: [] }))),
      );
      const allResults = results.flatMap((r) => r.results);
      const uniqueResults = allResults.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      );
      const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
      setTopRatedManhwa(shuffled.slice(0, 20));
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
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-3.5 sm:px-4 h-14 sm:h-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            {/* Logo visible only on mobile, moved to sidebar on desktop */}
            <div className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl overflow-hidden shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <Image
                src="/inkora-logo.svg"
                alt="Inkora"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col md:hidden">
              <span className="text-white font-bold tracking-tight text-base sm:text-lg leading-none">
                Inkora
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium tracking-wider uppercase">
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

          <div className="flex gap-2 sm:gap-3">
            <Link
              href="/search"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95"
            >
              <Search className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
            </Link>
            <NotificationBell />
          </div>
        </div>

        {/* Categories Scroll (Mobile Only) */}
        <div className="md:hidden overflow-x-auto hide-scrollbar flex gap-2 px-3.5 sm:px-4 pb-2.5 sm:pb-3 pt-0.5 sm:pt-1">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${
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

      <div className="relative z-10 max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Hero Section - Always visible or filtered? Keep it visible but maybe filtered. 
            For now, let's keep it static or random as per current implementation. 
        */}
        {!loadingStates.hero && heroManhwa.length > 0 && (
          <Hero featuredManga={heroManhwa} />
        )}

        {/* Continue Reading - Only on Popular/Home */}
        {activeCategory === 'Popular' && <ContinueReading />}

        {/* Personalized Recommendations - Only on Popular/Home */}
        {activeCategory === 'Popular' && (
          <RecommendationsRow availableManhwa={trendingManhwa} />
        )}

        {/* Recent Discussions - Only on Popular/Home */}
        {activeCategory === 'Popular' && <RecentDiscussions />}

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
