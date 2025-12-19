import {
  Provider,
  SearchResult,
  ManhwaInfo,
  ChapterPage,
  MetadataEnrichment,
} from './types';
import { apiCache, CACHE_TTL } from './cache';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://web-production-2840b.up.railway.app';

/**
 * Get proxied image URL to bypass hotlink protection
 * @param imageUrl - Original image URL
 * @param referer - Optional referer URL (auto-detected from image URL if not provided)
 */
export function getProxiedImageUrl(imageUrl: string, referer?: string): string {
  if (!imageUrl) return '';

  // If already proxied, return as-is
  if (imageUrl.includes('/proxy/image')) return imageUrl;

  // Build proxy URL
  const params = new URLSearchParams({ url: imageUrl });
  if (referer) {
    params.append('referer', referer);
  }

  return `${API_BASE_URL}/proxy/image?${params.toString()}`;
}

export interface AdvancedSearchOptions {
  query?: string;
  page?: number;
  status?: 'ongoing' | 'completed' | 'canceled';
  sort?: 'latest' | 'alphabet' | 'rating' | 'trending' | 'views' | 'new-manga';
  genres?: string[];
}

export class ManhwaAPI {
  private provider: Provider;

  constructor(provider: Provider = Provider.MGEKO) {
    this.provider = provider;
  }

  setProvider(provider: Provider) {
    this.provider = provider;
  }

  getProvider(): Provider {
    return this.provider;
  }

  private async fetchWithCache<T>(
    url: string,
    cacheKey: string,
    ttl: number = CACHE_TTL.MEDIUM,
  ): Promise<T> {
    // Check cache first
    const cached = apiCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Store in cache
    apiCache.set(cacheKey, data, ttl);

    return data;
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/${encodeURIComponent(query)}?page=${page}`;
    const cacheKey = `search:${this.provider}:${query}:${page}`;

    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.SHORT);
  }

  async advancedSearch(options: AdvancedSearchOptions): Promise<SearchResult> {
    const params = new URLSearchParams();
    if (options.query) params.append('query', options.query);
    if (options.page) params.append('page', options.page.toString());
    if (options.status) params.append('status', options.status);
    if (options.sort) params.append('sort', options.sort);
    if (options.genres && options.genres.length > 0) {
      params.append('genres', options.genres.join(','));
    }

    const url = `${API_BASE_URL}/manhwa/${this.provider}/advanced-search?${params.toString()}`;
    const cacheKey = `advanced:${this.provider}:${params.toString()}`;

    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.SHORT);
  }

  async getManhwaInfo(id: string): Promise<ManhwaInfo> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/info?id=${encodeURIComponent(id)}`;
    const cacheKey = `info:${this.provider}:${id}`;

    return this.fetchWithCache<ManhwaInfo>(url, cacheKey, CACHE_TTL.LONG);
  }

  /**
   * Get chapter pages
   * @param chapterId - The chapter ID
   * @param sourceProvider - Optional: specific provider to use (from manhwa.provider)
   *                         When using unified provider, pass the source provider for consistency
   */
  async getChapterPages(
    chapterId: string,
    sourceProvider?: string,
  ): Promise<ChapterPage[]> {
    // If using unified provider and a source provider is specified, include it in the request
    let url: string;
    if (this.provider === Provider.UNIFIED && sourceProvider) {
      url = `${API_BASE_URL}/manhwa/${this.provider}/read?chapterId=${encodeURIComponent(chapterId)}&provider=${sourceProvider}`;
    } else {
      url = `${API_BASE_URL}/manhwa/${this.provider}/read?chapterId=${encodeURIComponent(chapterId)}`;
    }

    const cacheKey = `chapter:${this.provider}:${sourceProvider || 'default'}:${chapterId}`;

    return this.fetchWithCache<ChapterPage[]>(url, cacheKey, CACHE_TTL.HOUR);
  }

