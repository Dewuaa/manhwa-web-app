import type { NextConfig } from 'next';

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
      // ManhuaUS
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
};

export default nextConfig;
