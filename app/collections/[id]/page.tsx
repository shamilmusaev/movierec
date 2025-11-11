'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCollectionById, type Collection } from '@/data/collections';
import { getMovieById, getMovieVideos } from '@/lib/tmdb/client';
import type { Movie, MovieVideo } from '@/types/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { useFavorites } from '@/hooks/useFavorites';

type ExtendedMovie = Movie & { trailer: MovieVideo | null };

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const favorites = useFavorites();

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const resolvedParams = await params;
      const collectionData = getCollectionById(resolvedParams.id);
      
      if (!collectionData) {
        console.error('Collection not found');
        setIsLoading(false);
        return;
      }

      setCollection(collectionData);

      // Load movies by IDs
      const moviePromises = collectionData.movieIds.map(async (movieId) => {
        try {
          const movie = await getMovieById(movieId);
          const videos = await getMovieVideos(movieId);
          const validTrailers = videos.filter(
            v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          );
          
          return {
            ...movie,
            trailer: validTrailers[0] || null,
          };
        } catch (error) {
          console.warn(`Failed to load movie ${movieId}:`, error);
          return null;
        }
      });

      const loadedMovies = await Promise.all(moviePromises);
      const validMovies = loadedMovies.filter((m): m is ExtendedMovie => 
        m !== null && m.trailer !== null
      );

      setMovies(validMovies);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading collection:', error);
      setIsLoading(false);
    }
  };

  // Intersection Observer для отслеживания текущего видимого видео
  useEffect(() => {
    if (!containerRef.current || movies.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setCurrentIndex(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.75,
      }
    );

    const cards = containerRef.current.querySelectorAll('[data-movie-card]');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [movies.length]);

  const handleBack = () => {
    router.push('/collections');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-2">Collection Not Found</h2>
        <p className="text-zinc-400 mb-6">This collection doesn't exist</p>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
        >
          Back to Collections
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col h-screen">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-lg border-b border-zinc-800 pt-safe shrink-0">
          <div className="px-4 py-3 flex items-start gap-3">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors shrink-0 mt-0.5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Collection Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold line-clamp-2">{collection.title}</h1>
              <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                {collection.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500">
                <span>{movies.length} movies</span>
                <span>•</span>
                <span>{currentIndex + 1} / {movies.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Scroll Container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto snap-y snap-mandatory hide-scrollbar"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {movies.length === 0 ? (
            <div className="min-h-full flex items-center justify-center snap-start">
              <div className="text-center px-4">
                <p className="text-xl text-zinc-400 mb-4">No movies with trailers found</p>
                <button
                  onClick={handleBack}
                  className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  Back to Collections
                </button>
              </div>
            </div>
          ) : (
            movies.map((movie, index) => (
              <div
                key={movie.id}
                data-index={index}
                data-movie-card
                className="h-[calc(100vh-8rem)] snap-start snap-always flex items-center justify-center px-4"
                style={{ scrollSnapStop: 'always' }}
              >
                <MovieCard
                  movie={movie}
                  trailer={movie.trailer}
                  isActive={index === currentIndex}
                  isFavorite={favorites.isFavorite(movie.id)}
                  muted={muted}
                  onFavoriteToggle={() => favorites.toggle(movie.id)}
                  onMuteToggle={() => setMuted(!muted)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
