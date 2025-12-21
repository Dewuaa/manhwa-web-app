'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Check if we're on Vercel or Cloudflare
const isVercel =
  process.env.NEXT_PUBLIC_VERCEL === '1' ||
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));

// Cloudflare Web Analytics token - get this from Cloudflare dashboard
// Go to: Analytics & Logs → Web Analytics → Add site → Copy the token
const CF_ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || '';

// Dynamically import Vercel Analytics only when on Vercel
export function PlatformAnalytics() {
  useEffect(() => {
    if (!isVercel && typeof window !== 'undefined') {
      console.log('[Analytics] Running on Cloudflare');
    }
  }, []);

  // On Vercel, use Vercel Analytics
  if (isVercel) {
    const VercelAnalytics = require('@vercel/analytics/react').Analytics;
    return <VercelAnalytics />;
  }

  // On Cloudflare, use Cloudflare Web Analytics
  if (CF_ANALYTICS_TOKEN) {
    return (
      <Script
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${CF_ANALYTICS_TOKEN}"}`}
        strategy="afterInteractive"
      />
    );
  }

  return null;
}

export default PlatformAnalytics;
