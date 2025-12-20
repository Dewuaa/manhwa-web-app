import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ScrollToTop from '@/components/ScrollToTop';
import AppLayout from '@/components/AppLayout';
import QueryProvider from '@/providers/QueryProvider';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CloudSyncProvider } from '@/contexts/CloudSyncContext';
import { ListsProvider } from '@/contexts/ListsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/JsonLd';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://inkora.spacely.tech'),
  title: {
    default: 'Inkora - Read Manga & Manhwa Online Free',
    template: '%s | Inkora',
  },
  description:
    'Read manga and manhwa online for free on Inkora. Discover thousands of titles including action, romance, fantasy, and more. Updated daily with the latest chapters.',
  keywords: [
    'manga',
    'manhwa',
    'webtoon',
    'read manga online',
    'read manhwa online',
    'free manga',
    'manga reader',
    'manhwa reader',
    'korean manga',
    'action manga',
    'romance manhwa',
    'fantasy webtoon',
    'isekai manga',
    'manga online free',
    'manhwa online free',
    'webtoon free',
  ],
  authors: [{ name: 'Inkora' }],
  creator: 'Inkora',
  publisher: 'Inkora',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Inkora',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://inkora.spacely.tech',
    siteName: 'Inkora',
    title: 'Inkora - Read Manga & Manhwa Online Free',
    description:
      'Read manga and manhwa online for free. Discover thousands of titles updated daily.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Inkora - Read Manga & Manhwa Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkora - Read Manga & Manhwa Online Free',
    description:
      'Read manga and manhwa online for free. Discover thousands of titles updated daily.',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here after setting it up
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://inkora.spacely.tech',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
        <meta name="theme-color" content="#9333ea" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="shortcut icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white pb-20 md:pb-0 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <CloudSyncProvider>
              <ListsProvider>
                <NotificationProvider>
                  <ToastProvider>
                    <AppLayout>{children}</AppLayout>
                    <ScrollToTop />
                  </ToastProvider>
                </NotificationProvider>
              </ListsProvider>
            </CloudSyncProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
