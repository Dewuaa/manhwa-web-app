'use client';

import { useEffect } from 'react';

// Check if we're on Vercel or Cloudflare
const isVercel =
  process.env.NEXT_PUBLIC_VERCEL === '1' ||
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));

// Dynamically import Vercel Analytics only when on Vercel
export function PlatformAnalytics() {
  useEffect(() => {
    // If on Cloudflare, use Cloudflare Web Analytics
    if (!isVercel && typeof window !== 'undefined') {
      // Cloudflare Web Analytics beacon (add your token in Cloudflare dashboard)
      // The script is automatically injected by Cloudflare when you enable Web Analytics
      console.log('[Analytics] Running on Cloudflare');
    }
  }, []);

  // On Vercel, use Vercel Analytics
  if (isVercel) {
    // Dynamically import to avoid issues on Cloudflare
    const VercelAnalytics = require('@vercel/analytics/react').Analytics;
    return <VercelAnalytics />;
  }

  // On Cloudflare, analytics is injected automatically via dashboard
  return null;
}

export default PlatformAnalytics;
