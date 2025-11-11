# Design Document: UX Improvements & TikTok Optimization

## Overview

This change addresses 5 critical UX issues in the TrailerSwipe MVP to bring the experience closer to TikTok/Reels quality standards.

## Problems Identified

### 1. Desktop Responsiveness

**Current State**: Videos stretch to full viewport width on desktop (1920px+), looking awkward and non-optimal.

**Root Cause**: No responsive constraints, mobile-first approach applied universally.

**User Impact**: Desktop users see stretched, uncomfortable viewing experience.

### 2. Swipe Performance

**Current State**: Custom `useSwipe` hook has occasional lag, non-intuitive gestures, velocity not properly handled.

**Root Cause**: Simplified implementation without production optimizations, no physics-based animation.

**User Impact**: Swipes feel janky, not as smooth as TikTok, lower engagement.

### 3. Video Loop Issues

**Current State**: When trailer ends, YouTube shows related videos grid, breaking immersion.

**Root Cause**: Missing `loop=1` and `playlist` parameters in embed URL.

**User Impact**: Users see unrelated video suggestions, disrupting flow.

### 4. Unavailable Trailers

**Current State**: Movies without YouTube trailers still appear in feed, showing empty state.

**Root Cause**: No filtering of movies with `trailer: null` before rendering.

**User Impact**: Users see broken cards, skip without content, frustration.

### 5. Missing Best Practices

**Current State**: No scroll snap, lazy loading, or performance optimizations.

**Root Cause**: MVP rushed implementation without polish.

**User Impact**: Battery drain, memory issues, slower experience.

## Technical Solutions

### Solution 1: Responsive Design with Tailwind

```typescript
// components/MovieCard.tsx
<motion.div
  className="w-full lg:max-w-md lg:mx-auto h-[85vh] rounded-xl overflow-hidden"
  // ...
>
```

**Rationale**: 
- Mobile stays full-width for immersive experience
- Desktop constrains to 448px (TikTok mobile width)
- Centers with auto-margins for aesthetic layout

**Alternatives Considered**:
- CSS Grid with sidebar info (too complex)
- Fixed 375px width (too narrow on tablet)

### Solution 2: Embla Carousel Integration

**Library Choice: `embla-carousel-react`**

**Why Embla**:
- Battle-tested: 6M+ downloads/month
- Lightweight: 12kb gzipped
- Vertical axis support
- Velocity-based physics
- Active maintenance
- TypeScript support

**Integration Pattern**:
```typescript
// hooks/useEmblaSwipe.ts
import useEmblaCarousel from 'embla-carousel-react';

export function useEmblaSwipe(onSwipe: (direction: 'left' | 'right') => void) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    skipSnaps: false,
    dragFree: false,
  });

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', () => {
      const index = emblaApi.selectedScrollSnap();
      // Handle swipe
    });
  }, [emblaApi]);

  return { emblaRef, emblaApi };
}
```

**Migration Strategy**:
1. Install embla-carousel-react
2. Create wrapper hook
3. Replace handlers in MovieCard
4. Keep custom hook as fallback (feature flag)
5. A/B test performance
6. Remove custom hook after validation

**Alternatives Considered**:
- `react-tinder-card`: Unmaintained (2+ years)
- `react-swipeable`: No vertical support
- Keep custom hook: Not production-ready

### Solution 3: YouTube Loop Configuration

**Current URL**:
```
https://www.youtube.com/embed/VIDEO?autoplay=1&mute=1&controls=0&rel=0
```

**Updated URL**:
```
https://www.youtube.com/embed/VIDEO?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=VIDEO
```

**Key Parameters**:
- `loop=1`: Enable video looping
- `playlist=VIDEO_KEY`: Required for single-video loop (YouTube quirk)
- `rel=0`: Already set, prevents related videos

**Implementation**:
```typescript
// lib/tmdb/client.ts
export function getYouTubeEmbedUrl(videoKey: string, autoplay: boolean = true, mute: boolean = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    playsinline: '1',
    controls: '0',
    modestbranding: '1',
    rel: '0',
    fs: '0',
    iv_load_policy: '3',
    disablekb: '1',
    loop: '1',              // NEW
    playlist: videoKey,     // NEW (required for loop)
  });
  
  return `https://www.youtube.com/embed/${videoKey}?${params.toString()}`;
}
```

**Edge Cases**:
- Some videos may not loop (YouTube restriction): Fallback to showing next movie
- Copyright-restricted videos: Already handled by error state

### Solution 4: Trailer Validation & Filtering

**Filtering Logic**:
```typescript
// app/page.tsx - loadMovies()
const moviesWithTrailers = await Promise.all(
  moviesList.slice(0, 20).map(async (movie) => {
    try {
      const videos = await getMovieVideos(movie.id);
      return {
        ...movie,
        trailer: videos[0] || null,
      };
    } catch (error) {
      return {
        ...movie,
        trailer: null,
      };
    }
  })
);

// NEW: Filter out movies without valid trailers
const validMovies = moviesWithTrailers.filter(
  m => m.trailer !== null && m.trailer.key && m.trailer.key.length > 0
);

// NEW: Load more if too few valid trailers
if (validMovies.length < 10) {
  console.log('Loading more movies due to insufficient trailers');
  // Fetch next page and filter again
}

