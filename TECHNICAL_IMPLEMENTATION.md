# 🔧 Technical Implementation Guide

## Quick Start: Implementing AI Features

This document provides **copy-paste ready code** to implement the AI features outlined in the main plan.

---

## 🏗️ Phase 1: Foundation Setup

### 1. Database Schema (Supabase)

```sql
-- Users table (handled by Supabase Auth)
-- We'll extend with a profile table

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User interactions table
create table user_interactions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  movie_id integer not null,
  interaction_type text not null, -- 'view', 'swipe_up', 'swipe_down', 'favorite', 'watch'
  watch_duration integer, -- in seconds
  total_duration integer, -- trailer length in seconds
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User preferences table
create table user_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  favorite_genres jsonb default '[]'::jsonb,
  disliked_genres jsonb default '[]'::jsonb,
  preferred_decades jsonb default '[]'::jsonb,
  ai_enabled boolean default true,
  emotion_detection_enabled boolean default false,
  notifications_enabled boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI recommendations cache
create table ai_recommendations (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  movie_ids jsonb not null, -- array of movie IDs
  algorithm text not null, -- 'collaborative', 'content_based', 'hybrid'
  confidence_scores jsonb, -- array of scores matching movie_ids
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Indexes for performance
create index idx_interactions_user_id on user_interactions(user_id);
create index idx_interactions_movie_id on user_interactions(movie_id);
create index idx_interactions_created_at on user_interactions(created_at desc);
create index idx_recommendations_user_id on ai_recommendations(user_id);
create index idx_recommendations_expires on ai_recommendations(expires_at);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table user_interactions enable row level security;
alter table user_preferences enable row level security;
alter table ai_recommendations enable row level security;

-- RLS Policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own interactions"
  on user_interactions for insert
  with check (auth.uid() = user_id);

create policy "Users can view own interactions"
  on user_interactions for select
  using (auth.uid() = user_id);
```

### 2. Environment Variables

```bash
# .env.local

# TMDB API (existing)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Alternative: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-your-claude-key

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install openai
npm install ai @ai-sdk/openai  # Vercel AI SDK
npm install zustand  # State management
npm install recharts  # For analytics charts
npm install zod  # Schema validation
npm install @tensorflow/tfjs @tensorflow-models/face-landmarks-detection  # Optional: emotion detection
```

### 4. Supabase Client Setup

```typescript
// lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (for API routes)
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
```

```typescript
// lib/supabase/types.ts

export interface UserInteraction {
  id?: number;
  user_id: string;
  movie_id: number;
  interaction_type: 'view' | 'swipe_up' | 'swipe_down' | 'favorite' | 'unfavorite' | 'watch';
  watch_duration?: number;
  total_duration?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface UserPreferences {
  user_id: string;
  favorite_genres: string[];
  disliked_genres: string[];
  preferred_decades: number[];
  ai_enabled: boolean;
  emotion_detection_enabled: boolean;
  notifications_enabled: boolean;
  updated_at?: string;
}

export interface AIRecommendation {
  id?: number;
  user_id: string;
  movie_ids: number[];
  algorithm: 'collaborative' | 'content_based' | 'hybrid';
  confidence_scores?: number[];
  created_at?: string;
  expires_at: string;
}
```

---

## 🎯 Phase 2: Smart Recommendations

### 1. Tracking Service

```typescript
// lib/analytics/tracker.ts

import { supabase } from '@/lib/supabase/client';
import { UserInteraction } from '@/lib/supabase/types';

export class InteractionTracker {
  private static instance: InteractionTracker;
  private queue: UserInteraction[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Flush queue every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  static getInstance(): InteractionTracker {
    if (!InteractionTracker.instance) {
      InteractionTracker.instance = new InteractionTracker();
    }
    return InteractionTracker.instance;
  }

  async track(interaction: Omit<UserInteraction, 'id' | 'created_at'>) {
    // Add to queue
    this.queue.push(interaction);

    // Flush if queue is large
    if (this.queue.length >= 10) {
      await this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const toFlush = [...this.queue];
    this.queue = [];

    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert(toFlush);

      if (error) {
        console.error('Failed to flush interactions:', error);
        // Re-add to queue
        this.queue.push(...toFlush);
      }
    } catch (error) {
      console.error('Error flushing interactions:', error);
      this.queue.push(...toFlush);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Convenience functions
export const tracker = InteractionTracker.getInstance();

export function trackView(userId: string, movieId: number) {
  tracker.track({
    user_id: userId,
    movie_id: movieId,
    interaction_type: 'view',
  });
}

export function trackWatch(
  userId: string,
  movieId: number,
  duration: number,
  total: number
) {
  tracker.track({
    user_id: userId,
    movie_id: movieId,
    interaction_type: 'watch',
    watch_duration: duration,
    total_duration: total,
  });
}

export function trackSwipe(
  userId: string,
  movieId: number,
  direction: 'up' | 'down'
) {
  tracker.track({
    user_id: userId,
    movie_id: movieId,
    interaction_type: direction === 'up' ? 'swipe_up' : 'swipe_down',
  });
}

export function trackFavorite(userId: string, movieId: number, add: boolean) {
  tracker.track({
    user_id: userId,
    movie_id: movieId,
    interaction_type: add ? 'favorite' : 'unfavorite',
  });
}
```

