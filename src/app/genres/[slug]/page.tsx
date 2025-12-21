import { Metadata } from 'next';
import GenreContent from './GenreContent';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const title =
    decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1).replace(/-/g, ' ');

  return {
    title: `${title} Manga & Manhwa - Read Best ${title} Series Free`,
    description: `Discover and read the best ${title} manga and manhwa online for free. Browse our collection of ${title} webtoons with daily updates.`,
    openGraph: {
      title: `${title} Manga & Manhwa - Inkora`,
      description: `Discover and read the best ${title} manga and manhwa online for free.`,
      url: `https://inkora.spacely.tech/genres/${slug}`,
    },
    alternates: {
      canonical: `https://inkora.spacely.tech/genres/${slug}`,
    },
  };
}

export default async function GenreDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;

  return <GenreContent slug={slug} initialPage={currentPage} />;
}
