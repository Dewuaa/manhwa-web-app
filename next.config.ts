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
      // Localhost for development
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      // Railway API
      { protocol: 'https', hostname: 'web-production-2840b.up.railway.app' },
      // Asura Comics
      { protocol: 'https', hostname: '**.asuracomic.net' },
      // WeebCentral
      { protocol: 'https', hostname: '**.weebcentral.com' },
      // ComicK CDNs
      { protocol: 'https', hostname: '**.compsci88.com' },
      { protocol: 'https', hostname: '**.planeptune.us' },
      { protocol: 'https', hostname: '**.lowee.us' },
      { protocol: 'https', hostname: '**.2xstorage.com' },
      { protocol: 'https', hostname: '**.comick.art' },
      { protocol: 'https', hostname: '**.comick.pictures' },
      { protocol: 'https', hostname: '**.comicknew.pictures' },
      // MangaDex
      { protocol: 'https', hostname: '**.mangadex.org' },
      // ManhuaPlus
      { protocol: 'https', hostname: '**.manhuaplus.top' },
      { protocol: 'https', hostname: '**.manhuaplus.com' },
      { protocol: 'https', hostname: '**.manhuaplus.us' },
      { protocol: 'https', hostname: '**.manhuaplus.cc' },
      // ManhuaUS (legacy)
      { protocol: 'https', hostname: '**.manhuaus.com' },
      // Mgeko
      { protocol: 'https', hostname: '**.mgeko.cc' },
      { protocol: 'https', hostname: '**.mgeko.com' },
      { protocol: 'https', hostname: '**.mgeko4.com' },
      { protocol: 'https', hostname: '**.imgsrv4.com' },
      // Supabase Storage
      { protocol: 'https', hostname: '**.supabase.co' },
      // Comix.to
      { protocol: 'https', hostname: '**.comix.to' },
      // Cloudflare Workers
      { protocol: 'https', hostname: '**.workers.dev' },
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
