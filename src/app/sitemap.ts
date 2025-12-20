import { MetadataRoute } from 'next';

const BASE_URL = 'https://inkora.spacely.tech';

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

  return [...staticPages, ...genrePages];
}
