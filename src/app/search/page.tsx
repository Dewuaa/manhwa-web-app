import { Metadata } from 'next';
import { manhwaAPI } from '@/lib/api';
import ManhwaCard from '@/components/ManhwaCard';
import Pagination from '@/components/Pagination';
import SearchPageClient from '@/components/SearchPageClient';
import { SearchResult } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Discover - Manhwa Reader',
  description: 'Search and discover your favorite manhwa.',
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
    <div className="min-h-screen bg-[#0a0a0a] pb-32 md:pb-12 pt-20">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-black text-white mb-8 tracking-tight">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-pink-600">
            Discover
          </span>{' '}
          Manhwa
        </h1>

        {/* Search Button - Opens Modal */}
        <div className="mb-12">
          <SearchPageClient />
        </div>

        {/* Current Filter Display */}
        {(query || genre) && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-gray-400">Showing results for:</span>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
              {query || genre}
            </span>
          </div>
        )}

        {/* Results */}
        {error ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-2">Oops!</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : !searchResults ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-white/10 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : searchResults.results.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
            <p className="text-gray-400">Try searching for something else.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
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
