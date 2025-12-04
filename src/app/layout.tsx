import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import BottomNav from "@/components/BottomNav";
import QueryProvider from "@/providers/QueryProvider";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // Replace with actual domain in production
  title: {
    default: "Manhwa Reader - Browse & Read Korean Webtoons",
    template: "%s | Manhwa Reader"
  },
  description: "Browse and read your favorite Korean manhwa from AsuraScans and WeebCentral",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Manhwa Reader',
    images: [
      {
        url: '/og-image.jpg', // You might want to add a default OG image to public/
        width: 1200,
        height: 630,
        alt: 'Manhwa Reader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manhwa Reader',
    description: 'Browse and read your favorite Korean manhwa',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground pb-16 md:pb-0`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ToastProvider>
            {children}
            <ScrollToTop />
            <BottomNav />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
