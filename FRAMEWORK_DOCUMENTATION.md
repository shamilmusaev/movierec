# TrailerSwipe - Comprehensive Framework Documentation

**Project:** TrailerSwipe (MVP)
**Tech Stack:** Next.js 16.0.1, React 19.2.0, TypeScript 5, Tailwind CSS 4, Framer Motion
**Target:** Mobile-first Tinder-style movie trailer swiper
**Date:** November 2025

---

## Table of Contents

1. [Next.js 16 App Router](#1-nextjs-16-app-router)
2. [TMDB API v3](#2-tmdb-api-v3)
3. [Framer Motion](#3-framer-motion)
4. [YouTube IFrame Player API](#4-youtube-iframe-player-api)
5. [Tailwind CSS v4](#5-tailwind-css-v4)
6. [TypeScript Best Practices](#6-typescript-best-practices)
7. [Project-Specific Type Definitions](#7-project-specific-type-definitions)

---

## 1. Next.js 16 App Router

**Official Docs:** https://nextjs.org/docs/app
**Version:** 16.0.1
**React Version:** 19.2.0

### 1.1 Server Components vs Client Components

#### Key Differences

**Server Components** (Default in Next.js):
- Render on the server only
- Can directly access databases, APIs, and secrets
- Reduce JavaScript bundle sent to browser
- Improve First Contentful Paint (FCP)
- Support async/await natively

**Client Components** (Marked with `'use client'`):
- Execute in the browser
- Enable interactivity and state management
- Access to browser APIs (localStorage, window)
- Support React hooks (useState, useEffect, etc.)

#### When to Use Each

Use **Server Components** for:
- Database/API queries near data source
- Protecting API keys and secrets
- Reducing client-side JavaScript
- Progressive content streaming
- SEO-critical content

Use **Client Components** for:
- State management (`useState`, `useReducer`)
- Event handlers (`onClick`, `onChange`, `onDrag`)
- Lifecycle effects (`useEffect`, `useLayoutEffect`)
- Browser APIs (`localStorage`, `navigator`, `window`)
- Custom React hooks
- Interactive UI elements (buttons, forms, swipeable cards)

#### Code Examples

**Server Component (Default):**
```typescript
// app/movies/page.tsx
import { getPopularMovies } from '@/lib/tmdb'

export default async function MoviesPage() {
  // Direct data fetching in Server Component
  const movies = await getPopularMovies()

  return (
    <div>
      <h1>Popular Movies</h1>
      {movies.map(movie => (
        <div key={movie.id}>{movie.title}</div>
      ))}
    </div>
  )
}
```

**Client Component:**
```typescript
// app/ui/swipe-card.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SwipeCard({ movie }: { movie: Movie }) {
  const [liked, setLiked] = useState(false)

  return (
    <motion.div
      drag
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) setLiked(true)
      }}
    >
      {movie.title}
    </motion.div>
  )
}
```

**Pattern: Server Component → Client Component (Props):**
```typescript
// app/page.tsx (Server Component)
import SwipeCard from '@/app/ui/swipe-card'
import { getPopularMovies } from '@/lib/tmdb'

export default async function HomePage() {
  const movies = await getPopularMovies()

  return (
    <div>
      {movies.map(movie => (
        <SwipeCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

// app/ui/swipe-card.tsx (Client Component)
'use client'

export default function SwipeCard({ movie }: { movie: Movie }) {
  // Handles client interactivity
  return <div>{movie.title}</div>
}
```

**Advanced: Passing Server Components as Children:**
```typescript
// app/ui/modal.tsx (Client Component)
'use client'

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div className="modal">{children}</div>
}

// app/page.tsx (Server Component)
import Modal from './ui/modal'
import MovieDetails from './ui/movie-details' // Server Component

export default function Page() {
  return (
    <Modal>
      <MovieDetails /> {/* Stays a Server Component */}
    </Modal>
  )
}
```

### 1.2 Data Fetching with fetch, cache, and revalidate

Next.js extends the Web `fetch()` API with caching and revalidation:

#### Cache Options

```typescript
// No caching (default for route handlers)
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})

// Force cache
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
})

// Time-based revalidation (ISR)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Revalidate every hour
})

// Tag-based revalidation
const data = await fetch('https://api.example.com/data', {
  next: { tags: ['movies'] }
})
```

#### Revalidation Methods

**Time-based (ISR):**
```typescript
// lib/tmdb.ts
export async function getPopularMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } } // Revalidate every hour
  )
  return res.json()
}
```

**On-demand with revalidateTag:**
```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const tag = request.nextUrl.searchParams.get('tag')
  revalidateTag(tag)
  return Response.json({ revalidated: true, now: Date.now() })
}

// lib/tmdb.ts
export async function getPopularMovies() {
  const res = await fetch(
    'https://api.themoviedb.org/3/movie/popular',
    { next: { tags: ['popular-movies'] } }
  )
  return res.json()
}
```

### 1.3 Route Handlers (API Routes)

**Official Docs:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

#### Supported HTTP Methods

`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`

#### Basic Structure

```typescript
// app/api/movies/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  return Response.json({ movies: [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  return Response.json({ success: true })
}
```

#### Dynamic Routes

```typescript
// app/api/movies/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const movie = await getMovieById(id)
  return Response.json(movie)
}
```

#### Common Operations

**Reading Cookies:**
```typescript
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  return Response.json({ token })
}
```

**Accessing Headers:**
```typescript
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()
  const referer = headersList.get('referer')

  return Response.json({ referer })
}
```

**CORS Headers:**
```typescript
export async function GET(request: Request) {
  return new Response(JSON.stringify({ data: 'hello' }), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### 1.4 Metadata and SEO

**Official Docs:** https://nextjs.org/docs/app/api-reference/functions/generate-metadata

#### Static Metadata

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TrailerSwipe - Discover Movies by Swiping Trailers',
  description: 'Swipe through movie trailers Tinder-style and find your next favorite film',
  keywords: ['movies', 'trailers', 'swipe', 'discover'],
  openGraph: {
    title: 'TrailerSwipe',
    description: 'Discover movies by swiping trailers',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrailerSwipe',
    description: 'Discover movies by swiping trailers',
    images: ['/twitter-image.jpg'],
  },
}
```

#### Dynamic Metadata with generateMetadata

```typescript
// app/movie/[id]/page.tsx
import type { Metadata } from 'next'
import { getMovieById } from '@/lib/tmdb'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function MoviePage({ params }: Props) {
  const { id } = await params
  const movie = await getMovieById(id)

  return <div>{movie.title}</div>
}
```

**Important Notes:**
- Metadata exports are **only supported in Server Components**
- Cannot export both `metadata` object and `generateMetadata` function from same segment
- Fetch requests in `generateMetadata` are automatically memoized
- Metadata is merged across nested layouts

### 1.5 Next.js 16 Performance Features

**Official Announcement:** https://nextjs.org/blog/next-16

- **Turbopack:** Full builds 3.78x faster, incremental builds 8.8x faster
- **Improved TypeScript:** Better error messages, clearer type inference
- **React 19.2:** Latest React features including async components
- **Edge Runtime:** Better debugging and performance

---

## 2. TMDB API v3

**Official Docs:** https://developer.themoviedb.org/reference/intro/getting-started
**Version:** v3
**Base URL:** `https://api.themoviedb.org/3`

### 2.1 Authentication

#### API Key Method

Register for an API key at: https://www.themoviedb.org/settings/api

**Two authentication methods:**

1. **Query Parameter:**
```
https://api.themoviedb.org/3/movie/popular?api_key=YOUR_API_KEY
```

2. **Bearer Token (Recommended):**
```bash
curl --request GET \
  --url 'https://api.themoviedb.org/3/movie/popular' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'accept: application/json'
```

#### Environment Variables Setup

```bash
# .env.local
TMDB_API_KEY=your_api_key_here
TMDB_ACCESS_TOKEN=your_access_token_here
```

```typescript
// lib/tmdb.ts
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN

const headers = {
  'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
  'accept': 'application/json'
}
```

### 2.2 Key Endpoints

#### /movie/popular - Get Popular Movies

**Endpoint:** `GET /movie/popular`
**Docs:** https://developer.themoviedb.org/reference/movie-popular-list

**Note:** This is a wrapper around the discover endpoint with `sort_by=popularity.desc`

**Parameters:**
- `language` (optional): ISO 639-1 code (default: en-US)
- `page` (optional): Page number (default: 1)
- `region` (optional): ISO 3166-1 code

**Example Request:**
```typescript
// lib/tmdb.ts
export async function getPopularMovies(page: number = 1) {
  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      'accept': 'application/json'
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!res.ok) throw new Error('Failed to fetch popular movies')

  return res.json()
}
```

**Response Format:**
```typescript
interface PopularMoviesResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

interface Movie {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}
```

**Example Response:**
```json
{
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/path/to/backdrop.jpg",
      "genre_ids": [28, 12, 878],
      "id": 299536,
      "original_language": "en",
      "original_title": "Avengers: Infinity War",
      "overview": "As the Avengers and their allies...",
      "popularity": 349.123,
      "poster_path": "/path/to/poster.jpg",
      "release_date": "2018-04-25",
      "title": "Avengers: Infinity War",
      "video": false,
      "vote_average": 8.3,
      "vote_count": 28954
    }
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

#### /movie/{id}/videos - Get Movie Videos/Trailers

**Endpoint:** `GET /movie/{movie_id}/videos`
**Docs:** https://developer.themoviedb.org/reference/movie-videos

**Parameters:**
- `movie_id` (required): Movie ID
- `language` (optional): ISO 639-1 code

**Example Request:**
```typescript
// lib/tmdb.ts
export async function getMovieVideos(movieId: number) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      'accept': 'application/json'
    },
    next: { revalidate: 86400 } // Cache for 24 hours
  })

  if (!res.ok) throw new Error('Failed to fetch movie videos')

  return res.json()
}
```

**Response Format:**
```typescript
interface MovieVideosResponse {
  id: number
  results: Video[]
}

interface Video {
  iso_639_1: string
  iso_3166_1: string
  name: string
  key: string // YouTube video key
  site: string // "YouTube"
  size: number // 360, 480, 720, 1080
  type: string // "Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes"
  official: boolean
  published_at: string
  id: string
}
```

**Example Response:**
```json
{
  "id": 299536,
  "results": [
    {
      "iso_639_1": "en",
      "iso_3166_1": "US",
      "name": "Official Trailer",
      "key": "6ZfuNTqbHE8",
      "site": "YouTube",
      "size": 1080,
      "type": "Trailer",
      "official": true,
      "published_at": "2018-03-16T13:00:00.000Z",
      "id": "5a9cf708c3a36834cd07c51b"
    }
  ]
}
```

**Building YouTube URL:**
```typescript
function getYouTubeUrl(key: string, autoplay: boolean = false, muted: boolean = true) {
  return `https://www.youtube.com/embed/${key}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}`
}

// Filter for official trailers
function getOfficialTrailer(videos: Video[]): Video | undefined {
  return videos.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube')
}
```

#### /genre/movie/list - Get Movie Genres

**Endpoint:** `GET /genre/movie/list`
**Docs:** https://developer.themoviedb.org/reference/genre-movie-list

**Parameters:**
- `language` (optional): ISO 639-1 code

**Example Request:**
```typescript
// lib/tmdb.ts
export async function getMovieGenres() {
  const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en-US'

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      'accept': 'application/json'
    },
    next: { revalidate: 604800 } // Cache for 1 week (genres rarely change)
  })

  if (!res.ok) throw new Error('Failed to fetch genres')

  return res.json()
}
```

**Response Format:**
```typescript
interface GenresResponse {
  genres: Genre[]
}

