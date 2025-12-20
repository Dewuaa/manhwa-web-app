'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fullSync,
  addCloudBookmark,
  removeCloudBookmark,
  updateCloudProgress,
  getLastSyncTime,
  isSyncNeeded,
  getLocalBookmarks,
  saveLocalBookmarks,
  getLocalHistory,
  saveLocalHistory,
} from '@/lib/cloudSync';
import { LocalBookmark, LocalReadingHistory } from '@/lib/supabase/types';

interface CloudSyncContextType {
  // State
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
  isEnabled: boolean;

  // Actions
  forceSync: () => Promise<void>;

  // Bookmark operations (handles both local and cloud)
  addBookmark: (bookmark: LocalBookmark) => Promise<void>;
  removeBookmark: (manhwaId: string) => Promise<void>;
  isBookmarked: (manhwaId: string) => boolean;
  getBookmarks: () => LocalBookmark[];
  toggleBookmark: (bookmark: LocalBookmark) => Promise<boolean>;

  // Progress operations (handles both local and cloud)
  updateProgress: (progress: LocalReadingHistory) => Promise<void>;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export function CloudSyncProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<LocalBookmark[]>([]);

  const syncInProgressRef = useRef(false);
  const initialSyncDoneRef = useRef(false);

  const isEnabled = Boolean(user && isConfigured);

  // Load bookmarks on mount
  useEffect(() => {
    setBookmarks(getLocalBookmarks());
    setLastSyncTime(getLastSyncTime());
  }, []);

  // Perform initial sync when user logs in
  useEffect(() => {
    if (isEnabled && !initialSyncDoneRef.current) {
      initialSyncDoneRef.current = true;
      if (isSyncNeeded()) {
        performFullSync();
      }
    }
  }, [isEnabled]);

  // Auto-sync on window focus
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

  // Listen for sync complete events to refresh local state
  useEffect(() => {
    const handleSyncComplete = () => {
      setBookmarks(getLocalBookmarks());
    };

    window.addEventListener('cloudSyncComplete', handleSyncComplete);
    return () => window.removeEventListener('cloudSyncComplete', handleSyncComplete);
  }, []);

  const performFullSync = useCallback(async () => {
    if (!user || syncInProgressRef.current) return;

    syncInProgressRef.current = true;
    setIsSyncing(true);
    setError(null);

    try {
      const result = await fullSync(user.id);
      setLastSyncTime(Date.now());

      if (result.errors.length > 0) {
        setError(result.errors.join('; '));
      }

      // Refresh local bookmarks after sync
      setBookmarks(getLocalBookmarks());

      // Dispatch event
      window.dispatchEvent(new CustomEvent('cloudSyncComplete', { detail: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
      syncInProgressRef.current = false;
    }
  }, [user]);

  const addBookmarkHandler = useCallback(
    async (bookmark: LocalBookmark) => {
      // Update local state
      const currentBookmarks = getLocalBookmarks();
      const exists = currentBookmarks.find((b) => b.id === bookmark.id);

      if (!exists) {
        const newBookmarks = [bookmark, ...currentBookmarks];
        saveLocalBookmarks(newBookmarks);
        setBookmarks(newBookmarks);
      }

      // Sync to cloud if enabled
      if (user) {
        await addCloudBookmark(user.id, bookmark);
      }
    },
    [user],
  );

  const removeBookmarkHandler = useCallback(
    async (manhwaId: string) => {
      // Update local state
      const newBookmarks = getLocalBookmarks().filter((b) => b.id !== manhwaId);
      saveLocalBookmarks(newBookmarks);
      setBookmarks(newBookmarks);

      // Sync to cloud if enabled
      if (user) {
        await removeCloudBookmark(user.id, manhwaId);
      }
    },
    [user],
  );

  const isBookmarkedHandler = useCallback(
    (manhwaId: string): boolean => {
      return bookmarks.some((b) => b.id === manhwaId);
    },
    [bookmarks],
  );

  const getBookmarksHandler = useCallback((): LocalBookmark[] => {
    return bookmarks;
  }, [bookmarks]);

  const toggleBookmarkHandler = useCallback(
    async (bookmark: LocalBookmark): Promise<boolean> => {
      const wasBookmarked = isBookmarkedHandler(bookmark.id);

      if (wasBookmarked) {
        await removeBookmarkHandler(bookmark.id);
        return false;
      } else {
        await addBookmarkHandler(bookmark);
        return true;
      }
    },
    [isBookmarkedHandler, removeBookmarkHandler, addBookmarkHandler],
  );

  const updateProgressHandler = useCallback(
    async (progress: LocalReadingHistory) => {
      // Local update is handled by useReadingHistory hook
      // This syncs to cloud
      if (user) {
        await updateCloudProgress(user.id, progress);
      }
    },
    [user],
  );

  const value: CloudSyncContextType = {
    isSyncing,
    lastSyncTime,
    error,
    isEnabled,
    forceSync: performFullSync,
    addBookmark: addBookmarkHandler,
    removeBookmark: removeBookmarkHandler,
    isBookmarked: isBookmarkedHandler,
    getBookmarks: getBookmarksHandler,
    toggleBookmark: toggleBookmarkHandler,
    updateProgress: updateProgressHandler,
  };

  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloudSyncContext() {
  const context = useContext(CloudSyncContext);
  if (context === undefined) {
    throw new Error('useCloudSyncContext must be used within a CloudSyncProvider');
  }
  return context;
}
