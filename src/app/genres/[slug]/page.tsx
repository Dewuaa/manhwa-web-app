import { Metadata } from 'next';
import GenreContent from './GenreContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const title = decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1);
  
  return {
    title: `${title} Manhwa - Read Best ${title} Webtoons`,
    description: `Browse and read the best ${title} manhwa online for free.`,
  };
}

export default async function GenreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <GenreContent slug={slug} />;
}
