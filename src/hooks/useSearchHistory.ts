import { useState, useCallback } from 'react';

const STORAGE_KEY = 'inkora_search_history';
const MAX_HISTORY = 10;

// Helper to load history from localStorage
function loadHistoryFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useSearchHistory() {
  // Use lazy initialization to avoid setState in useEffect
  const [history, setHistory] = useState<string[]>(loadHistoryFromStorage);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    const updated = [
      query,
      ...history.filter((q) => q.toLowerCase() !== query.toLowerCase()),
    ].slice(0, MAX_HISTORY);

    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeFromHistory = (query: string) => {
    const updated = history.filter((q) => q !== query);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
