'use client';

import { useState, useEffect, useRef } from 'react';
import type { Movie, MovieVideo, Genre } from '@/types/tmdb';
import {
  getPopularMovies,
  getMovieVideos,
  getGenres,
  getMoviesByGenre,
  getImageUrl,
} from '@/lib/tmdb/client';
import { useFavorites } from '@/hooks/useFavorites';
import { MovieCard } from '@/components/MovieCard';
import { CategoryTabs } from '@/components/CategoryTabs';
import { TabBar } from '@/components/TabBar';

type ExtendedMovie = Movie & { trailer: MovieVideo | null };

export default function Home() {
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<(Genre | { id: string; name: string })[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | number>('popular');
  const [muted, setMuted] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const favorites = useFavorites();

  // Load genres on mount
  useEffect(() => {
    loadGenres();
  }, []);

  // Load movies when category changes
  useEffect(() => {
    loadMovies();
  }, [activeCategory]);

  const loadGenres = async () => {
    try {
      const genresList = await getGenres();
      setCategories([
        { id: 'popular', name: 'Top Choices' },
        ...genresList.slice(0, 6), // Limit to first 6 genres
      ]);
    } catch (error) {
      console.error('Error loading genres:', error);
      setCategories([{ id: 'popular', name: 'Top Choices' }]);
    }
  };

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const moviesList =
        activeCategory === 'popular'
          ? await getPopularMovies()
          : await getMoviesByGenre(activeCategory as number);

      // Load trailers for first 20 movies
      const moviesWithTrailers = await Promise.all(
        moviesList.slice(0, 20).map(async (movie) => {
          try {
            const videos = await getMovieVideos(movie.id);
            // Фильтруем только YouTube видео типа Trailer
            const validTrailers = videos.filter(
              v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
            );
            return {
              ...movie,
              trailer: validTrailers[0] || null,
            };
          } catch (error) {
            console.warn(`Failed to load trailers for movie ${movie.id}:`, error);
            return {
              ...movie,
              trailer: null,
            };
          }
        })
      );

      // Filter out movies without valid trailers
      const validMovies = moviesWithTrailers.filter(
        (movie) => movie.trailer !== null && movie.trailer.key && movie.trailer.key.length > 0
      );

      console.log(`Loaded ${moviesWithTrailers.length} movies, ${validMovies.length} have valid trailers`);

      // Randomize movie order for variety
      const shuffledMovies = validMovies.sort(() => Math.random() - 0.5);

      // If we don't have enough valid trailers, we could load more (future enhancement)
      if (shuffledMovies.length < 5) {
        console.warn('Not enough movies with trailers, consider loading more');
      }

      setMovies(shuffledMovies);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
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
            
            // Загружаем больше видео когда приближаемся к концу
            if (index >= movies.length - 3) {
              loadMovies();
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.75, // 75% видимости
      }
    );

    // Наблюдаем за всеми карточками
    const cards = containerRef.current.querySelectorAll('[data-movie-card]');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [movies.length]);

  const handleFavoriteToggle = (movieId: number) => {
    favorites.toggle(movieId);
  };

  const handleCategoryChange = (categoryId: string | number) => {
    setActiveCategory(categoryId);
  };

  const currentMovie = movies[currentIndex];
  const backgroundImage = currentMovie?.backdrop_path
    ? getImageUrl(currentMovie.backdrop_path, 'w780')
    : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Category Tabs with safe-area */}
        <div className="pt-safe shrink-0">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Main Scroll Snap Container - TikTok style */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto snap-y snap-mandatory hide-scrollbar"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
            touchAction: 'pan-y', // Only vertical scrolling
          }}
        >
          {isLoading ? (
            <div className="min-h-full flex items-center justify-center snap-start">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : movies.length === 0 ? (
            <div className="min-h-full flex items-center justify-center snap-start">
              <div className="text-center">
                <p className="text-xl text-zinc-400">No movies found</p>
                <button
                  onClick={loadMovies}
                  className="mt-4 px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            movies.map((movie, index) => (
              <div
                key={movie.id}
                data-index={index}
                data-movie-card
                className="h-screen snap-start snap-always flex items-center justify-center"
                style={{ scrollSnapStop: 'always' }}
              >
                <MovieCard
                  movie={movie}
                  trailer={movie.trailer}
                  isActive={index === currentIndex}
                  isFavorite={favorites.isFavorite(movie.id)}
                  muted={muted}
                  onFavoriteToggle={() => handleFavoriteToggle(movie.id)}
                  onMuteToggle={() => setMuted(!muted)}
                />
              </div>
            ))
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
