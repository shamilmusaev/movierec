# TrailerSwipe - Quick Implementation Guide

This is a condensed quick-start guide. For detailed best practices, see [BEST_PRACTICES.md](/Users/dwhitewolf/Desktop/movierec/BEST_PRACTICES.md).

---

## Quick Start Setup

### 1. Install Dependencies

```bash
npm install framer-motion react-player
# OR
npm install embla-carousel-react embla-carousel-autoplay react-player

# Additional utilities
npm install @tanstack/react-query  # For better data fetching (optional)
npm install react-intersection-observer  # For lazy loading
```

### 2. Environment Variables

```bash
# .env.local
TMDB_API_KEY=your_api_key_here
TMDB_ACCESS_TOKEN=your_bearer_token_here
```

Get your API key from: https://www.themoviedb.org/settings/api

---

## Project Structure

```
app/
├── (routes)/
│   ├── page.tsx              # Home - Server Component
│   ├── explore/
│   │   └── page.tsx          # Browse by category
│   └── favorite/
│       └── page.tsx          # Favorites list
├── actions/
│   └── loadMoreMovies.ts     # Server Actions
├── components/
│   ├── client/
│   │   ├── MovieSwiper.tsx   # Main swipeable component
│   │   ├── VideoPlayer.tsx   # Video player wrapper
│   │   └── SwipeCard.tsx     # Individual card
│   └── server/
│       └── CategoryNav.tsx   # Navigation
├── lib/
│   ├── api/
│   │   ├── tmdb.ts           # TMDB API client
│   │   └── movies.ts         # Movie-specific functions
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useFavorites.ts
│   │   └── useSwipe.ts
│   └── utils/
│       ├── video.ts          # Video helper functions
│       └── image.ts          # Image URL builders
└── types/
    ├── movie.ts
    └── swipe.ts
```

---

## Implementation Steps

### Step 1: TMDB API Client

Create the API client first:

```typescript
// lib/api/tmdb.ts
const BASE_URL = 'https://api.themoviedb.org/3'
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN

async function tmdbFetch<T>(endpoint: string, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
    ...options
  })

  if (!res.ok) throw new Error(`TMDB API Error: ${res.status}`)
  return res.json() as Promise<T>
}

export const tmdb = {
  movies: {
    popular: (page = 1) => tmdbFetch(`/movie/popular?page=${page}`),
    videos: (movieId: number) => tmdbFetch(`/movie/${movieId}/videos`)
  }
}
```

### Step 2: Fetch Movies with Trailers

```typescript
// lib/api/movies.ts
import { tmdb } from './tmdb'
import { getBestTrailer } from '@/lib/utils/video'

export async function getMoviesWithTrailers() {
  const data = await tmdb.movies.popular()

  const moviesWithTrailers = await Promise.all(
    data.results.map(async (movie) => {
      const videos = await tmdb.movies.videos(movie.id)
      const trailer = getBestTrailer(videos.results)
      return { ...movie, trailer }
    })
  )

  return moviesWithTrailers.filter(m => m.trailer !== null)
}
```

```typescript
// lib/utils/video.ts
export function getBestTrailer(videos: VideoResult[]) {
  const youtubeVideos = videos.filter(v => v.site === 'YouTube')

  return (
    youtubeVideos.find(v => v.official && v.type === 'Trailer') ||
    youtubeVideos.find(v => v.type === 'Trailer') ||
    youtubeVideos.find(v => v.type === 'Teaser') ||
    youtubeVideos[0] ||
    null
  )
}
```

### Step 3: Video Player Component

```typescript
// components/client/VideoPlayer.tsx
'use client'

import ReactPlayer from 'react-player/youtube'
import { useEffect, useState } from 'react'

export function VideoPlayer({ videoKey, isActive, autoplay = true, muted = true }) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(isActive && autoplay)
  }, [isActive, autoplay])

  return (
    <ReactPlayer
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
            playsinline: 1
          }
        }
      }}
    />
  )
}
```

### Step 4: Swipeable Card (Framer Motion)

```typescript
// components/client/MovieSwiper.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoPlayer } from './VideoPlayer'
import { useFavorites } from '@/lib/hooks/useFavorites'

const SWIPE_THRESHOLD = 150

export function MovieSwiper({ movies }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { toggleFavorite } = useFavorites()

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      toggleFavorite(movies[currentIndex])
    }
    setCurrentIndex(prev => prev + 1)
  }

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      handleSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
  }

  if (currentIndex >= movies.length) {
    return <div>No more movies!</div>
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={movies[currentIndex].id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          exit={{ x: 1000, opacity: 0 }}
          className="absolute inset-0"
        >
          <VideoPlayer
            videoKey={movies[currentIndex].trailer.key}
            isActive={true}
          />

          <div className="absolute bottom-0 p-6 text-white">
            <h2 className="text-3xl font-bold">{movies[currentIndex].title}</h2>
            <p className="text-gray-300">{movies[currentIndex].overview}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-8">
        <button onClick={() => handleSwipe('left')} className="...">
          Skip
        </button>
        <button onClick={() => handleSwipe('right')} className="...">
          Like
        </button>
      </div>
    </div>
  )
}
```

