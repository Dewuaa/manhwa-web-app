import { Metadata } from 'next';
import { manhwaAPI } from '@/lib/api';
import AdvancedSearch from '@/components/AdvancedSearch';
import ManhwaCard from '@/components/ManhwaCard';
import Pagination from '@/components/Pagination';
import { SearchResult } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Advanced Search - Manhwa Reader',
  description: 'Search for your favorite manhwa with advanced filters.',
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.query === 'string' ? params.query : '';
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const status = typeof params.status === 'string' ? params.status : '';
  const sort = typeof params.sort === 'string' ? params.sort : 'latest';
  const genres = typeof params.genres === 'string' ? params.genres.split(',') : [];

  let searchResults: SearchResult | null = null;
  let error: string | null = null;

  // Only search if there are parameters
  const hasParams = query || status || sort !== 'latest' || genres.length > 0;

  if (hasParams) {
    try {
      searchResults = await manhwaAPI.advancedSearch({
        query,
        page,
        status: status as 'ongoing' | 'completed' | 'canceled',
        sort: sort as
          | 'latest'
          | 'alphabet'
          | 'rating'
          | 'trending'
          | 'views'
          | 'new-manga',
        genres,
      });
    } catch (err) {
      console.error('Search failed:', err);
      error = 'Failed to load search results. Please try again.';
    }
  } else {
    // Default to latest updates if no params
    try {
      searchResults = await manhwaAPI.getLatestManhwa(page);
    } catch (err) {
      console.error('Default fetch failed:', err);
      error = 'Failed to load latest updates.';
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12 pt-20">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-8 tracking-tight">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-pink-600">
            Discover
          </span>{' '}
          Manhwa
        </h1>

        {/* Advanced Search Component */}
        <AdvancedSearch
          initialValues={{
            query,
            status,
            sort,
            genres,
          }}
          className="mb-12"
        />

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
            <p className="text-gray-400">Searching the archives...</p>
          </div>
        ) : searchResults.results.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl ring-1 ring-white/10">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms.</p>
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
                query,
                status,
                sort,
                genres: genres.length > 0 ? genres.join(',') : undefined,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
