# Implementation Tasks

## 1. Project Setup & Configuration

- [x] 1.1 Add environment variable for TMDB API key
- [x] 1.2 Install dependencies (framer-motion or embla-carousel-react, react-player if needed)
- [x] 1.3 Create project structure (components/, lib/, types/, hooks/)
- [x] 1.4 Update app metadata in layout.tsx for TrailerSwipe branding

## 2. TMDB API Integration

- [x] 2.1 Create TMDB API client (`lib/tmdb/client.ts`)
- [x] 2.2 Define TypeScript types for Movie, Video, Genre (`types/tmdb.ts`)
- [x] 2.3 Implement `getPopularMovies()` function
- [x] 2.4 Implement `getMovieVideos(movieId)` function
- [x] 2.5 Implement `getGenres()` function
- [x] 2.6 Implement `getMoviesByGenre(genreId)` function
- [x] 2.7 Add error handling and response validation

## 3. UI Components Foundation

- [x] 3.1 Create `MovieCard` component with poster and metadata
- [x] 3.2 Create `TrailerPlayer` component with YouTube embed
- [x] 3.3 Create `CategoryTabs` component for genre navigation
- [x] 3.4 Create `TabBar` component for bottom navigation
- [x] 3.5 Create `FavoriteIcon` component (heart icon with animation)

## 4. Swipe Functionality

- [x] 4.1 Create `useSwipe` custom hook for gesture detection
- [x] 4.2 Implement swipe state management (current index, direction)
- [x] 4.3 Add card stack with active/inactive states
- [x] 4.4 Implement smooth card transitions (scale, opacity, translate)
- [x] 4.5 Add swipe feedback indicators (heart/X icons)
- [x] 4.6 Handle edge cases (first/last card, rapid swipes)

## 5. Trailer Player Integration

- [x] 5.1 Implement auto-play logic for active card
- [x] 5.2 Implement stop/pause for inactive cards
- [x] 5.3 Add mute control toggle
- [x] 5.4 Handle player lifecycle (loading, playing, error states)
- [x] 5.5 Add fallback for movies without trailers (show poster)
- [x] 5.6 Optimize for mobile (iOS inline playback attributes)

## 6. Favorites System

- [x] 6.1 Create LocalStorage utility (`lib/favorites/storage.ts`)
- [x] 6.2 Implement `addFavorite(movieId)` function
- [x] 6.3 Implement `removeFavorite(movieId)` function
- [x] 6.4 Implement `getFavorites()` function
- [x] 6.5 Implement `isFavorite(movieId)` function
- [x] 6.6 Create `useFavorites` custom hook
- [x] 6.7 Add swipe-right gesture to add favorite
- [x] 6.8 Add heart icon tap to toggle favorite

## 7. Category Navigation

- [x] 7.1 Fetch and display genre list from TMDB
- [x] 7.2 Implement category tab switching
- [x] 7.3 Load movies by selected genre
- [x] 7.4 Add loading states during category switch
- [x] 7.5 Implement "Top Choices" as default category
- [x] 7.6 Add visual indicator for active category

## 8. Favorites View

- [x] 8.1 Create Favorites page/view (`app/favorites/page.tsx`)
- [x] 8.2 Display list of saved movies with posters
- [x] 8.3 Add remove from favorites functionality
- [x] 8.4 Handle empty state (no favorites yet)
- [x] 8.5 Link from bottom TabBar to Favorites view

## 9. Main Page Integration

- [x] 9.1 Replace app/page.tsx with main swipe interface
- [x] 9.2 Integrate all components (cards, player, tabs, navigation)
- [x] 9.3 Implement initial data loading (popular movies)
- [x] 9.4 Add loading state for initial fetch
- [x] 9.5 Add error boundaries and error states
- [x] 9.6 Implement blurred background from active poster

## 10. Mobile Optimization

- [ ] 10.1 Test and optimize touch gestures on mobile devices
- [ ] 10.2 Ensure proper viewport meta tags
- [ ] 10.3 Test iOS Safari auto-play and inline playback
- [ ] 10.4 Test Android Chrome video playback
- [ ] 10.5 Optimize video loading (preload next trailer)
- [ ] 10.6 Add haptic feedback on swipe (if supported)

## 11. Polish & UX

- [x] 11.1 Add smooth animations for all transitions
- [x] 11.2 Implement swipe feedback (visual confirmation)
- [ ] 11.3 Add skeleton loaders for content
- [x] 11.4 Ensure 60fps performance during swipes
- [ ] 11.5 Add proper focus states for accessibility
- [x] 11.6 Test and refine gesture thresholds

## 12. Testing & Validation

- [ ] 12.1 Test complete user flow (first launch → swipe → favorites)
- [ ] 12.2 Test category switching and filtering
- [ ] 12.3 Test LocalStorage persistence across sessions
- [ ] 12.4 Test error scenarios (no trailers, API failures)
- [ ] 12.5 Verify mobile responsiveness on various screen sizes
- [ ] 12.6 Test performance metrics (FCP, LCP, TTI)
