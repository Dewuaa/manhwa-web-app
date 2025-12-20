/**
 * Recommendation Service
 * Generates personalized "Because you read X" suggestions
 */

import { Manhwa } from './types';
import { getBookmarks, Bookmark } from './storage';

// Extended reading history item (internal use - matches the hook's type)
interface ReadingHistoryItem {
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage: string;
  lastChapterId: string;
  lastChapterTitle: string;
  timestamp: number;
  chaptersRead: string[];
  chapterProgress: Record<string, number>;
  totalChapters?: number;
  genres?: string[];
}

// Storage key matching the hook
const STORAGE_KEY = 'manhwa_reading_history';

// Helper to get extended reading history from the same storage as the hook
function getExtendedReadingHistory(): ReadingHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Genre mappings for similarity
const GENRE_GROUPS: Record<string, string[]> = {
  action: ['action', 'martial arts', 'fighting', 'battle', 'adventure'],
  fantasy: ['fantasy', 'magic', 'isekai', 'reincarnation', 'system', 'dungeon'],
  romance: ['romance', 'love', 'shoujo', 'josei', 'drama'],
  comedy: ['comedy', 'slice of life', 'school life', 'gag'],
  dark: ['horror', 'thriller', 'psychological', 'tragedy', 'mature'],
  supernatural: ['supernatural', 'demons', 'gods', 'spirits', 'monsters'],
};

export interface RecommendationReason {
  type: 'genre' | 'similar' | 'author' | 'popular';
  basedOn?: string; // Title of the manhwa this is based on
  genre?: string;
  message: string;
}

export interface RecommendedManhwa extends Manhwa {
  reason: RecommendationReason;
  matchScore: number;
}

/**
 * Get top genres from reading history
 */
export function getTopGenresFromHistory(history: ReadingHistoryItem[]): string[] {
  const genreCounts: Record<string, number> = {};

  history.forEach((item) => {
    if (item.genres && item.genres.length > 0) {
      const weight = item.chaptersRead?.length || 1;
      item.genres.forEach((genre) => {
        const normalized = genre.toLowerCase();
        genreCounts[normalized] = (genreCounts[normalized] || 0) + weight;
      });
    }
  });

  // Sort by count and return top genres
  return Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);
}

/**
 * Get most read manhwa titles from history
 */
export function getMostReadTitles(history: ReadingHistoryItem[]): string[] {
  return history
    .sort((a, b) => (b.chaptersRead?.length || 0) - (a.chaptersRead?.length || 0))
    .slice(0, 5)
    .map((item) => item.manhwaTitle);
}

/**
 * Check if two genres are similar
 */
function areGenresSimilar(genre1: string, genre2: string): boolean {
  const g1 = genre1.toLowerCase();
  const g2 = genre2.toLowerCase();

  if (g1 === g2) return true;

  // Check if they belong to the same group
  for (const group of Object.values(GENRE_GROUPS)) {
    if (group.includes(g1) && group.includes(g2)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate similarity score between manhwa and history
 */
function calculateSimilarityScore(
  manhwa: Manhwa,
  topGenres: string[],
  readIds: Set<string>,
): number {
  // Skip already read
  if (readIds.has(manhwa.id)) return -1;

  let score = 0;
  const manhwaGenres = (manhwa.genres || []).map((g) => g.toLowerCase());

  // Genre matching
  topGenres.forEach((userGenre, index) => {
    const weight = (topGenres.length - index) * 2; // Higher weight for top genres
    manhwaGenres.forEach((manhwaGenre) => {
      if (areGenresSimilar(userGenre, manhwaGenre)) {
        score += weight;
      }
    });
  });

  return score;
}

/**
 * Generate "Because you read X" recommendations
 */
export function generateRecommendations(
  availableManhwa: Manhwa[],
  history: ReadingHistoryItem[],
  limit: number = 10,
): RecommendedManhwa[] {
  if (history.length === 0 || availableManhwa.length === 0) {
    return [];
  }

  const topGenres = getTopGenresFromHistory(history);
  const mostReadTitles = getMostReadTitles(history);
  const readIds = new Set(history.map((h) => h.manhwaId));

  const recommendations: RecommendedManhwa[] = [];

  availableManhwa.forEach((manhwa) => {
    const score = calculateSimilarityScore(manhwa, topGenres, readIds);

    if (score > 0) {
      // Find the best reason for this recommendation
      let reason: RecommendationReason;
      const manhwaGenres = (manhwa.genres || []).map((g) => g.toLowerCase());

      // Find matching genre
      const matchingGenre = topGenres.find((userGenre) =>
        manhwaGenres.some((mg) => areGenresSimilar(userGenre, mg)),
      );

      // Find similar title from history
      const similarTitle = mostReadTitles.find((title) => {
        const historyItem = history.find((h) => h.manhwaTitle === title);
        if (!historyItem?.genres) return false;
        return historyItem.genres.some((hg) =>
          manhwaGenres.some((mg) => areGenresSimilar(hg.toLowerCase(), mg)),
        );
      });

      if (similarTitle) {
        reason = {
          type: 'similar',
          basedOn: similarTitle,
          message: `Because you read "${similarTitle}"`,
        };
      } else if (matchingGenre) {
        reason = {
          type: 'genre',
          genre: matchingGenre,
          message: `Because you like ${matchingGenre.charAt(0).toUpperCase() + matchingGenre.slice(1)}`,
        };
      } else {
        reason = {
          type: 'popular',
          message: 'Popular in your favorite genres',
        };
      }

      recommendations.push({
        ...manhwa,
        reason,
        matchScore: score,
      });
    }
  });

  // Sort by score and return top recommendations
  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

/**
 * Generate quick recommendations for homepage
 */
export function getQuickRecommendations(
  availableManhwa: Manhwa[],
  limit: number = 6,
): { manhwa: RecommendedManhwa[]; topGenre: string | null } {
  const history = getExtendedReadingHistory();

  if (history.length === 0) {
    return { manhwa: [], topGenre: null };
  }

  const topGenres = getTopGenresFromHistory(history);
  const topGenre = topGenres[0] || null;

  const recommendations = generateRecommendations(availableManhwa, history, limit);

  return {
    manhwa: recommendations,
    topGenre,
  };
}

/**
 * Get "Continue from where you left" suggestions
 */
export function getContinueReading(limit: number = 5): ReadingHistoryItem[] {
  const history = getExtendedReadingHistory();

  // Sort by last read time and filter for incomplete
  return history
    .filter((item) => {
      // Filter for items with progress < 100%
      if (!item.totalChapters) return true; // Unknown total, show it
      const progress = ((item.chaptersRead?.length || 0) / item.totalChapters) * 100;
      return progress < 100;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
