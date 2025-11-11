# Essential Code Snippets

Quick copy-paste snippets for common patterns in TrailerSwipe.

---

## Environment Setup

```bash
# .env.local
TMDB_API_KEY=your_api_key_here
TMDB_ACCESS_TOKEN=your_bearer_token_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Type Definitions

### Movie Types
```typescript
// types/movie.ts
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date: string
  genre_ids: number[]
  trailer?: VideoResult
}

export interface VideoResult {
  id: string
  key: string
  name: string
  site: 'YouTube' | 'Vimeo'
  size: number
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette'
  official: boolean
  published_at: string
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface VideosResponse {
  id: number
  results: VideoResult[]
}
```

### Swipe Types
```typescript
// types/swipe.ts
export type SwipeDirection = 'left' | 'right'

export interface SwipeInfo {
  movieId: number
  direction: SwipeDirection
  timestamp: number
}
```

---

## TMDB API Integration

### API Client
```typescript
// lib/api/tmdb.ts
const BASE_URL = 'https://api.themoviedb.org/3'
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN!

interface FetchOptions {
  tags?: string[]
  revalidate?: number
}

async function tmdbFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { tags = [], revalidate = 3600 } = options

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    next: {
      revalidate,
      tags: ['tmdb', ...tags]
    }
  })

  if (!res.ok) {
    throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export const tmdb = {
  movies: {
    popular: (page = 1) =>
      tmdbFetch<TMDBResponse<Movie>>(
        `/movie/popular?page=${page}`,
        { tags: ['movies', 'popular'] }
      ),

    trending: (timeWindow: 'day' | 'week' = 'week') =>
      tmdbFetch<TMDBResponse<Movie>>(
        `/trending/movie/${timeWindow}`,
        { tags: ['movies', 'trending'] }
      ),

    byGenre: (genreId: number, page = 1) =>
      tmdbFetch<TMDBResponse<Movie>>(
        `/discover/movie?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
        { tags: ['movies', `genre-${genreId}`] }
      ),

    videos: (movieId: number) =>
      tmdbFetch<VideosResponse>(
        `/movie/${movieId}/videos`,
        { tags: ['videos', `movie-${movieId}`] }
      )
  },

  genres: {
    list: () =>
      tmdbFetch<{ genres: Genre[] }>(
        '/genre/movie/list',
        { tags: ['genres'], revalidate: 86400 }
      )
  }
}
```

### Get Best Trailer
```typescript
// lib/utils/video.ts
import type { VideoResult } from '@/types/movie'

export function getBestTrailer(videos: VideoResult[]): VideoResult | null {
  const youtubeVideos = videos.filter(v => v.site === 'YouTube')

  // Priority: Official Trailer > Any Trailer > Teaser > First video
  const officialTrailer = youtubeVideos.find(
    v => v.official && v.type === 'Trailer'
  )
  if (officialTrailer) return officialTrailer

  const anyTrailer = youtubeVideos.find(v => v.type === 'Trailer')
  if (anyTrailer) return anyTrailer

  const teaser = youtubeVideos.find(v => v.type === 'Teaser')
  if (teaser) return teaser

  return youtubeVideos[0] || null
}

export function getYouTubeUrl(key: string): string {
  return `https://www.youtube.com/watch?v=${key}`
}

export function getYouTubeEmbedUrl(key: string, params?: Record<string, any>): string {
  const url = new URL(`https://www.youtube.com/embed/${key}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }
  return url.toString()
}
```

### Fetch Movies with Trailers
```typescript
// lib/api/movies.ts
import { tmdb } from './tmdb'
import { getBestTrailer } from '@/lib/utils/video'
import type { Movie } from '@/types/movie'

export async function getMoviesWithTrailers(
  genreId?: number,
  page = 1
): Promise<Movie[]> {
  try {
    const moviesData = genreId
      ? await tmdb.movies.byGenre(genreId, page)
      : await tmdb.movies.popular(page)

    // Fetch trailers in parallel with Promise.allSettled
    const moviesWithTrailers = await Promise.allSettled(
      moviesData.results.map(async (movie) => {
        const videosData = await tmdb.movies.videos(movie.id)
        const trailer = getBestTrailer(videosData.results)
        return { ...movie, trailer }
      })
    )

    // Filter successful results and movies with trailers
    return moviesWithTrailers
      .filter((result): result is PromiseFulfilledResult<Movie> =>
        result.status === 'fulfilled' && result.value.trailer !== null
      )
      .map(result => result.value)

  } catch (error) {
    console.error('Failed to fetch movies with trailers:', error)
    throw new Error('Could not load movies')
  }
}
```

### Image URLs
```typescript
// lib/utils/image.ts
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const getImageUrl = {
  poster: (
    path: string | null,
    size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
  ) => path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '/placeholder-poster.jpg',

  backdrop: (
    path: string | null,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'
  ) => path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '/placeholder-backdrop.jpg',
}
```

---

## Custom Hooks

### useLocalStorage
```typescript
// lib/hooks/useLocalStorage.ts
'use client'

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
        setStoredValue(initialValue)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
```

### useFavorites
```typescript
// lib/hooks/useFavorites.ts
'use client'

import { useLocalStorage } from './useLocalStorage'
import { useCallback } from 'react'
import type { Movie } from '@/types/movie'

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Movie[]>(
    'trailerswipe-favorites',
    []
  )

  const addFavorite = useCallback((movie: Movie) => {
    setFavorites(prev => {
      if (prev.some(m => m.id === movie.id)) return prev
      return [...prev, movie]
    })
  }, [setFavorites])

  const removeFavorite = useCallback((movieId: number) => {
    setFavorites(prev => prev.filter(m => m.id !== movieId))
  }, [setFavorites])

  const toggleFavorite = useCallback((movie: Movie) => {
    setFavorites(prev => {
      const exists = prev.some(m => m.id === movie.id)
      return exists
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, movie]
    })
  }, [setFavorites])

  const isFavorite = useCallback((movieId: number): boolean => {
    return favorites.some(m => m.id === movieId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [setFavorites])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length
  }
}
```

### useSwipe
```typescript
// lib/hooks/useSwipe.ts
'use client'

import { useCallback, useState } from 'react'
import type { SwipeDirection, SwipeInfo } from '@/types/swipe'

interface UseSwipeOptions {
  onSwipe?: (info: SwipeInfo) => void
  onSwipeLeft?: (movieId: number) => void
  onSwipeRight?: (movieId: number) => void
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const [lastSwipe, setLastSwipe] = useState<SwipeInfo | null>(null)

  const handleSwipe = useCallback((movieId: number, direction: SwipeDirection) => {
    const swipeInfo: SwipeInfo = {
      movieId,
      direction,
      timestamp: Date.now()
    }

    setLastSwipe(swipeInfo)

    // Call callbacks
    options.onSwipe?.(swipeInfo)
    if (direction === 'left') {
      options.onSwipeLeft?.(movieId)
    } else {
      options.onSwipeRight?.(movieId)
    }
  }, [options])

  const swipeLeft = useCallback((movieId: number) => {
    handleSwipe(movieId, 'left')
  }, [handleSwipe])

  const swipeRight = useCallback((movieId: number) => {
    handleSwipe(movieId, 'right')
  }, [handleSwipe])

  return {
    handleSwipe,
    swipeLeft,
    swipeRight,
    lastSwipe
  }
}
```

---

## Components

### VideoPlayer
```typescript
// components/client/VideoPlayer.tsx
'use client'

import ReactPlayer from 'react-player/youtube'
import { useEffect, useState, useRef } from 'react'
import type { VideoResult } from '@/types/movie'

interface VideoPlayerProps {
  video: VideoResult
  isActive: boolean
  autoplay?: boolean
  muted?: boolean
  onReady?: () => void
  onError?: (error: Error) => void
}

export function VideoPlayer({
  video,
  isActive,
  autoplay = true,
  muted = true,
  onReady,
  onError
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef<ReactPlayer>(null)

  useEffect(() => {
    setPlaying(isActive && autoplay)
  }, [isActive, autoplay])

  return (
    <div className="relative aspect-video w-full h-full bg-black">
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${video.key}`}
        playing={playing}
        muted={muted}
        loop
        controls={false}
        width="100%"
        height="100%"
        config={{
          youtube: {
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              fs: 1,
              playsinline: 1
            }
          }
        }}
        onReady={onReady}
        onError={(error) => {
          console.error('Video playback error:', error)
          onError?.(new Error('Video playback failed'))
        }}
        className="absolute top-0 left-0"
      />
    </div>
  )
}
```

### SwipeCard (Framer Motion)
```typescript
// components/client/SwipeCard.tsx
'use client'

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import type { Movie } from '@/types/movie'

interface SwipeCardProps {
  movie: Movie
  onSwipe: (direction: 'left' | 'right') => void
  isActive: boolean
  children: React.ReactNode
}

const SWIPE_THRESHOLD = 150

export function SwipeCard({ movie, onSwipe, isActive, children }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  function handleDragEnd(event: any, info: PanInfo) {
    const { offset, velocity } = info

    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      onSwipe(offset.x > 0 ? 'right' : 'left')
    }
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute inset-0 cursor-grab"
    >
      {children}
    </motion.div>
  )
}
```

### MovieSwiper
```typescript
// components/client/MovieSwiper.tsx
'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeCard } from './SwipeCard'
import { VideoPlayer } from './VideoPlayer'
import { useFavorites } from '@/lib/hooks/useFavorites'
import type { Movie } from '@/types/movie'

