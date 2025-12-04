'use client';

import { useState, useEffect, useCallback } from 'react';

interface EngagementData {
  [manhwaId: string]: {
    viewCount: number;
    bookmarkCount: number;
    lastViewed: number;
    readCount: number;
  };
}

const STORAGE_KEY = 'manhwa_engagement';
const ENGAGEMENT_WINDOW_DAYS = 7; // Only count engagement from last 7 days

export function useEngagement() {
  const [engagement, setEngagement] = useState<EngagementData>({});

  // Load engagement data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEngagement(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    }
  }, []);

  // Save engagement data
  const saveEngagement = useCallback((data: EngagementData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setEngagement(data);
    } catch (error) {
      console.error('Failed to save engagement data:', error);
    }
  }, []);

  // Track view
  const trackView = useCallback((manhwaId: string) => {
    setEngagement((prev) => {
      const updated = {
        ...prev,
        [manhwaId]: {
          viewCount: (prev[manhwaId]?.viewCount || 0) + 1,
          bookmarkCount: prev[manhwaId]?.bookmarkCount || 0,
          lastViewed: Date.now(),
          readCount: prev[manhwaId]?.readCount || 0,
        },
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save engagement:', error);
      }
      
      return updated;
    });
  }, []);

  // Track bookmark
  const trackBookmark = useCallback((manhwaId: string, isBookmarked: boolean) => {
    setEngagement((prev) => {
      const updated = {
        ...prev,
        [manhwaId]: {
          viewCount: prev[manhwaId]?.viewCount || 0,
          bookmarkCount: isBookmarked ? 1 : 0,
          lastViewed: prev[manhwaId]?.lastViewed || Date.now(),
          readCount: prev[manhwaId]?.readCount || 0,
        },
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save engagement:', error);
      }
      
      return updated;
    });
  }, []);

  // Track read
  const trackRead = useCallback((manhwaId: string) => {
    setEngagement((prev) => {
      const updated = {
        ...prev,
        [manhwaId]: {
          viewCount: prev[manhwaId]?.viewCount || 0,
          bookmarkCount: prev[manhwaId]?.bookmarkCount || 0,
          lastViewed: prev[manhwaId]?.lastViewed || Date.now(),
          readCount: (prev[manhwaId]?.readCount || 0) + 1,
        },
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save engagement:', error);
      }
      
      return updated;
    });
  }, []);

  // Calculate trending score
  const getTrendingScore = useCallback((manhwaId: string): number => {
    const data = engagement[manhwaId];
    if (!data) return 0;

    // Check if within engagement window
    const daysSinceView = (Date.now() - data.lastViewed) / (1000 * 60 * 60 * 24);
    if (daysSinceView > ENGAGEMENT_WINDOW_DAYS) return 0;

    // Weighted scoring
    const viewScore = data.viewCount * 1.0;
    const bookmarkScore = data.bookmarkCount * 3.0;
    const readScore = data.readCount * 2.0;
    
    // Recency bonus (more recent = higher score)
    const recencyBonus = Math.max(0, (ENGAGEMENT_WINDOW_DAYS - daysSinceView) / ENGAGEMENT_WINDOW_DAYS);

    return (viewScore + bookmarkScore + readScore) * (1 + recencyBonus);
  }, [engagement]);

  // Get trending manhwa IDs sorted by score
  const getTrendingIds = useCallback((): string[] => {
    const scores = Object.keys(engagement).map((id) => ({
      id,
      score: getTrendingScore(id),
    }));

    return scores
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.id);
  }, [engagement, getTrendingScore]);

  return {
    engagement,
    trackView,
    trackBookmark,
    trackRead,
    getTrendingScore,
    getTrendingIds,
  };
}
