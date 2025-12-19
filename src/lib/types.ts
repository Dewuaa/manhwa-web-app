export enum Provider {
  MANHUAPLUS = 'manhuaplus', // Primary provider
  MANHUAUS = 'manhuaus',
  UNIFIED = 'unified', // Auto-fallback provider
}

export interface Manhwa {
  id: string;
  title: string;
  image: string;
  status: string;
  latestChapter: string;
  latestChapters?: Array<{ title: string; releaseDate: string }>;
  rating?: number | string | null;
  genres?: string[];
  provider?: string; // Source provider
}

export interface SearchResult {
  currentPage: number;
  hasNextPage: boolean;
  results: Manhwa[];
}

export interface Chapter {
  id: string;
  title: string;
  releaseDate: string;
}

export interface ManhwaInfo {
  id: string;
  title: string;
  altTitles?: string[];
  description: string;
  image: string;
  headerForImage?: { Referer: string };
  genres?: string[];
  status: string;
  views?: number;
  authors?: string[];
  chapters: Chapter[];
  rating?: number | string | null;
  releaseDate?: string;
  provider?: string; // Source provider for this data
  _fallback?: boolean; // True if fallback provider was used
}

export interface ChapterPage {
  page: number;
  img: string;
  headerForImage?: { Referer: string };
  provider?: string; // Source provider for this chapter
}

export interface MetadataEnrichment {
  genres?: string[];
  authors?: string[];
  releaseDate?: string;
  description?: string;
}
