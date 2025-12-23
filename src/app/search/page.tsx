import { Metadata } from 'next';
import SearchPageClient from '@/components/SearchPageClient';

export const metadata: Metadata = {
  title: 'Search Manga & Manhwa - Discover New Series',
  description:
    'Search and discover thousands of manga and manhwa series. Find action, romance, fantasy, and more genres. Updated daily with the latest chapters.',
  openGraph: {
    title: 'Search Manga & Manhwa - Inkora',
    description: 'Search and discover thousands of manga and manhwa series.',
    url: 'https://inkora.spacely.tech/search',
  },
  alternates: {
    canonical: 'https://inkora.spacely.tech/search',
  },
};

export default async function SearchPage() {
  // Simple page that just shows the search modal over a dark background
  return (
    <div className="min-h-screen bg-gray-950">
      <SearchPageClient />
    </div>
  );
}
