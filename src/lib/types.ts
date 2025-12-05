export enum Provider {
  MANHUAPLUS = 'manhuaplus',
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
}

export interface ChapterPage {
  page: number;
  img: string;
  headerForImage?: { Referer: string };
}

export interface MetadataEnrichment {
  genres?: string[];
  authors?: string[];
  releaseDate?: string;
  description?: string;
}
