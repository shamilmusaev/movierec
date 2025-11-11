'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import type { Movie } from '@/types/tmdb';

export default function FavoritesPage() {
  const favorites = useFavorites();
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavoriteMovies();
  }, [favorites.favorites]);

  const loadFavoriteMovies = async () => {
    if (favorites.favorites.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    // For MVP, we'll just show the IDs. In production, fetch full movie data
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-zinc-800 z-10 pt-safe">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {favorites.count} movie{favorites.count !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {favorites.favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <svg className="w-24 h-24 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-zinc-400">No favorites yet</h2>
            <p className="text-zinc-500 mb-6">Swipe right on movies you like to add them here</p>
            <Link
              href="/"
              className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
            >
              Discover Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.favorites.map((movieId) => (
              <div key={movieId} className="bg-zinc-900 rounded-lg p-4 text-center">
                <p className="text-sm text-zinc-400">Movie ID: {movieId}</p>
                <button
                  onClick={() => favorites.remove(movieId)}
                  className="mt-2 text-xs text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
