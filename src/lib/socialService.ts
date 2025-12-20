/**
 * Social Service
 * Handles sharing, public profiles, and reading stats
 */

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

// Helper to get extended reading history
function getExtendedReadingHistory(): ReadingHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Reading statistics
 */
export interface ReadingStats {
  totalManhwaRead: number;
  totalChaptersRead: number;
  favoriteGenres: string[];
  averageChaptersPerTitle: number;
  longestStreak: number;
  completedSeries: number;
  lastReadDate: string | null;
}

/**
 * Shareable progress
 */
export interface ShareableProgress {
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage: string;
  chaptersRead: number;
  totalChapters: number | null;
  progressPercent: number;
  lastChapter: string;
}

/**
 * Public profile settings
 */
export interface PublicProfile {
  username: string;
  avatarUrl?: string;
  bio?: string;
  showReadingStats: boolean;
  showCurrentlyReading: boolean;
  showBadges: boolean;
  createdAt: number;
}

/**
 * Achievement badge
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: number;
}

// Badge definitions
const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'first_read',
    name: 'First Chapter',
    description: 'Read your first chapter',
    icon: '📖',
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Read 50 chapters',
    icon: '📚',
  },
  {
    id: 'dedicated',
    name: 'Dedicated Reader',
    description: 'Read 200 chapters',
    icon: '🎯',
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Bookmark 10 series',
    icon: '⭐',
  },
  {
    id: 'explorer',
    name: 'Genre Explorer',
    description: 'Read 5 different genres',
    icon: '🌟',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete 5 series',
    icon: '🏆',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Read after midnight',
    icon: '🦉',
  },
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Read 20 chapters in one day',
    icon: '⚡',
  },
];

const BADGES_KEY = 'inkora_badges';
const PROFILE_KEY = 'inkora_public_profile';

/**
 * Get all badge definitions
 */
export function getAllBadges(): Badge[] {
  return BADGE_DEFINITIONS;
}

/**
 * Get earned badges from storage
 */
export function getEarnedBadges(): Badge[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(BADGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save earned badge
 */
function saveBadge(badge: Badge): void {
  const earned = getEarnedBadges();
  if (!earned.find((b) => b.id === badge.id)) {
    earned.push({ ...badge, earnedAt: Date.now() });
    localStorage.setItem(BADGES_KEY, JSON.stringify(earned));
  }
}

/**
 * Calculate reading statistics
 */
export function calculateReadingStats(): ReadingStats {
  const history = getExtendedReadingHistory();
  const bookmarks = getBookmarks();

  const totalManhwaRead = history.length;
  const totalChaptersRead = history.reduce(
    (acc, item) => acc + (item.chaptersRead?.length || 0),
    0,
  );

  // Calculate favorite genres
  const genreCounts: Record<string, number> = {};
  history.forEach((item) => {
    if (item.genres) {
      item.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  const favoriteGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);

  // Count completed series
  const completedSeries = history.filter((item) => {
    if (!item.totalChapters) return false;
    return (item.chaptersRead?.length || 0) >= item.totalChapters;
  }).length;

  // Last read date
  const lastRead = history.sort((a, b) => b.timestamp - a.timestamp)[0];
  const lastReadDate = lastRead
    ? new Date(lastRead.timestamp).toISOString().split('T')[0]
    : null;

  return {
    totalManhwaRead,
    totalChaptersRead,
    favoriteGenres,
    averageChaptersPerTitle:
      totalManhwaRead > 0 ? Math.round(totalChaptersRead / totalManhwaRead) : 0,
    longestStreak: 0, // Would need more tracking
    completedSeries,
    lastReadDate,
  };
}

/**
 * Check and award badges based on current stats
 */
export function checkAndAwardBadges(): Badge[] {
  const history = getExtendedReadingHistory();
  const bookmarks = getBookmarks();
  const stats = calculateReadingStats();
  const newBadges: Badge[] = [];

  // First chapter
  if (stats.totalChaptersRead >= 1) {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === 'first_read');
    if (badge && !getEarnedBadges().find((b) => b.id === badge.id)) {
      saveBadge(badge);
      newBadges.push(badge);
    }
  }

  // Bookworm - 50 chapters
  if (stats.totalChaptersRead >= 50) {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === 'bookworm');
    if (badge && !getEarnedBadges().find((b) => b.id === badge.id)) {
      saveBadge(badge);
      newBadges.push(badge);
    }
  }

  // Dedicated - 200 chapters
  if (stats.totalChaptersRead >= 200) {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === 'dedicated');
    if (badge && !getEarnedBadges().find((b) => b.id === badge.id)) {
      saveBadge(badge);
      newBadges.push(badge);
    }
  }

  // Collector - 10 bookmarks
  if (bookmarks.length >= 10) {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === 'collector');
    if (badge && !getEarnedBadges().find((b) => b.id === badge.id)) {
      saveBadge(badge);
      newBadges.push(badge);
    }
  }

  // Explorer - 5 genres
  if (stats.favoriteGenres.length >= 5) {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === 'explorer');
    if (badge && !getEarnedBadges().find((b) => b.id === badge.id)) {
      saveBadge(badge);
      newBadges.push(badge);
    }
  }

  // Completionist - 5 completed
  if (stats.completedSeries >= 5) {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === 'completionist');
    if (badge && !getEarnedBadges().find((b) => b.id === badge.id)) {
      saveBadge(badge);
      newBadges.push(badge);
    }
  }

  // Night owl - reading after midnight
  const now = new Date();
  if (now.getHours() >= 0 && now.getHours() < 5) {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === 'night_owl');
    if (badge && !getEarnedBadges().find((b) => b.id === badge.id)) {
      saveBadge(badge);
      newBadges.push(badge);
    }
  }

  return newBadges;
}