### Step 5: Favorites Hook

```typescript
// lib/hooks/useFavorites.ts
'use client'

import { useLocalStorage } from './useLocalStorage'
import { useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage('trailerswipe-favorites', [])

  const toggleFavorite = useCallback((movie) => {
    setFavorites(prev => {
      const exists = prev.some(m => m.id === movie.id)
      return exists
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, movie]
    })
  }, [setFavorites])

  const isFavorite = useCallback((movieId) => {
    return favorites.some(m => m.id === movieId)
  }, [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
```

```typescript
// lib/hooks/useLocalStorage.ts
'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    }
  }

  return [storedValue, setValue] as const
}
```

### Step 6: Main Page (Server Component)

```typescript
// app/page.tsx
import { getMoviesWithTrailers } from '@/lib/api/movies'
import { MovieSwiper } from '@/components/client/MovieSwiper'

export const revalidate = 3600

export default async function HomePage() {
  const movies = await getMoviesWithTrailers()

  return (
    <main>
      <MovieSwiper movies={movies} />
    </main>
  )
}
```

---

## Key TypeScript Types

```typescript
// types/movie.ts
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date: string
  trailer?: VideoResult
}

export interface VideoResult {
  id: string
  key: string              // YouTube video ID
  name: string
  site: 'YouTube' | 'Vimeo'
  type: 'Trailer' | 'Teaser' | 'Clip'
  official: boolean
}
```

---

## Essential Tailwind Classes

```typescript
// Swipe container
className="h-screen w-full overflow-hidden bg-black"

// Card
className="absolute inset-0"

// Video aspect ratio
className="aspect-video w-full"

// Overlay gradient
className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"

// Touch button (44x44px minimum)
className="min-h-[44px] min-w-[44px] p-3"

// Mobile-safe height
className="h-[100dvh]"
```

---

## Performance Tips

1. **Only one video playing**: Control with `isActive` prop
2. **Lazy load images**: Use Next.js `<Image>` component
3. **Memoize callbacks**: Use `useCallback` for handlers
4. **Debounce swipes**: Prevent rapid firing
5. **Limit loaded movies**: Implement pagination

---

## Accessibility Checklist

- [ ] Keyboard navigation (Arrow keys, Space, Enter)
- [ ] Focus indicators visible
- [ ] ARIA labels on buttons
- [ ] Screen reader announcements
- [ ] Color contrast WCAG AA (4.5:1)
- [ ] Touch targets 44x44px minimum

---

## Common Issues & Solutions

### Issue: Videos not autoplaying on iOS
**Solution:** Ensure `muted={true}` and `playsinline: 1` in config

### Issue: Multiple videos playing at once
**Solution:** Use single `activeIndex` state, pass `isActive` to each player

### Issue: localStorage error on server
**Solution:** Check `typeof window !== 'undefined'` before accessing

### Issue: Swipe not smooth
**Solution:** Use `dragElastic={0.7}` and proper `dragConstraints`

### Issue: Memory leaks with videos
**Solution:** Destroy player instances when unmounted using cleanup in `useEffect`

---

## Next Steps

1. Implement infinite scroll with server actions
2. Add category filtering
3. Create favorites page
4. Add user preferences (quality, autoplay)
5. Implement analytics tracking
6. Add social sharing features

---

## Useful Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Lint
npm run lint
```

---

## Resources

- Full guide: [BEST_PRACTICES.md](./BEST_PRACTICES.md)
- TMDB API: https://developer.themoviedb.org/docs
- Framer Motion: https://www.framer.com/motion/
- Next.js 15: https://nextjs.org/docs
- ReactPlayer: https://github.com/cookpete/react-player

---

**Quick Reference Card:**

| Feature | Library/Pattern |
|---------|----------------|
| Swipe | Framer Motion `drag` + `onDragEnd` |
| Video | ReactPlayer with YouTube config |
| Storage | Custom `useLocalStorage` hook |
| Data Fetch | Server Components + `fetch` |
| Caching | `next: { revalidate: 3600 }` |
| Types | TypeScript strict mode |
| Mobile | Tailwind mobile-first + `dvh` |
| A11y | ARIA + keyboard handlers |

---

**Last Updated:** 2025-01-11
