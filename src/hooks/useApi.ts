import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manhwaAPI } from '@/lib/api';
import type { AdvancedSearchOptions } from '@/lib/api';

// Latest Manhwa Hook
export function useLatestManhwa(page: number = 1) {
  return useQuery({
    queryKey: ['latest-manhwa', page],
    queryFn: () => manhwaAPI.getLatestManhwa(page),
    staleTime: 1000 * 60 * 2, // 2 minutes for latest updates
  });
}

// Genres Hook
export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const genres = await manhwaAPI.getGenres();
      return genres || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - genres rarely change
  });
}

// Manhwa Info Hook
export function useManhwaInfo(id: string) {
  return useQuery({
    queryKey: ['manhwa-info', id],
    queryFn: () => manhwaAPI.getManhwaInfo(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!id,
  });
}

// Genre Hook
export function useGenreManhwa(slug: string, page: number = 1) {
  return useQuery({
    queryKey: ['genre', slug, page],
    queryFn: () => manhwaAPI.getGenre(slug, page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!slug,
  });
}

// Advanced Search Hook
export function useAdvancedSearch(options: AdvancedSearchOptions) {
  return useQuery({
    queryKey: ['advanced-search', options],
    queryFn: () => manhwaAPI.advancedSearch(options),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Chapter Pages Hook
export function useChapterPages(chapterId: string) {
  return useQuery({
    queryKey: ['chapter-pages', chapterId],
    queryFn: () => manhwaAPI.getChapterPages(chapterId),
    staleTime: 1000 * 60 * 15, // 15 minutes - chapter pages don't change
    enabled: !!chapterId,
  });
}

// Prefetch helpers for pagination
export function usePrefetchNextPage() {
  const queryClient = useQueryClient();

  return {
    prefetchLatest: (nextPage: number) => {
      queryClient.prefetchQuery({
        queryKey: ['latest-manhwa', nextPage],
        queryFn: () => manhwaAPI.getLatestManhwa(nextPage),
      });
    },
    prefetchGenre: (slug: string, nextPage: number) => {
      queryClient.prefetchQuery({
        queryKey: ['genre', slug, nextPage],
        queryFn: () => manhwaAPI.getGenre(slug, nextPage),
      });
    },
    prefetchSearch: (options: AdvancedSearchOptions) => {
      queryClient.prefetchQuery({
        queryKey: ['advanced-search', options],
        queryFn: () => manhwaAPI.advancedSearch(options),
      });
    },
  };
}