/**
 * Generate shareable progress for a manhwa
 */
export function generateShareableProgress(manhwaId: string): ShareableProgress | null {
  const history = getExtendedReadingHistory();
  const item = history.find((h) => h.manhwaId === manhwaId);

  if (!item) return null;

  const chaptersRead = item.chaptersRead?.length || 0;
  const totalChapters = item.totalChapters || null;
  const progressPercent = totalChapters
    ? Math.round((chaptersRead / totalChapters) * 100)
    : 0;

  return {
    manhwaId: item.manhwaId,
    manhwaTitle: item.manhwaTitle,
    manhwaImage: item.manhwaImage,
    chaptersRead,
    totalChapters,
    progressPercent,
    lastChapter: item.lastChapterTitle,
  };
}

/**
 * Generate share text for progress
 */
export function generateShareText(progress: ShareableProgress): string {
  const progressText = progress.totalChapters
    ? `${progress.chaptersRead}/${progress.totalChapters} chapters (${progress.progressPercent}%)`
    : `${progress.chaptersRead} chapters read`;

  return `📚 I'm reading "${progress.manhwaTitle}" on Inkora!\n${progressText}`;
}

/**
 * Generate share URL
 */
export function generateShareUrl(manhwaId: string): string {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://inkora.spacely.tech';
  return `${baseUrl}/manhwa/${encodeURIComponent(manhwaId)}`;
}

/**
 * Share progress using Web Share API
 */
export async function shareProgress(manhwaId: string): Promise<boolean> {
  const progress = generateShareableProgress(manhwaId);
  if (!progress) return false;

  const text = generateShareText(progress);
  const url = generateShareUrl(manhwaId);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Reading ${progress.manhwaTitle}`,
        text,
        url,
      });
      return true;
    } catch (err) {
      // User cancelled or error
      return false;
    }
  }

  return false;
}

/**
 * Share reading stats
 */
export async function shareStats(): Promise<boolean> {
  const stats = calculateReadingStats();
  const text = `📊 My Inkora Reading Stats:
📖 ${stats.totalChaptersRead} chapters read
📚 ${stats.totalManhwaRead} series explored
🏆 ${stats.completedSeries} series completed
❤️ Favorite: ${stats.favoriteGenres[0] || 'Various'}`;

  const url =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://inkora.spacely.tech';

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'My Inkora Stats',
        text,
        url,
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get public profile settings
 */
export function getPublicProfile(): PublicProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save public profile settings
 */
export function savePublicProfile(profile: Partial<PublicProfile>): void {
  const current = getPublicProfile() || {
    username: 'Reader',
    showReadingStats: true,
    showCurrentlyReading: true,
    showBadges: true,
    createdAt: Date.now(),
  };

  const updated = { ...current, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
}
