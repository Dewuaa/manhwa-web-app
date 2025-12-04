'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { useGenreManhwa, usePrefetchNextPage } from '@/hooks/useApi';
import { Manhwa } from '@/lib/types';
import ManhwaCard from '@/components/ManhwaCard';
import { ManhwaGridSkeleton } from '@/components/LoadingSkeleton';
import Pagination from '@/components/Pagination';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface GenreContentProps {
  slug: string;
  initialPage?: number;
}

export default function GenreContent({ slug, initialPage = 1 }: GenreContentProps) {
  const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');
  const title = decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1);

  // Use cached genre data with React Query
  const { data, isLoading, error, refetch } = useGenreManhwa(slug, initialPage);
  const { prefetchGenre } = usePrefetchNextPage();
  
  const manhwaList = data?.results || [];
  const hasNextPage = data?.hasNextPage || false;

  // Prefetch next page for faster navigation
  useEffect(() => {
    if (hasNextPage) {
      prefetchGenre(slug, initialPage + 1);
    }
  }, [slug, initialPage, hasNextPage, prefetchGenre]);

  const handlePageChange = (newPage: number) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Note: Page navigation would typically be handled by router.push
    // For now, we'll rely on parent component to handle this
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/genres"
              className="hidden md:inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Genres
            </Link>
            
            <h1 className="text-xl font-bold text-white flex items-center capitalize">
              <Tag className="w-5 h-5 mr-2 text-red-500" />
              {title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <ManhwaGridSkeleton />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">Failed to load genre. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : manhwaList.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No manhwa found in this genre.
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {manhwaList.map((manhwa) => (
                <ManhwaCard key={manhwa.id} manhwa={manhwa} />
              ))}
            </motion.div>
            
            {/* Pagination */}
            {!isLoading && manhwaList.length > 0 && (
              <>
                <Pagination
                  currentPage={initialPage}
                  hasNextPage={hasNextPage}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
                {!hasNextPage && (
                  <div className="text-center pb-8 text-gray-500 text-sm">
                    End of results
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
