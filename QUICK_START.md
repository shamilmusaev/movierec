# TrailerSwipe - Quick Start Guide

This is a condensed reference for the TrailerSwipe project. For detailed documentation, see [FRAMEWORK_DOCUMENTATION.md](/Users/dwhitewolf/Desktop/movierec/FRAMEWORK_DOCUMENTATION.md)

## Project Setup

**Current Stack:**
- Next.js 16.0.1 (App Router)
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4
- Node.js 20+

**Required Dependencies:**
```bash
npm install framer-motion
npm install --save-dev @types/youtube
```

**Environment Variables:**
Create `.env.local`:
```bash
TMDB_API_KEY=your_api_key_here
TMDB_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your TMDB API key: https://www.themoviedb.org/settings/api

---

## Essential Code Snippets

### 1. TMDB API Helper

```typescript
// lib/tmdb.ts
const BASE_URL = 'https://api.themoviedb.org/3'
const headers = {
  'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  'accept': 'application/json'
}

export async function getPopularMovies(page: number = 1) {
  const res = await fetch(
    `${BASE_URL}/movie/popular?language=en-US&page=${page}`,
    {
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    }
  )
  return res.json()
}

export async function getMovieVideos(movieId: number) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?language=en-US`,
    {
      headers,
      next: { revalidate: 86400 } // Cache for 24 hours
    }
  )
  return res.json()
}

export function getImageUrl(path: string | null, size = 'original') {
  if (!path) return '/placeholder.jpg'
  return `https://image.tmdb.org/t/p/${size}${path}`
}
```

### 2. Basic Types

```typescript
// lib/types.ts
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date: string
  genre_ids: number[]
}

export interface Video {
  key: string
  site: string
  type: 'Trailer' | 'Teaser' | 'Clip'
  official: boolean
  name: string
}
```

### 3. Swipe Card Component

```typescript
// app/components/swipe-card.tsx
'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'

export default function SwipeCard({ movie, onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipeRight()
    } else if (info.offset.x < -100) {
      onSwipeLeft()
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className="absolute w-[90vw] h-[70vh] bg-white rounded-2xl shadow-xl"
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-full object-cover rounded-2xl"
      />
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <h2 className="text-white text-2xl font-bold">{movie.title}</h2>
      </div>
    </motion.div>
  )
}
```

### 4. YouTube Player Component

```typescript
// app/components/youtube-player.tsx
'use client'

import { useEffect, useRef } from 'react'

export default function YouTubePlayer({ videoKey, isActive }) {
  const playerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !window.YT) return

    playerRef.current = new YT.Player(containerRef.current, {
      videoId: videoKey,
      playerVars: {
        autoplay: 0,
        mute: 1,
        controls: 0,
        modestbranding: 1,
        playsinline: 1,
      },
    })

    return () => playerRef.current?.destroy()
  }, [videoKey])

  useEffect(() => {
    if (isActive) {
      playerRef.current?.playVideo()
    } else {
      playerRef.current?.pauseVideo()
    }
  }, [isActive])

  return <div ref={containerRef} className="w-full h-full" />
}
```

### 5. Server Component Page

```typescript
// app/page.tsx
import { getPopularMovies } from '@/lib/tmdb'
import SwipeContainer from '@/app/components/swipe-container'

export default async function HomePage() {
  const { results: movies } = await getPopularMovies()

  return (
    <main className="min-h-screen bg-gray-100">
      <SwipeContainer movies={movies} />
    </main>
  )
}
```

### 6. LocalStorage Hook

```typescript
// hooks/use-favorites.ts
'use client'

