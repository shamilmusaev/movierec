# Implementation Tasks

## Phase 1: Quick Fixes (30 min)

- [x] 1.1 Add `lg:max-w-md lg:mx-auto` to MovieCard container
- [ ] 1.2 Test desktop layout on 1920x1080, 2560x1440 screens
- [ ] 1.3 Verify mobile remains full-screen
- [x] 1.4 Add `loop=1&playlist={videoKey}` to YouTube embed URL
- [ ] 1.5 Test video looping behavior
- [x] 1.6 Filter movies without trailers in `loadMovies()`
- [x] 1.7 Add validation: `m.trailer?.key` must exist
- [ ] 1.8 Test with filtered movie list
- [x] 1.9 Fix mute button state persistence (add videoKey to useEffect deps)
- [x] 1.10 Add delay for postMessage to ensure iframe loaded
- [x] 1.11 Reduce gradient overlay from full-screen to bottom-only (h-48)
- [x] 1.12 Add HD quality parameter: `vq=hd720` to YouTube URL
- [x] 1.13 Randomize movies with `sort(() => Math.random() - 0.5)`
- [x] 1.14 Increase title size from `text-3xl` to `text-4xl`
- [x] 1.15 Increase description from `text-sm` to `text-base`
- [x] 1.16 Add drop-shadow to text for readability without heavy gradient
- [x] 1.17 Move mute button from bottom-right to top-left
- [x] 1.18 Add safe-area padding (pt-safe, pb-safe) for iPhone notch
- [x] 1.19 Add viewport-fit=cover meta tag for edge-to-edge display

## Phase 2: Swipe Library Integration (1-2 hours)

- [ ] 2.1 Install embla-carousel-react (`npm install embla-carousel-react`)
- [ ] 2.2 Read embla-carousel vertical axis documentation
- [ ] 2.3 Create new hook: `hooks/useEmblaSwipe.ts`
- [ ] 2.4 Integrate embla into MovieCard component
- [ ] 2.5 Replace custom `useSwipe` handlers with embla API
- [ ] 2.6 Test basic swipe up/down functionality
- [ ] 2.7 Add velocity-based swipe detection
- [ ] 2.8 Verify swipe animations at 60fps
- [ ] 2.9 Test on iOS Safari (touch gestures)
- [ ] 2.10 Test on Android Chrome (touch gestures)
- [ ] 2.11 Compare performance vs old custom hook

## Phase 3: Best Practices & Polish (1-2 hours)

- [ ] 3.1 Add scroll snap: `scroll-snap-type: y mandatory`
- [ ] 3.2 Add snap align to cards: `scroll-snap-align: start`
- [ ] 3.3 Implement lazy loading for off-screen cards
- [ ] 3.4 Use IntersectionObserver for video visibility
- [ ] 3.5 Unload off-screen video iframes (memory optimization)
- [ ] 3.6 Preload next card's poster image
- [ ] 3.7 Add loading skeleton for next cards
- [ ] 3.8 Add spring animation with physics (Framer Motion)
- [ ] 3.9 Test haptic feedback on iOS (if available)
- [ ] 3.10 Prevent accidental horizontal scrolls

## Phase 4: YouTube Video Optimization

- [ ] 4.1 Update `getYouTubeEmbedUrl()` in tmdb/client.ts
- [ ] 4.2 Add `loop=1` parameter
- [ ] 4.3 Add `playlist={videoKey}` parameter (required for loop)
- [ ] 4.4 Verify `rel=0` prevents related videos
- [ ] 4.5 Test loop behavior with different video lengths
- [ ] 4.6 Add error handling for unavailable videos
- [ ] 4.7 Show fallback when YouTube embed fails

## Phase 5: Trailer Filtering & Validation

- [ ] 5.1 Add filter in `loadMovies()`: `.filter(m => m.trailer?.key)`
- [ ] 5.2 Count valid trailers after filtering
- [ ] 5.3 Load more movies if valid count < 10
- [ ] 5.4 Add loading state while fetching additional movies
- [ ] 5.5 Log filtered movies for debugging
- [ ] 5.6 Test with genre having few trailers
- [ ] 5.7 Add fallback message if no trailers available

## Phase 6: Desktop Responsive Design

- [ ] 6.1 Add responsive width to MovieCard: `w-full lg:max-w-md`
- [ ] 6.2 Add auto-margins on desktop: `lg:mx-auto`
- [ ] 6.3 Test card centering on large screens
- [ ] 6.4 Adjust background blur for desktop layout
- [ ] 6.5 Consider sidebar with movie info on desktop (optional)
- [ ] 6.6 Test breakpoint transitions (md, lg, xl)
- [ ] 6.7 Verify swipe interactions work on desktop (mouse drag)

## Phase 7: Performance Testing & Optimization

- [ ] 7.1 Measure FPS during swipe animations
- [ ] 7.2 Profile memory usage with multiple cards
- [ ] 7.3 Test on low-end Android device
- [ ] 7.4 Test on older iPhone (iPhone 8)
- [ ] 7.5 Optimize bundle size (check embla-carousel impact)
- [ ] 7.6 Lazy load Framer Motion animations
- [ ] 7.7 Add performance monitoring (Web Vitals)

## Phase 8: Edge Cases & Refinements

- [ ] 8.1 Handle rapid swipes (queue management)
- [ ] 8.2 Test swipe at end of movie list
- [ ] 8.3 Verify loading state during movie fetch
- [ ] 8.4 Test with slow network (throttle to 3G)
- [ ] 8.5 Handle API errors gracefully
- [ ] 8.6 Test with TMDB API rate limits
- [ ] 8.7 Add retry logic for failed video loads

## Phase 9: Cross-Browser Testing

- [ ] 9.1 Test iOS Safari 15, 16, 17
- [ ] 9.2 Test Android Chrome latest
- [ ] 9.3 Test Desktop Chrome
- [ ] 9.4 Test Desktop Safari
- [ ] 9.5 Test Desktop Firefox
- [ ] 9.6 Test Desktop Edge
- [ ] 9.7 Verify video autoplay policies on all browsers
- [ ] 9.8 Test mute/unmute on all browsers

## Phase 10: Final Validation

- [ ] 10.1 Verify all 5 user issues are resolved
- [ ] 10.2 Desktop cards centered and properly sized
- [ ] 10.3 Swipes smooth and responsive (60fps)
- [ ] 10.4 Videos loop without showing related videos
- [ ] 10.5 Zero unavailable trailers in feed
- [ ] 10.6 Performance on par or better than before
- [ ] 10.7 Update OpenSpec tasks.md for vertical-format change
- [ ] 10.8 Archive completed changes

## Optional Enhancements

- [ ] 11.1 Add pull-to-refresh for new movies
- [ ] 11.2 Add video progress indicator
- [ ] 11.3 Add double-tap to favorite (Instagram-style)
- [ ] 11.4 Add swipe velocity indicator
- [ ] 11.5 Add keyboard shortcuts for desktop
- [ ] 11.6 Add analytics tracking for swipe events
