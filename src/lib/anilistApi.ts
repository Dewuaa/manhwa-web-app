/**
 * AniList API Client for Frontend
 * 
 * Fetches enhanced metadata from AniList to improve manga detail pages.
 */

import { apiCache as cache } from './cache';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-consumet-org-wine.vercel.app';

export interface AnilistManga {
  id: string;
  anilistId: number;
  title: string;
  altTitles: string[];
  image: string;
  cover: string | null;
  description: string;
  genres: string[];
  tags: string[];
  rating: number | null;
  popularity: number;
  status: string;
  totalChapters: number | null;
  totalVolumes: number | null;
  startDate: string | null;
  endDate: string | null;
  isAdult: boolean;
  siteUrl: string;
  relations: {
    relationType: string;
    id: number;
    title: string;
    image: string;
    type: string;
    format: string;
  }[];
  recommendations: {
    id: number;
    title: string;
    image: string;
    rating: number | null;
  }[];
}

export interface AnilistMatchResult {
  match: AnilistManga | null;
  confidence: number;
}

export interface AnilistSearchResult {
  currentPage: number;
  hasNextPage: boolean;
  totalResults: number;
  results: AnilistManga[];
}

/**
 * Search for manga on AniList
 */
export async function searchAnilist(query: string, page = 1): Promise<AnilistSearchResult> {
  const cacheKey = `anilist-search-${query}-${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as AnilistSearchResult;

  try {
    const response = await fetch(
      `${API_BASE}/manhwa/anilist/search?q=${encodeURIComponent(query)}&page=${page}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Failed to search AniList');
    }

    const data = await response.json();
    cache.set(cacheKey, data, 3600000); // 1 hour cache
    return data;
  } catch (error) {
    console.error('AniList search error:', error);
    return { currentPage: 1, hasNextPage: false, totalResults: 0, results: [] };
  }
}

/**
 * Get manga info by AniList ID
 */
export async function getAnilistInfo(anilistId: number): Promise<AnilistManga | null> {
  const cacheKey = `anilist-info-${anilistId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as AnilistManga;

  try {
    const response = await fetch(
      `${API_BASE}/manhwa/anilist/info/${anilistId}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    cache.set(cacheKey, data, 3600000);
    return data;
  } catch (error) {
    console.error('AniList info error:', error);
    return null;
  }
}

/**
 * Match a manga title to AniList
 * Returns best match with confidence score
 */
export async function matchAnilist(title: string): Promise<AnilistMatchResult> {
  // Clean the title for better matching
  const cleanTitle = title
    .replace(/-mg\d*$/i, '') // Remove Mgeko suffixes
    .replace(/[-_]/g, ' ')
    .trim();

  const cacheKey = `anilist-match-${cleanTitle.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as AnilistMatchResult;

  try {
    const response = await fetch(
      `${API_BASE}/manhwa/anilist/match?title=${encodeURIComponent(cleanTitle)}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return { match: null, confidence: 0 };
    }

    const data = await response.json();
    cache.set(cacheKey, data, 3600000);
    return data;
  } catch (error) {
    console.error('AniList match error:', error);
    return { match: null, confidence: 0 };
  }
}

/**
 * Get trending manga from AniList
 */
export async function getAnilistTrending(page = 1, perPage = 20): Promise<AnilistSearchResult> {
  const cacheKey = `anilist-trending-${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as AnilistSearchResult;

  try {
    const response = await fetch(
      `${API_BASE}/manhwa/anilist/trending?page=${page}&perPage=${perPage}`,
      { next: { revalidate: 1800 } } // 30 min cache
    );

    if (!response.ok) {
      throw new Error('Failed to get trending');
    }

    const data = await response.json();
    cache.set(cacheKey, data, 1800000); // 30 min
    return data;
  } catch (error) {
    console.error('AniList trending error:', error);
    return { currentPage: 1, hasNextPage: false, totalResults: 0, results: [] };
  }
}
