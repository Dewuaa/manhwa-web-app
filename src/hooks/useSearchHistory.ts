import { useState, useEffect } from 'react';

const STORAGE_KEY = 'inkora_search_history';
const MAX_HISTORY = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load history from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

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
