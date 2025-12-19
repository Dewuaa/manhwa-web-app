'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  titleIcon?: ReactNode;
  showBack?: boolean;
  backHref?: string;
  headerRight?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function PageContainer({
  children,
  title,
  titleIcon,
  showBack = false,
  backHref,
  headerRight,
  className = '',
  noPadding = false,
}: PageContainerProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={`min-h-screen bg-[#0a0a0a] ${className}`}>
      {/* Sticky Header */}
      {(title || showBack || headerRight) && (
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              {title && (
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3"
                >
                  {titleIcon}
                  {title}
                </motion.h1>
              )}
            </div>
            {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={noPadding ? '' : 'pb-32 md:pb-12'}>{children}</div>
    </div>
  );
}
