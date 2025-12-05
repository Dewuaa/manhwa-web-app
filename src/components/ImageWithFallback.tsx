'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';

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
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    if (fallbackSrc) {
      return (
        <Image
          {...props}
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

  return (
    <>
      {loading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </>
  );
}
