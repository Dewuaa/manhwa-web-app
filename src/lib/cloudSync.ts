/**
 * Cloud Sync Service
 * Handles synchronization between local storage and Supabase cloud storage
 */

import { getSupabaseClient } from './supabase/client';
import {
  UserBookmark,
  ReadingProgressDB,
  LocalBookmark,
  LocalReadingHistory,
} from './supabase/types';

const BOOKMARKS_KEY = 'manhwa_bookmarks';
const HISTORY_KEY = 'manhwa_reading_history';
const LAST_SYNC_KEY = 'cloud_sync_last_sync';

export interface SyncResult {
  success: boolean;
  bookmarksSynced: number;
  progressSynced: number;
  errors: string[];
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
}

/**
 * Get local bookmarks from localStorage
 */
export function getLocalBookmarks(): LocalBookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get local reading history from localStorage
 */
export function getLocalHistory(): LocalReadingHistory[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save bookmarks to localStorage
 */
export function saveLocalBookmarks(bookmarks: LocalBookmark[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

/**
 * Save reading history to localStorage
 */
export function saveLocalHistory(history: LocalReadingHistory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Convert local bookmark to cloud format
 */
function localToCloudBookmark(
  local: LocalBookmark,
  userId: string,
): Omit<UserBookmark, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    manhwa_id: local.id,
    title: local.title,
    image: local.image || null,
    provider: 'mgeko',
  };
}

/**
 * Convert cloud bookmark to local format
 */
function cloudToLocalBookmark(cloud: UserBookmark): LocalBookmark {
  return {
    id: cloud.manhwa_id,
    title: cloud.title,
    image: cloud.image || '',
    addedAt: new Date(cloud.created_at).getTime(),
  };
}

/**
 * Convert local history to cloud format
 */
function localToCloudProgress(
  local: LocalReadingHistory,
  userId: string,
): Omit<ReadingProgressDB, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    manhwa_id: local.manhwaId,
    manhwa_title: local.manhwaTitle,
    manhwa_image: local.manhwaImage || null,
    last_chapter_id: local.lastChapterId,
    last_chapter_title: local.lastChapterTitle || null,
    chapters_read: local.chaptersRead || [],
    chapter_progress: local.chapterProgress || {},
    total_chapters: local.totalChapters || null,
    provider: 'mgeko',
    last_read_at: new Date(local.timestamp).toISOString(),
  };
}

/**
 * Convert cloud progress to local format
 */
function cloudToLocalProgress(cloud: ReadingProgressDB): LocalReadingHistory {
  return {
    manhwaId: cloud.manhwa_id,
    manhwaTitle: cloud.manhwa_title,
    manhwaImage: cloud.manhwa_image || '',
    lastChapterId: cloud.last_chapter_id,
    lastChapterTitle: cloud.last_chapter_title || '',
    timestamp: new Date(cloud.last_read_at).getTime(),
    chaptersRead: cloud.chapters_read || [],
    chapterProgress: cloud.chapter_progress || {},
    totalChapters: cloud.total_chapters || undefined,
  };
}

/**
 * Merge local and cloud bookmarks (cloud wins for conflicts, union for unique)
 */
function mergeBookmarks(local: LocalBookmark[], cloud: UserBookmark[]): LocalBookmark[] {
  const cloudMap = new Map(cloud.map((b) => [b.manhwa_id, cloudToLocalBookmark(b)]));
  const localMap = new Map(local.map((b) => [b.id, b]));

  // Start with cloud bookmarks (they have priority)
  const merged = new Map(cloudMap);

  // Add local bookmarks that don't exist in cloud
  for (const [id, bookmark] of localMap) {
    if (!merged.has(id)) {
      merged.set(id, bookmark);
    }
  }

  // Sort by addedAt descending (newest first)
  return Array.from(merged.values()).sort((a, b) => b.addedAt - a.addedAt);
}

/**
 * Merge local and cloud reading progress (merge chapter progress, latest timestamp wins)
 */
