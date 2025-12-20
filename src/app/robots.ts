import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/callback', '/profile', '/bookmarks', '/history'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/callback', '/profile', '/bookmarks', '/history'],
      },
    ],
    sitemap: 'https://inkora.spacely.tech/sitemap.xml',
  };
}
