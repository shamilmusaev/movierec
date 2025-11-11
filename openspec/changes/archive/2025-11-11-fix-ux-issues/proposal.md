# Change: Fix UX Issues and Optimize TikTok-Style Experience

## Why

Current implementation has several UX issues that prevent optimal user experience:

1. **Desktop Experience Poor**: Full-screen vertical videos on desktop look stretched and awkward (85vh on 27" monitor)
2. **Swipe Performance Issues**: Custom swipe hook causes lag and non-intuitive gestures, not production-ready
3. **Video Ends with Suggestions**: YouTube shows related videos when trailer ends, breaking immersion
4. **Missing Best Practices**: No snap scrolling, momentum, or optimizations typical of TikTok-style feeds
5. **Broken Trailers in Feed**: Movies without available trailers still appear, showing empty state

**Problem**: User experience doesn't match expectations from TikTok/Reels, with performance and polish issues.

**Opportunity**: Implement industry-standard libraries and patterns to create smooth, professional vertical video experience.

## What Changes

### 1. Desktop Responsive Design

- **Max-Width Container**: Constrain video cards to `max-w-md` (448px) on desktop/tablet
- **Centered Layout**: Center card with margins on larger screens
- **Mobile-First**: Keep full-screen experience on mobile devices
- **Breakpoint Logic**: Use Tailwind `lg:` prefix for desktop constraints

**Before**: `w-full h-[85vh]` on all screens  
**After**: `w-full lg:max-w-md lg:mx-auto h-[85vh]`

### 2. Production-Ready Swipe Library

Replace custom `useSwipe` hook with battle-tested library:

**Option A: `embla-carousel`** (Recommended)
- ✅ 6M+ downloads/month, actively maintained
- ✅ Vertical scrolling with snap points
- ✅ Touch momentum and physics
- ✅ Keyboard navigation
- ✅ Lightweight (12kb gzipped)

**Option B: `react-tinder-card`**
- ✅ 150k downloads/month
- ✅ Swipe stack interaction
- ❌ Less maintained (last update 2 years ago)

**Decision**: Use `embla-carousel` for production stability and features.

### 3. Video Loop and Related Videos Fix

- **Add Loop Parameter**: Include `loop=1` in YouTube embed URL
- **Add Playlist Parameter**: Use `playlist={videoKey}` to enable looping
- **Remove Related Videos**: Ensure `rel=0` is properly set
- **Test Fallback**: Verify behavior when video unavailable

**URL Changes**:
```typescript
// Before
?autoplay=1&mute=1&controls=0&rel=0

// After  
?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist={videoKey}
```

### 4. Filter Unavailable Trailers

- **Pre-filter Movies**: Remove movies without YouTube trailers before rendering
- **Validation Check**: Verify `trailer.key` exists and is non-empty
- **Fallback Strategy**: Load next batch if too many filtered out
- **User Feedback**: Show loading state while fetching valid trailers

**Logic**:
```typescript
const validMovies = moviesWithTrailers.filter(m => m.trailer?.key);
if (validMovies.length < 5) {
  // Load more movies to ensure smooth experience
  loadMoreMovies();
}
```

### 5. TikTok Best Practices Implementation

**Snap Scrolling**:
- Implement scroll snap for smooth card transitions
- Use `scroll-snap-type: y mandatory` on container
- Add `scroll-snap-align: start` on cards

**Performance Optimizations**:
- Lazy load only visible + next 2 cards
- Unload off-screen video iframes
- Use IntersectionObserver for visibility detection
- Preload next card's poster image

**Gesture Improvements**:
- Velocity-based swipe detection
- Spring animation with physics
- Haptic feedback on mobile (if available)
- Prevent accidental scrolls

**Visual Polish**:
- Smooth card transitions (300ms ease-out)
- Pull-to-refresh indicator
- Loading skeleton for next cards
- Progress indicator for video playback

## Impact

### Modified Capabilities

- `swipe-ui` - Replace custom swipe with embla-carousel
- `trailer-player` - Add loop parameter, filter unavailable videos
- All components - Add responsive design constraints

### Affected Code

- `hooks/useSwipe.ts` - Replace with embla-carousel integration or deprecate
- `components/TrailerPlayer.tsx` - Add loop parameter to YouTube URL
- `components/MovieCard.tsx` - Add responsive width constraints
- `app/page.tsx` - Filter movies without trailers, add embla-carousel setup
- `lib/tmdb/client.ts` - Update `getYouTubeEmbedUrl()` with loop parameter

### New Dependencies

```json
{
  "embla-carousel-react": "^8.0.0"
}
```

### Environment Variables

No changes required.

## Migration Plan

### Phase 1: Quick Fixes (30 min)
1. Add desktop responsive constraints to MovieCard
2. Add loop parameter to YouTube URL
3. Filter unavailable trailers in movie loading

### Phase 2: Swipe Library Integration (1-2 hours)
1. Install embla-carousel-react
2. Create new `useEmblaCarousel` wrapper hook
3. Replace custom swipe logic in MovieCard
4. Test swipe performance and gestures

### Phase 3: Best Practices & Polish (1-2 hours)
1. Implement scroll snap behavior
2. Add lazy loading for off-screen cards
3. Add loading skeletons
4. Test on multiple devices

### Phase 4: Testing & Validation
1. Test desktop responsiveness (1920x1080, 2560x1440)
2. Test mobile devices (iOS Safari, Android Chrome)
3. Test swipe smoothness and physics
4. Verify video loop behavior
5. Ensure no broken trailers appear

**Rollback**: Changes are additive; can disable embla-carousel and revert to custom hook if needed.

## Risks & Mitigation

### 1. Embla Carousel Learning Curve
- **Risk**: New library may have complex API
- **Mitigation**: Well-documented, similar patterns to existing code
- **Time**: 1-2 hours to integrate properly

### 2. YouTube Loop May Not Work for All Videos
- **Risk**: Some videos may not respect loop parameter
- **Mitigation**: Use `playlist={videoKey}` as required for single-video loop
- **Fallback**: Show next movie when current ends (current behavior)

### 3. Performance Regression with New Library
- **Risk**: Embla may be heavier than custom hook
- **Mitigation**: Embla is optimized and widely used (12kb gzipped)
- **Test**: Benchmark before/after on low-end devices

### 4. Desktop Max-Width May Look Awkward
- **Risk**: Centered narrow video on large screens may feel empty
- **Mitigation**: Add background blur/gradient to fill space
- **Alternative**: Show sidebar with movie info on desktop

### 5. Filtering Trailers May Reduce Content
- **Risk**: Too many movies filtered out = fewer swipes
- **Mitigation**: Load larger batches (40 instead of 20)
- **Strategy**: Fetch incrementally until we have 10+ valid trailers

## Success Criteria

- ✅ Desktop shows max-width cards (448px) centered on screen
- ✅ Mobile remains full-screen experience
- ✅ Swipe gestures feel smooth and responsive (60fps)
- ✅ No lag or jank during swipe animations
- ✅ Videos loop infinitely without showing related videos
- ✅ Zero movies with unavailable trailers in feed
- ✅ Performance on par or better than before
- ✅ Works on iOS Safari, Android Chrome, Desktop browsers
- ✅ Swipe velocity affects card animation speed

## Design Notes

### Desktop Layout
```
┌─────────────────────────────────────┐
│                                     │
│         ┌───────────┐               │
│         │           │               │
│         │   VIDEO   │  ← max-w-md  │
│         │  (448px)  │               │
│         │           │               │
│         └───────────┘               │
│                                     │
└─────────────────────────────────────┘
        Desktop (1920px)
```

### Mobile Layout (Unchanged)
```
┌─────────────┐
│             │
│    VIDEO    │  ← Full width
│ (edge-edge) │
│             │
└─────────────┘
   Mobile
```

### Embla Carousel Structure
```typescript
const [emblaRef, emblaApi] = useEmblaCarousel({
  axis: 'y',
  skipSnaps: false,
  dragFree: false,
});

// Use emblaApi.scrollNext() for swipes
// Listen to emblaApi.on('select') for card changes
```

### YouTube URL with Loop
```
https://www.youtube.com/embed/VIDEO_KEY?
  autoplay=1
  &mute=1
  &controls=0
  &rel=0
  &loop=1
  &playlist=VIDEO_KEY  ← Required for loop to work
  &playsinline=1
  &fs=0
  &iv_load_policy=3
  &disablekb=1
  &enablejsapi=1
```

## References

- [Embla Carousel Docs](https://www.embla-carousel.com/)
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [TikTok-style scroll best practices](https://web.dev/patterns/web-vitals-patterns/carousels/)
- [Framer Motion + Embla integration](https://www.embla-carousel.com/examples/predefined/#framer-motion)
