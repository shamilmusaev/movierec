'use client';

import type { Collection } from '@/data/collections';
import { CollectionCard } from './CollectionCard';

interface CollectionGridProps {
  collections: Collection[];
  isLoading?: boolean;
}

export function CollectionGrid({ collections, isLoading }: CollectionGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-zinc-800 rounded-xl aspect-[3/4] mb-4" />
            <div className="h-5 bg-zinc-800 rounded mb-2 w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-bold text-white mb-2">No Collections Yet</h3>
        <p className="text-zinc-400">Check back soon for curated movie collections</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pb-24 pb-safe">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