interface Genre {
  id: number
  name: string
}
```

**Example Response:**
```json
{
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 16, "name": "Animation" },
    { "id": 35, "name": "Comedy" },
    { "id": 80, "name": "Crime" },
    { "id": 18, "name": "Drama" },
    { "id": 14, "name": "Fantasy" },
    { "id": 27, "name": "Horror" },
    { "id": 878, "name": "Science Fiction" },
    { "id": 53, "name": "Thriller" }
  ]
}
```

**Genre Mapping Helper:**
```typescript
// lib/genres.ts
const GENRE_MAP = new Map<number, string>([
  [28, 'Action'],
  [12, 'Adventure'],
  [16, 'Animation'],
  [35, 'Comedy'],
  [80, 'Crime'],
  [18, 'Drama'],
  [14, 'Fantasy'],
  [27, 'Horror'],
  [878, 'Science Fiction'],
  [53, 'Thriller'],
])

export function getGenreNames(genreIds: number[]): string[] {
  return genreIds.map(id => GENRE_MAP.get(id) || 'Unknown')
}
```

### 2.3 Image URLs

TMDB provides images at different sizes. Base URL: `https://image.tmdb.org/t/p/`

**Image Sizes:**
- **Poster:** `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`
- **Backdrop:** `w300`, `w780`, `w1280`, `original`

