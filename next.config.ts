import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gg.asuracomic.net',
      },
      {
        protocol: 'https',
        hostname: 'asuracomic.net',
      },
      {
        protocol: 'https',
        hostname: 'weebcentral.com',
      },
      {
        protocol: 'https',
        hostname: '**.weebcentral.com',
      },
      {
        protocol: 'https',
        hostname: 'terna.compaci88.com',
      },
      {
        protocol: 'https',
        hostname: 'temp.compsci88.com',
      },
      {
        protocol: 'https',
        hostname: '**.compsci88.com',
      },
      {
        protocol: 'https',
        hostname: 'hot.planeptune.us',
      },
      {
        protocol: 'https',
        hostname: '**.planeptune.us',
      },
      {
        protocol: 'https',
        hostname: 'official.lowee.us',
      },
      {
        protocol: 'https',
        hostname: '**.lowee.us',
      },
      // ComicK image CDNs
      {
        protocol: 'https',
        hostname: 'comick.art',
      },
      {
        protocol: 'https',
        hostname: '**.comick.art',
      },
      {
        protocol: 'https',
        hostname: 'meo.comick.pictures',
      },
      {
        protocol: 'https',
        hostname: '**.comick.pictures',
      },
      {
        protocol: 'https',
        hostname: 'comicknew.pictures',
      },
      {
        protocol: 'https',
        hostname: '**.comicknew.pictures',
      },
      // MangaDex
      {
        protocol: 'https',
        hostname: 'mangadex.org',
      },
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
      },
      {
        protocol: 'https',
        hostname: '**.mangadex.org',
      },
      // ManhuaPlus
      {
        protocol: 'https',
        hostname: 'manhuaplus.top',
      },
      {
        protocol: 'https',
        hostname: '**.manhuaplus.top',
      },
      {
        protocol: 'https',
        hostname: 'manhuaplus.com',
      },
      {
        protocol: 'https',
        hostname: '**.manhuaplus.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.manhuaplus.us',
      },
      {
        protocol: 'https',
        hostname: '**.manhuaplus.us',
      },
      {
        protocol: 'https',
        hostname: 'cdn.manhuaplus.cc',
      },
      {
        protocol: 'https',
        hostname: '**.manhuaplus.cc',
      },
      // ManhuaUS (legacy - for old bookmarks)
      {
        protocol: 'https',
        hostname: 'manhuaus.com',
      },
      {
        protocol: 'https',
        hostname: '**.manhuaus.com',
      },
    ],
  },
  turbopack: {}, // Enable Turbopack compatibility
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