### 2. Simple Recommendation Algorithm

```typescript
// lib/recommendations/simple.ts

import { supabase } from '@/lib/supabase/client';
import { Movie } from '@/types/tmdb';
import { tmdbClient } from '@/lib/tmdb/client';

export interface RecommendationResult {
  movie: Movie;
  score: number;
  reasons: string[];
}

export class SimpleRecommender {
  /**
   * Get personalized recommendations based on user's favorites
   */
  async getRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<RecommendationResult[]> {
    // 1. Get user's interaction history
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .in('interaction_type', ['favorite', 'watch'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (!interactions || interactions.length === 0) {
      // New user - return popular movies
      return this.getPopularMovies(limit);
    }

    // 2. Extract favorite movie IDs
    const favoriteMovieIds = interactions
      .filter((i) => i.interaction_type === 'favorite')
      .map((i) => i.movie_id);

    // 3. Get watched movies with high engagement (>70% watched)
    const highEngagementMovies = interactions
      .filter(
        (i) =>
          i.interaction_type === 'watch' &&
          i.watch_duration &&
          i.total_duration &&
          i.watch_duration / i.total_duration > 0.7
      )
      .map((i) => i.movie_id);

    const interestedMovieIds = [
      ...new Set([...favoriteMovieIds, ...highEngagementMovies]),
    ];

    // 4. Fetch movie details to analyze
    const movieDetails = await Promise.all(
      interestedMovieIds.slice(0, 10).map((id) => tmdbClient.getMovie(id))
    );

    // 5. Extract favorite genres
    const genreCounts = new Map<number, number>();
    movieDetails.forEach((movie) => {
      movie.genres?.forEach((genre) => {
        genreCounts.set(genre.id, (genreCounts.get(genre.id) || 0) + 1);
      });
    });

    const topGenres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    // 6. Find similar movies
    const recommendations = new Map<number, RecommendationResult>();

    for (const movieId of interestedMovieIds.slice(0, 5)) {
      const similar = await tmdbClient.getSimilarMovies(movieId);

      similar.results.forEach((movie) => {
        if (interestedMovieIds.includes(movie.id)) return; // Skip already watched

        const existing = recommendations.get(movie.id);
        const reasons: string[] = [];
        let score = 50;

        // Calculate score based on genre match
        const matchingGenres = movie.genre_ids?.filter((g) =>
          topGenres.includes(g)
        ).length || 0;
        score += matchingGenres * 15;
        if (matchingGenres > 0) {
          reasons.push(`Matches your favorite genres`);
        }

        // Boost if similar to favorite
        if (favoriteMovieIds.includes(movieId)) {
          score += 20;
          const originalMovie = movieDetails.find((m) => m.id === movieId);
          if (originalMovie) {
            reasons.push(`Similar to ${originalMovie.title}`);
          }
        }

        // Boost by popularity (normalize 0-10 to 0-15 points)
        score += (movie.vote_average / 10) * 15;

        if (!existing || existing.score < score) {
          recommendations.set(movie.id, {
            movie,
            score: Math.min(score, 100),
            reasons: existing
              ? [...new Set([...existing.reasons, ...reasons])]
              : reasons,
          });
        }
      });
    }

    // 7. Sort by score and return top results
    return Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Fallback: Get popular movies for new users
   */
  private async getPopularMovies(
    limit: number
  ): Promise<RecommendationResult[]> {
    const popular = await tmdbClient.getPopularMovies();

    return popular.results.slice(0, limit).map((movie) => ({
      movie,
      score: Math.round((movie.vote_average / 10) * 100),
      reasons: ['Popular this week'],
    }));
  }

  /**
   * Calculate match score for a specific movie
   */
  async calculateMatchScore(
    userId: string,
    movieId: number
  ): Promise<number> {
    const recommendations = await this.getRecommendations(userId, 100);
    const match = recommendations.find((r) => r.movie.id === movieId);
    return match?.score || 0;
  }
}

export const recommender = new SimpleRecommender();
```

