'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange?: (page: number) => void;
  hrefBuilder?: (page: number) => string;
  baseUrl?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  isLoading?: boolean;
}

export default function Pagination({ 
  currentPage, 
  hasNextPage, 
  onPageChange,
  hrefBuilder,
  baseUrl,
  searchParams,
  isLoading = false 
}: PaginationProps) {
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const buildHref = (page: number) => {
    if (hrefBuilder) {
      return hrefBuilder(page);
    }
    if (baseUrl && searchParams) {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
      });
      params.set('page', page.toString());
      return `${baseUrl}?${params.toString()}`;
    }
    return '';
  };

  const renderButton = (page: number, label: React.ReactNode, disabled: boolean, icon: 'left' | 'right') => {
    const className = "flex items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors ring-1 ring-white/10";
    
    const href = buildHref(page);

    if (href && !disabled) {
      return (
        <Link href={href} className={className}>
          {icon === 'left' && <ChevronLeft className="w-5 h-5 mr-1" />}
          {label}
          {icon === 'right' && <ChevronRight className="w-5 h-5 ml-1" />}
        </Link>
      );
    }

    return (
      <button
        onClick={() => onPageChange?.(page)}
        disabled={disabled}
        className={className}
      >
        {icon === 'left' && <ChevronLeft className="w-5 h-5 mr-1" />}
        {label}
        {icon === 'right' && <ChevronRight className="w-5 h-5 ml-1" />}
      </button>
    );
  };

  return (
    <div className="flex justify-center items-center space-x-4 py-8">
      {renderButton(prevPage, 'Previous', currentPage <= 1 || isLoading, 'left')}
      
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Page</span>
        <span className="w-8 h-8 flex items-center justify-center bg-red-500 rounded-lg text-white font-bold shadow-lg shadow-red-500/20">
          {currentPage}
        </span>
      </div>

      {renderButton(nextPage, 'Next', !hasNextPage || isLoading, 'right')}
    </div>
  );
}
