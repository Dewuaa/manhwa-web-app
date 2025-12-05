import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ScrollToTop from '@/components/ScrollToTop';
import AppLayout from '@/components/AppLayout';
import QueryProvider from '@/providers/QueryProvider';
import { ToastProvider } from '@/contexts/ToastContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // Replace with actual domain in production
  title: {
    default: 'Inkora - Read Manga & Manhwa Online',
    template: '%s | Inkora',
  },
  description:
    'Your ultimate destination for reading manga and manhwa online. Discover thousands of titles with Inkora.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Inkora',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Inkora',
    images: [
      {
        url: '/og-image.jpg', // You might want to add a default OG image to public/
        width: 1200,
        height: 630,
        alt: 'Inkora - Manga & Manhwa Reader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkora',
    description: 'Your ultimate destination for reading manga and manhwa online',
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
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white pb-20 md:pb-0 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ToastProvider>
            <AppLayout>{children}</AppLayout>
            <ScrollToTop />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
