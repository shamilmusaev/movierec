# Design Document: TrailerSwipe MVP

## Context

TrailerSwipe is a greenfield Next.js application targeting mobile-first movie discovery through trailer swiping. This is an MVP with no existing backend infrastructure, relying entirely on TMDB API for data and LocalStorage for persistence.

**Key Stakeholders**: End users (movie lovers aged 18-35), potential streaming service partners

**Constraints**:
- Mobile-first development (iOS Safari, Android Chrome)
- No backend/database (LocalStorage only)
- TMDB API rate limits
- Mobile video auto-play restrictions

## Goals / Non-Goals

### Goals

- ✅ Deliver smooth 60fps swipe experience on mobile devices
- ✅ Minimize initial load time (FCP < 2s on 4G)
- ✅ Support offline access to favorites list
- ✅ Create addictive "hook" experience similar to TikTok
- ✅ Handle network failures gracefully

### Non-Goals

- ❌ User authentication (MVP uses anonymous LocalStorage)
- ❌ Social features (sharing, following, reviews)
- ❌ Backend API (direct TMDB integration only)
- ❌ Advanced filtering (multiple genres, year ranges, ratings)
- ❌ Desktop-optimized experience (mobile-first only)
- ❌ Trailer analytics or watch history

## Decisions

### 1. Animation Library: Framer Motion

**Decision**: Use Framer Motion for swipe gestures and card animations.

**Rationale**:
- Declarative API fits React patterns
- Built-in gesture detection (`drag`, `dragEnd`)
- Smooth spring animations out of the box
- Better performance than CSS-only on mobile
- Smaller bundle than Embla Carousel for our use case

**Alternative Considered**: Embla Carousel
- Pros: Specifically built for carousels, good mobile support
- Cons: Heavier bundle, overkill for simple swipe gestures
- Why not chosen: Framer Motion provides more flexibility for custom animations

### 2. Video Player: YouTube Embed with iframe API

**Decision**: Use YouTube iframe embed with native controls.

**Rationale**:
- All TMDB trailers are on YouTube
- No need for external dependencies (react-player)
- YouTube handles codec compatibility across devices
- Built-in playback controls and quality selection
- Free and reliable CDN

**Alternative Considered**: ReactPlayer library
- Pros: Unified API for multiple video sources
- Cons: Larger bundle size, additional dependency
- Why not chosen: We only need YouTube, native embed is sufficient

### 3. State Management: React Hooks + Context

**Decision**: Use React hooks (useState, useEffect) with Context API for shared state.

**Rationale**:
- Simple MVP doesn't need Redux/Zustand complexity
- Context API sufficient for favorites and category state
- Keeps bundle size minimal
- Easy to migrate to more complex solution later

**State Structure**:
```typescript
// Global state (Context)
- favorites: string[]  // movie IDs
- currentCategory: string
- muted: boolean

// Local state (per component)
- movies: Movie[]
- currentIndex: number
- loading: boolean
```

### 4. Data Architecture: Client-Side Only

**Decision**: Fetch and cache data entirely on the client, no backend API.

**Rationale**:
- MVP scope - avoid backend complexity
- TMDB API allows client-side calls
- LocalStorage sufficient for favorites
- Reduces deployment complexity (static site)

**Caching Strategy**:
```typescript
// SessionStorage for API responses (duration of session)
- Popular movies: 5 minutes
- Genre list: Session lifetime
- Movie videos: 10 minutes

// LocalStorage for user data (persistent)
- Favorites: No expiration
- Last category: No expiration
- Mute preference: No expiration
```

### 5. Component Architecture: Composition Pattern

**Decision**: Build small, focused components composed together.

**Component Hierarchy**:
```
App Layout (layout.tsx)
└── Home Page (page.tsx)
    ├── CategoryTabs
    ├── SwipeContainer
    │   ├── CardStack
    │   │   └── MovieCard[]
    │   │       ├── TrailerPlayer
    │   │       ├── MovieInfo
    │   │       └── FavoriteIcon
    │   └── SwipeFeedback
    └── TabBar

Favorites Page (favorites/page.tsx)
├── FavoritesList
│   └── MovieCard[]
└── EmptyState
```

**Rationale**:
- Easy to test individual components
- Better code reuse
- Simpler to add features later
- Clear separation of concerns