setMovies(validMovies);
```

**Validation Checks**:
1. `trailer !== null`
2. `trailer.key` exists
3. `trailer.key.length > 0`
4. `trailer.site === 'YouTube'` (already in getMovieVideos)

**User Experience**:
- Show loading state while filtering
- Fetch additional pages if needed
- Fallback message if genre has no trailers

### Solution 5: Best Practices Implementation

#### Scroll Snap

```css
/* globals.css */
.snap-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.snap-card {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

**Integration with Embla**: Embla handles snap internally, no CSS needed.

#### Lazy Loading

```typescript
// components/MovieCard.tsx
const [shouldLoad, setShouldLoad] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setShouldLoad(true);
      }
    },
    { threshold: 0.5 }
  );

  if (cardRef.current) {
    observer.observe(cardRef.current);
  }

  return () => observer.disconnect();
}, []);

// Only render TrailerPlayer when visible
{shouldLoad && <TrailerPlayer videoKey={trailer.key} />}
```

**Benefits**:
- Reduced memory usage
- Faster initial load
- Better battery life

#### Performance Monitoring

```typescript
// lib/performance.ts
export function measureSwipePerformance(callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  const duration = end - start;
  
  if (duration > 16.67) { // 60fps = 16.67ms per frame
    console.warn(`Swipe took ${duration}ms (target: <16.67ms)`);
  }
}
```

## Architecture Changes

### Before: Custom Swipe Hook
```
useSwipe (custom) → handlers → MovieCard → Framer Motion drag
```

### After: Embla Carousel
```
embla-carousel → useEmblaSwipe → MovieCard → smooth transitions
```

### Component Tree
```
App
├── CategoryTabs
├── Embla Container (NEW)
│   ├── MovieCard (visible)
│   ├── MovieCard (next, preloaded)
│   └── MovieCard (next+1, skeleton)
├── SwipeFeedback
└── TabBar
```

## Data Flow

### Current Flow
```
loadMovies() 
  → fetch 20 movies 
  → fetch trailers for all
  → set movies (with nulls)
  → render (some broken)
```

### Optimized Flow
```
loadMovies() 
  → fetch 20 movies
  → fetch trailers for all
  → filter out nulls
  → if count < 10, fetch more
  → set movies (all valid)
  → render (all working)
```

## Performance Considerations

### Memory Usage

**Before**: All 20 movie videos loaded simultaneously
**After**: Only 3 videos loaded at once (current, next, previous)

**Expected Savings**: ~70% memory reduction

### Bundle Size

**Before**: Custom hook (2kb)
**After**: Embla carousel (12kb gzipped)

**Trade-off**: +10kb for production-quality swipe experience (acceptable)

### Network Requests

**No Change**: Same number of TMDB API calls
**Optimization**: Could batch trailer fetches (future enhancement)

## Testing Strategy

### Desktop Responsiveness

**Test Cases**:
1. 1920x1080 screen → Card 448px centered
2. 2560x1440 screen → Card 448px centered
3. iPad landscape → Card full width (< 1024px)
4. Resize browser → Smooth transitions

### Swipe Performance

**Test Cases**:
1. Fast swipe → Immediate response
2. Slow swipe → Follows finger
3. Velocity swipe → Physics-based animation
4. Edge of list → Bounce back

**Measurement**:
- FPS counter in Chrome DevTools
- Target: Steady 60fps
- No dropped frames during swipe

### Video Loop

**Test Cases**:
1. Short trailer (30s) → Loops seamlessly
2. Long trailer (2min) → Loops after completion
3. Failed video → Shows poster fallback
4. Mute toggle during loop → Maintains loop

### Trailer Filtering

**Test Cases**:
1. Popular movies → All have trailers
2. Obscure genre → Some filtered out, more loaded
3. No trailers available → Show message
4. API error → Graceful degradation

## Rollback Plan

### If Embla Carousel Causes Issues

1. Keep `hooks/useSwipe.ts` in codebase
2. Add feature flag: `USE_EMBLA_CAROUSEL`
3. Toggle in `.env.local`
4. Monitor performance metrics
5. Revert if performance degrades

### If Desktop Layout Causes Issues

1. Remove responsive classes
2. Add back full-width on desktop
3. Consider alternative: sidebar with info

### If Loop Breaks Videos

1. Remove `loop=1` parameter
2. Show "Next" button at video end
3. Auto-advance after 3 seconds

## Success Metrics

### Quantitative

- Desktop card width: 448px on screens > 1024px ✅
- Swipe FPS: 60fps steady ✅
- Video loop: 100% success rate ✅
- Unavailable trailers: 0% in feed ✅
- Bundle size: < 500kb total ✅

### Qualitative

- Swipe feels smooth and responsive ✅
- Desktop experience looks professional ✅
- Videos loop seamlessly ✅
- No broken cards in feed ✅
- User engagement increases ✅

## Future Enhancements

### Phase 2 Improvements

1. **Pull to Refresh**: Reload movies with gesture
2. **Video Progress Bar**: Show playback progress
3. **Double-tap to Favorite**: Instagram-style interaction
4. **Keyboard Shortcuts**: Desktop navigation
5. **Analytics**: Track swipe patterns
6. **Offline Support**: Cache favorite trailers

### Performance Optimizations

1. **Video Preloading**: Preload next 2 videos
2. **Image Optimization**: WebP format, blur placeholders
3. **Code Splitting**: Lazy load components
4. **Service Worker**: Cache API responses

## References

- [Embla Carousel Docs](https://www.embla-carousel.com/)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- [Web Vitals Patterns](https://web.dev/patterns/web-vitals-patterns/)
- [TikTok UI Best Practices](https://www.smashingmagazine.com/2021/10/design-mobile-apps-one-hand-usage/)
