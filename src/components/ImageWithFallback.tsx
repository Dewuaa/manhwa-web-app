'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { getProxiedImageUrl } from '@/lib/api';

// Domains that require proxy due to hotlink protection
const PROXY_REQUIRED_DOMAINS = ['2xstorage.com', 'manhuaplus.top', 'manhuaus.com'];

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  showIcon?: boolean;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  showIcon = true,
  className = '',
  fill,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if this domain needs proxying
  const needsProxy = useMemo(() => {
    if (!src || typeof src !== 'string') return false;
    return PROXY_REQUIRED_DOMAINS.some((domain) => src.includes(domain));
  }, [src]);

  // Auto-proxy images from protected domains
  const processedSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return src;
    if (needsProxy) {
      return getProxiedImageUrl(src);
    }
    return src;
  }, [src, needsProxy]);

  if (error) {
    if (fallbackSrc) {
      return (
        <Image
          {...props}
          fill={fill}
          src={fallbackSrc}
          alt={alt}
          className={className}
          onError={() => setError(true)}
        />
      );
    }

    // Default fallback
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${className}`}
        style={{ width: '100%', height: '100%' }}
      >
        {showIcon && (
          <div className="flex flex-col items-center justify-center p-4">
            <BookOpen className="w-12 h-12 text-gray-600 mb-2" />
            <span className="text-xs text-gray-500 text-center">{alt}</span>
          </div>
        )}
      </div>
    );
  }

  // For proxied images, use unoptimized to bypass Next.js image optimization
  // This avoids the "private IP" error when proxy resolves to localhost
  if (needsProxy) {
    return (
      <>
        {loading && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={processedSrc as string}
          alt={alt}
          className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} ${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
      </>
    );
  }

  return (
    <>
      {loading && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}
      <Image
        {...props}
        fill={fill}
        src={processedSrc}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </>
  );
}
