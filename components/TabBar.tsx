'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useState, useEffect } from 'react';

export function TabBar() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();
  const [isMobile, setIsMobile] = useState(false);

  const isHome = pathname === '/';
  const isCollections = pathname?.startsWith('/collections');
  const isFavorites = pathname === '/favorites';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldHide = isMobile && scrollDirection === 'down';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 pb-safe z-30 transition-transform duration-300 ${
        shouldHide ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex justify-around items-center h-14 md:h-16 max-w-lg mx-auto">
        {/* Home Tab */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isHome ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 mb-0.5 md:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-[10px] md:text-xs font-medium">Home</span>
        </Link>

        {/* Collections Tab */}
        <Link
          href="/collections"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isCollections ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 mb-0.5 md:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-[10px] md:text-xs font-medium">Collections</span>
        </Link>

        {/* Favorites Tab */}
        <Link
          href="/favorites"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isFavorites ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 mb-0.5 md:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-[10px] md:text-xs font-medium">Favorites</span>
        </Link>
      </div>
    </div>
  );
}
