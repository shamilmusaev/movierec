/**
 * TMDB API Client
 * Handles all interactions with The Movie Database API
 */

import type {
  TMDBMoviesResponse,
  TMDBVideosResponse,
  TMDBGenresResponse,
  Movie,
  MovieVideo,
  Genre,
} from '@/types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

if (!TMDB_API_KEY) {
  console.warn('TMDB API key is not configured. Please set NEXT_PUBLIC_TMDB_API_KEY in .env.local');
}

/**
 * Helper function to build TMDB API URLs
 */
function buildUrl(endpoint: string, params: Record<string, string | number> = {}): string {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Add API key
  if (TMDB_API_KEY) {
    url.searchParams.append('api_key', TMDB_API_KEY);
  }
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchTMDB<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = buildUrl(endpoint, params);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.status_message || `TMDB API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('TMDB API Error:', error);
    throw error;
  }
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  const data = await fetchTMDB<TMDBMoviesResponse>('/movie/popular', { page });
  // Filter movies without posters
  return data.results.filter(movie => movie.poster_path !== null);
}

/**
 * Get trailer videos for a specific movie
 */
export async function getMovieVideos(movieId: number): Promise<MovieVideo[]> {
  const data = await fetchTMDB<TMDBVideosResponse>(`/movie/${movieId}/videos`);
  
  // Prioritize official trailers over teasers
  const trailers = data.results
    .filter(video => video.site === 'YouTube')
    .sort((a, b) => {
      // Official trailers first
      if (a.official && !b.official) return -1;
      if (!a.official && b.official) return 1;
      
      // Then trailers over teasers
      if (a.type === 'Trailer' && b.type !== 'Trailer') return -1;
      if (a.type !== 'Trailer' && b.type === 'Trailer') return 1;
      
      return 0;
    });
  
  return trailers;
}

/**
 * Get all available movie genres
 */
export async function getGenres(): Promise<Genre[]> {
  const data = await fetchTMDB<TMDBGenresResponse>('/genre/movie/list');
  return data.genres;
}

/**
 * Get movies by genre
 */
export async function getMoviesByGenre(genreId: number, page: number = 1): Promise<Movie[]> {
  const data = await fetchTMDB<TMDBMoviesResponse>('/discover/movie', {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page,
  });
  
  // Filter movies without posters
  return data.results.filter(movie => movie.poster_path !== null);
}

/**
 * Helper function to get full image URL
 */
export function getImageUrl(path: string, size: 'w500' | 'w780' | 'original' = 'w500'): string {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Helper function to get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoKey: string, autoplay: boolean = true, mute: boolean = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    playsinline: '1',
    controls: '0', // Полностью убираем контролы
    modestbranding: '1',
    rel: '0',
    fs: '0', // Убираем кнопку fullscreen
    iv_load_policy: '3', // Убираем аннотации
    disablekb: '1', // Отключаем клавиатурные шорткаты
  });
  
  return `https://www.youtube.com/embed/${videoKey}?${params.toString()}`;
}