interface MovieSwiperProps {
  movies: Movie[]
  onLoadMore?: () => void
}

export function MovieSwiper({ movies, onLoadMore }: MovieSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const { toggleFavorite } = useFavorites()

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (direction === 'right') {
      toggleFavorite(movies[currentIndex])
    }

    setExitDirection(direction)

    setTimeout(() => {
      setCurrentIndex(prev => {
        const next = prev + 1
        if (next >= movies.length - 2 && onLoadMore) {
          onLoadMore()
        }
        return next
      })
      setExitDirection(null)
    }, 300)
  }, [currentIndex, movies, toggleFavorite, onLoadMore])

  if (currentIndex >= movies.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl">No more movies!</p>
      </div>
    )
  }

  const currentMovie = movies[currentIndex]
  const nextMovie = movies[currentIndex + 1]

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Background preview of next movie */}
      {nextMovie && (
        <div className="absolute inset-0 opacity-30 scale-95 blur-sm">
          <img
            src={`https://image.tmdb.org/t/p/w1280${nextMovie.backdrop_path}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Current card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{
            x: exitDirection === 'right' ? 1000 : -1000,
            opacity: 0,
            scale: 0.8,
            rotate: exitDirection === 'right' ? 20 : -20
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <SwipeCard
            movie={currentMovie}
            onSwipe={handleSwipe}
            isActive={true}
          >
            <div className="relative w-full h-full">
              {currentMovie.trailer && (
                <VideoPlayer
                  video={currentMovie.trailer}
                  isActive={true}
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

              {/* Movie info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{currentMovie.title}</h2>
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                  {currentMovie.overview}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span>⭐ {currentMovie.vote_average.toFixed(1)}</span>
                  <span>{new Date(currentMovie.release_date).getFullYear()}</span>
                </div>
              </div>
            </div>
          </SwipeCard>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-8 z-10 pointer-events-none">
        <button
          onClick={() => handleSwipe('left')}
          className="pointer-events-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm
                     flex items-center justify-center hover:bg-white/30 transition-colors
                     active:scale-95 min-h-[44px] min-w-[44px]"
          aria-label="Skip movie"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="pointer-events-auto w-16 h-16 rounded-full bg-red-500/80 backdrop-blur-sm
                     flex items-center justify-center hover:bg-red-500 transition-colors
                     active:scale-95 min-h-[44px] min-w-[44px]"
          aria-label="Like movie"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
```

---

## Server Components & Actions

### Main Page
```typescript
// app/page.tsx
import { getMoviesWithTrailers } from '@/lib/api/movies'
import { MovieSwiper } from '@/components/client/MovieSwiper'
import { Suspense } from 'react'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const movies = await getMoviesWithTrailers()

  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSkeleton />}>
        <MovieSwiper movies={movies} />
      </Suspense>
    </main>
  )
}

function LoadingSkeleton() {
  return (
    <div className="h-screen w-full bg-black animate-pulse flex items-center justify-center">
      <div className="text-white">Loading movies...</div>
    </div>
  )
}
```

### Server Action for Loading More
```typescript
// app/actions/loadMoreMovies.ts
'use server'

import { getMoviesWithTrailers } from '@/lib/api/movies'

export async function loadMoreMovies(page: number, genreId?: number) {
  try {
    const movies = await getMoviesWithTrailers(genreId, page)
    return { success: true, data: movies, error: null }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

---

## Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      height: {
        'screen-safe': ['100vh', '100dvh'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Utility Functions

### Debounce
```typescript
// lib/utils/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
```

### Format Date
```typescript
// lib/utils/date.ts
export function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function getYear(dateString: string): number {
  return new Date(dateString).getFullYear()
}
```

---

## Next.js Config

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    reactCompiler: true,
  },
}

export default config
```

---

## Testing Utilities

### Mock Data
```typescript
// lib/mocks/movies.ts
import type { Movie, VideoResult } from '@/types/movie'

export const mockTrailer: VideoResult = {
  id: '1',
  key: 'dQw4w9WgXcQ',
  name: 'Official Trailer',
  site: 'YouTube',
  size: 1080,
  type: 'Trailer',
  official: true,
  published_at: '2023-01-01T00:00:00.000Z'
}

export const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  overview: 'This is a test movie description',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  vote_average: 8.5,
  vote_count: 1000,
  release_date: '2023-01-01',
  genre_ids: [28, 12],
  popularity: 100,
  adult: false,
  original_language: 'en',
  original_title: 'Test Movie',
  video: false,
  trailer: mockTrailer
}

export const mockMovies: Movie[] = Array.from({ length: 10 }, (_, i) => ({
  ...mockMovie,
  id: i + 1,
  title: `Test Movie ${i + 1}`
}))
```

---

This collection provides all essential code snippets needed to implement TrailerSwipe. Copy and adapt as needed for your implementation.
