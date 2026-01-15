import {
  Provider,
  SearchResult,
  ManhwaInfo,
  ChapterPage,
  MetadataEnrichment,
} from './types';
import { apiCache, CACHE_TTL } from './cache';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://determined-meris-inkora-f9b56664.koyeb.app';

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
  perPage?: number;
  // Types: manga, manhwa, manhua, other
  types?: string[];
  // Status: releasing, finished, on_hiatus, discontinued, not_yet_released
  status?: string[];
  // Demographics: 1=Seinen, 2=Shounen, 3=Shoujo, 4=Josei
  demographics?: string[];
  // Genres: slugs or IDs (prefix with - to exclude)
  genres?: string[];
  genresMode?: 'and' | 'or';
  // Min chapters
  minChapters?: number;
  // Year range
  yearFrom?: number;
  yearTo?: number;
  // Sort: follows, rating, updated, created, title, year, views_7d, views_1mo, views_3mo, views_total
  sort?: 'follows' | 'rating' | 'updated' | 'created' | 'title' | 'year' | 'views_7d' | 'views_1mo' | 'views_3mo' | 'views_total' | 'relevance';
  order?: 'asc' | 'desc';
}

export class ManhwaAPI {
  private provider: Provider;

  constructor(provider: Provider = Provider.COMIXTO) {
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
    // Comix.to uses different endpoint structure
    const url = this.provider === Provider.COMIXTO
      ? `${API_BASE_URL}/manhwa/comixto/search?q=${encodeURIComponent(query)}&page=${page}`
      : `${API_BASE_URL}/manhwa/${this.provider}/${encodeURIComponent(query)}?page=${page}`;
    const cacheKey = `search:${this.provider}:${query}:${page}`;

    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.SHORT);
  }

  async getManhwaInfo(id: string): Promise<ManhwaInfo> {
    // Comix.to uses /info/:id instead of /info?id=
    const url = this.provider === Provider.COMIXTO
      ? `${API_BASE_URL}/manhwa/comixto/info/${encodeURIComponent(id)}`
      : `${API_BASE_URL}/manhwa/${this.provider}/info?id=${encodeURIComponent(id)}`;
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
    let url: string;
    
    if (this.provider === Provider.COMIXTO || sourceProvider === 'comixto') {
      // Comix.to uses /read/:chapterId
      url = `${API_BASE_URL}/manhwa/comixto/read/${encodeURIComponent(chapterId)}`;
    } else if (this.provider === Provider.UNIFIED && sourceProvider) {
      url = `${API_BASE_URL}/manhwa/${this.provider}/read?chapterId=${encodeURIComponent(chapterId)}&provider=${sourceProvider}`;
    } else {
      url = `${API_BASE_URL}/manhwa/${this.provider}/read?chapterId=${encodeURIComponent(chapterId)}`;
    }

    const cacheKey = `chapter:${this.provider}:${sourceProvider || 'default'}:${chapterId}`;

    // Comix.to returns { pages: [...] } instead of just [...]
    if (this.provider === Provider.COMIXTO || sourceProvider === 'comixto') {
      const response = await this.fetchWithCache<{ pages: ChapterPage[] }>(url, cacheKey, CACHE_TTL.HOUR);
      return response.pages || [];
    }
    
    return this.fetchWithCache<ChapterPage[]>(url, cacheKey, CACHE_TTL.HOUR);
  }

  // Get popular manhwa from jumbo/featured page
  async getPopular(page: number = 1): Promise<SearchResult> {
    const url = this.provider === Provider.COMIXTO
      ? `${API_BASE_URL}/manhwa/comixto/trending?page=${page}&type=manhwa,manhua`
      : `${API_BASE_URL}/manhwa/${this.provider}/popular?page=${page}`;
    const cacheKey = `popular:${this.provider}:${page}`;

    try {
      return await this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.MEDIUM);
    } catch {
      // Fallback to latest if popular endpoint fails
      return this.getLatestManhwa(page);
    }
  }

  async getLatestManhwa(page: number = 1): Promise<SearchResult> {
    const url = this.provider === Provider.COMIXTO
      ? `${API_BASE_URL}/manhwa/comixto/latest?page=${page}`
      : `${API_BASE_URL}/manhwa/${this.provider}/latest?page=${page}`;
    const cacheKey = `latest:${this.provider}:${page}`;

    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.SHORT);
  }

  async getTrending(
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly',
    page: number = 1,
  ): Promise<SearchResult> {
    const url = this.provider === Provider.COMIXTO
      ? `${API_BASE_URL}/manhwa/comixto/trending?page=${page}&type=manhwa,manhua`
      : `${API_BASE_URL}/manhwa/${this.provider}/trending?period=${period}&page=${page}`;
    const cacheKey = `trending:${this.provider}:${period}:${page}`;


    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.MEDIUM);
  }

  async getGenre(slug: string, page: number = 1): Promise<SearchResult> {
    // Comix.to has its own genre endpoint
    const url = this.provider === Provider.COMIXTO
      ? `${API_BASE_URL}/manhwa/comixto/genre/${encodeURIComponent(slug)}?page=${page}`
      : `${API_BASE_URL}/manhwa/${this.provider}/genre/${encodeURIComponent(slug)}?page=${page}`;
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
  async advancedSearch(params: AdvancedSearchOptions): Promise<SearchResult & { totalResults?: number; totalPages?: number }> {
    const { 
      query, 
      page = 1, 
      perPage = 24,
      types = [],
      status = [],
      demographics = [],
      genres = [], 
      genresMode = 'and',
      minChapters,
      yearFrom,
      yearTo,
      sort = 'follows',
      order = 'desc',
    } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('per_page', perPage.toString());
    
    if (query) searchParams.append('q', query);
    if (types && types.length > 0) searchParams.append('types', types.join(','));
    if (status && status.length > 0) searchParams.append('status', status.join(','));
    if (demographics && demographics.length > 0) searchParams.append('demographics', demographics.join(','));
    if (genres && genres.length > 0) {
      searchParams.append('genres', genres.join(','));
      searchParams.append('genres_mode', genresMode || 'and');
    }
    if (minChapters) searchParams.append('minchap', minChapters.toString());
    if (yearFrom) searchParams.append('year_from', yearFrom.toString());
    if (yearTo) searchParams.append('year_to', yearTo.toString());
    searchParams.append('sort', sort);
    searchParams.append('order', order);

    const url = `${API_BASE_URL}/manhwa/comixto/advanced-search?${searchParams.toString()}`;
    const cacheKey = `advanced-search:${this.provider}:${searchParams.toString()}`;

    try {
      return await this.fetchWithCache<SearchResult & { totalResults?: number; totalPages?: number }>(url, cacheKey, CACHE_TTL.MEDIUM);
    } catch {
      // Fallback to regular search if advanced search not supported
      if (query) {
        return this.search(query, page);
      }
      return this.getLatestManhwa(page);
    }
  }

  // Enrich metadata from AniList (primary) or Manhuaus (fallback)
  async enrichMetadata(title: string): Promise<MetadataEnrichment | null> {
    // Try AniList first (better metadata)
    try {
      console.log('🔍 Searching AniList for metadata:', title);
      
      // Clean title for better matching
      const cleanTitle = title
        .replace(/-mg\d*$/i, '') // Remove Mgeko suffixes
        .replace(/[-_]/g, ' ')
        .trim();
      
      const anilistUrl = `${API_BASE_URL}/manhwa/anilist/match?title=${encodeURIComponent(cleanTitle)}`;
      const anilistResponse = await fetch(anilistUrl);
      
      if (anilistResponse.ok) {
        const anilistData = await anilistResponse.json();
        
        if (anilistData.match && anilistData.confidence >= 50) {
          const match = anilistData.match;
          console.log('✅ AniList match found:', match.title, 'confidence:', anilistData.confidence);
          
          let authors = match.authors || [];
          
          // If AniList doesn't have authors, try MangaUpdates as fallback
          if (authors.length === 0) {
            try {
              console.log('🔍 AniList missing authors, trying MangaUpdates...');
              const muUrl = `${API_BASE_URL}/manhwa/mangaupdates/match?title=${encodeURIComponent(cleanTitle)}`;
              const muResponse = await fetch(muUrl);
              
              if (muResponse.ok) {
                const muData = await muResponse.json();
                if (muData.match && muData.confidence >= 40) {
                  const muMatch = muData.match;
                  authors = muMatch.authors || [];
                  console.log('✅ MangaUpdates authors found:', authors);
                }
              }
            } catch (muError) {
              console.warn('MangaUpdates fallback failed:', muError);
            }
          }
          
          return {
            genres: match.genres || [],
            authors, // Authors from AniList or MangaUpdates fallback
            releaseDate: match.startDate || null,
            description: match.description || null,
            // Extended AniList metadata
            anilistId: match.anilistId,
            anilistUrl: match.siteUrl,
            rating: match.rating,
            image: match.image, // HD cover from AniList
            cover: match.cover, // Banner image
            status: match.status,
            totalChapters: match.totalChapters,
            tags: match.tags || [],
            recommendations: match.recommendations || [],
          };
        }
      }
    } catch (error) {
      console.warn('AniList enrichment failed:', error);
    }

    // Fallback to MangaUpdates when AniList fails or doesn't match
    try {
      console.log('🔍 Trying MangaUpdates for metadata:', title);
      
      const cleanTitle = title
        .replace(/-mg\d*$/i, '')
        .replace(/[-_]/g, ' ')
        .trim();
      
      const muUrl = `${API_BASE_URL}/manhwa/mangaupdates/match?title=${encodeURIComponent(cleanTitle)}`;
      const muResponse = await fetch(muUrl);
      
      if (muResponse.ok) {
        const muData = await muResponse.json();
        if (muData.match && muData.confidence >= 40) {
          const match = muData.match;
          console.log('✅ MangaUpdates match found:', match.title, 'confidence:', muData.confidence);
          
          return {
            genres: match.genres || [],
            authors: match.authors || [],
            releaseDate: match.year || null,
            description: match.description || null,
            image: match.image, // MangaUpdates cover
            rating: match.rating,
            status: match.status,
            tags: match.categories || [],
            recommendations: [],
          };
        }
      }
    } catch (error) {
      console.warn('MangaUpdates enrichment failed:', error);
    }

    // Fallback to Manhuaus
    try {
      console.log('🔍 Fallback: Searching Manhuaus for metadata:', title);

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
      console.warn('❌ Failed to enrich metadata:', error);
      return null;
    }
  }

  // Clear cache for specific provider
  clearCache() {
    apiCache.clear();
  }
}

export const manhwaAPI = new ManhwaAPI();