  // Get popular manhwa from jumbo/featured page
  async getPopular(page: number = 1): Promise<SearchResult> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/popular?page=${page}`;
    const cacheKey = `popular:${this.provider}:${page}`;

    try {
      return await this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.MEDIUM);
    } catch {
      // Fallback to latest if popular endpoint fails
      return this.getLatestManhwa(page);
    }
  }

  async getLatestManhwa(page: number = 1): Promise<SearchResult> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/latest?page=${page}`;
    const cacheKey = `latest:${this.provider}:${page}`;

    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.SHORT);
  }

  async getTrending(
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly',
    page: number = 1,
  ): Promise<SearchResult> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/trending?period=${period}&page=${page}`;
    const cacheKey = `trending:${this.provider}:${period}:${page}`;

    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.MEDIUM);
  }

  async getGenre(slug: string, page: number = 1): Promise<SearchResult> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/genre/${encodeURIComponent(slug)}?page=${page}`;
    const cacheKey = `genre:${this.provider}:${slug}:${page}`;

    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.MEDIUM);
  }

  // Default genres as fallback
  private defaultGenres: { name: string; slug: string }[] = [
    { name: 'Action', slug: 'action' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Horror', slug: 'horror' },
    { name: 'Isekai', slug: 'isekai' },
    { name: 'Martial Arts', slug: 'martial-arts' },
    { name: 'Mystery', slug: 'mystery' },
    { name: 'Romance', slug: 'romance' },
    { name: 'Sci-Fi', slug: 'sci-fi' },
    { name: 'Slice of Life', slug: 'slice-of-life' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Supernatural', slug: 'supernatural' },
    { name: 'Thriller', slug: 'thriller' },
    { name: 'Tragedy', slug: 'tragedy' },
  ];

  async getGenres(): Promise<{ name: string; slug: string }[]> {
    try {
      const url = `${API_BASE_URL}/manhwa/${this.provider}/genres`;
      const cacheKey = `genres:${this.provider}`;

      const data = await this.fetchWithCache<{
        genres: { name: string; slug: string }[];
      }>(url, cacheKey, CACHE_TTL.HOUR);

      return data.genres?.length ? data.genres : this.defaultGenres;
    } catch (error) {
      console.warn('Failed to fetch genres, using defaults:', error);
      return this.defaultGenres;
    }
  }

  // Advanced search with multiple filters
  async advancedSearch(params: {
    query?: string;
    genres?: string[];
    status?: 'ongoing' | 'completed' | 'all';
    sort?: 'latest' | 'popular' | 'rating' | 'az';
    page?: number;
  }): Promise<SearchResult> {
    const { query = '', genres = [], status = 'all', sort = 'latest', page = 1 } = params;

    const searchParams = new URLSearchParams();
    if (query) searchParams.append('query', query);
    if (genres.length > 0) searchParams.append('genres', genres.join(','));
    if (status !== 'all') searchParams.append('status', status);
    searchParams.append('sort', sort);
    searchParams.append('page', page.toString());

    const url = `${API_BASE_URL}/manhwa/${this.provider}/advanced-search?${searchParams.toString()}`;
    const cacheKey = `advanced-search:${this.provider}:${query}:${genres.join(',')}:${status}:${sort}:${page}`;

    try {
      return await this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.MEDIUM);
    } catch {
      // Fallback to regular search if advanced search not supported
      if (query) {
        return this.searchManhwa(query, page);
      }
      return this.getLatestManhwa(page);
    }
  }

  // Enrich metadata from Manhuaus
  async enrichMetadata(title: string): Promise<MetadataEnrichment | null> {
    try {
      console.log('🔍 Searching Manhuaus for metadata:', title);

      // Search Manhuaus for the manhwa
      const searchUrl = `${API_BASE_URL}/manhwa/manhuaus/${encodeURIComponent(title)}`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.warn('Manhuaus search failed:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('✅ Manhuaus search response:', data);

      // Get the first result from the search
      const result = data.results?.[0];
      if (!result) {
        console.warn('No results found for:', title);
        return null;
      }

      console.log('📋 Manhuaus result:', result);
      console.log('👥 Author field:', result.author);

      // Extract authors - handle different formats
      let authors: string[] = [];
      if (result.author) {
        if (Array.isArray(result.author)) {
          authors = result.author
            .map((a: any) => (typeof a === 'string' ? a : a.name || a.title))
            .filter(Boolean);
        } else if (typeof result.author === 'string') {
          authors = [result.author];
        }
      }

      // Extract metadata
      const enrichment: MetadataEnrichment = {
        genres: result.genres || [],
        authors: authors,
        releaseDate: result.releaseDate || result.year?.toString() || null,
        description: result.description || null,
      };

      console.log('📦 Enrichment from Manhuaus:', enrichment);
      return enrichment;
    } catch (error) {
      console.warn('❌ Failed to enrich metadata from Manhuaus:', error);
      return null;
    }
  }

  // Clear cache for specific provider
  clearCache() {
    apiCache.clear();
  }
}

export const manhwaAPI = new ManhwaAPI();
