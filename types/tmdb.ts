/**
 * TMDB API Type Definitions
 * Documentation: https://developers.themoviedb.org/3
 */

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string; // "YouTube", "Vimeo"
  type: string; // "Trailer", "Teaser", "Clip"
  official: boolean;
  published_at: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBVideosResponse {
  id: number;
  results: MovieVideo[];
}

export interface TMDBGenresResponse {
  genres: Genre[];
}

export interface TMDBError {
  status_code: number;
  status_message: string;
  success: false;
}
