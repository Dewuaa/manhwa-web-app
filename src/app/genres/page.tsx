import { Metadata } from 'next';
import GenresPageClient from './GenresPageClient';

export const metadata: Metadata = {
  title: 'Browse All Genres - Manga & Manhwa Categories',
  description:
    'Browse manga and manhwa by genre. Find action, romance, fantasy, comedy, horror, mystery, and more. Discover your next favorite series on Inkora.',
  openGraph: {
    title: 'Browse All Genres - Inkora',
    description:
      'Browse manga and manhwa by genre. Find action, romance, fantasy, comedy, and more.',
    url: 'https://inkora.spacely.tech/genres',
  },
  alternates: {
    canonical: 'https://inkora.spacely.tech/genres',
  },
};

export default function GenresPage() {
  return <GenresPageClient />;
}
