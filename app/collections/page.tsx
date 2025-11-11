'use client';

import { useState, useEffect } from 'react';
import { getAllCollections, type Collection } from '@/data/collections';
import { CollectionGrid } from '@/components/CollectionGrid';
import { TabBar } from '@/components/TabBar';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading (in future this might be async API call)
    const timer = setTimeout(() => {
      setCollections(getAllCollections());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-lg border-b border-zinc-800 pt-safe shrink-0">
          <div className="px-4 md:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Collections</h1>
            <p className="text-sm md:text-base text-zinc-400 mt-1">
              Curated movie lists for every mood
            </p>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="flex-1 overflow-y-auto py-6 pb-20">
          <CollectionGrid collections={collections} isLoading={isLoading} />
        </div>

        {/* Tab Bar */}
        <div className="shrink-0">
          <TabBar />
        </div>
      </div>
    </div>
  );
}
