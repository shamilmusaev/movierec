'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import { useFavoriteCollections } from '@/hooks/useFavoriteCollections';
import { getMovieById } from '@/lib/tmdb/client';
import { getCollectionById, type Collection } from '@/data/collections';
import type { Movie } from '@/types/tmdb';
import { FavoriteMovieCard } from '@/components/FavoriteMovieCard';
import { CollectionCard } from '@/components/CollectionCard';
import { TabBar } from '@/components/TabBar';

type Tab = 'movies' | 'collections';

export default function FavoritesPage() {
  const favorites = useFavorites();
  const favoriteCollections = useFavoriteCollections();
  const [activeTab, setActiveTab] = useState<Tab>('movies');
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavoriteMovies();
  }, [favorites.favorites]);

  useEffect(() => {
    loadFavoriteCollections();
  }, [favoriteCollections.favoriteCollections]);

  const loadFavoriteMovies = async () => {
    if (favorites.favorites.length === 0) {
      setFavoriteMovies([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const moviePromises = favorites.favorites.map(id => getMovieById(id));
      const movies = await Promise.all(moviePromises);
      setFavoriteMovies(movies);
    } catch (error) {
      console.error('Error loading favorite movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavoriteCollections = () => {
    if (favoriteCollections.favoriteCollections.length === 0) {
      setCollections([]);
      return;
    }

    const loadedCollections = favoriteCollections.favoriteCollections
      .map(id => getCollectionById(id))
      .filter((c): c is Collection => c !== undefined);
    
    setCollections(loadedCollections);
  };

  const handleRemoveMovie = (movieId: number) => {
    favorites.remove(movieId);
  };

  const totalCount = favorites.count + favoriteCollections.count;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-zinc-800 z-10 pt-safe shrink-0">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold">Favorites</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {totalCount} item{totalCount !== 1 ? 's' : ''} saved
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'movies'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Movies ({favorites.count})
              {activeTab === 'movies' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'collections'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Collections ({favoriteCollections.count})
              {activeTab === 'collections' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'movies' ? (
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : favoriteMovies.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <svg className="w-24 h-24 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-400">No favorite movies yet</h2>
                  <p className="text-zinc-500 mb-6">Swipe right on movies you like to add them here</p>
                  <Link
                    href="/"
                    className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  >
                    Discover Movies
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favoriteMovies.map((movie) => (
                    <FavoriteMovieCard
                      key={movie.id}
                      movie={movie}
                      onRemove={() => handleRemoveMovie(movie.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <svg className="w-24 h-24 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-400">No favorite collections yet</h2>
                  <p className="text-zinc-500 mb-6">Add collections you like to keep them here</p>
                  <Link
                    href="/collections"
                    className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {collections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="shrink-0">
          <TabBar />
        </div>
      </div>
    </div>
  );
}
