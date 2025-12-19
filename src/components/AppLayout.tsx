'use client';

import React from 'react';
import { NavBar } from '@/components/zenith/NavBar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide sidebar on Details and Reader pages (any route starting with /manhwa/)
  const shouldHideSidebar = pathname?.startsWith('/manhwa/');

  // Hide footer on Detail page and Reader page
  const shouldHideFooter = pathname?.startsWith('/manhwa/');

  return (
    <>
      {!shouldHideSidebar && <NavBar />}
      <div
        className={`transition-all duration-300 ${shouldHideSidebar ? '' : 'md:pl-24'}`}
      >
        {children}
        {!shouldHideFooter && <Footer />}
      </div>
    </>
  );
}
