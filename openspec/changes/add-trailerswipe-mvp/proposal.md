# Change: Add TrailerSwipe MVP - TikTok-Style Movie Discovery

## Why

Users are overwhelmed by endless movie catalogs and need a faster, more engaging way to discover films. TrailerSwipe provides an emotional "hook" experience similar to TikTok but focused on movie trailers, allowing users to instantly decide whether to watch a film by swiping through trailers as cards.

**Target Audience**: Movie lovers aged 18-35 who prefer browsing trailers over traditional catalogs, primarily on mobile browsers (iOS/Android).

## What Changes

This is the initial MVP implementation with the following core features:

- **TMDB API Integration**: Fetch popular movies, trailers, and genres from The Movie Database API
- **Trailer Video Player**: Auto-play YouTube trailers with mute on load, stop previous when advancing
- **Swipe Card UI**: Implement horizontal swipe gestures (right = favorite, left = skip) with smooth animations
- **Favorites System**: Save favorite movies to LocalStorage with persistent storage
- **Category Navigation**: Filter movies by genre (Trending, Action, Drama, Comedy, etc.)
- **Mobile-First Responsive UI**: Centered active card, blurred background, bottom tab bar navigation

**Priority Features (High 🔥)**:
- TMDB API integration
- Trailer auto-play functionality
- Swipe gestures (left/right)
- Modern card-based UI with animations
- Mobile-first responsive design

**Priority Features (Medium ⚡)**:
- Favorites persistence
- Category filtering by genre

## Impact

### New Capabilities
- `tmdb-integration` - API client for fetching movies and trailers
- `trailer-player` - Video player with auto-play and lifecycle management
- `swipe-ui` - Card-based swipe interface with gesture detection
- `favorites` - LocalStorage-based favorites management
- `category-navigation` - Genre filtering and category tabs

### Affected Code
- `app/page.tsx` - Will be replaced with main swipe interface
- `app/layout.tsx` - Update metadata for TrailerSwipe branding
- New directories:
  - `components/` - Reusable UI components
  - `lib/tmdb/` - TMDB API client and types
  - `lib/favorites/` - LocalStorage favorites utility
  - `types/` - TypeScript type definitions
  - `hooks/` - Custom React hooks for swipe and player logic

### Dependencies to Add
- `framer-motion` or `embla-carousel-react` - For swipe animations
- `react-player` (optional) - Alternative to YouTube embed for flexible video handling

### Environment Variables Needed
- `NEXT_PUBLIC_TMDB_API_KEY` - TMDB API authentication key

## Migration Plan

This is a greenfield MVP, no migration needed. Current boilerplate page will be replaced.

## Risks & Mitigation

1. **TMDB API Rate Limits**
   - Mitigation: Implement client-side caching, batch requests where possible
   
2. **Mobile Video Auto-play Restrictions (iOS)**
   - Mitigation: Start with mute enabled, provide unmute control, test on iOS Safari
   
3. **LocalStorage Size Limits**
   - Mitigation: Store only movie IDs (not full data), implement cleanup for old favorites
   
4. **Performance with Video Loading**
   - Mitigation: Preload next trailer, lazy load posters, optimize bundle size

## Success Criteria

- ✅ User can swipe through at least 20 movie trailers smoothly (60fps)
- ✅ Trailers auto-play when card is active, stop when swiped away
- ✅ Favorites persist across browser sessions
- ✅ Categories load and filter movies correctly
- ✅ Mobile experience is smooth on iOS Safari and Chrome Android
- ✅ First Contentful Paint < 2 seconds on 4G connection
