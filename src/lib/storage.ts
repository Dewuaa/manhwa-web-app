// localStorage utility for bookmarks and reading history

export interface Bookmark {
  id: string;
  title: string;
  image: string;
  addedAt: number;
}

export interface ReadingHistory {
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage: string;
  chapterId: string;
  chapterTitle: string;
  lastReadAt: number;
}

const BOOKMARKS_KEY = 'manhwa_bookmarks';
const HISTORY_KEY = 'manhwa_reading_history';

// Bookmarks
export const getBookmarks = (): Bookmark[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addBookmark = (bookmark: Bookmark): void => {
  const bookmarks = getBookmarks();
  const exists = bookmarks.find(b => b.id === bookmark.id);
  if (!exists) {
    bookmarks.unshift(bookmark);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }
};

export const removeBookmark = (id: string): void => {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
};

export const isBookmarked = (id: string): boolean => {
  return getBookmarks().some(b => b.id === id);
};

export const toggleBookmark = (bookmark: Bookmark): boolean => {
  if (isBookmarked(bookmark.id)) {
    removeBookmark(bookmark.id);
    return false;
  } else {
    addBookmark(bookmark);
    return true;
  }
};

// Reading History
export const getReadingHistory = (): ReadingHistory[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToHistory = (entry: ReadingHistory): void => {
  let history = getReadingHistory();
  
  // Remove existing entry for this manhwa
  history = history.filter(h => h.manhwaId !== entry.manhwaId);
  
  // Add new entry at the beginning
  history.unshift(entry);
  
  // Keep only last 50 entries
  history = history.slice(0, 50);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getLastReadChapter = (manhwaId: string): ReadingHistory | null => {
  const history = getReadingHistory();
  return history.find(h => h.manhwaId === manhwaId) || null;
};

export const clearHistory = (): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
};

export const clearBookmarks = (): void => {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
};
