'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/data/collections';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const movieCount = collection.movieIds.length;
  
  // Use first movie ID as cover (will need to fetch poster later)
  const coverMovieId = collection.movieIds[0];

  return (
    <Link href={`/collections/${collection.id}`}>
      <div className="group cursor-pointer transition-all duration-200 hover:scale-[0.98]">
        {/* Card Container */}
        <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
          {/* Cover Image - 3:4 aspect ratio */}
          <div className="relative w-full aspect-[3/4] bg-zinc-800">
            {/* Placeholder gradient for now */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, 
                  ${getThemeColor(collection.theme)}20 0%, 
                  ${getThemeColor(collection.theme)}40 100%)`
              }}
            />
            
            {/* Collection Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/20 text-8xl font-bold">
                {getThemeEmoji(collection.theme)}
              </div>
            </div>

            {/* Movie Count Badge */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-semibold text-white">
                {movieCount} 🎬
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-white line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
              {collection.title}
            </h3>
            <p className="text-sm text-zinc-400 line-clamp-2">
              {collection.tagline}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Helper functions for theming
function getThemeColor(theme: Collection['theme']): string {
  const colors: Record<Collection['theme'], string> = {
    inspirational: '#10B981', // green
    dark: '#8B5CF6',          // purple
    comedy: '#F59E0B',        // amber
    action: '#EF4444',        // red
    scifi: '#3B82F6',         // blue
    romantic: '#EC4899',      // pink
    thriller: '#6366F1',      // indigo
    drama: '#14B8A6',         // teal
    oscar: '#FBBF24',         // yellow
    hidden: '#8B5CF6',        // purple
  };
  return colors[theme] || '#6B7280';
}

function getThemeEmoji(theme: Collection['theme']): string {
  const emojis: Record<Collection['theme'], string> = {
    inspirational: '✨',
    dark: '🌑',
    comedy: '😂',
    action: '💥',
    scifi: '🚀',
    romantic: '💕',
    thriller: '🔪',
    drama: '🎭',
    oscar: '🏆',
    hidden: '💎',
  };
  return emojis[theme] || '🎬';
}