### 3. API Route for Recommendations

```typescript
// app/api/recommendations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { recommender } from '@/lib/recommendations/simple';
import { createServerClient } from '@/lib/supabase/client';

export const runtime = 'edge'; // Use edge runtime for low latency

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check cache first
    const { data: cached } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return NextResponse.json({
        recommendations: cached.movie_ids.map((id: number, idx: number) => ({
          movieId: id,
          score: cached.confidence_scores?.[idx] || 0,
        })),
        cached: true,
        algorithm: cached.algorithm,
      });
    }

    // Generate fresh recommendations
    const recommendations = await recommender.getRecommendations(
      user.id,
      limit
    );

    // Cache for 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await supabase.from('ai_recommendations').insert({
      user_id: user.id,
      movie_ids: recommendations.map((r) => r.movie.id),
      confidence_scores: recommendations.map((r) => r.score),
      algorithm: 'content_based',
      expires_at: expiresAt.toISOString(),
    });

    return NextResponse.json({
      recommendations: recommendations.map((r) => ({
        movieId: r.movie.id,
        score: r.score,
        reasons: r.reasons,
      })),
      cached: false,
      algorithm: 'content_based',
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
```

### 4. Match Score Component

```tsx
// components/MatchScore.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // You'll need to create this

interface MatchScoreProps {
  movieId: number;
  reasons?: string[];
}

export function MatchScore({ movieId, reasons = [] }: MatchScoreProps) {
  const { user } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchScore = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/recommendations/match-score?movieId=${movieId}`
        );
        const data = await res.json();
        setScore(data.score);
      } catch (error) {
        console.error('Failed to fetch match score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [movieId, user]);

  if (!user || loading || score === null) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 75) return 'Great Match';
    if (score >= 60) return 'Good Match';
    return 'Might Like';
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/80">
          {getScoreLabel(score)}
        </span>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>

      {reasons.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {reasons.map((reason, idx) => (
            <span key={idx} className="text-xs text-white/60">
              • {reason}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Phase 3: Intelligent Search

### 1. OpenAI Integration

```typescript
// lib/ai/openai.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SearchIntent {
  genres: string[];
  mood?: string;
  themes: string[];
  similar_to?: string[];
  era?: string;
  rating_min?: number;
}

export async function parseSearchQuery(
  query: string
): Promise<SearchIntent> {
  const prompt = `You are a movie search assistant. Parse this user query into structured search parameters.

User query: "${query}"

Extract:
- genres (array of genre names)
- mood (optional: happy, sad, scary, exciting, relaxing, etc.)
- themes (array of theme keywords)
- similar_to (array of movie titles mentioned)
- era (optional: 80s, 90s, 2000s, recent, classic)
- rating_min (optional: minimum rating 1-10)

Return ONLY valid JSON, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper and faster
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON-only API. Return only valid JSON, no markdown or explanations.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response');

    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse search query:', error);
    // Fallback: simple keyword extraction
    return {
      genres: [],
      themes: query.toLowerCase().split(' '),
    };
  }
}

export async function generateSearchExplanation(
  query: string,
  intent: SearchIntent
): Promise<string> {
  const prompt = `User searched for: "${query}"
We interpreted this as: ${JSON.stringify(intent)}

Generate a friendly one-sentence explanation of what we're looking for.
Example: "Looking for thrilling sci-fi movies with mind-bending plots"`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 50,
    });

    return response.choices[0].message.content || query;
  } catch (error) {
    return query;
  }
}
```

### 2. Search API Route

```typescript
// app/api/search/intelligent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { parseSearchQuery } from '@/lib/ai/openai';
import { tmdbClient } from '@/lib/tmdb/client';

export const runtime = 'edge';

