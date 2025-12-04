import { Provider, SearchResult, ManhwaInfo, ChapterPage } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://comsu-api.onrender.com';

export interface AdvancedSearchOptions {
  query?: string;
  page?: number;
  status?: 'ongoing' | 'completed' | 'canceled';
  sort?: 'latest' | 'alphabet' | 'rating' | 'trending' | 'views' | 'new-manga';
  genres?: string[];
}

export class ManhwaAPI {
  private provider: Provider;

  constructor(provider: Provider = Provider.MANHUAUS) {
    this.provider = provider;
  }

  setProvider(provider: Provider) {
    this.provider = provider;
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    const response = await fetch(
      `${API_BASE_URL}/manhwa/${this.provider}/${encodeURIComponent(query)}?page=${page}`,
    );

    if (!response.ok) {
      throw new Error('Failed to search manhwa');
    }

    return response.json();
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

    const response = await fetch(
      `${API_BASE_URL}/manhwa/${this.provider}/advanced-search?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error('Failed to perform advanced search');
    }

    return response.json();
  }

  async getManhwaInfo(id: string): Promise<ManhwaInfo> {
    const response = await fetch(
      `${API_BASE_URL}/manhwa/${this.provider}/info?id=${encodeURIComponent(id)}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch manhwa info');
    }

    return response.json();
  }

  async getChapterPages(chapterId: string): Promise<ChapterPage[]> {
    const response = await fetch(
      `${API_BASE_URL}/manhwa/${this.provider}/read?chapterId=${encodeURIComponent(chapterId)}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chapter pages');
    }

    return response.json();
  }

  // Get popular manhwa (using a common search term)
  async getPopular(): Promise<SearchResult> {
    return this.search('');
  }

  async getLatestManhwa(page: number = 1): Promise<SearchResult> {
    const response = await fetch(`${API_BASE_URL}/manhwa/${this.provider}/latest?page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to fetch latest manhwa');
    }
    return response.json();
  }

  async getGenre(slug: string, page: number = 1): Promise<SearchResult> {
    const response = await fetch(
      `${API_BASE_URL}/manhwa/${this.provider}/genre/${encodeURIComponent(slug)}?page=${page}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch genre');
    }

    return response.json();
  }

  async getGenres(): Promise<{ name: string; slug: string }[]> {
    const response = await fetch(`${API_BASE_URL}/manhwa/${this.provider}/genres`);
    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }
    const data = await response.json();
    return data.genres;
  }
}

export const manhwaAPI = new ManhwaAPI();