import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('favorites')
    if (stored) setFavorites(JSON.parse(stored))
  }, [])

  const addFavorite = (movie) => {
    const newFavorites = [...favorites, { ...movie, addedAt: Date.now() }]
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const removeFavorite = (movieId) => {
    const newFavorites = favorites.filter(f => f.id !== movieId)
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  return { favorites, addFavorite, removeFavorite }
}
```

---

## Key Patterns

### Server Component ↔ Client Component

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetch('...')  // Direct data fetching
  return <ClientComponent data={data} />
}

// Client Component (needs 'use client')
'use client'
export default function ClientComponent({ data }) {
  const [state, setState] = useState()  // Can use hooks
  return <div onClick={() => setState()}>...</div>
}
```

### TMDB Image URLs

```typescript
// Poster sizes: w92, w154, w185, w342, w500, w780, original
const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`

// Backdrop sizes: w300, w780, w1280, original
const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
```

### YouTube Embed URL

```typescript
// For trailers from /movie/{id}/videos endpoint
const youtubeUrl = `https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1`

// Filter for official trailer
const trailer = videos.results.find(v =>
  v.type === 'Trailer' && v.official && v.site === 'YouTube'
)
```

### Tailwind Mobile-First

```typescript
<div className="
  w-full          // Mobile default
  sm:w-1/2        // ≥640px
  md:w-1/3        // ≥768px
  lg:w-1/4        // ≥1024px
">
```

---

## Common Tasks

### Fetch Movies with Trailers

```typescript
export async function getMoviesWithTrailers(page = 1) {
  const { results } = await getPopularMovies(page)

  const moviesWithTrailers = await Promise.all(
    results.map(async (movie) => {
      const { results: videos } = await getMovieVideos(movie.id)
      const trailer = videos.find(v =>
        v.type === 'Trailer' && v.official && v.site === 'YouTube'
      )
      return {
        ...movie,
        trailerKey: trailer?.key || null
      }
    })
  )

  return moviesWithTrailers.filter(m => m.trailerKey)
}
```

### API Route Handler

```typescript
// app/api/movies/route.ts
import { getPopularMovies } from '@/lib/tmdb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page')) || 1

  const movies = await getPopularMovies(page)

  return Response.json(movies)
}
```

### Generate Metadata

```typescript
// app/movie/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params
  const movie = await getMovieById(id)

  return {
    title: `${movie.title} - TrailerSwipe`,
    description: movie.overview,
    openGraph: {
      images: [`https://image.tmdb.org/t/p/original${movie.backdrop_path}`],
    },
  }
}
```

---

## Testing Checklist

- [ ] TMDB API key works (test with `/movie/popular`)
- [ ] YouTube IFrame API loads (`window.YT` exists)
- [ ] Swipe gestures work on mobile (use DevTools mobile emulator)
- [ ] Videos autoplay when muted
- [ ] Only one video plays at a time
- [ ] LocalStorage persists favorites
- [ ] Images load with proper sizes
- [ ] Dark mode works (if implemented)
- [ ] Responsive design (test all breakpoints)

---

## Troubleshooting

**TMDB API 401 Error:**
- Check API key in `.env.local`
- Verify you're using `Authorization: Bearer` header
- Restart dev server after changing env vars

**YouTube Autoplay Blocked:**
- Ensure `mute: 1` parameter is set
- Check browser console for autoplay policy errors
- Add `onAutoplayBlocked` event handler

**TypeScript Errors with Async Components:**
- Verify TypeScript ≥5.1.3
- Verify @types/react ≥18.2.8
- Check `tsconfig.json` has `strict: true`

**Framer Motion Not Working:**
- Add `'use client'` to component
- Check `framer-motion` is installed
- Verify import path is correct

**Tailwind Styles Not Applying:**
- Check `globals.css` imports `@import "tailwindcss"`
- Verify class names are correct (v4 syntax)
- Clear `.next` cache and restart dev server

---

## Next Steps

1. Install dependencies: `npm install framer-motion @types/youtube`
2. Set up TMDB API credentials in `.env.local`
3. Create basic TMDB helper functions in `lib/tmdb.ts`
4. Build swipe card component with Framer Motion
5. Implement YouTube player integration
6. Add favorites with LocalStorage
7. Style with Tailwind CSS v4
8. Test on mobile devices

---

## Resources

- **Full Documentation:** [FRAMEWORK_DOCUMENTATION.md](/Users/dwhitewolf/Desktop/movierec/FRAMEWORK_DOCUMENTATION.md)
- **PRD:** [prd.md](/Users/dwhitewolf/Desktop/movierec/prd.md)
- **TMDB API Docs:** https://developer.themoviedb.org
- **Next.js Docs:** https://nextjs.org/docs
- **Framer Motion:** https://motion.dev
- **Tailwind CSS:** https://tailwindcss.com

**Last Updated:** November 11, 2025
