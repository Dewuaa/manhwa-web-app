import { MetadataRoute } from 'next';

const BASE_URL = 'https://inkora.spacely.tech';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://determined-meris-inkora-f9b56664.koyeb.app';

// Fetch popular/trending manga IDs for sitemap
async function fetchMangaIds(): Promise<string[]> {
  try {
    // Fetch multiple pages of trending manga to get more IDs
    const pages = [1, 2, 3];
    const allIds: string[] = [];

    for (const page of pages) {
      const response = await fetch(
        `${API_BASE_URL}/manhwa/comixto/trending?page=${page}&type=manhwa,manhua`,
        { next: { revalidate: 86400 } } // Cache for 24 hours
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        allIds.push(...results.map((m: { id: string }) => m.id));
      }
    }

    // Return unique IDs
    return [...new Set(allIds)];
  } catch (error) {
    console.error('Failed to fetch manga IDs for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/advanced-search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Genre pages - popular genres
  const genres = [
    'action',
    'adventure',
    'comedy',
    'drama',
    'fantasy',
    'horror',
    'mystery',
    'romance',
    'sci-fi',
    'slice-of-life',
    'sports',
    'supernatural',
    'thriller',
    'martial-arts',
    'isekai',
    'school-life',
    'seinen',
    'shounen',
    'shoujo',
    'josei',
    'mature',
    'adult',
    'ecchi',
    'harem',
    'historical',
    'mecha',
    'military',
    'music',
    'parody',
    'psychological',
    'tragedy',
    'wuxia',
    'manhua',
    'manhwa',
    'webtoon',
  ];

  const genrePages: MetadataRoute.Sitemap = genres.map((genre) => ({
    url: `${BASE_URL}/genres/${genre}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Dynamic manga pages from trending
  const mangaIds = await fetchMangaIds();
  const mangaPages: MetadataRoute.Sitemap = mangaIds.map((id) => ({
    url: `${BASE_URL}/manhwa/${encodeURIComponent(id)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...genrePages, ...mangaPages];
}

