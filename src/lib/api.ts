import { Provider, SearchResult, ManhwaInfo, ChapterPage, MetadataEnrichment } from './types';
import { apiCache, CACHE_TTL } from './cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://inkora-reader.onrender.com';

export interface AdvancedSearchOptions {
  query?: string;
  page?: number;
  status?: 'ongoing' | 'completed' | 'canceled';
  sort?: 'latest' | 'alphabet' | 'rating' | 'trending' | 'views' | 'new-manga';
  genres?: string[];
}

export class ManhwaAPI {
  private provider: Provider;

  constructor(provider: Provider = Provider.MANHUAPLUS) {
    this.provider = provider;
  }

  setProvider(provider: Provider) {
    this.provider = provider;
  }

  private async fetchWithCache<T>(
    url: string,
    cacheKey: string,
    ttl: number = CACHE_TTL.MEDIUM
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

  async getChapterPages(chapterId: string): Promise<ChapterPage[]> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/read?chapterId=${encodeURIComponent(chapterId)}`;
    const cacheKey = `chapter:${this.provider}:${chapterId}`;
    
    return this.fetchWithCache<ChapterPage[]>(url, cacheKey, CACHE_TTL.HOUR);
  }

  // Get popular manhwa (using a common search term)
  async getPopular(): Promise<SearchResult> {
    return this.search('');
  }

  async getLatestManhwa(page: number = 1): Promise<SearchResult> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/latest?page=${page}`;
    const cacheKey = `latest:${this.provider}:${page}`;
    
    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.SHORT);
  }

  async getGenre(slug: string, page: number = 1): Promise<SearchResult> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/genre/${encodeURIComponent(slug)}?page=${page}`;
    const cacheKey = `genre:${this.provider}:${slug}:${page}`;
    
    return this.fetchWithCache<SearchResult>(url, cacheKey, CACHE_TTL.MEDIUM);
  }

  async getGenres(): Promise<{ name: string; slug: string }[]> {
    const url = `${API_BASE_URL}/manhwa/${this.provider}/genres`;
    const cacheKey = `genres:${this.provider}`;
    
    const data = await this.fetchWithCache<{ genres: { name: string; slug: string }[] }>(
      url,
      cacheKey,
      CACHE_TTL.HOUR
    );
    
    return data.genres;
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
          authors = result.author.map((a: any) => typeof a === 'string' ? a : (a.name || a.title)).filter(Boolean);
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