**Helper Function:**
```typescript
// lib/tmdb.ts
export function getImageUrl(
  path: string | null,
  size: 'w300' | 'w500' | 'w780' | 'original' = 'original'
): string {
  if (!path) return '/placeholder-image.jpg'
  return `https://image.tmdb.org/t/p/${size}${path}`
}
```

### 2.4 Rate Limits and Best Practices

**Rate Limits:**
- TMDB doesn't publish strict rate limits publicly
- Recommended: Implement caching and avoid excessive requests
- Use Next.js revalidation to cache responses

**Best Practices:**
1. **Cache aggressively:** Popular movies change slowly
2. **Use revalidation:** Set appropriate `next: { revalidate }` times
3. **Protect API keys:** Always use environment variables
4. **Error handling:** Handle 404s for missing trailers gracefully
5. **Batch requests:** Fetch multiple movies' videos in parallel when needed

**Example with Error Handling:**
```typescript
// lib/tmdb.ts
export async function getMovieWithTrailer(movieId: number) {
  try {
    const [movie, videos] = await Promise.all([
      getMovieById(movieId),
      getMovieVideos(movieId)
    ])

    const trailer = videos.results.find(
      v => v.type === 'Trailer' && v.site === 'YouTube' && v.official
    )

    return {
      ...movie,
      trailerKey: trailer?.key || null
    }
  } catch (error) {
    console.error('Failed to fetch movie with trailer:', error)
    throw error
  }
}
```

---

## 3. Framer Motion

**Official Docs:** https://motion.dev
**Recommended Version:** ^11.0.0 (Latest)
**Installation:** `npm install framer-motion`

### 3.1 Drag Gestures

**Docs:** https://motion.dev/docs/gestures

Framer Motion provides powerful drag gesture support perfect for swipeable cards.

#### Basic Drag Setup

```typescript
'use client'

import { motion } from 'framer-motion'

export default function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileDrag={{ scale: 0.95 }}
    >
      Drag me!
    </motion.div>
  )
}
```

#### Drag Direction Control

```typescript
<motion.div
  drag="x" // Only horizontal dragging
  dragElastic={0.2} // Resistance when dragging past constraints
/>

<motion.div
  drag="y" // Only vertical dragging
/>

<motion.div
  drag // Both directions
/>
```

#### Drag Constraints

```typescript
// Pixel-based constraints
<motion.div
  drag
  dragConstraints={{
    top: -50,
    left: -50,
    right: 50,
    bottom: 50
  }}
/>

// Ref-based constraints (constrain to parent)
'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function ConstrainedDrag() {
  const constraintsRef = useRef(null)

  return (
    <div ref={constraintsRef} className="w-full h-screen">
      <motion.div
        drag
        dragConstraints={constraintsRef}
      >
        Drag me!
      </motion.div>
    </div>
  )
}
```

#### Drag Events

```typescript
'use client'

import { motion } from 'framer-motion'

