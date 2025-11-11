'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Movie, MovieVideo, Genre } from '@/types/tmdb';
import {
  getPopularMovies,
  getMovieVideos,
  getGenres,
  getMoviesByGenre,
  getImageUrl,
} from '@/lib/tmdb/client';
import { useFavorites } from '@/hooks/useFavorites';
import { useSwipe } from '@/hooks/useSwipe';
import { MovieCard } from '@/components/MovieCard';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SwipeFeedback } from '@/components/SwipeFeedback';
import { TabBar } from '@/components/TabBar';

type ExtendedMovie = Movie & { trailer: MovieVideo | null };

export default function Home() {
  const [movies, setMovies] = useState<ExtendedMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<(Genre | { id: string; name: string })[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | number>('popular');
  const [muted, setMuted] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'favorites'>('home');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackDirection, setFeedbackDirection] = useState<'left' | 'right' | null>(null);

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

      // Load trailers for first 5 movies
      const moviesWithTrailers = await Promise.all(
        moviesList.slice(0, 20).map(async (movie) => {
          try {
            const videos = await getMovieVideos(movie.id);
            return {
              ...movie,
              trailer: videos[0] || null,
            };
          } catch (error) {
            return {
              ...movie,
              trailer: null,
            };
          }
        })
      );

      setMovies(moviesWithTrailers);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextMovie = () => {
    if (currentIndex < movies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadMovies(); // Load more when reaching end
    }
  };

  const handleSwipeLeft = () => {
    setFeedbackDirection('left');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 500);
    goToNextMovie();
  };

  const handleSwipeRight = () => {
    const currentMovie = movies[currentIndex];
    if (currentMovie) {
      favorites.add(currentMovie.id);
    }

    setFeedbackDirection('right');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 500);
    goToNextMovie();
  };

  const handleVideoEnd = () => {
    // Auto-advance to next video when current one ends
    goToNextMovie();
  };

  const { swipeState, handlers } = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 80, // Lower threshold for more responsive swipes
  });

  const handleCategoryChange = (categoryId: string | number) => {
    setActiveCategory(categoryId);
  };

  const currentMovie = movies[currentIndex];
  const backgroundImage = currentMovie?.backdrop_path
    ? getImageUrl(currentMovie.backdrop_path, 'w780')
    : null;

  if (activeTab === 'favorites') {
    return <FavoritesView onBack={() => setActiveTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Blurred Background */}
      {backgroundImage && (
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center blur-3xl scale-110"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Category Tabs */}
        <div className="pt-safe">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Main Swipe Area */}
        <div className="flex-1 flex items-center justify-center px-0 pb-16 md:pb-20">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center">
              <p className="text-xl text-zinc-400">No movies found</p>
              <button
                onClick={loadMovies}
                className="mt-4 px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                {currentMovie && (
                  <MovieCard
                    key={currentMovie.id}
                    movie={currentMovie}
                    trailer={currentMovie.trailer}
                    isActive={true}
                    isFavorite={favorites.isFavorite(currentMovie.id)}
                    muted={muted}
                    onFavoriteToggle={() => favorites.toggle(currentMovie.id)}
                    onMuteToggle={() => setMuted(!muted)}
                    onVideoEnd={handleVideoEnd}
                    dragHandlers={handlers}
                  />
                )}
              </AnimatePresence>

              {/* Swipe Indicators */}
              {swipeState.isDragging && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: swipeState.direction === 'left' ? swipeState.distance / 100 : 0,
                    }}
                    className="text-red-500 text-6xl font-bold"
                  >
                    ✕
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: swipeState.direction === 'right' ? swipeState.distance / 100 : 0,
                    }}
                    className="text-green-500 text-6xl font-bold"
                  >
                    ♥
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Swipe Feedback */}
      <SwipeFeedback direction={feedbackDirection} show={showFeedback} />
    </div>
  );
}

// Favorites View Component
function FavoritesView({ onBack }: { onBack: () => void }) {
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

    setIsLoading(true);
    // For MVP, we'll just show the IDs. In production, fetch full movie data
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-zinc-800 z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Favorites</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4">
        {favorites.favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <svg className="w-24 h-24 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-zinc-400">No favorites yet</h2>
            <p className="text-zinc-500">Swipe right on movies you like to add them here</p>
          </div>
        ) : (
          <div>
            <p className="text-zinc-400 mb-4">{favorites.count} favorite{favorites.count !== 1 ? 's' : ''}</p>
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
          </div>
        )}
      </div>

      <TabBar activeTab="favorites" onTabChange={(tab) => tab === 'home' && onBack()} />
    </div>
  );
}
