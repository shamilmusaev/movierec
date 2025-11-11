'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Collection } from '@/data/collections';
import { getMovieById, getImageUrl } from '@/lib/tmdb/client';
import type { Movie } from '@/types/tmdb';
import { useFavoriteCollections } from '@/hooks/useFavoriteCollections';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const movieCount = collection.movieIds.length;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const favoriteCollections = useFavoriteCollections();
  const isFavorite = favoriteCollections.isFavorite(collection.id);

  useEffect(() => {
    async function fetchMovies() {
      try {
        // Fetch first 4 movies for the grid
        const moviePromises = collection.movieIds
          .slice(0, 4)
          .map(id => getMovieById(id));
        const fetchedMovies = await Promise.all(moviePromises);
        setMovies(fetchedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [collection.movieIds]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteCollections.toggle(collection.id);
  };

  return (
    <Link href={`/collections/${collection.id}`}>
      <div className="group cursor-pointer transition-all duration-200 hover:scale-[0.98]">
        {/* Card Container */}
        <div className="relative bg-zinc-900 rounded-lg md:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
          {/* Cover Image - More compact for mobile */}
          <div className="relative w-full aspect-[2/3] md:aspect-[3/4] bg-zinc-800">
            {/* Movie Posters Grid */}
            {!isLoading && movies.length > 0 ? (
              <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5">
                {movies.map((movie, index) => (
                  <div key={movie.id} className="relative w-full h-full bg-zinc-700 rounded-sm overflow-hidden">
                    {movie.poster_path ? (
                      <Image
                        src={getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <span className="text-zinc-600 text-2xl">🎬</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Placeholder gradient while loading */}
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
              </>
            )}

            {/* Favorite Button - top right - smaller on mobile */}
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-colors z-10"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Bottom Overlay with Info - more compact on mobile */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-sm p-2 md:p-4">
              <div className="flex items-center justify-between">
                {/* Left: Collection Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-lg font-bold text-white line-clamp-1 mb-0.5 md:mb-1">
                    {collection.title}
                  </h3>
                  <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-zinc-300 flex-wrap">
                    <span className="flex items-center gap-0.5 md:gap-1">
                      <span className="text-xs md:text-sm">🎬</span>
                      <span className="whitespace-nowrap">{movieCount}</span>
                    </span>
                    <span className="flex items-center gap-0.5 md:gap-1">
                      <span className="text-xs md:text-sm">❤️</span>
                      <span className="whitespace-nowrap">{collection.likes || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Play Button - smaller on mobile */}
            <div className="absolute bottom-12 md:bottom-20 right-2 md:right-4">
              <button
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all hover:scale-110 active:scale-95 shadow-xl"
                onClick={(e) => {
                  e.preventDefault();
                  // Play action will be handled by Link
                }}
              >
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-black ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
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