export default function SwipeCard() {
  return (
    <motion.div
      drag="x"
      onDragStart={(event, info) => {
        console.log('Drag started', info.point, info.offset)
      }}
      onDrag={(event, info) => {
        console.log('Dragging', info.point, info.offset, info.delta)
      }}
      onDragEnd={(event, info) => {
        console.log('Drag ended', info.point, info.offset, info.velocity)

        // Swipe right
        if (info.offset.x > 100) {
          console.log('Swiped right!')
        }
        // Swipe left
        else if (info.offset.x < -100) {
          console.log('Swiped left!')
        }
      }}
    >
      Swipe me!
    </motion.div>
  )
}
```

### 3.2 Tinder-Style Swipe Cards Implementation

**Reference Examples:**
- https://github.com/Deep-Codes/framer-tinder-cards
- https://www.geeksforgeeks.org/reactjs/how-to-create-tinder-card-swipe-gesture-using-react-and-framer-motion/
- https://dev.to/lansolo99/a-tinder-like-card-game-with-framer-motion-35i5

#### Complete Swipe Card Component

```typescript
'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'

interface SwipeCardProps {
  movie: {
    id: number
    title: string
    poster_path: string
    trailerKey: string
  }
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

export default function SwipeCard({ movie, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const controls = useAnimation()

  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 100

    if (info.offset.x > swipeThreshold) {
      // Swipe right - Like
      await controls.start({ x: 1000, transition: { duration: 0.3 } })
      onSwipeRight()
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe left - Dislike
      await controls.start({ x: -1000, transition: { duration: 0.3 } })
      onSwipeLeft()
    } else {
      // Return to center
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } })
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        x,
        rotate,
        opacity,
        position: 'absolute',
        width: '90%',
        height: '70vh',
      }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <h2 className="text-white text-2xl font-bold">{movie.title}</h2>
      </div>
    </motion.div>
  )
}
```

#### Swipe Indicators

```typescript
'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'

export default function SwipeCardWithIndicators({ movie }: any) {
  const x = useMotionValue(0)

  // Like indicator opacity (shows when dragging right)
  const likeOpacity = useTransform(x, [0, 100], [0, 1])

  // Dislike indicator opacity (shows when dragging left)
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0])

  return (
    <motion.div drag="x" style={{ x }}>
      {/* Like Indicator */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-10 right-10 bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-2xl rotate-12"
      >
        LIKE
      </motion.div>

      {/* Dislike Indicator */}
      <motion.div
        style={{ opacity: dislikeOpacity }}
        className="absolute top-10 left-10 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-2xl -rotate-12"
      >
        NOPE
      </motion.div>

      {/* Card content */}
      <div>Movie Card</div>
    </motion.div>
  )
}
```

### 3.3 Variants and Transitions

```typescript
const cardVariants = {
  enter: {
    scale: 0.8,
    opacity: 0,
    y: 50
  },
  center: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  })
}

<motion.div
  variants={cardVariants}
  initial="enter"
  animate="center"
  exit="exit"
  custom={direction}
>
  Card content
</motion.div>
```

### 3.4 Layout Animations for Card Stacks

```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'

export default function CardStack({ movies }: { movies: Movie[] }) {
  const [cards, setCards] = useState(movies)

  return (
    <div className="relative w-full h-screen">
      <AnimatePresence>
        {cards.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ scale: 0.95, y: index * 10, opacity: 1 - (index * 0.1) }}
            animate={{ scale: 0.95, y: index * 10, opacity: 1 - (index * 0.1) }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ zIndex: cards.length - index }}
            className="absolute"
          >
            <SwipeCard movie={movie} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

---

## 4. YouTube IFrame Player API

**Official Docs:** https://developers.google.com/youtube/iframe_api_reference
**Type Definitions:** `npm install --save-dev @types/youtube`

### 4.1 Loading the API

```typescript
// app/components/youtube-player-loader.tsx
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: typeof YT
  }
}

export function YouTubePlayerLoader({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    // Check if already loaded
    if (window.YT && window.YT.Player) {
      onReady()
      return
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'

    window.onYouTubeIframeAPIReady = onReady

    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  }, [onReady])

  return null
}
```

### 4.2 Creating a Player Instance

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

interface YouTubePlayerProps {
  videoKey: string
  autoplay?: boolean
  muted?: boolean
  onReady?: (player: YT.Player) => void
  onStateChange?: (event: YT.OnStateChangeEvent) => void
}

export default function YouTubePlayer({
  videoKey,
  autoplay = true,
  muted = true,
  onReady,
  onStateChange
}: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !window.YT) return

    // Create player
    playerRef.current = new YT.Player(containerRef.current, {
      videoId: videoKey,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        mute: muted ? 1 : 0,
        controls: 1,
        rel: 0, // Don't show related videos
        modestbranding: 1, // Minimal YouTube branding
        playsinline: 1, // Play inline on iOS
      },
      events: {
        onReady: (event) => {
          if (muted) {
            event.target.mute()
          }
          if (autoplay) {
            event.target.playVideo()
          }
          onReady?.(event.target)
        },
        onStateChange: onStateChange,
      },
    })

    return () => {
      playerRef.current?.destroy()
    }
  }, [videoKey, autoplay, muted])

  return <div ref={containerRef} className="w-full h-full" />
}
```

### 4.3 Controlling Multiple Player Instances

```typescript
'use client'

import { useRef, useEffect } from 'react'