function mergeProgress(
  local: LocalReadingHistory[],
  cloud: ReadingProgressDB[],
): LocalReadingHistory[] {
  const cloudMap = new Map(cloud.map((p) => [p.manhwa_id, cloudToLocalProgress(p)]));
  const localMap = new Map(local.map((p) => [p.manhwaId, p]));

  const merged = new Map<string, LocalReadingHistory>();

  // Process all unique manhwa IDs
  const allIds = new Set([...cloudMap.keys(), ...localMap.keys()]);

  for (const id of allIds) {
    const cloudItem = cloudMap.get(id);
    const localItem = localMap.get(id);

    if (cloudItem && localItem) {
      // Merge: combine chapters read, keep max progress, use latest timestamp
      const mergedChaptersRead = [
        ...new Set([...cloudItem.chaptersRead, ...localItem.chaptersRead]),
      ];

      // Merge chapter progress, keeping max values
      const mergedChapterProgress: Record<string, number> = {
        ...cloudItem.chapterProgress,
      };
      for (const [chapterId, progress] of Object.entries(localItem.chapterProgress)) {
        mergedChapterProgress[chapterId] = Math.max(
          mergedChapterProgress[chapterId] || 0,
          progress,
        );
      }

      // Use the entry with more recent timestamp for other fields
      const base = cloudItem.timestamp > localItem.timestamp ? cloudItem : localItem;

      merged.set(id, {
        ...base,
        chaptersRead: mergedChaptersRead,
        chapterProgress: mergedChapterProgress,
        totalChapters:
          Math.max(cloudItem.totalChapters || 0, localItem.totalChapters || 0) ||
          undefined,
      });
    } else if (cloudItem) {
      merged.set(id, cloudItem);
    } else if (localItem) {
      merged.set(id, localItem);
    }
  }

  // Sort by timestamp descending (most recently read first)
  return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Sync bookmarks with cloud
 */
export async function syncBookmarks(
  userId: string,
): Promise<{ synced: number; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { synced: 0, error: 'Supabase not configured' };
  }

  try {
    // Fetch cloud bookmarks
    const { data: cloudBookmarks, error: fetchError } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    // Get local bookmarks
    const localBookmarks = getLocalBookmarks();

    // Merge bookmarks
    const mergedBookmarks = mergeBookmarks(localBookmarks, cloudBookmarks || []);

    // Save merged bookmarks locally
    saveLocalBookmarks(mergedBookmarks);

    // Upload local-only bookmarks to cloud
    const cloudIds = new Set((cloudBookmarks || []).map((b) => b.manhwa_id));
    const localOnly = localBookmarks.filter((b) => !cloudIds.has(b.id));

    if (localOnly.length > 0) {
      const toUpload = localOnly.map((b) => localToCloudBookmark(b, userId));
      const { error: uploadError } = await supabase
        .from('user_bookmarks')
        .upsert(toUpload, { onConflict: 'user_id,manhwa_id' });

      if (uploadError) throw uploadError;
    }

    return { synced: mergedBookmarks.length, error: null };
  } catch (err) {
    console.error('Bookmark sync error:', err);
    return { synced: 0, error: err instanceof Error ? err.message : 'Sync failed' };
  }
}

/**
 * Sync reading progress with cloud
 */
export async function syncProgress(
  userId: string,
): Promise<{ synced: number; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { synced: 0, error: 'Supabase not configured' };
  }

  try {
    // Fetch cloud progress
    const { data: cloudProgress, error: fetchError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false });

    if (fetchError) throw fetchError;

    // Get local history
    const localHistory = getLocalHistory();

    // Merge progress
    const mergedProgress = mergeProgress(localHistory, cloudProgress || []);

    // Save merged progress locally
    saveLocalHistory(mergedProgress);

    // Upload/update all merged progress to cloud
    const toUpload = mergedProgress.map((p) => localToCloudProgress(p, userId));

    if (toUpload.length > 0) {
      const { error: uploadError } = await supabase
        .from('reading_progress')
        .upsert(toUpload, { onConflict: 'user_id,manhwa_id' });

      if (uploadError) throw uploadError;
    }

    return { synced: mergedProgress.length, error: null };
  } catch (err) {
    console.error('Progress sync error:', err);
    return { synced: 0, error: err instanceof Error ? err.message : 'Sync failed' };
  }
}

/**
 * Full sync - syncs both bookmarks and progress
 */
export async function fullSync(userId: string): Promise<SyncResult> {
  const errors: string[] = [];

  const bookmarkResult = await syncBookmarks(userId);
  if (bookmarkResult.error) errors.push(`Bookmarks: ${bookmarkResult.error}`);

  const progressResult = await syncProgress(userId);
  if (progressResult.error) errors.push(`Progress: ${progressResult.error}`);

  // Update last sync time
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  }

  return {
    success: errors.length === 0,
    bookmarksSynced: bookmarkResult.synced,
    progressSynced: progressResult.synced,
    errors,
  };
}

/**
 * Add a single bookmark to cloud
 */
export async function addCloudBookmark(
  userId: string,
  bookmark: LocalBookmark,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .upsert(localToCloudBookmark(bookmark, userId), {
        onConflict: 'user_id,manhwa_id',
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error('Add cloud bookmark error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to add bookmark',
    };
  }
}

/**
 * Remove a bookmark from cloud
 */
export async function removeCloudBookmark(
  userId: string,
  manhwaId: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('manhwa_id', manhwaId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error('Remove cloud bookmark error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove bookmark',
    };
  }
}

/**
 * Update reading progress in cloud
 */
export async function updateCloudProgress(
  userId: string,
  progress: LocalReadingHistory,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('reading_progress')
      .upsert(localToCloudProgress(progress, userId), {
        onConflict: 'user_id,manhwa_id',
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error('Update cloud progress error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update progress',
    };
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LAST_SYNC_KEY);
  return stored ? parseInt(stored, 10) : null;
}

/**
 * Check if sync is needed (more than 5 minutes since last sync)
 */
export function isSyncNeeded(): boolean {
  const lastSync = getLastSyncTime();
  if (!lastSync) return true;
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - lastSync > fiveMinutes;
}
