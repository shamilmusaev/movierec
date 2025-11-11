'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Movie, MovieVideo } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb/client';
import { TrailerPlayer } from './TrailerPlayer';
import { FavoriteIcon } from './FavoriteIcon';

interface MovieCardProps {
  movie: Movie;
  trailer: MovieVideo | null;
  isActive: boolean;
  isFavorite: boolean;
  muted: boolean;
  onFavoriteToggle: () => void;
  onMuteToggle: () => void;
  onVideoEnd?: () => void;
  dragHandlers?: any;
  style?: any;
}

export function MovieCard({
  movie,
  trailer,
  isActive,
  isFavorite,
  muted,
  onFavoriteToggle,
  onMuteToggle,
  onVideoEnd,
  dragHandlers,
  style,
}: MovieCardProps) {
  const [videoError, setVideoError] = useState(false);
  const posterUrl = movie.poster_path ? getImageUrl(movie.poster_path, 'w780') : null;
  const hasTrailer = trailer !== null && !videoError;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...dragHandlers}
      style={{ ...style, touchAction: 'pan-y' }}
    >
      <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-xl bg-zinc-900 overflow-hidden md:shadow-2xl">
        {/* Trailer or Poster */}
        {hasTrailer && isActive ? (
          <div className="w-full h-full">
            <TrailerPlayer
              videoKey={trailer.key}
              isActive={isActive}
              muted={muted}
              onMuteToggle={onMuteToggle}
              onVideoEnd={onVideoEnd}
              onError={() => setVideoError(true)}
            />
          </div>
        ) : posterUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover object-center"
              priority={isActive}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <p className="text-zinc-400">No poster available</p>
          </div>
        )}

        {/* Lighter gradient overlay for better text readability - only at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white pb-safe">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 line-clamp-2">{movie.title}</h2>
          <p className="text-xs md:text-sm text-zinc-300 line-clamp-3 mb-3 md:mb-4">{movie.overview}</p>

          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {movie.vote_average.toFixed(1)}
            </span>
            {movie.release_date && (
              <span>{new Date(movie.release_date).getFullYear()}</span>
            )}
          </div>
        </div>

        {/* Favorite Icon */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 pt-safe">
          <FavoriteIcon
            isFavorite={isFavorite}
            onToggle={onFavoriteToggle}
          />
        </div>
      </div>
    </motion.div>
  );
}
