import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

// Detect if building for Cloudflare Pages
const isCloudflare = process.env.CF_PAGES === '1';

// Bundle analyzer config
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    // On Cloudflare, disable Next.js image optimization (use unoptimized or external service)
    // This saves you from Vercel's image optimization limits!
    unoptimized: isCloudflare,
    remotePatterns: [
      // API proxy (for images with hotlink protection)
      {
        protocol: 'https',
        hostname: 'web-production-2840b.up.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
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
      // 2xstorage CDN
      {
        protocol: 'https',
        hostname: 'img-r1.2xstorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.2xstorage.com',
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
      // Mgeko
      {
        protocol: 'https',
        hostname: 'mgeko.cc',
      },
      {
        protocol: 'https',
        hostname: '**.mgeko.cc',
      },
      {
        protocol: 'https',
        hostname: 'mgeko.com',
      },
      {
        protocol: 'https',
        hostname: '**.mgeko.com',
      },
      {
        protocol: 'https',
        hostname: 'mgeko4.com',
      },
      {
        protocol: 'https',
        hostname: '**.mgeko4.com',
      },
      {
        protocol: 'https',
        hostname: 'imgsrv4.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgsrv4.com',
      },
      // Supabase Storage (avatars)
      {
        protocol: 'https',
        hostname: 'rekqzsbvvralruplvpve.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      // API Proxy (for image proxying)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'web-production-2840b.up.railway.app',
      },
      // Comix.to
      {
        protocol: 'https',
        hostname: 'comix.to',
      },
      {
        protocol: 'https',
        hostname: '**.comix.to',
      },
      {
        protocol: 'https',
        hostname: 'static.comix.to',
      },
    ],
    qualities: [75, 90],
  },
  turbopack: {}, // Enable Turbopack compatibility
};

// Chain the plugins: bundleAnalyzer -> withPWA -> nextConfig
export default bundleAnalyzer(
  withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  })(nextConfig)
);