export default function MultiplePlayersController() {
  const players = useRef<Map<string, YT.Player>>(new Map())
  const currentPlayingId = useRef<string | null>(null)

  const createPlayer = (id: string, videoKey: string, elementId: string) => {
    const player = new YT.Player(elementId, {
      videoId: videoKey,
      events: {
        onReady: (event) => {
          players.current.set(id, event.target)
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            // Pause all other players
            pauseOthers(id)
            currentPlayingId.current = id
          }
        }
      }
    })
  }

  const pauseOthers = (excludeId: string) => {
    players.current.forEach((player, id) => {
      if (id !== excludeId) {
        player.pauseVideo()
      }
    })
  }

  const playVideo = (id: string) => {
    const player = players.current.get(id)
    if (player) {
      pauseOthers(id)
      player.playVideo()
    }
  }

  const pauseVideo = (id: string) => {
    const player = players.current.get(id)
    player?.pauseVideo()
  }

  const stopVideo = (id: string) => {
    const player = players.current.get(id)
    player?.stopVideo()
  }

  return {
    createPlayer,
    playVideo,
    pauseVideo,
    stopVideo,
    players: players.current
  }
}
```

### 4.4 Autoplay with Mute

**Important:** Modern browsers require videos to be muted for autoplay to work.

```typescript
function onPlayerReady(event: YT.PlayerReadyEvent) {
  // Mute first, then play
  event.target.mute()
  event.target.playVideo()
}

// Handle autoplay blocking
const playerVars = {
  autoplay: 1,
  mute: 1 // Required for autoplay in most browsers
}

// Listen for autoplay blocked event
function onAutoplayBlocked(event: any) {
  console.log('Autoplay was blocked by the browser')
  // Show user a play button
}
```

### 4.5 Player Events and Callbacks

```typescript
// Player states
enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5
}

// Event handlers
const events = {
  onReady: (event: YT.PlayerReadyEvent) => {
    console.log('Player ready', event.target)
  },

  onStateChange: (event: YT.OnStateChangeEvent) => {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        console.log('Video is playing')
        break
      case YT.PlayerState.PAUSED:
        console.log('Video is paused')
        break
      case YT.PlayerState.ENDED:
        console.log('Video ended')
        break
      case YT.PlayerState.BUFFERING:
        console.log('Video is buffering')
        break
    }
  },

  onError: (event: YT.OnErrorEvent) => {
    switch (event.data) {
      case 2:
        console.error('Invalid parameter')
        break
      case 100:
        console.error('Video not found')
        break
      case 101:
      case 150:
        console.error('Embedding not allowed')
        break
    }
  }
}
```

### 4.6 Player Methods

```typescript
const player: YT.Player = playerRef.current

// Playback control
player.playVideo()
player.pauseVideo()
player.stopVideo()
player.seekTo(seconds, allowSeekAhead)

// Volume control
player.setVolume(100) // 0-100
player.mute()
player.unMute()
player.isMuted() // boolean
player.getVolume() // 0-100

// Player state
player.getDuration() // seconds
player.getCurrentTime() // seconds
player.getPlayerState() // PlayerState enum
player.getPlaybackRate() // speed (0.25, 0.5, 1, 1.5, 2)
player.setPlaybackRate(1.5)

// Video info
player.getVideoUrl() // YouTube.com URL
player.getVideoEmbedCode()

// Sizing
player.setSize(width, height)

// DOM
player.getIframe() // HTMLIFrameElement
player.destroy() // Remove player
```

### 4.7 TrailerSwipe-Specific Implementation

```typescript
'use client'

import { useEffect, useRef } from 'react'

interface TrailerPlayerProps {
  trailerKey: string
  isActive: boolean // Is this the current card
  onVideoEnd?: () => void
}

export default function TrailerPlayer({ trailerKey, isActive, onVideoEnd }: TrailerPlayerProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !window.YT) return

    playerRef.current = new YT.Player(containerRef.current, {
      videoId: trailerKey,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        mute: 1,
        controls: 0, // Hide controls for cleaner UI
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        loop: 1,
        playlist: trailerKey // Required for looping
      },
      events: {
        onReady: (event) => {
          event.target.mute()
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            onVideoEnd?.()
          }
        }
      }
    })

    return () => {
      playerRef.current?.destroy()
    }
  }, [trailerKey])

  // Auto-play/pause based on active state
  useEffect(() => {
    if (!playerRef.current) return

    if (isActive) {
      playerRef.current.playVideo()
    } else {
      playerRef.current.pauseVideo()
    }
  }, [isActive])

  return (
    <div ref={containerRef} className="w-full h-full" />
  )
}
```

---

## 5. Tailwind CSS v4

**Official Docs:** https://tailwindcss.com
**Version:** 4.0 (Latest)
**Installation:** Already included in project

### 5.1 Tailwind CSS v4 New Features

**Official Announcement:** https://tailwindcss.com/blog/tailwindcss-v4

**Major Improvements:**
- **3.78x faster** full builds
- **8.8x faster** incremental builds
- **182x faster** when no changes
- CSS-first configuration (no more `tailwind.config.js`)
- Native CSS variables for all theme values
- Built-in container queries
- Advanced animation support

### 5.2 CSS-First Configuration

**Old (v3):**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#5B21B6'
      }
    }
  }
}
```

**New (v4):**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: #5B21B6;
  --font-display: "Satoshi", sans-serif;
  --spacing-18: 4.5rem;
}
```

All theme values become CSS variables accessible everywhere:

```typescript
// Can use in inline styles or pass to libraries
<div style={{ backgroundColor: 'var(--color-brand)' }} />

