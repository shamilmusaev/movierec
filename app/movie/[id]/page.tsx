'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getMovieById, getMovieVideos, getImageUrl, getYouTubeEmbedUrl } from '@/lib/tmdb/client';
import type { Movie, MovieVideo } from '@/types/tmdb';
import { useFavorites } from '@/hooks/useFavorites';
import { TrailerPlayer } from '@/components/TrailerPlayer';
import { TabBar } from '@/components/TabBar';

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState<MovieVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const favorites = useFavorites();

  useEffect(() => {
    loadMovie();
  }, []);

  const loadMovie = async () => {
    try {
      const resolvedParams = await params;
      const movieId = parseInt(resolvedParams.id);
      
      const [movieData, videos] = await Promise.all([
        getMovieById(movieId),
        getMovieVideos(movieId)
      ]);

      setMovie(movieData);
      
      const validTrailers = videos.filter(
        v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      setTrailer(validTrailers[0] || null);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading movie:', error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleFavoriteToggle = () => {
    if (movie) {
      favorites.toggle(movie.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isFavorite = favorites.isFavorite(movie.id);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-lg border-b border-zinc-800 pt-safe shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleFavoriteToggle}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <svg
                className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`}
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Backdrop Image */}
          {movie.backdrop_path && (
            <div className="relative w-full aspect-video">
              <Image
                src={getImageUrl(movie.backdrop_path, 'w780')}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              {/* Play Trailer Button */}
              {trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                >
                  <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Movie Info */}
          <div className="px-4 mt-6">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-white font-semibold">{movie.vote_average.toFixed(1)}</span>
              </span>
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
            </div>

            {/* Overview */}
            {movie.overview && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Overview</h2>
                <p className="text-zinc-300 leading-relaxed">{movie.overview}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="shrink-0">
          <TabBar />
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowTrailer(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/70 rounded-full hover:bg-black transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-full h-full">
            <TrailerPlayer
              videoKey={trailer.key}
              isActive={true}
              muted={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