const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science fiction': 878,
  'sci-fi': 878,
  'tv movie': 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    // Parse query using AI
    const intent = await parseSearchQuery(query);

    // Convert to TMDB parameters
    const genreIds = intent.genres
      .map((g) => GENRE_MAP[g.toLowerCase()])
      .filter(Boolean);

    // Search movies
    const results = await tmdbClient.discoverMovies({
      with_genres: genreIds.join(','),
      'vote_average.gte': intent.rating_min || 0,
      sort_by: 'vote_count.desc',
    });

    // If similar_to mentioned, fetch those movies
    let similarMovies: any[] = [];
    if (intent.similar_to && intent.similar_to.length > 0) {
      for (const title of intent.similar_to.slice(0, 2)) {
        const searchResults = await tmdbClient.searchMovies(title);
        if (searchResults.results.length > 0) {
          const movie = searchResults.results[0];
          const similar = await tmdbClient.getSimilarMovies(movie.id);
          similarMovies.push(...similar.results);
        }
      }
    }

    // Combine and deduplicate results
    const allMovies = [...results.results, ...similarMovies];
    const uniqueMovies = Array.from(
      new Map(allMovies.map((m) => [m.id, m])).values()
    );

    return NextResponse.json({
      query,
      intent,
      results: uniqueMovies.slice(0, 20),
      total: uniqueMovies.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

### 3. Search Component

```tsx
// components/IntelligentSearch.tsx

'use client';

import { useState } from 'react';
import { Movie } from '@/types/tmdb';

const EXAMPLE_QUERIES = [
  'Scary movies for Halloween',
  'Feel-good romantic comedies',
  'Action movies like John Wick',
  'Mind-bending sci-fi thrillers',
  'Funny heist movies',
];

export function IntelligentSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [intent, setIntent] = useState<any>(null);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/search/intelligent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      setResults(data.results);
      setIntent(data.intent);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="What mood are you in?"
          className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={loading || !query}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-500 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Example Queries */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-white/60">💡 Try:</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              onClick={() => {
                setQuery(example);
                handleSearch(example);
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-white/80 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Intent Display */}
      {intent && (
        <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
          <span className="text-sm text-purple-200">
            🤖 Looking for:{' '}
            {intent.genres?.join(', ') || 'movies'}{' '}
            {intent.mood && `(${intent.mood} mood)`}
          </span>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((movie) => (
            <div key={movie.id} className="flex flex-col gap-2">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover rounded-lg"
              />
              <span className="text-sm font-medium">{movie.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 😊 Phase 4: Mood-Based Recommendations

### 1. Mood Mapping

```typescript
// lib/ai/mood.ts

export type Mood =
  | 'happy'
  | 'sad'
  | 'anxious'
  | 'energetic'
  | 'relaxed'
  | 'romantic'
  | 'scared'
  | 'curious';

export interface MoodProfile {
  emoji: string;
  label: string;
  genres: number[];
  themes: string[];
  description: string;
}

export const MOOD_PROFILES: Record<Mood, MoodProfile> = {
  happy: {
    emoji: '😊',
    label: 'Happy',
    genres: [35, 10751, 16], // Comedy, Family, Animation
    themes: ['feel-good', 'uplifting', 'wholesome'],
    description: 'Light-hearted movies that will keep you smiling',
  },
  sad: {
    emoji: '😢',
    label: 'Sad',
    genres: [18, 10749], // Drama, Romance
    themes: ['emotional', 'tear-jerker', 'heartwarming'],
    description: 'Emotional stories that touch the heart',
  },
  anxious: {
    emoji: '😰',
    label: 'Anxious',
    genres: [35, 16, 10751], // Comedy, Animation, Family
    themes: ['comfort', 'familiar', 'safe'],
    description: 'Comforting movies to ease your mind',
  },
  energetic: {
    emoji: '⚡',
    label: 'Energetic',
    genres: [28, 12, 878], // Action, Adventure, Sci-Fi
    themes: ['adrenaline', 'fast-paced', 'explosive'],
    description: 'High-energy action and adventure',
  },
  relaxed: {
    emoji: '😌',
    label: 'Relaxed',
    genres: [18, 10749, 99], // Drama, Romance, Documentary
    themes: ['slow-burn', 'contemplative', 'peaceful'],
    description: 'Slow-paced, calming stories',
  },
  romantic: {
    emoji: '💕',
    label: 'Romantic',
    genres: [10749, 35], // Romance, Comedy
    themes: ['love', 'relationships', 'heartwarming'],
    description: 'Love stories that warm your heart',
  },
  scared: {
    emoji: '😱',
    label: 'Scared',
    genres: [27, 53], // Horror, Thriller
    themes: ['suspense', 'thrilling', 'scary'],
    description: 'Spine-tingling horror and thrillers',
  },
  curious: {
    emoji: '🤔',
    label: 'Curious',
    genres: [878, 9648, 36], // Sci-Fi, Mystery, History
    themes: ['mystery', 'thought-provoking', 'intelligent'],
    description: 'Mind-bending stories that make you think',
  },
};

export async function getMoviesByMood(mood: Mood): Promise<any[]> {
  const profile = MOOD_PROFILES[mood];
  const { tmdbClient } = await import('@/lib/tmdb/client');

  const results = await tmdbClient.discoverMovies({
    with_genres: profile.genres.join(','),
    sort_by: 'vote_average.desc',
    'vote_count.gte': 1000,
  });

  return results.results;
}
```

### 2. Mood Selector Component

```tsx
// components/MoodSelector.tsx

'use client';

import { useState } from 'react';
import { Mood, MOOD_PROFILES } from '@/lib/ai/mood';

interface MoodSelectorProps {
  onMoodSelect: (mood: Mood) => void;
}

export function MoodSelector({ onMoodSelect }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (mood: Mood) => {
    setSelectedMood(mood);
    onMoodSelect(mood);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <span className="text-2xl">
          {selectedMood ? MOOD_PROFILES[selectedMood].emoji : '😊'}
        </span>
        <span className="text-sm font-medium">
          {selectedMood ? MOOD_PROFILES[selectedMood].label : 'Your Mood'}
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-gradient-to-b from-gray-900 to-black rounded-t-3xl p-6 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">How are you feeling?</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(MOOD_PROFILES) as Mood[]).map((mood) => {
                  const profile = MOOD_PROFILES[mood];
                  const isSelected = selectedMood === mood;

                  return (
                    <button
                      key={mood}
                      onClick={() => handleSelect(mood)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-4xl">{profile.emoji}</span>
                      <span className="text-sm font-medium">
                        {profile.label}
                      </span>
                      <span className="text-xs text-white/60 text-center">
                        {profile.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 💬 Phase 5: AI Chat Assistant

### 1. Chat API with Streaming

```typescript
// app/api/ai/chat/route.ts

import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a friendly movie recommendation assistant for TrailerSwipe.

Your role:
- Help users discover movies they'll love
- Ask clarifying questions if needed
- Provide 2-3 specific movie suggestions
- Explain WHY you recommend each movie
- Keep responses concise and enthusiastic

Guidelines:
- Always include movie title and year
- Mention key details: genre, director, or starring actors
- Use emojis occasionally 🎬
- Be conversational and warm
- If unsure, ask follow-up questions`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Error processing chat', { status: 500 });
  }
}
```

### 2. Chat Component

```tsx
// components/AIChat.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';

const SUGGESTED_PROMPTS = [
  '🎭 Surprise me with something great',
  '🍿 Perfect for date night',
  '🧠 Mind-bending thriller',
  '😂 Make me laugh',
  '😱 Scare me',
];

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/ai/chat',
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendPrompt = (prompt: string) => {
    handleInputChange({
      target: { value: prompt },
    } as any);
    setTimeout(() => {
      handleSubmit({
        preventDefault: () => {},
      } as any);
    }, 0);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold">TrailerSwipe AI</h3>
                <p className="text-xs text-white/60">
                  Your movie recommendation assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-white/80">
                    👋 Hi! I can help you find the perfect movie. What are you
                    in the mood for?
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendPrompt(prompt)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/90'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-white/10"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-purple-500 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-purple-600 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

---

## 📊 Analytics Dashboard (Bonus)

```tsx
// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Fetch user stats
    fetch('/api/analytics/stats')
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Your Movie Stats 📊</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Movies Watched"
          value={stats.moviesWatched}
          icon="🎬"
        />
        <StatCard label="Watch Time" value={`${stats.watchTime}h`} icon="⏱️" />
        <StatCard label="Favorites" value={stats.favorites} icon="❤️" />
      </div>

      {/* Genre Distribution */}
      <div className="bg-white/5 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Favorite Genres</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.genreDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {stats.genreDistribution.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(${index * 45}, 70%, 60%)`}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Watch Activity */}
      <div className="bg-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Watch Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="day" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #ffffff20',
              }}
            />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}
```

---

## 🚀 Deployment Checklist

- [ ] Set up Supabase project
- [ ] Run database migrations
- [ ] Add environment variables to Vercel
- [ ] Enable RLS policies
- [ ] Test authentication flow
- [ ] Deploy to Vercel
- [ ] Monitor API costs (OpenAI usage)
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (PostHog)
- [ ] Test on mobile devices

---

## 🎯 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run migrations (after setting up Supabase)
# Copy SQL from section 1 into Supabase SQL Editor

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

**Ready to code?** Start with Phase 1, get the foundation right, then progressively add AI features! 🚀