// Or pass to Framer Motion
<motion.div
  animate={{ color: 'var(--color-brand)' }}
/>
```

### 5.3 Mobile-First Utilities

Tailwind uses mobile-first breakpoints:

```typescript
<div className="
  w-full           // Mobile (default)
  sm:w-1/2         // ≥640px
  md:w-1/3         // ≥768px
  lg:w-1/4         // ≥1024px
  xl:w-1/5         // ≥1280px
  2xl:w-1/6        // ≥1536px
">
  Responsive div
</div>
```

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 5.4 Custom Animations

**v4 allows defining animations directly in CSS:**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  @keyframes slide-in {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes wiggle {
    0%, 100% {
      transform: rotate(-3deg);
    }
    50% {
      transform: rotate(3deg);
    }
  }
}
```

**Usage:**
```typescript
<div className="animate-slide-in">
  Slides in from left
</div>

<div className="animate-fade-in">
  Fades in
</div>

<div className="animate-wiggle">
  Wiggles
</div>
```

**Built-in animations:**
- `animate-spin`: Continuous rotation
- `animate-ping`: Ripple effect
- `animate-pulse`: Fade in/out
- `animate-bounce`: Bounce effect

### 5.5 TrailerSwipe-Specific Animations

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  @keyframes swipe-right {
    from {
      transform: translateX(0) rotate(0deg);
      opacity: 1;
    }
    to {
      transform: translateX(100vw) rotate(25deg);
      opacity: 0;
    }
  }

  @keyframes swipe-left {
    from {
      transform: translateX(0) rotate(0deg);
      opacity: 1;
    }
    to {
      transform: translateX(-100vw) rotate(-25deg);
      opacity: 0;
    }
  }

  @keyframes card-enter {
    from {
      transform: scale(0.8) translateY(50px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
}
```

### 5.6 Gradient Backgrounds

**v4 adds conic and radial gradients:**

```typescript
// Linear gradients (existing)
<div className="bg-gradient-to-r from-purple-500 to-pink-500">
  Linear gradient
</div>

// Radial gradients (NEW in v4)
<div className="bg-radial-to-tr from-blue-500 to-transparent">
  Radial gradient
</div>

// Conic gradients (NEW in v4)
<div className="bg-conic-to-r from-red-500 via-yellow-500 to-blue-500">
  Conic gradient
</div>
```

### 5.7 Container Queries (Built-in)

**No plugin needed in v4:**

```typescript
<div className="@container">
  <div className="
    grid-cols-1
    @sm:grid-cols-2
    @md:grid-cols-3
    @lg:grid-cols-4
  ">
    Responds to container size, not viewport
  </div>
</div>
```

### 5.8 3D Transforms (NEW in v4)

```typescript
<div className="
  rotate-x-45
  rotate-y-30
  scale-z-150
  translate-z-10
">
  3D transformed element
</div>
```

### 5.9 Dark Mode

```typescript
// Enable dark mode in CSS
@theme {
  --color-bg: white;
  --color-text: black;

  @media (prefers-color-scheme: dark) {
    --color-bg: black;
    --color-text: white;
  }
}

// Use in components
<div className="
  bg-white dark:bg-black
  text-black dark:text-white
">
  Supports dark mode
</div>
```

### 5.10 Motion Preferences (Accessibility)

```typescript
// Respect user's motion preferences
<div className="
  animate-bounce
  motion-reduce:animate-none
">
  Doesn't animate if user prefers reduced motion
</div>

<div className="
  transition-all
  motion-safe:hover:scale-110
">
  Only animates if motion is safe
</div>
```

### 5.11 TrailerSwipe UI Examples

```typescript
// Card component
<div className="
  relative
  w-[90vw] max-w-md
  h-[70vh]
  bg-white dark:bg-gray-900
  rounded-2xl
  shadow-2xl
  overflow-hidden
  transition-transform
  hover:scale-105
  motion-reduce:hover:scale-100
">
  <img src="poster.jpg" className="w-full h-full object-cover" />
  <div className="
    absolute bottom-0 left-0 right-0
    p-6
    bg-gradient-to-t from-black/80 to-transparent
  ">
    <h2 className="text-white text-2xl font-bold">Movie Title</h2>
  </div>
</div>

// Swipe indicators
<div className="
  absolute top-10 right-10
  bg-green-500
  text-white
  px-6 py-3
  rounded-lg
  font-bold text-2xl
  rotate-12
  shadow-xl
">
  LIKE
</div>

// Category tabs
<button className="
  px-6 py-3
  bg-gray-200 dark:bg-gray-700
  hover:bg-gray-300 dark:hover:bg-gray-600
  active:bg-gray-400 dark:active:bg-gray-500
  rounded-full
  font-medium
  transition-colors
  motion-safe:hover:scale-105
">
  Action
</button>
```

---

## 6. TypeScript Best Practices

**TypeScript Version:** 5.x
**Docs:** https://www.typescriptlang.org/docs

### 6.1 Next.js 16 + TypeScript Setup

Your `tsconfig.json` is already well-configured:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true, // Strict type checking
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx", // React 19 JSX transform
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"] // Path alias
    }
  }
}
```

### 6.2 Async Server Components

**Requires TypeScript 5.1.3+ and @types/react 18.2.8+**

```typescript
// app/page.tsx
import { getPopularMovies } from '@/lib/tmdb'

// Server Components can be async
export default async function HomePage() {
  const movies = await getPopularMovies()

  return (
    <div>
      {movies.results.map(movie => (
        <div key={movie.id}>{movie.title}</div>
      ))}
    </div>
  )
}
```

### 6.3 Type-Safe API Responses

```typescript
// lib/types.ts

// TMDB Movie type
export interface Movie {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

// TMDB Response type
export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

// Video type
export interface Video {
  iso_639_1: string
  iso_3166_1: string
  name: string
  key: string
  site: string
  size: number
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes'
  official: boolean
  published_at: string
  id: string
}

// Genre type
export interface Genre {
  id: number
  name: string
}

// Extended movie with trailer
export interface MovieWithTrailer extends Movie {
  trailerKey: string | null
  genres: Genre[]
}
```

### 6.4 Type-Safe Fetch Wrapper

```typescript
// lib/tmdb.ts
import type { Movie, TMDBResponse, Video, Genre } from './types'

const BASE_URL = 'https://api.themoviedb.org/3'
const headers = {
  'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  'accept': 'application/json'
}

async function tmdbFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      ...headers,
      ...init?.headers
    }
  })

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>(
    `/movie/popular?language=en-US&page=${page}`,
    { next: { revalidate: 3600 } }
  )
}

export async function getMovieVideos(movieId: number): Promise<{ id: number; results: Video[] }> {
  return tmdbFetch<{ id: number; results: Video[] }>(
    `/movie/${movieId}/videos?language=en-US`,
    { next: { revalidate: 86400 } }
  )
}

export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
  return tmdbFetch<{ genres: Genre[] }>(
    '/genre/movie/list?language=en-US',
    { next: { revalidate: 604800 } }
  )
}
```

### 6.5 Component Props Typing

```typescript
// app/ui/movie-card.tsx
import type { Movie } from '@/lib/types'

interface MovieCardProps {
  movie: Movie
  onLike?: (movieId: number) => void
  onDislike?: (movieId: number) => void
  className?: string
}

export default function MovieCard({ movie, onLike, onDislike, className }: MovieCardProps) {
  return (
    <div className={className}>
      <h2>{movie.title}</h2>
      <button onClick={() => onLike?.(movie.id)}>Like</button>
      <button onClick={() => onDislike?.(movie.id)}>Dislike</button>
    </div>
  )
}
```

### 6.6 React Hooks Typing

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Movie } from '@/lib/types'

export function useMovieSwipe() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [favorites, setFavorites] = useState<number[]>([])

  const currentMovie = movies[currentIndex]

  const swipeRight = useCallback((movieId: number) => {
    setFavorites(prev => [...prev, movieId])
    setCurrentIndex(prev => prev + 1)
  }, [])

  const swipeLeft = useCallback(() => {
    setCurrentIndex(prev => prev + 1)
  }, [])

  useEffect(() => {
    // Load movies
    fetch('/api/movies')
      .then(res => res.json())
      .then((data: Movie[]) => setMovies(data))
  }, [])

  return {
    currentMovie,
    swipeRight,
    swipeLeft,
    favorites,
    hasMore: currentIndex < movies.length - 1
  }
}
```

### 6.7 Event Handler Typing

```typescript
'use client'

