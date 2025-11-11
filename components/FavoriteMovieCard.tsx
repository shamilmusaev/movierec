'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb/client';

interface FavoriteMovieCardProps {
  movie: Movie;
  onRemove: () => void;
}

export function FavoriteMovieCard({ movie, onRemove }: FavoriteMovieCardProps) {
  return (
    <div className="group relative">
      <Link href={`/movie/${movie.id}`}>
        <div className="relative aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-[0.98]">
          {movie.poster_path ? (
            <Image
              src={getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <span className="text-zinc-600 text-4xl">🎬</span>
            </div>
          )}

          {/* Overlay with movie info on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
              {movie.release_date && (
                <span>• {new Date(movie.release_date).getFullYear()}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-11 h-11 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
        aria-label="Remove from favorites"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
