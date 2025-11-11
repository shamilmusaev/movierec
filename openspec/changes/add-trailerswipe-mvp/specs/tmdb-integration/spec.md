## ADDED Requirements

### Requirement: Fetch Popular Movies

The system SHALL fetch popular movies from TMDB API using the `/movie/popular` endpoint.

#### Scenario: Successful movies fetch

- **WHEN** the application requests popular movies
- **THEN** the system returns a list of movies with id, title, poster path, and overview
- **AND** results are limited to movies with available posters

#### Scenario: API error handling

- **WHEN** TMDB API returns an error or is unavailable
- **THEN** the system displays an error message to the user
- **AND** provides a retry mechanism

### Requirement: Fetch Movie Trailers

The system SHALL fetch trailer videos for a specific movie using the `/movie/{id}/videos` endpoint.

#### Scenario: Successful trailer fetch

- **WHEN** the application requests videos for a movie
- **THEN** the system returns trailer videos with YouTube keys
- **AND** prioritizes official trailers over teasers

#### Scenario: No trailers available

- **WHEN** a movie has no trailer videos
- **THEN** the system returns an empty result
- **AND** the UI displays the movie poster as fallback

### Requirement: Fetch Genre List

The system SHALL fetch available movie genres from TMDB API using the `/genre/movie/list` endpoint.

#### Scenario: Load genre categories

- **WHEN** the application initializes category navigation
- **THEN** the system returns a list of genres with id and name
- **AND** includes common genres (Action, Drama, Comedy, etc.)

### Requirement: Fetch Movies by Genre

The system SHALL fetch movies filtered by genre using the `/discover/movie` endpoint with genre_id parameter.

#### Scenario: Filter by selected genre

- **WHEN** user selects a category (e.g., Action)
- **THEN** the system fetches movies matching that genre
- **AND** returns results sorted by popularity

#### Scenario: Switch between genres

- **WHEN** user switches from one genre to another
- **THEN** the system loads fresh movies for the new genre
- **AND** resets the swipe card stack

### Requirement: API Authentication

The system SHALL authenticate all TMDB API requests using the API key from environment variables.

#### Scenario: Include API key in requests

- **WHEN** making any request to TMDB API
- **THEN** the system includes the API key in query parameters or headers
- **AND** handles authentication errors gracefully

### Requirement: Response Caching

The system SHALL implement client-side caching to minimize redundant API calls.

#### Scenario: Cache popular movies

- **WHEN** popular movies are fetched
- **THEN** the system caches the results for a reasonable duration
- **AND** serves cached data on subsequent requests within the cache period

### Requirement: Type Safety

The system SHALL use TypeScript types for all TMDB API responses.

#### Scenario: Type validation

- **WHEN** receiving data from TMDB API
- **THEN** the system validates data against defined TypeScript interfaces
- **AND** handles type mismatches gracefully