import type { DragEndEvent } from 'framer-motion'

interface SwipeCardProps {
  onSwipe: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ onSwipe }: SwipeCardProps) {
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: DragEndEvent) => {
    if (info.offset.x > 100) {
      onSwipe('right')
    } else if (info.offset.x < -100) {
      onSwipe('left')
    }
  }

  return <motion.div onDragEnd={handleDragEnd}>Card</motion.div>
}
```

### 6.8 LocalStorage Typing

```typescript
// lib/storage.ts
interface FavoriteMovie {
  id: number
  title: string
  poster_path: string | null
  addedAt: number
}

export function saveFavorites(favorites: FavoriteMovie[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('favorites', JSON.stringify(favorites))
}

export function loadFavorites(): FavoriteMovie[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem('favorites')
  if (!stored) return []

  try {
    return JSON.parse(stored) as FavoriteMovie[]
  } catch {
    return []
  }
}

export function addFavorite(movie: Movie): void {
  const favorites = loadFavorites()

  const favorite: FavoriteMovie = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    addedAt: Date.now()
  }

  if (!favorites.find(f => f.id === movie.id)) {
    saveFavorites([...favorites, favorite])
  }
}
```

### 6.9 Avoid 'any' - Use Proper Types

**Bad:**
```typescript
function processMovie(data: any) {
  return data.title // No type safety
}
```

**Good:**
```typescript
import type { Movie } from '@/lib/types'

function processMovie(data: Movie): string {
  return data.title // Type-safe
}
```

### 6.10 Use Type Inference

```typescript
// Type is inferred as number
const movieId = 123

// Type is inferred as Movie[]
const movies = await getPopularMovies().then(res => res.results)

// Use type assertions only when necessary
const element = document.getElementById('player') as HTMLDivElement
```

---

## 7. Project-Specific Type Definitions

### 7.1 Complete Type System for TrailerSwipe

```typescript
// lib/types.ts

// ==================== TMDB API Types ====================

export interface Movie {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface Video {
  iso_639_1: string
  iso_3166_1: string
  name: string
  key: string
  site: 'YouTube' | 'Vimeo'
  size: 360 | 480 | 720 | 1080
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes'
  official: boolean
  published_at: string
  id: string
}

export interface Genre {
  id: number
  name: string
}

export interface MovieVideosResponse {
  id: number
  results: Video[]
}

export interface GenresResponse {
  genres: Genre[]
}

// ==================== App-Specific Types ====================

export interface MovieWithTrailer extends Movie {
  trailerKey: string | null
  trailerName?: string
  genres: Genre[]
}

export interface FavoriteMovie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  trailerKey: string | null
  addedAt: number
}

