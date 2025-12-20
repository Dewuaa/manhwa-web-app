'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fullSync,
  syncBookmarks,
  syncProgress,
  addCloudBookmark,
  removeCloudBookmark,
  updateCloudProgress,
  getLastSyncTime,
  isSyncNeeded,
  SyncResult,
  getLocalBookmarks,
  getLocalHistory,
} from '@/lib/cloudSync';
import { LocalBookmark, LocalReadingHistory } from '@/lib/supabase/types';

export interface CloudSyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
  isEnabled: boolean;
}

export function useCloudSync() {
  const { user, isConfigured } = useAuth();
  const [state, setState] = useState<CloudSyncState>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    isEnabled: false,
  });

  const syncInProgressRef = useRef(false);
  const initialSyncDoneRef = useRef(false);

  // Check if cloud sync is available
  const isEnabled = Boolean(user && isConfigured);

  // Update state when auth changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isEnabled,
      lastSyncTime: getLastSyncTime(),
    }));
  }, [isEnabled]);

  // Perform initial sync when user logs in
  useEffect(() => {
    if (isEnabled && !initialSyncDoneRef.current && isSyncNeeded()) {
      initialSyncDoneRef.current = true;
      performFullSync();
    }
  }, [isEnabled]);

  // Auto-sync on window focus (if sync is needed)
  useEffect(() => {
    if (!isEnabled) return;

    const handleFocus = () => {
      if (isSyncNeeded() && !syncInProgressRef.current) {
        performFullSync();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isEnabled]);

  // Periodic sync every 5 minutes
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(
      () => {
        if (isSyncNeeded() && !syncInProgressRef.current) {
          performFullSync();
        }
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [isEnabled]);

  /**
   * Perform full synchronization
   */
  const performFullSync = useCallback(async (): Promise<SyncResult | null> => {
    if (!user || syncInProgressRef.current) return null;

    syncInProgressRef.current = true;
    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const result = await fullSync(user.id);

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        error: result.errors.length > 0 ? result.errors.join('; ') : null,
      }));

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('cloudSyncComplete', { detail: result }));

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      setState((prev) => ({ ...prev, isSyncing: false, error: errorMsg }));
      return null;
    } finally {
      syncInProgressRef.current = false;
    }
  }, [user]);

  /**
   * Sync only bookmarks
   */
  const syncBookmarksOnly = useCallback(async () => {
    if (!user) return null;

    setState((prev) => ({ ...prev, isSyncing: true }));
    try {
      const result = await syncBookmarks(user.id);
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: result.error,
        lastSyncTime: result.error ? prev.lastSyncTime : Date.now(),
      }));
      return result;
    } catch (err) {
      setState((prev) => ({ ...prev, isSyncing: false }));
      return null;
    }
  }, [user]);

  /**
   * Sync only reading progress
   */
  const syncProgressOnly = useCallback(async () => {
    if (!user) return null;

    setState((prev) => ({ ...prev, isSyncing: true }));
    try {
      const result = await syncProgress(user.id);
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: result.error,
        lastSyncTime: result.error ? prev.lastSyncTime : Date.now(),
      }));
      return result;
    } catch (err) {
      setState((prev) => ({ ...prev, isSyncing: false }));
      return null;
    }
  }, [user]);

  /**
   * Add bookmark (local + cloud if enabled)
   */
  const addBookmark = useCallback(
    async (bookmark: LocalBookmark) => {
      // Always save locally
      const bookmarks = getLocalBookmarks();
      const exists = bookmarks.find((b) => b.id === bookmark.id);
      if (!exists) {
        bookmarks.unshift(bookmark);
        localStorage.setItem('manhwa_bookmarks', JSON.stringify(bookmarks));
      }

      // Sync to cloud if enabled
      if (user) {
        await addCloudBookmark(user.id, bookmark);
      }
    },
    [user],
  );

  /**
   * Remove bookmark (local + cloud if enabled)
   */
  const removeBookmark = useCallback(
    async (manhwaId: string) => {
      // Always remove locally
      const bookmarks = getLocalBookmarks().filter((b) => b.id !== manhwaId);
      localStorage.setItem('manhwa_bookmarks', JSON.stringify(bookmarks));

      // Remove from cloud if enabled
      if (user) {
        await removeCloudBookmark(user.id, manhwaId);
      }
    },
    [user],
  );

  /**
   * Update reading progress (local + cloud if enabled)
   */
  const updateProgress = useCallback(
    async (progress: LocalReadingHistory) => {
      // Local update is handled by useReadingHistory hook
      // This just syncs to cloud
      if (user) {
        await updateCloudProgress(user.id, progress);
      }
    },
    [user],
  );

  /**
   * Force a manual sync
   */
  const forceSync = useCallback(async () => {
    return performFullSync();
  }, [performFullSync]);

  return {
    ...state,
    performFullSync,
    syncBookmarksOnly,
    syncProgressOnly,
    addBookmark,
    removeBookmark,
    updateProgress,
    forceSync,
  };
}
