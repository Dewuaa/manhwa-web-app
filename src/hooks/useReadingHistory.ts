import { useState, useEffect, useCallback } from 'react';

export interface ReadingHistoryItem {
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage: string;
  lastChapterId: string;
  lastChapterTitle: string;
  timestamp: number;
  chaptersRead: string[]; // Array of chapter IDs read
  totalChapters?: number;
}

export interface ReadingProgress {
  manhwaId: string;
  progress: number; // Percentage 0-100
  chaptersRead: number;
  totalChapters: number;
}

const STORAGE_KEY = 'manhwa_reading_history';
const MAX_HISTORY_ITEMS = 50;

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(parsed);
        }
      } catch (error) {
        console.error('Failed to load reading history:', error);
      }
    };
    loadHistory();
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((newHistory: ReadingHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save reading history:', error);
    }
  }, []);

  // Mark a chapter as read
  const markChapterRead = useCallback((
    manhwaId: string,
    manhwaTitle: string,
    manhwaImage: string,
    chapterId: string,
    chapterTitle: string,
    totalChapters?: number
  ) => {
    setHistory((prevHistory) => {
      const existingIndex = prevHistory.findIndex((item) => item.manhwaId === manhwaId);
      
      let newHistory: ReadingHistoryItem[];
      
      if (existingIndex !== -1) {
        // Update existing entry
        const existing = prevHistory[existingIndex];
        const chaptersRead = (existing.chaptersRead || []).includes(chapterId)
          ? (existing.chaptersRead || [])
          : [...(existing.chaptersRead || []), chapterId];

        const updated: ReadingHistoryItem = {
          ...existing,
          lastChapterId: chapterId,
          lastChapterTitle: chapterTitle,
          timestamp: Date.now(),
          chaptersRead,
          totalChapters: totalChapters || existing.totalChapters,
        };

        // Move to front
        newHistory = [
          updated,
          ...prevHistory.slice(0, existingIndex),
          ...prevHistory.slice(existingIndex + 1),
        ];
      } else {
        // Create new entry
        const newItem: ReadingHistoryItem = {
          manhwaId,
          manhwaTitle,
          manhwaImage,
          lastChapterId: chapterId,
          lastChapterTitle: chapterTitle,
          timestamp: Date.now(),
          chaptersRead: [chapterId],
          totalChapters,
        };

        newHistory = [newItem, ...prevHistory];
      }

      // Limit history size
      if (newHistory.length > MAX_HISTORY_ITEMS) {
        newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      }

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save reading history:', error);
      }

      return newHistory;
    });
  }, []);

  // Get reading progress for a manhwa
  const getProgress = useCallback((manhwaId: string): ReadingProgress | null => {
    const item = history.find((h) => h.manhwaId === manhwaId);
    if (!item || !item.totalChapters) return null;

    const chaptersRead = item.chaptersRead.length;
    const progress = Math.round((chaptersRead / item.totalChapters) * 100);

    return {
      manhwaId,
      progress,
      chaptersRead,
      totalChapters: item.totalChapters,
    };
  }, [history]);

  // Get recently read manhwa
  const getRecentlyRead = useCallback((limit: number = 10): ReadingHistoryItem[] => {
    return history.slice(0, limit);
  }, [history]);

  // Check if a chapter has been read
  const isChapterRead = useCallback((manhwaId: string, chapterId: string): boolean => {
    const item = history.find((h) => h.manhwaId === manhwaId);
    return item?.chaptersRead?.includes(chapterId) || false;
  }, [history]);

  // Remove a manhwa from history
  const removeFromHistory = useCallback((manhwaId: string) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.filter((item) => item.manhwaId !== manhwaId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save reading history:', error);
      }
      return newHistory;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear reading history:', error);
    }
  }, []);

  return {
    history,
    markChapterRead,
    getProgress,
    getRecentlyRead,
    isChapterRead,
    removeFromHistory,
    clearHistory,
  };
}
