'use client';

import React from 'react';
import { NavBar } from "@/components/zenith/NavBar";
import Footer from "@/components/Footer";
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide sidebar on Details and Reader pages (any route starting with /manhwa/)
  const shouldHideSidebar = pathname?.startsWith('/manhwa/');
  
  // Hide footer on Reader page only
  const shouldHideFooter = pathname?.includes('/read/');

  return (
    <>
      {!shouldHideSidebar && <NavBar />}
      <div className={`transition-all duration-300 ${shouldHideSidebar ? '' : 'md:pl-24'}`}>
        {children}
        {!shouldHideFooter && <Footer />}
      </div>
    </>
  );
}
