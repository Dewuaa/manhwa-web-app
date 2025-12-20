/**
 * Notification Service
 * Handles new chapter alerts and notification preferences
 */

import { getSupabaseClient } from './supabase/client';

// Types
export interface NotificationPreferences {
  enabled: boolean;
  newChapters: boolean;
  recommendations: boolean;
  socialUpdates: boolean;
  emailNotifications: boolean;
}

export interface ChapterNotification {
  id: string;
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage?: string;
  chapterTitle: string;
  chapterId: string;
  timestamp: number;
  read: boolean;
}

const NOTIFICATIONS_KEY = 'manhwa_notifications';
const NOTIFICATION_PREFS_KEY = 'manhwa_notification_prefs';
const LAST_CHECK_KEY = 'manhwa_last_notification_check';

// Default preferences
const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  newChapters: true,
  recommendations: true,
  socialUpdates: true,
  emailNotifications: false,
};

// ============================================
// LOCAL STORAGE OPERATIONS
// ============================================

/**
 * Get notification preferences
 */
export function getNotificationPrefs(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const data = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    return data ? { ...DEFAULT_PREFS, ...JSON.parse(data) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Save notification preferences
 */
export function saveNotificationPrefs(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

/**
 * Get all notifications
 */
export function getNotifications(): ChapterNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save notifications
 */
export function saveNotifications(notifications: ChapterNotification[]): void {
  if (typeof window === 'undefined') return;
  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
}

/**
 * Add a new notification
 */
export function addNotification(
  notification: Omit<ChapterNotification, 'id' | 'timestamp' | 'read'>,
): void {
  const notifications = getNotifications();

  // Check if notification already exists
  const exists = notifications.some(
    (n) => n.manhwaId === notification.manhwaId && n.chapterId === notification.chapterId,
  );

  if (!exists) {
    const newNotification: ChapterNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: Date.now(),
      read: false,
    };
    saveNotifications([newNotification, ...notifications]);
  }
}

/**
 * Mark notification as read
 */
export function markNotificationRead(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n,
  );
  saveNotifications(updated);
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsRead(): void {
  const notifications = getNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const filtered = notifications.filter((n) => n.id !== notificationId);
  saveNotifications(filtered);
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

/**
 * Get last check timestamp
 */
export function getLastCheckTime(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Update last check timestamp
 */
export function updateLastCheckTime(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
}

// ============================================
// PUSH NOTIFICATION SUPPORT
// ============================================

/**
 * Check if browser supports notifications
 */
export function supportsNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!supportsNotifications()) return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Check if notifications are permitted
 */
export function hasNotificationPermission(): boolean {
  if (!supportsNotifications()) return false;
  return Notification.permission === 'granted';
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions,
): void {
  if (!hasNotificationPermission()) return;

  const notification = new Notification(title, {
    icon: '/icon.png',
    badge: '/icon.png',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/**
 * Show new chapter notification
 */
export function showNewChapterNotification(
  manhwaTitle: string,
  chapterTitle: string,
  manhwaId: string,
): void {
  showBrowserNotification(`New Chapter: ${manhwaTitle}`, {
    body: chapterTitle,
    tag: `chapter-${manhwaId}`,
    data: { manhwaId },
  });
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

/**
 * Register for push notifications (requires service worker)
 */
export async function registerPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if push is supported
    if (!('pushManager' in registration)) {
      return false;
    }

    // For now, just return true if we have permission
    // Full push implementation would require a backend
    return hasNotificationPermission();
  } catch (error) {
    console.error('Failed to register push notifications:', error);
    return false;
  }
}