export type SwipeDirection = 'left' | 'right'

export type Category = 'popular' | 'action' | 'comedy' | 'drama' | 'trending'

export interface CategoryConfig {
  id: Category
  name: string
  genreIds?: number[]
  endpoint: string
}

// ==================== Component Props ====================

export interface SwipeCardProps {
  movie: MovieWithTrailer
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isActive: boolean
  zIndex: number
}

export interface YouTubePlayerProps {
  videoKey: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  onReady?: (player: YT.Player) => void
  onStateChange?: (event: YT.OnStateChangeEvent) => void
  onEnd?: () => void
}

export interface CategoryTabProps {
  category: CategoryConfig
  isActive: boolean
  onClick: () => void
}

// ==================== Hook Return Types ====================

export interface UseMovieSwipeReturn {
  currentMovie: MovieWithTrailer | null
  swipeRight: () => void
  swipeLeft: () => void
  hasMore: boolean
  isLoading: boolean
  loadMore: () => Promise<void>
}

export interface UseFavoritesReturn {
  favorites: FavoriteMovie[]
  addFavorite: (movie: Movie, trailerKey?: string | null) => void
  removeFavorite: (movieId: number) => void
  isFavorite: (movieId: number) => boolean
  clearFavorites: () => void
}

export interface UseYouTubePlayerReturn {
  playerRef: React.RefObject<YT.Player | null>
  isReady: boolean
  play: () => void
  pause: () => void
  stop: () => void
  mute: () => void
  unmute: () => void
  setVolume: (volume: number) => void
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface MoviesApiResponse extends ApiResponse<MovieWithTrailer[]> {
  page: number
  totalPages: number
}

// ==================== Utility Types ====================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncFunction<T> = () => Promise<T>
```

### 7.2 Environment Variables Typing

```typescript
// env.d.ts (create this file in root)
declare namespace NodeJS {
  interface ProcessEnv {
    TMDB_API_KEY: string
    TMDB_ACCESS_TOKEN: string
    NEXT_PUBLIC_APP_URL: string
  }
}
```

### 7.3 YouTube IFrame API Typing

```typescript
// Install types
// npm install --save-dev @types/youtube

// Usage in components
'use client'

import { useRef, useEffect } from 'react'

export default function YouTubePlayer() {
  const playerRef = useRef<YT.Player | null>(null)

  useEffect(() => {
    if (!window.YT) return

    playerRef.current = new YT.Player('player', {
      videoId: 'VIDEO_KEY',
      events: {
        onReady: (event: YT.PlayerReadyEvent) => {
          event.target.playVideo()
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === YT.PlayerState.PLAYING) {
            console.log('Playing')
          }
        }
      }
    })
  }, [])

  return <div id="player" />
}
```

---

## Quick Reference Links

### Official Documentation
- **Next.js 16:** https://nextjs.org/docs/app
- **React 19:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS v4:** https://tailwindcss.com
- **Framer Motion:** https://motion.dev
- **TMDB API:** https://developer.themoviedb.org
- **YouTube IFrame API:** https://developers.google.com/youtube/iframe_api_reference

### Code Examples
- **Next.js Examples:** https://github.com/vercel/next.js/tree/canary/examples
- **Framer Motion Tinder Cards:** https://github.com/Deep-Codes/framer-tinder-cards
- **TMDB TypeScript Wrapper:** https://github.com/Api-Wrappers/tmdb-wrapper

### Tools
- **TMDB API Key:** https://www.themoviedb.org/settings/api
- **Next.js TypeScript Plugin:** Built-in
- **Tailwind CSS Playground:** https://play.tailwindcss.com

---

## Version-Specific Constraints

### Critical Compatibility Notes

1. **React 19.2.0 with TypeScript:**
   - Requires TypeScript 5.1.3+
   - Requires @types/react 18.2.8+
   - Supports async Server Components natively

2. **Next.js 16.0.1:**
   - App Router is default
   - Turbopack for dev server
   - Enhanced caching with `fetch` API
   - Route handlers replace API routes

3. **Tailwind CSS v4:**
   - Breaking changes from v3
   - CSS-first configuration (no more JS config)
   - All theme values are CSS variables
   - Use `@theme` directive for customization

4. **Framer Motion:**
   - Install latest: `npm install framer-motion`
   - Drag listeners report viewport-relative coordinates
   - Use `'use client'` directive for all motion components

5. **YouTube IFrame API:**
   - Requires user gesture for autoplay (or mute=1)
   - Install types: `npm install --save-dev @types/youtube`
   - Minimum player size: 200x200px

---

## Installation Commands

```bash
# Framer Motion
npm install framer-motion

# YouTube types
npm install --save-dev @types/youtube

# Optional: TMDB TypeScript wrapper (if you want pre-built types)
npm install @tdanks2000/tmdb-wrapper

# Optional: React Player (alternative to YouTube IFrame API)
npm install react-player
```

---

**Documentation Generated:** November 11, 2025
**For Project:** TrailerSwipe MVP
**Tech Stack:** Next.js 16.0.1 + React 19.2.0 + TypeScript 5 + Tailwind CSS 4
