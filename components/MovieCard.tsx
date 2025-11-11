'use client';

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
  dragHandlers,
  style,
}: MovieCardProps) {
  const posterUrl = movie.poster_path ? getImageUrl(movie.poster_path, 'w780') : null;
  const hasTrailer = trailer !== null;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      {...dragHandlers}
      style={style}
    >
      <div className="relative w-full max-w-md h-[70vh] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Trailer or Poster */}
        {hasTrailer && isActive ? (
          <div className="w-full h-full">
            <TrailerPlayer
              videoKey={trailer.key}
              isActive={isActive}
              muted={muted}
              onMuteToggle={onMuteToggle}
            />
          </div>
        ) : posterUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              priority={isActive}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <p className="text-zinc-400">No poster available</p>
          </div>
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 line-clamp-2">{movie.title}</h2>
          <p className="text-sm text-zinc-300 line-clamp-3 mb-4">{movie.overview}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="absolute top-6 right-6">
          <FavoriteIcon
            isFavorite={isFavorite}
            onToggle={onFavoriteToggle}
          />
        </div>
      </div>
    </motion.div>
  );
}