### 6. Mobile Video Auto-play Strategy

**Decision**: Start muted by default, provide unmute control.

**Implementation**:
```html
<iframe
  src="https://www.youtube.com/embed/{key}?autoplay=1&mute=1&playsinline=1"
  allow="autoplay; encrypted-media"
/>
```

**Rationale**:
- iOS Safari requires muted auto-play
- User can manually unmute if desired
- Meets mobile browser policies
- Better UX than requiring user to start each video

## Risks / Trade-offs

### Risk 1: TMDB API Rate Limits

**Impact**: User experience degraded if rate limited

**Mitigation**:
- Implement aggressive client-side caching
- Batch requests where possible
- Display cached data during rate limit errors
- Monitor API usage in production

**Trade-off**: Fresh data vs API quota

### Risk 2: LocalStorage Size Limits

**Impact**: Favorites feature breaks when storage full (~5-10MB limit)

**Mitigation**:
- Store only movie IDs (not full objects)
- Implement cleanup of old favorites (FIFO after 500 items)
- Add error handling for storage failures
- Provide export/import functionality for users

**Trade-off**: Unlimited favorites vs reliable storage

### Risk 3: Mobile Video Performance

**Impact**: Poor video loading causes lag and hurts UX

**Mitigation**:
- Preload next video in background
- Use poster images as fallback
- Implement timeout for video loads (3s)
- Optimize video quality based on connection

**Trade-off**: Smooth experience vs data usage

### Risk 4: Network Failures

**Impact**: App unusable without internet connection

**Mitigation**:
- Cache movie data in SessionStorage
- Show cached favorites when offline
- Graceful error messages with retry option
- Implement service worker for future PWA capability

**Trade-off**: Online-only vs complexity of offline support

## Migration Plan

### Phase 1: Initial Deployment (Week 1-2)

1. Deploy basic swipe functionality with TMDB integration
2. Implement favorites with LocalStorage
3. Launch with "Top Choices" category only
4. Gather user feedback and performance metrics

### Phase 2: Category Navigation (Week 3)

1. Add genre category tabs
2. Implement category filtering
3. Test performance with genre switching

### Phase 3: Polish & Optimization (Week 4)

1. Optimize video preloading
2. Refine animations and transitions
3. Add error boundaries and improved error handling
4. Performance tuning (target 60fps on mid-range devices)

### Rollback Plan

- Keep previous version deployed on separate URL
- LocalStorage data is forward/backward compatible (just IDs)
- Can revert to static "coming soon" page if critical issues

## Open Questions

1. **Video preloading strategy**: How many videos ahead should we preload?
   - Proposed: 1 video ahead only (next card)
   - Need to test on various connection speeds

2. **Favorites limit**: What's a reasonable maximum for favorites?
   - Proposed: 500 movies (soft limit, ~50KB storage)
   - Implement cleanup after this threshold

3. **Category persistence**: Should we remember last category or always default to Top Choices?
   - Proposed: Remember last category for better UX
   - Fall back to Top Choices if invalid

4. **Swipe threshold**: What distance/velocity triggers a swipe?
   - Proposed: 100px drag distance OR 0.5 velocity
   - Needs user testing to refine

5. **Error retry strategy**: Automatic retry or manual user retry?
   - Proposed: Manual retry with clear "Try Again" button
   - Avoid annoying users with automatic retries

## Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| First Contentful Paint | < 2s | Industry standard for mobile |
| Largest Contentful Paint | < 3s | Video poster should load quickly |
| Time to Interactive | < 3.5s | User can start swiping |
| Frame Rate (swipe) | 60fps | Smooth gesture tracking |
| Video Start Time | < 1.5s | After card becomes active |
| Bundle Size (JS) | < 200KB | Keep mobile load fast |

## Technology Choices Summary

| Aspect | Choice | Reason |
|--------|--------|--------|
| Framework | Next.js 16 App Router | Modern React, SSG support |
| Language | TypeScript | Type safety for API responses |
| Styling | Tailwind CSS 4 | Rapid development, small bundle |
| Animations | Framer Motion | Best mobile gesture support |
| Video | YouTube iframe | Native, reliable, free |
| State | React Hooks + Context | Simple, sufficient for MVP |
| Storage | LocalStorage | Persistent, no backend needed |
| API Client | Native fetch | Built-in, no extra dependency |
