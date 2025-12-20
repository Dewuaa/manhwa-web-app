'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  ChapterNotification,
  NotificationPreferences,
  getNotifications,
  getNotificationPrefs,
  saveNotificationPrefs,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  requestNotificationPermission,
  hasNotificationPermission,
  showNewChapterNotification,
} from '@/lib/notificationService';
import { getBookmarks } from '@/lib/storage';

interface NotificationContextType {
  notifications: ChapterNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  hasPermission: boolean;

  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  requestPermission: () => Promise<boolean>;
  addNewChapterNotification: (
    manhwaId: string,
    manhwaTitle: string,
    manhwaImage: string | undefined,
    chapterTitle: string,
    chapterId: string,
  ) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<ChapterNotification[]>([]);
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(getNotificationPrefs());
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
    setHasPermission(hasNotificationPermission());
  }, []);

  const refreshNotifications = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      markNotificationRead(id);
      refreshNotifications();
    },
    [refreshNotifications],
  );

  const markAllAsRead = useCallback(() => {
    markAllNotificationsRead();
    refreshNotifications();
  }, [refreshNotifications]);

  const removeNotification = useCallback(
    (id: string) => {
      deleteNotification(id);
      refreshNotifications();
    },
    [refreshNotifications],
  );

  const clearAll = useCallback(() => {
    clearAllNotifications();
    refreshNotifications();
  }, [refreshNotifications]);

  const updatePreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      const newPrefs = { ...preferences, ...prefs };
      saveNotificationPrefs(newPrefs);
      setPreferences(newPrefs);
    },
    [preferences],
  );

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  const addNewChapterNotification = useCallback(
    (
      manhwaId: string,
      manhwaTitle: string,
      manhwaImage: string | undefined,
      chapterTitle: string,
      chapterId: string,
    ) => {
      // Check if notifications are enabled
      if (!preferences.enabled || !preferences.newChapters) return;

      // Check if this manhwa is bookmarked
      const bookmarks = getBookmarks();
      const isBookmarked = bookmarks.some((b) => b.id === manhwaId);

      if (!isBookmarked) return;

      // Add to notification list
      addNotification({
        manhwaId,
        manhwaTitle,
        manhwaImage,
        chapterTitle,
        chapterId,
      });

      // Show browser notification if permitted
      if (hasPermission) {
        showNewChapterNotification(manhwaTitle, chapterTitle, manhwaId);
      }

      refreshNotifications();
    },
    [preferences, hasPermission, refreshNotifications],
  );

  const value: NotificationContextType = {
    notifications,
    preferences,
    unreadCount,
    hasPermission,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updatePreferences,
    requestPermission,
    addNewChapterNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
