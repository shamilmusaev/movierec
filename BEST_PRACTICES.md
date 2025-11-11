# TikTok-Style Swipeable Video Card Interface - Best Practices Guide

This comprehensive guide covers best practices for building the TrailerSwipe application using Next.js 15+, TypeScript, Tailwind CSS, and modern React patterns.

---

## Table of Contents

1. [Next.js 15 App Router Architecture](#1-nextjs-15-app-router-architecture)
2. [Video Swipe Interface Implementation](#2-video-swipe-interface-implementation)
3. [TMDB API Integration](#3-tmdb-api-integration)
4. [YouTube Embed & Video Control](#4-youtube-embed--video-control)
5. [LocalStorage for Favorites](#5-localstorage-for-favorites)
6. [Performance Optimization](#6-performance-optimization)
7. [Mobile-First Responsive Design](#7-mobile-first-responsive-design)
8. [Accessibility](#8-accessibility)
9. [TypeScript Patterns](#9-typescript-patterns)
10. [Code Examples](#10-code-examples)

---

## 1. Next.js 15 App Router Architecture

### 1.1 Server vs Client Components Strategy

**Key Principle:** Server-first architecture with strategic client component islands.

**Best Practices:**

- **Default to Server Components** for all non-interactive UI
- **Use Client Components** only for interactivity (state, effects, events, browser APIs)
- **Composition Pattern:** Import client components inside server components to minimize client bundle size

```typescript
// app/page.tsx (Server Component - default)
import { Suspense } from 'react'
import MovieSwiper from '@/components/MovieSwiper' // Client Component

export default async function HomePage() {
  const initialMovies = await fetchMovies() // Server-side data fetching

  return (
    <main>
      <Suspense fallback={<LoadingSkeleton />}>
        <MovieSwiper initialMovies={initialMovies} />
      </Suspense>
    </main>
  )
}
```

```typescript
// components/MovieSwiper.tsx (Client Component)
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MovieSwiper({ initialMovies }: Props) {
  // Client-side interactivity here
}
```

### 1.2 Data Fetching Patterns

**Official Next.js 15 Best Practices:**

**Time-based Revalidation:**
```typescript
// app/lib/api.ts
export async function fetchMovies(genre?: string) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular`, {
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
    },
    next: { revalidate: 3600 } // Revalidate every hour
  })

  if (!res.ok) throw new Error('Failed to fetch movies')
  return res.json()
}
```

**On-demand Revalidation with Server Actions:**
```typescript
// app/actions/movies.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function refreshMovies() {
  revalidateTag('movies')
  revalidatePath('/explore')
}

// In your fetch:
fetch(url, {
  next: { tags: ['movies'] }
})
```

**Cache Control:**
```typescript
// Force dynamic rendering for user-specific data
export const dynamic = 'force-dynamic' // Force SSR
export const revalidate = 0 // Disable caching

// Or for static with periodic updates
export const revalidate = 60 // ISR every 60 seconds
```

### 1.3 File Structure Best Practices (2025)

```
app/
├── (routes)/
│   ├── explore/
│   │   ├── page.tsx          # Server Component
│   │   └── loading.tsx       # Loading UI
│   ├── favorite/
│   │   └── page.tsx
│   └── layout.tsx            # Root layout
├── components/
│   ├── client/               # Client Components
│   │   ├── MovieSwiper.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── SwipeCard.tsx
│   └── server/               # Server Components
│       ├── CategoryNav.tsx
│       └── MovieGrid.tsx
├── lib/
│   ├── api/
│   │   └── tmdb.ts          # API functions
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useSwipe.ts
│   └── utils/
│       └── video.ts
└── types/
    └── movie.ts
```

**Source:** [Next.js App Router Best Practices 2025](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3)

---

## 2. Video Swipe Interface Implementation

### 2.1 Framer Motion vs Embla Carousel

**Recommendation:** Use **Framer Motion** for full control over TikTok-style vertical swipes, or **Embla Carousel** for easier implementation with built-in touch support.

### 2.2 Framer Motion Implementation

**Best Practices for Swipeable Cards:**

**Key Concepts:**
- **Drag Threshold:** 150px is standard for determining swipe completion
- **Drag Constraints:** Limit drag distance to prevent excessive movement
- **Motion Values:** Use `useMotionValue` and `useTransform` for performance

```typescript
// components/client/SwipeCard.tsx
'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useState } from 'react'

const SWIPE_THRESHOLD = 150

interface SwipeCardProps {
  movie: Movie
  onSwipe: (direction: 'left' | 'right') => void
  isActive: boolean
}

export function SwipeCard({ movie, onSwipe, isActive }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  function handleDragEnd(event: any, info: PanInfo) {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="absolute inset-0"
    >
      {/* Card content */}
    </motion.div>
  )
}
```

**AnimatePresence for Exit Animations:**
```typescript
'use client'

import { AnimatePresence, motion } from 'framer-motion'

export function MovieSwiper({ movies }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={movies[currentIndex].id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <SwipeCard movie={movies[currentIndex]} />
      </motion.div>
    </AnimatePresence>
  )
}
```

**Source:** [Tinder-like Card Game with Framer Motion](https://dev.to/lansolo99/a-tinder-like-card-game-with-framer-motion-35i5)

### 2.3 Embla Carousel Implementation

**Best Practices for Autoplay with Video:**

```typescript
// components/client/VideoCarousel.tsx
'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCallback, useEffect, useRef } from 'react'

export function VideoCarousel({ movies }: Props) {
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      stopOnFocusIn: true
    })
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      axis: 'y', // Vertical scrolling like TikTok
      skipSnaps: false
    },
    [autoplay.current]
  )

  // Handle slide change to control video playback
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const index = emblaApi.selectedScrollSnap()
    // Pause all videos except current
    pauseAllVideos()
    playVideoAt(index)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  return (
    <div
      ref={emblaRef}
      className="overflow-hidden h-screen"
      onMouseEnter={() => autoplay.current.stop()}
      onMouseLeave={() => autoplay.current.play()}
    >
      <div className="flex flex-col">
        {movies.map((movie, index) => (
          <div key={movie.id} className="flex-[0_0_100%]">
            <VideoCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Configuration Options:**
- `delay`: Time between auto-scrolls (default: 4000ms)
- `stopOnInteraction`: Stop autoplay on drag (recommended: `true` for video)
- `playOnInit`: Set to `false` for manual control
- `stopOnMouseEnter`: Pause when hovering (good UX)
- `stopOnFocusIn`: Pause when focused (accessibility)

**Source:** [Embla Carousel Autoplay Documentation](https://www.embla-carousel.com/plugins/autoplay/)

### 2.4 CSS Scroll Snap Alternative (Lightweight)

For a simpler, CSS-only approach without heavy libraries:

```tsx
// components/client/ScrollSnapSwiper.tsx
'use client'

export function ScrollSnapSwiper({ movies }: Props) {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="h-screen snap-start snap-always"
        >
          <VideoCard movie={movie} />
        </div>
      ))}
    </div>
  )
}
```

**Tailwind Config:**
```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      scrollSnapType: {
        'y-mandatory': 'y mandatory',
      }
    }
  }
}
```

**Source:** [TikTok/YouTube Shorts Snap Scroll](https://dev.to/biomathcode/create-tik-tokyoutube-shorts-like-snap-infinite-scroll-react-1mca)

---

## 3. TMDB API Integration

### 3.1 API Setup & Authentication

**Environment Variables:**
```env
# .env.local
TMDB_API_KEY=your_api_key_here
TMDB_ACCESS_TOKEN=your_bearer_token_here
```

**API Client Pattern:**
```typescript
// lib/api/tmdb.ts

const BASE_URL = 'https://api.themoviedb.org/3'
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN

interface TMDBConfig {
  method?: string
  tags?: string[]
  revalidate?: number
}

async function tmdbFetch<T>(endpoint: string, config: TMDBConfig = {}): Promise<T> {
  const { tags = [], revalidate = 3600 } = config

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
    throw new Error(`TMDB API Error: ${res.status}`)
  }

  return res.json()
}

export const tmdb = {
  movies: {
    popular: (page = 1) =>
      tmdbFetch(`/movie/popular?page=${page}`, { tags: ['movies', 'popular'] }),

    trending: (timeWindow: 'day' | 'week' = 'week') =>
      tmdbFetch(`/trending/movie/${timeWindow}`, { tags: ['movies', 'trending'] }),

    byGenre: (genreId: number, page = 1) =>
      tmdbFetch(`/discover/movie?with_genres=${genreId}&page=${page}`,
        { tags: ['movies', `genre-${genreId}`] }),

    videos: (movieId: number) =>
      tmdbFetch<VideosResponse>(`/movie/${movieId}/videos`,
        { tags: ['videos', `movie-${movieId}`] })
  },

  genres: {
    list: () =>
      tmdbFetch<GenresResponse>('/genre/movie/list', { tags: ['genres'] })
  }
}
```

### 3.2 Getting Movie Trailers

**Endpoint:** `GET /movie/{movie_id}/videos`

**Response Structure:**
```typescript
// types/movie.ts

export interface VideoResult {
  id: string
  iso_639_1: string
  iso_3166_1: string
  key: string              // YouTube video ID
  name: string             // e.g., "Official Trailer"
  site: string             // "YouTube" or "Vimeo"
  size: number             // Resolution (1080, 720, etc.)
  type: string             // "Trailer", "Teaser", "Clip", etc.
  official: boolean
  published_at: string
}

export interface VideosResponse {
  id: number
  results: VideoResult[]
}

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  release_date: string
  genre_ids: number[]
  trailer?: VideoResult   // Best trailer (added by your logic)
}
```

**Best Trailer Selection Logic:**
```typescript
// lib/utils/video.ts

export function getBestTrailer(videos: VideoResult[]): VideoResult | null {
  // Priority: Official Trailer > Trailer > Teaser
  const youtubeVideos = videos.filter(v => v.site === 'YouTube')

  const officialTrailer = youtubeVideos.find(
    v => v.official && v.type === 'Trailer'
  )

  if (officialTrailer) return officialTrailer

  const trailer = youtubeVideos.find(v => v.type === 'Trailer')
  if (trailer) return trailer

  const teaser = youtubeVideos.find(v => v.type === 'Teaser')
  return teaser || youtubeVideos[0] || null
}

export function getYouTubeUrl(videoKey: string): string {
  return `https://www.youtube.com/watch?v=${videoKey}`
}

export function getYouTubeEmbedUrl(videoKey: string): string {
  return `https://www.youtube.com/embed/${videoKey}`
}
```

**Fetching Movies with Trailers:**
```typescript
// lib/api/movies.ts

export async function getMoviesWithTrailers(genreId?: number): Promise<Movie[]> {
  const moviesData = genreId
    ? await tmdb.movies.byGenre(genreId)
    : await tmdb.movies.popular()

  // Fetch trailers for each movie
  const moviesWithTrailers = await Promise.all(
    moviesData.results.map(async (movie) => {
      try {
        const videosData = await tmdb.movies.videos(movie.id)
        const bestTrailer = getBestTrailer(videosData.results)
        return { ...movie, trailer: bestTrailer }
      } catch (error) {
        console.error(`Failed to fetch trailer for ${movie.id}`, error)
        return { ...movie, trailer: null }
      }
    })
  )

  // Filter out movies without trailers
  return moviesWithTrailers.filter(movie => movie.trailer !== null)
}
```

**Image URLs:**
```typescript
// lib/utils/image.ts

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const getImageUrl = {
  poster: (path: string, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500') =>
    `${TMDB_IMAGE_BASE}/${size}${path}`,

  backdrop: (path: string, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
    `${TMDB_IMAGE_BASE}/${size}${path}`,
}
```

**Source:** [TMDB API Documentation](https://developer.themoviedb.org/docs/getting-started) | [Getting Started Guide](https://dev.to/alamjamshed17777/getting-started-with-the-tmdb-api-a-beginners-guide-52li)

---

## 4. YouTube Embed & Video Control

### 4.1 ReactPlayer (Recommended)

**Installation:**
```bash
npm install react-player
```

**Why ReactPlayer:**
- Supports multiple video platforms (YouTube, Vimeo, etc.)
- TypeScript support
- Consistent API across platforms
- Built-in controls for play/pause/mute
- Event callbacks

**Implementation:**
```typescript
// components/client/VideoPlayer.tsx
'use client'

import ReactPlayer from 'react-player/youtube' // Only load YouTube player
import { useState, useRef } from 'react'

interface VideoPlayerProps {
  videoKey: string
  isActive: boolean      // Is this the current card?
  autoplay?: boolean
  muted?: boolean
}

export function VideoPlayer({
  videoKey,
  isActive,
  autoplay = true,
  muted = true
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null)
  const [playing, setPlaying] = useState(false)

  // Auto-play when card becomes active
  useEffect(() => {
    setPlaying(isActive && autoplay)
  }, [isActive, autoplay])

  return (
    <div className="relative aspect-video w-full">
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${videoKey}`}
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
              playsinline: 1  // Important for iOS
            }
          }
        }}
        onReady={() => console.log('Player ready')}
        onError={(error) => console.error('Playback error:', error)}
        onEnded={() => setPlaying(false)}
        className="absolute top-0 left-0"
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setPlaying(!playing)}
          className="bg-black/50 p-2 rounded-full"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={() => {
            if (playerRef.current) {
              const player = playerRef.current.getInternalPlayer()
              const isMuted = player.isMuted()
              isMuted ? player.unMute() : player.mute()
            }
          }}
          className="bg-black/50 p-2 rounded-full"
          aria-label="Toggle mute"
        >
          <SoundIcon />
        </button>
      </div>
    </div>
  )
}
```

**Instance Methods (via ref):**
```typescript
playerRef.current?.seekTo(10) // Seek to 10 seconds
playerRef.current?.getInternalPlayer() // Access YouTube IFrame API
```

### 4.2 Multiple Video Instances Pattern

**Critical:** Only play one video at a time to prevent memory leaks and performance issues.

```typescript
// components/client/MovieSwiper.tsx
'use client'

import { useState, useCallback } from 'react'

export function MovieSwiper({ movies }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleSlideChange = useCallback((newIndex: number) => {
    setActiveIndex(newIndex)
    // All other videos will stop via isActive={false}
  }, [])

  return (
    <div>
      {movies.map((movie, index) => (
        <VideoPlayer
          key={movie.id}
          videoKey={movie.trailer.key}
          isActive={index === activeIndex}
          autoplay
          muted
        />
      ))}
    </div>
  )
}
```

### 4.3 YouTube IFrame API (Alternative)

For more control, use the official YouTube IFrame API:

```typescript
// lib/hooks/useYouTubePlayer.ts
'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function useYouTubePlayer(videoId: string, autoplay = false) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }

    window.onYouTubeIframeAPIReady = () => {
      if (containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            mute: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
          },
          events: {
            onReady: () => setIsReady(true),
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                playerRef.current?.playVideo()
              }
            }
          }
        })
      }
    }

    return () => {
      playerRef.current?.destroy()
    }
  }, [videoId, autoplay])

  return {
    playerRef,
    containerRef,
    isReady,
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    mute: () => playerRef.current?.mute(),
    unMute: () => playerRef.current?.unMute()
  }
}
```

**Important YouTube Autoplay Requirements:**
1. **Must be muted** for autoplay to work (Chrome policy since 2018)
2. **playsinline: 1** required for iOS devices
3. **User gesture** may be required on some browsers

**Sources:**
- [ReactPlayer npm](https://www.npmjs.com/package/react-player)
- [YouTube Embed Autoplay](https://ahmadrosid.com/blog/autoplay-youtube-embed-in-react)
- [React YouTube Integration](https://dev.to/sahilthakur7/integrating-youtube-player-in-react-45p6)

---

## 5. LocalStorage for Favorites

### 5.1 Type-Safe Custom Hook

```typescript
// lib/hooks/useLocalStorage.ts
'use client'

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'

type SetValue<T> = Dispatch<SetStateAction<T>>

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue: SetValue<T> = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        // Dispatch custom event for cross-tab sync
        window.dispatchEvent(new CustomEvent('localStorage', {
          detail: { key, value: valueToStore }
        }))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Remove from localStorage
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

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing storage event:', error)
        }
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorage', handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorage', handleCustomEvent as EventListener)
    }
  }, [key])

  return [storedValue, setValue, removeValue]
}
```

### 5.2 Favorites Management

```typescript
// lib/hooks/useFavorites.ts
'use client'

import { useLocalStorage } from './useLocalStorage'
import { Movie } from '@/types/movie'
import { useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Movie[]>('trailerswipe-favorites', [])

  const addFavorite = useCallback((movie: Movie) => {
    setFavorites(prev => {
      // Prevent duplicates
      if (prev.some(m => m.id === movie.id)) {
        return prev
      }
      return [...prev, movie]
    })
  }, [setFavorites])

  const removeFavorite = useCallback((movieId: number) => {
    setFavorites(prev => prev.filter(m => m.id !== movieId))
  }, [setFavorites])

  const toggleFavorite = useCallback((movie: Movie) => {
    setFavorites(prev => {
      const exists = prev.some(m => m.id === movie.id)
      if (exists) {
        return prev.filter(m => m.id !== movie.id)
      }
      return [...prev, movie]
    })
  }, [setFavorites])

  const isFavorite = useCallback((movieId: number) => {
    return favorites.some(m => m.id === movieId)
  }, [favorites])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    count: favorites.length
  }
}
```

### 5.3 Usage in Components

```typescript
// components/client/SwipeCard.tsx
'use client'

import { useFavorites } from '@/lib/hooks/useFavorites'

export function SwipeCard({ movie, onSwipe }: Props) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const isLiked = isFavorite(movie.id)

  const handleSwipeRight = () => {
    toggleFavorite(movie)
    onSwipe('right')
  }

  return (
    <motion.div
      onDragEnd={(e, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) {
          handleSwipeRight()
        }
      }}
    >
      <button
        onClick={() => toggleFavorite(movie)}
        className={isLiked ? 'text-red-500' : 'text-gray-400'}
        aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
      >
        <HeartIcon filled={isLiked} />
      </button>
    </motion.div>
  )
}
```

### 5.4 Best Practices

**DO:**
- Use TypeScript generics for type safety
- Handle SSR (check `typeof window`)
- Implement error handling with try/catch
- Use JSON.stringify/parse for serialization
- Sync across tabs with storage events
- Set reasonable size limits (5MB max per domain)

**DON'T:**
- Store sensitive data (passwords, tokens)
- Store large binary data
- Use for data that needs server sync
- Forget to handle parse errors

**Sources:**
- [usehooks-ts useLocalStorage](https://usehooks-ts.com/react-hook/use-local-storage)
- [localStorage Best Practices](https://felixgerschau.com/react-localstorage/)
- [State Persistence Guide](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c)

---

## 6. Performance Optimization

### 6.1 Video Loading & Memory Management

**Key Strategies:**

1. **Lazy Load Videos**: Only mount players for visible cards
2. **Unload Off-Screen Videos**: Destroy players to free memory
3. **Preload Next Video**: Load 1 video ahead
4. **Use Lower Quality**: Default to 720p, allow quality selection

```typescript
// components/client/OptimizedVideoPlayer.tsx
'use client'

import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'

// Lazy load ReactPlayer
const ReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
  loading: () => <VideoSkeleton />
})

export function OptimizedVideoPlayer({ videoKey, isActive }: Props) {
  // Only render when in viewport
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  })

  return (
    <div ref={ref} className="aspect-video">
      {inView ? (
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${videoKey}`}
          playing={isActive && inView}
          config={{
            youtube: {
              playerVars: {
                quality: 'hd720' // Limit quality
              }
            }
          }}
        />
      ) : (
        <VideoSkeleton />
      )}
    </div>
  )
}
```

### 6.2 Image Optimization

**Use Next.js Image Component:**
```typescript
// components/MoviePoster.tsx
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils/image'

export function MoviePoster({ movie }: { movie: Movie }) {
  return (
    <Image
      src={getImageUrl.poster(movie.poster_path, 'w500')}
      alt={movie.title}
      width={500}
      height={750}
      quality={85}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,...`} // Low-quality placeholder
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 500px"
    />
  )
}
```

### 6.3 React Performance Patterns

**Memoization:**
```typescript
'use client'

import { memo, useMemo, useCallback } from 'react'

export const SwipeCard = memo(function SwipeCard({ movie, onSwipe }: Props) {
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    onSwipe(movie.id, direction)
  }, [movie.id, onSwipe])

  const cardVariants = useMemo(() => ({
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  }), [])

  return <motion.div variants={cardVariants}>{/* ... */}</motion.div>
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.movie.id === nextProps.movie.id
})
```

**Virtualization (for lists):**
```typescript
// For favorites list
import { useVirtualizer } from '@tanstack/react-virtual'

export function FavoritesList({ favorites }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: favorites.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 2
  })

  return (
    <div ref={parentRef} className="h-screen overflow-y-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <MovieCard movie={favorites[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 6.4 Bundle Size Optimization

**Next.js 15 Config:**
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7 // 7 days
  },

  // Enable React compiler (experimental)
  experimental: {
    reactCompiler: true
  },

  // Bundle analyzer (development only)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  }
}

export default config
```

**Dynamic Imports:**
```typescript
// Only load Framer Motion on client
const FramerMotionComponents = dynamic(
  () => import('@/components/client/FramerMotionComponents'),
  { ssr: false }
)
```

**Sources:**
- [React Performance Optimization 2025](https://aglowiditsolutions.com/blog/react-performance-optimization/)
- [Video Optimization Guide](https://imagekit.io/blog/react-video-optimization/)
- [Lazy Loading Best Practices](https://www.codevichar.com/2025/09/lazy-loading-react.html)

---

## 7. Mobile-First Responsive Design

### 7.1 Mobile-First Principles

**Start with mobile breakpoints, then scale up:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    screens: {
      // Mobile-first breakpoints
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      height: {
        'screen-safe': ['100vh', '100dvh'], // Dynamic viewport height
      }
    }
  }
}
```

### 7.2 Touch Gestures Best Practices

**Minimum Touch Target Size: 44x44px (Apple) / 48x48px (Material Design)**

```tsx
// components/client/TouchButton.tsx
export function TouchButton({ children, onClick, ...props }: Props) {
  return (
    <button
      onClick={onClick}
      className="min-h-[44px] min-w-[44px] p-3 touch-manipulation"
      {...props}
    >
      {children}
    </button>
  )
}
```

**Touch Event Handling:**
```typescript
'use client'

import { useSwipeable } from 'react-swipeable'

export function SwipeableCard({ onSwipe }: Props) {
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe('left'),
    onSwipedRight: () => onSwipe('right'),
    trackMouse: true, // Also work with mouse for desktop
    preventScrollOnSwipe: true,
    delta: 50, // Minimum distance for swipe
  })

  return <div {...handlers}>{/* content */}</div>
}
```

**Framer Motion Touch Gestures:**
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.7}
  onDragEnd={(e, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) handleSwipe('right')
  }}
  // Important for mobile
  whileTap={{ scale: 0.95 }}
  style={{ touchAction: 'pan-y' }} // Allow vertical scroll
>
```

### 7.3 Responsive Video Layout

```tsx
// components/client/ResponsiveVideoCard.tsx
export function ResponsiveVideoCard({ movie }: Props) {
  return (
    <div className="
      h-[100dvh] w-full
      relative overflow-hidden
      bg-gradient-to-b from-black/50 to-black
    ">
      {/* Video Container - Full screen on mobile, contained on desktop */}
      <div className="
        absolute inset-0
        md:relative md:max-w-2xl md:mx-auto
        md:h-[80vh] md:my-auto md:rounded-2xl md:overflow-hidden
      ">
        <VideoPlayer videoKey={movie.trailer.key} />
      </div>

      {/* Overlay Info - Bottom on mobile, side on desktop */}
      <div className="
        absolute bottom-0 left-0 right-0 p-6
        md:relative md:max-w-2xl md:mx-auto
        bg-gradient-to-t from-black via-black/80 to-transparent
        md:bg-none
      ">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {movie.title}
        </h2>
        <p className="text-sm md:text-base text-gray-300 line-clamp-3 md:line-clamp-none">
          {movie.overview}
        </p>
      </div>

      {/* Swipe Actions - Floating buttons on mobile */}
      <div className="
        absolute bottom-24 left-0 right-0
        flex justify-center gap-8
        md:bottom-auto md:top-1/2 md:-translate-y-1/2
        md:justify-between md:px-8
      ">
        <TouchButton onClick={() => handleSwipe('left')}>
          <XIcon className="w-8 h-8" />
        </TouchButton>
        <TouchButton onClick={() => handleSwipe('right')}>
          <HeartIcon className="w-8 h-8" />
        </TouchButton>
      </div>
    </div>
  )
}
```

### 7.4 Viewport Units for Mobile

**Use Dynamic Viewport Height (dvh) for mobile:**

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  /* Handle iOS Safari's dynamic viewport */
  .h-screen-dynamic {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height */
  }

  .min-h-screen-dynamic {
    min-height: 100vh;
    min-height: 100dvh;
  }
}
```

**Safe Area Handling (iOS notch):**
```css
@layer utilities {
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### 7.5 Performance for Mobile

```typescript
// Detect mobile device
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

// Reduce motion for performance
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Use in components
export function AnimatedCard({ movie }: Props) {
  const shouldReduceMotion = prefersReducedMotion()

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      {/* ... */}
    </motion.div>
  )
}
```

**Sources:**
- [Mobile-First React Best Practices](https://reactemplates.com/blog/mobile-responsive-react-templates-best-practices-guide/)
- [Touch Gestures Guide](https://www.codevichar.com/2025/09/lazy-loading-react.html)
- [Next.js Mobile Optimization](https://clouddevs.com/next/optimizing-for-mobile-devices/)

---

## 8. Accessibility

### 8.1 WCAG 2.1 Compliance for Video Content

**Level AA Requirements:**
1. Keyboard navigation for all video controls
2. Visible focus indicators
3. Sufficient color contrast (4.5:1 for text)
4. Screen reader support
5. Captions for video content (not required for trailers but recommended)

### 8.2 Keyboard Navigation

**Required Keyboard Shortcuts:**
- `Space` / `Enter`: Play/Pause video
- `Arrow Left/Right`: Previous/Next video
- `Arrow Up/Down`: Volume control
- `M`: Mute/Unmute
- `F`: Fullscreen
- `Escape`: Exit fullscreen
- `Tab`: Navigate through interactive elements

```typescript
// components/client/AccessibleVideoPlayer.tsx
'use client'

import { useEffect, useCallback, useRef } from 'react'

export function AccessibleVideoPlayer({ videoKey, onNext, onPrevious }: Props) {
  const playerRef = useRef<HTMLDivElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault()
        setIsPlaying(prev => !prev)
        break
      case 'ArrowLeft':
        e.preventDefault()
        onPrevious()
        break
      case 'ArrowRight':
        e.preventDefault()
        onNext()
        break
      case 'm':
      case 'M':
        e.preventDefault()
        setIsMuted(prev => !prev)
        break
      case 'Escape':
        document.exitFullscreen()
        break
    }
  }, [onNext, onPrevious])

  useEffect(() => {
    const element = playerRef.current
    if (!element) return

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      ref={playerRef}
      tabIndex={0}
      role="region"
      aria-label={`Video player for ${movie.title}`}
      className="focus:outline-none focus:ring-4 focus:ring-blue-500"
    >
      <ReactPlayer
        url={`https://www.youtube.com/watch?v=${videoKey}`}
        playing={isPlaying}
        muted={isMuted}
      />

      {/* Visible Focus Indicator */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPlaying ? 'Playing' : 'Paused'}
      </div>
    </div>
  )
}
```

### 8.3 Screen Reader Support

**Semantic HTML & ARIA:**
```tsx
export function SwipeCard({ movie, onSwipe }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isLiked = isFavorite(movie.id)

  return (
    <article
      role="article"
      aria-labelledby={`movie-title-${movie.id}`}
      className="swipe-card"
    >
      {/* Title - Always announce */}
      <h2 id={`movie-title-${movie.id}`} className="text-2xl font-bold">
        {movie.title}
      </h2>

      {/* Description */}
      <p className="text-gray-300">
        {movie.overview}
      </p>

      {/* Video Player */}
      <div
        role="region"
        aria-label={`Trailer for ${movie.title}`}
      >
        <VideoPlayer videoKey={movie.trailer.key} />
      </div>

      {/* Action Buttons */}
      <div role="group" aria-label="Movie actions">
        <button
          onClick={() => onSwipe('left')}
          aria-label={`Reject ${movie.title}`}
          className="btn-reject"
        >
          <XIcon aria-hidden="true" />
          <span className="sr-only">Reject</span>
        </button>

        <button
          onClick={() => toggleFavorite(movie)}
          aria-label={
            isLiked
              ? `Remove ${movie.title} from favorites`
              : `Add ${movie.title} to favorites`
          }
          aria-pressed={isLiked}
          className="btn-favorite"
        >
          <HeartIcon aria-hidden="true" filled={isLiked} />
          <span className="sr-only">
            {isLiked ? 'Remove from' : 'Add to'} favorites
          </span>
        </button>
      </div>

      {/* Live Region for Feedback */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLiked && `${movie.title} added to favorites`}
      </div>
    </article>
  )
}
```

### 8.4 Focus Management

**Focus Trap for Modals:**
```typescript
// lib/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react'

export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstElement?.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  return containerRef
}
```

### 8.5 Color Contrast & Visual Design

**WCAG AA Contrast Requirements:**
- Normal text (< 18pt): 4.5:1
- Large text (≥ 18pt or bold 14pt): 3:1
- UI components: 3:1

```typescript
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        // Ensure sufficient contrast
        'primary': '#2563eb',      // 4.5:1 on white
        'secondary': '#7c3aed',    // 4.5:1 on white
        'success': '#059669',      // 4.5:1 on white
        'error': '#dc2626',        // 4.5:1 on white
        'text-primary': '#111827', // 15:1 on white
        'text-secondary': '#4b5563' // 7:1 on white
      }
    }
  }
}
```

**Focus Indicators:**
```css
/* globals.css */
@layer utilities {
  .focus-visible {
    @apply outline-none ring-4 ring-blue-500 ring-offset-2;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .focus-visible {
      @apply ring-8;
    }
  }
}
```

### 8.6 Skip Links

```tsx
// app/layout.tsx
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="
            sr-only focus:not-sr-only
            focus:absolute focus:top-4 focus:left-4
            bg-blue-600 text-white px-4 py-2 rounded
            z-50
          "
        >
          Skip to main content
        </a>

        <nav aria-label="Main navigation">
          {/* Navigation */}
        </nav>

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}
```

**Sources:**
- [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## 9. TypeScript Patterns

### 9.1 Type Definitions

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
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
  video: boolean
  trailer?: VideoResult
}

export interface VideoResult {
  id: string
  iso_639_1: string
  iso_3166_1: string
  key: string
  name: string
  site: 'YouTube' | 'Vimeo'
  size: number
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes'
  official: boolean
  published_at: string
}

export interface Genre {
  id: number
  name: string
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

export interface GenresResponse {
  genres: Genre[]
}
```

```typescript
// types/swipe.ts

export type SwipeDirection = 'left' | 'right'

export interface SwipeInfo {
  movieId: number
  direction: SwipeDirection
  timestamp: number
}

export interface SwipeCallbacks {
  onSwipe: (movieId: number, direction: SwipeDirection) => void
  onSwipeLeft: (movieId: number) => void
  onSwipeRight: (movieId: number) => void
}
```

### 9.2 Component Props with TypeScript

```typescript
// components/client/VideoPlayer.tsx

import type { VideoResult } from '@/types/movie'
import type { ComponentPropsWithoutRef } from 'react'

interface VideoPlayerProps extends ComponentPropsWithoutRef<'div'> {
  video: VideoResult
  isActive: boolean
  autoplay?: boolean
  muted?: boolean
  onReady?: () => void
  onError?: (error: Error) => void
  onEnded?: () => void
}

export function VideoPlayer({
  video,
  isActive,
  autoplay = true,
  muted = true,
  onReady,
  onError,
  onEnded,
  className,
  ...divProps
}: VideoPlayerProps) {
  // Implementation
}
```

### 9.3 Generic Hooks

```typescript
// lib/hooks/useAsync.ts

import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate
  })

  const execute = useCallback(async () => {
    setState({ data: null, error: null, isLoading: true })

    try {
      const data = await asyncFunction()
      setState({ data, error: null, isLoading: false })
      return data
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        isLoading: false
      })
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute }
}
```

### 9.4 Discriminated Unions

```typescript
// types/api.ts

type ApiSuccess<T> = {
  status: 'success'
  data: T
}

type ApiError = {
  status: 'error'
  error: {
    code: string
    message: string
  }
}

type ApiLoading = {
  status: 'loading'
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError | ApiLoading

// Usage
function handleResponse<T>(response: ApiResponse<T>) {
  switch (response.status) {
    case 'success':
      return response.data // Type: T
    case 'error':
      return response.error // Type: { code: string, message: string }
    case 'loading':
      return null
  }
}
```

### 9.5 Utility Types

```typescript
// types/utils.ts

// Make all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

// Pick specific keys and make them required
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

// Omit null and undefined from type
export type NonNullable<T> = T extends null | undefined ? never : T

// Extract promise return type
export type Awaited<T> = T extends Promise<infer U> ? U : T

// Usage examples
type PartialMovie = DeepPartial<Movie>
type MovieWithTrailer = RequireKeys<Movie, 'trailer'>
type MovieData = Awaited<ReturnType<typeof fetchMovies>>
```

---

## 10. Code Examples

### 10.1 Complete Swipeable Card Stack

```typescript
// components/client/MovieSwiper.tsx
'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import type { Movie } from '@/types/movie'
import { VideoPlayer } from './VideoPlayer'
import { useFavorites } from '@/lib/hooks/useFavorites'

const SWIPE_THRESHOLD = 150
const SWIPE_VELOCITY = 500

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
        // Load more when reaching near end
        if (next >= movies.length - 2 && onLoadMore) {
          onLoadMore()
        }
        return next
      })
      setExitDirection(null)
    }, 300)
  }, [currentIndex, movies, toggleFavorite, onLoadMore])

  const handleDragEnd = useCallback((
    event: any,
    info: PanInfo
  ) => {
    const { offset, velocity } = info

    if (
      Math.abs(offset.x) > SWIPE_THRESHOLD ||
      Math.abs(velocity.x) > SWIPE_VELOCITY
    ) {
      handleSwipe(offset.x > 0 ? 'right' : 'left')
    }
  }, [handleSwipe])

  if (currentIndex >= movies.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl">No more movies!</p>
      </div>
    )
  }

  const currentMovie = movies[currentIndex]
  const nextMovie = movies[currentIndex + 1]

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Next Card (Background) */}
      {nextMovie && (
        <div className="absolute inset-0 opacity-50 scale-95">
          <img
            src={`https://image.tmdb.org/t/p/w1280${nextMovie.backdrop_path}`}
            alt={nextMovie.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Current Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          initial={{ scale: 1, opacity: 1 }}
          exit={{
            x: exitDirection === 'right' ? 1000 : -1000,
            opacity: 0,
            scale: 0.8,
            rotate: exitDirection === 'right' ? 20 : -20
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-full h-full">
            {/* Video Player */}
            {currentMovie.trailer && (
              <VideoPlayer
                video={currentMovie.trailer}
                isActive={true}
                autoplay
                muted
              />
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            {/* Movie Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{currentMovie.title}</h2>
              <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                {currentMovie.overview}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  ⭐ {currentMovie.vote_average.toFixed(1)}
                </span>
                <span>
                  {new Date(currentMovie.release_date).getFullYear()}
                </span>
              </div>
            </div>

            {/* Swipe Indicator */}
            <SwipeIndicator direction={exitDirection} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-8 z-10">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm
                     flex items-center justify-center
                     hover:bg-white/30 transition-colors
                     active:scale-95"
          aria-label="Skip movie"
        >
          <XIcon className="w-8 h-8 text-white" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-red-500/80 backdrop-blur-sm
                     flex items-center justify-center
                     hover:bg-red-500 transition-colors
                     active:scale-95"
          aria-label="Like movie"
        >
          <HeartIcon className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  )
}

function SwipeIndicator({ direction }: { direction: 'left' | 'right' | null }) {
  if (!direction) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        absolute top-1/2 -translate-y-1/2
        ${direction === 'right' ? 'right-8' : 'left-8'}
        px-6 py-3 rounded-full
        ${direction === 'right' ? 'bg-green-500' : 'bg-red-500'}
        text-white font-bold text-xl
      `}
    >
      {direction === 'right' ? 'LIKE' : 'NOPE'}
    </motion.div>
  )
}
```

### 10.2 Complete TMDB Integration

```typescript
// app/page.tsx (Server Component)
import { getMoviesWithTrailers } from '@/lib/api/movies'
import { MovieSwiper } from '@/components/client/MovieSwiper'
import { Suspense } from 'react'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const initialMovies = await getMoviesWithTrailers()

  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSkeleton />}>
        <MovieSwiper movies={initialMovies} />
      </Suspense>
    </main>
  )
}
```

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

    // Fetch trailers in parallel
    const moviesWithTrailers = await Promise.allSettled(
      moviesData.results.map(async (movie) => {
        const videosData = await tmdb.movies.videos(movie.id)
        const trailer = getBestTrailer(videosData.results)
        return { ...movie, trailer }
      })
    )

    // Filter successful results with trailers
    return moviesWithTrailers
      .filter((result): result is PromiseFulfilledResult<Movie> =>
        result.status === 'fulfilled' && result.value.trailer !== null
      )
      .map(result => result.value)
  } catch (error) {
    console.error('Failed to fetch movies:', error)
    throw new Error('Could not load movies')
  }
}
```

### 10.3 Server Action for Infinite Loading

```typescript
// app/actions/loadMoreMovies.ts
'use server'

import { getMoviesWithTrailers } from '@/lib/api/movies'

export async function loadMoreMovies(page: number, genreId?: number) {
  try {
    const movies = await getMoviesWithTrailers(genreId, page)
    return { success: true, data: movies }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

```typescript
// components/client/InfiniteMovieSwiper.tsx
'use client'

import { useState, useCallback } from 'react'
import { loadMoreMovies } from '@/app/actions/loadMoreMovies'
import { MovieSwiper } from './MovieSwiper'

export function InfiniteMovieSwiper({ initialMovies, genreId }: Props) {
  const [movies, setMovies] = useState(initialMovies)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMore = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    const nextPage = page + 1
    const result = await loadMoreMovies(nextPage, genreId)

    if (result.success) {
      setMovies(prev => [...prev, ...result.data])
      setPage(nextPage)
    }
    setIsLoading(false)
  }, [page, genreId, isLoading])

  return <MovieSwiper movies={movies} onLoadMore={handleLoadMore} />
}
```

---

## Additional Resources

### Official Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Framer Motion API](https://www.framer.com/motion/)
- [Embla Carousel Docs](https://www.embla-carousel.com/)
- [TMDB API Reference](https://developer.themoviedb.org/reference/intro/getting-started)
- [ReactPlayer GitHub](https://github.com/cookpete/react-player)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community Resources
- [usehooks-ts](https://usehooks-ts.com/) - TypeScript React hooks library
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

### Example Projects
- [TikTok Style Swiper](https://blog.peng37.com/a-react-component-for-tiktok-style-swiper)
- [Movie App with TMDB](https://github.com/aamnah/tmdb-movies)
- [Tinder-like Cards](https://dev.to/lansolo99/a-tinder-like-card-game-with-framer-motion-35i5)

---

## Summary Checklist

### Architecture
- [ ] Use Server Components by default
- [ ] Add 'use client' only for interactive components
- [ ] Fetch data on the server with proper caching
- [ ] Implement proper error boundaries

### Video & Swipe
- [ ] Choose Framer Motion or Embla Carousel
- [ ] Implement swipe threshold (150px standard)
- [ ] Control video playback (only one active)
- [ ] Add loading states and error handling

### TMDB Integration
- [ ] Secure API keys in environment variables
- [ ] Implement proper error handling
- [ ] Filter movies without trailers
- [ ] Cache responses with Next.js revalidation

### Performance
- [ ] Lazy load videos with intersection observer
- [ ] Optimize images with Next.js Image
- [ ] Implement virtualization for lists
- [ ] Monitor bundle size

### Mobile & Accessibility
- [ ] Mobile-first responsive design
- [ ] Touch target minimum 44x44px
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] WCAG AA color contrast

### TypeScript
- [ ] Define proper types for all data
- [ ] Use generics for reusable hooks
- [ ] Type API responses
- [ ] Enable strict mode

---

**Document Version:** 1.0
**Last Updated:** 2025-01-11
**Tech Stack:** Next.js 15+, TypeScript, Tailwind CSS, Framer Motion/Embla, ReactPlayer, TMDB API
