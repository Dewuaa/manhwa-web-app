import { Metadata } from 'next';
import { manhwaAPI } from '@/lib/api';
import ManhwaCard from '@/components/ManhwaCard';
import Pagination from '@/components/Pagination';
import SearchPageClient from '@/components/SearchPageClient';
import { SearchResult } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Search Manga & Manhwa - Discover New Series',
  description:
    'Search and discover thousands of manga and manhwa series. Find action, romance, fantasy, and more genres. Updated daily with the latest chapters.',
  openGraph: {
    title: 'Search Manga & Manhwa - Inkora',
    description: 'Search and discover thousands of manga and manhwa series.',
    url: 'https://inkora.spacely.tech/search',
  },
  alternates: {
    canonical: 'https://inkora.spacely.tech/search',
  },
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.query === 'string' ? params.query : '';
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const genre = typeof params.genre === 'string' ? params.genre : '';

  let searchResults: SearchResult | null = null;
  let error: string | null = null;

  try {
    if (query) {
      searchResults = await manhwaAPI.search(query, page);
    } else if (genre) {
      searchResults = await manhwaAPI.getGenre(genre, page);
    } else {
      searchResults = await manhwaAPI.getLatestManhwa(page);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
    error = 'Failed to load content. Please try again.';
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 sm:pb-32 md:pb-12 pt-16 sm:pt-20">
      <div className="px-3.5 sm:px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-5 sm:mb-8 tracking-tight">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-pink-600">
            Discover
          </span>{' '}
          Manhwa
        </h1>

        {/* Search Button - Opens Modal */}
        <div className="mb-8 sm:mb-12">
          <SearchPageClient />
        </div>

        {/* Current Filter Display */}
        {(query || genre) && (
          <div className="mb-4 sm:mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm sm:text-base">
              Showing results for:
            </span>
            <span className="px-2.5 sm:px-3 py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-medium">
              {query || genre}
            </span>
          </div>
        )}

        {/* Results */}
        {error ? (
          <div className="text-center py-12 sm:py-20 bg-white/5 rounded-xl sm:rounded-2xl ring-1 ring-white/10">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">⚠️</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Oops!</h3>
            <p className="text-gray-400 text-sm sm:text-base">{error}</p>
          </div>
        ) : !searchResults ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
            <p className="text-gray-400 text-sm sm:text-base">Loading...</p>
          </div>
        ) : searchResults.results.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white/5 rounded-xl sm:rounded-2xl ring-1 ring-white/10">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Try searching for something else.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 mb-8 sm:mb-12">
              {searchResults.results.map((manhwa) => (
                <ManhwaCard key={manhwa.id} manhwa={manhwa} />
              ))}
            </div>

            <Pagination
              currentPage={searchResults.currentPage}
              hasNextPage={searchResults.hasNextPage}
              baseUrl="/search"
              searchParams={{
                query: query || undefined,
                genre: genre || undefined,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
