'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface ManhwaLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * A custom Link component for navigating to manhwa detail pages.
 * Automatically saves the current URL to sessionStorage so the
 * detail page's back button can return to the correct origin.
 */
export function ManhwaLink({ href, children, className, onClick }: ManhwaLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only save origin if we're not already on a manhwa detail or reader page
    if (!pathname.includes('/manhwa/') || pathname.includes('/genres/') || pathname.includes('/search')) {
      const currentUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      sessionStorage.setItem('manhwa_back_origin', currentUrl);
    }
    
    onClick?.(e);
  }, [pathname, searchParams, onClick]);

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

/**
 * Utility function to save origin before programmatic navigation
 */
export function saveNavigationOrigin() {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname + window.location.search;
    // Only save if not on manhwa detail or reader page
    if (!currentPath.includes('/manhwa/') || currentPath.includes('/genres/') || currentPath.includes('/search')) {
      sessionStorage.setItem('manhwa_back_origin', currentPath);
    }
  }
}
