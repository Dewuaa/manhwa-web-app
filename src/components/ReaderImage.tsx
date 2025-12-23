'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getProxiedImageUrl } from '@/lib/api';

interface ReaderImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

/**
 * Optimized image component for the manga reader.
 * Uses Next.js Image for better quality and performance.
 */
export default function ReaderImage({ src, alt, priority = false, className = '' }: ReaderImageProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const proxiedUrl = getProxiedImageUrl(src);
  
  // Get container width for responsive sizing
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth || 800;
      // Estimate height based on typical manga page ratio (roughly 1.4x height)
      setDimensions({ width, height: Math.round(width * 1.4) });
    }
  }, []);

  if (error) {
    // Fallback to regular img on error
    return (
      <div ref={containerRef} className="w-full relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxiedUrl}
          alt={alt}
          className={`w-full h-auto block select-none ${className}`}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Loading placeholder */}
      {!loaded && (
        <div 
          className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center"
          style={{ minHeight: '400px' }}
        >
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={proxiedUrl}
        alt={alt}
        width={dimensions.width || 800}
        height={dimensions.height || 1120}
        quality={90}
        priority={priority}
        className={`w-full h-auto block select-none transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        unoptimized={false}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
}
