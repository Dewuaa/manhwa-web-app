import { Metadata } from 'next';
import ManhwaDetailPage from './ManhwaClientPage';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://determined-meris-inkora-f9b56664.koyeb.app';

// Server-side fetch function for metadata
async function getManhwaInfo(id: string) {
  try {
    const url = `${API_BASE_URL}/manhwa/comixto/info/${encodeURIComponent(id)}`;
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch manhwa info for metadata:', error);
    return null;
  }
}

// Generate SEO metadata on the server
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const manhwa = await getManhwaInfo(id);

  if (!manhwa) {
    return {
      title: 'Manhwa Not Found',
      description: 'The requested manhwa could not be found.',
    };
  }

  // Clean description for meta tag (remove HTML, limit length)
  const cleanDescription = manhwa.description
    ?.replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160) || 'Read this manhwa on Inkora';

  const title = manhwa.title || 'Unknown Manhwa';

  return {
    title: title,
    description: cleanDescription,
    keywords: [
      manhwa.title,
      'manga',
      'manhwa',
      'read online',
      'free manga',
      ...(manhwa.genres || []),
    ].filter(Boolean),
    openGraph: {
      title: `${title} | Inkora`,
      description: cleanDescription,
      images: manhwa.image ? [{ url: manhwa.image, width: 300, height: 450, alt: title }] : [],
      type: 'article',
      siteName: 'Inkora',
      url: `https://inkora.spacely.tech/manhwa/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Inkora`,
      description: cleanDescription,
      images: manhwa.image ? [manhwa.image] : [],
    },
    alternates: {
      canonical: `https://inkora.spacely.tech/manhwa/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Server Component - renders the client component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch data on server for initial hydration
  const initialManhwa = await getManhwaInfo(id);

  return <ManhwaDetailPage initialManhwa={initialManhwa} />;
}
