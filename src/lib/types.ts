export enum Provider {
  COMIXTO = 'comixto', // Primary provider with scan group support
  MGEKO = 'mgeko', // Fallback provider
  MANHUAPLUS = 'manhuaplus',
  MANHUAUS = 'manhuaus',
  UNIFIED = 'unified', // Auto-fallback provider
}

export interface ScanGroup {
  id: number;
  name: string;
  slug?: string;
}

export interface Manhwa {
  id: string;
  title: string;
  image: string;
  status: string;
  latestChapter: string | number;
  latestChapters?: Array<{ title: string; releaseDate: string }>;
  rating?: number | string | null;
  ratingCount?: number;
  views?: number;
  viewsFormatted?: string;
  genres?: string[];
  provider?: string; // Source provider
  isPopular?: boolean;
  isTrending?: boolean;
  updatedAt?: string | number;
}

export interface SearchResult {
  currentPage: number;
  hasNextPage: boolean;
  totalResults?: number;
  results: Manhwa[];
}

export interface Chapter {
  id: string;
  title: string;
  chapterNumber?: number;
  releaseDate?: string;
  // Scan group support for Comix.to
  scanGroup?: ScanGroup | null;
  isOfficial?: boolean;
  hasMultipleVersions?: boolean;
  versions?: Chapter[];
}

export interface ManhwaInfo {
  id: string;
  title: string;
  altTitles?: string[];
  description: string;
  image: string;
  headerForImage?: { Referer: string };
  genres?: string[];
  themes?: string[];
  status: string;
  type?: string; // Manga, Manhwa, Manhua
  demographics?: string; // Seinen, Shounen, Shoujo, Josei
  views?: number;
  viewsFormatted?: string;
  follows?: number;
  rating?: number | string | null;
  ratingCount?: number;
  lastUpdate?: string;
  totalChapters?: number;
  authors?: string[];
  artists?: string[];
  chapters: Chapter[];
  releaseDate?: string;
  originalLanguage?: string;
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
  releaseDate?: string | null;
  description?: string | null;
  // AniList-specific fields
  anilistId?: number;
  anilistUrl?: string;
  rating?: number | null;
  image?: string; // HD cover from AniList
  cover?: string | null; // Banner image
  status?: string;
  totalChapters?: number | null;
  tags?: string[];
  recommendations?: {
    id: number;
    title: string;
    image: string;
    rating: number | null;
  }[];
}

