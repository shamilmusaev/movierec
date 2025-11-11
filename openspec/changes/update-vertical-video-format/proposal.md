# Change: Update to Vertical TikTok-Style Video Format

## Why

Current horizontal video format doesn't provide optimal viewing experience for mobile-first movie trailer discovery. TikTok-style vertical/portrait format maximizes screen real estate on mobile devices and creates more immersive experience that users expect from modern short-form video apps.

**Problem**: Horizontal trailers leave black bars on mobile, reducing visual impact and engagement.

**Opportunity**: Vertical format fills entire mobile screen, creating TikTok-like experience that users are familiar with.

## What Changes

- **Vertical Video Container**: Change card aspect ratio from horizontal (~16:9) to vertical portrait (~9:16)
- **Full-Screen Height**: Video fills most of viewport height (80-90vh) instead of limited height
- **Optimized Movie Info Layout**: Redesign title, description, and metadata to overlay on bottom of vertical video
- **Enhanced Poster Fallback**: When trailers unavailable, display poster in vertical format with optimized cropping
- **Updated Swipe Animations**: Adapt swipe gestures for taller cards with vertical movement considerations
- **Background Treatment**: Adjust blurred background to work with vertical format

**Visual Changes**:
- Card dimensions: From `max-w-md h-[70vh]` to full-width `h-[85vh]`
- Video aspect ratio: From 16:9 to 9:16 (portrait)
- Content overlay: Bottom-aligned with gradient for better readability
- Swipe indicators: Repositioned for vertical layout

## Impact

### Modified Capabilities

- `trailer-player` - Video container aspect ratio and sizing
- `swipe-ui` - Card dimensions and layout for vertical format

### Affected Code

- `components/MovieCard.tsx` - Update container dimensions and layout
- `components/TrailerPlayer.tsx` - Adjust video container aspect ratio
- `app/page.tsx` - Update main container sizing for vertical cards
- `app/globals.css` - May need custom aspect ratio utilities

### Dependencies

No new dependencies required (uses existing Framer Motion and Tailwind)

### Environment Variables

No changes to environment variables

## Migration Plan

1. **Phase 1**: Update card container dimensions to vertical format
2. **Phase 2**: Adjust video player to fill vertical space
3. **Phase 3**: Redesign movie info overlay for vertical layout
4. **Phase 4**: Test and optimize swipe gestures for taller cards
5. **Phase 5**: Adjust poster fallback rendering for vertical format

**Rollback**: Changes are CSS/layout only, can revert by restoring component dimensions.

## Risks & Mitigation

1. **YouTube Trailers May Not Have Vertical Versions**
   - Risk: Most trailers are horizontal, will have letterboxing
   - Mitigation: Use `object-fit: cover` with `object-position: center` to fill vertical space by cropping sides
   - Alternative: Keep horizontal video centered with artistic background

2. **Content Visibility**
   - Risk: Cropping horizontal trailers may cut important content
   - Mitigation: Use smart cropping (center-focus) and test with sample trailers
   - Fallback: Allow toggling between "fill" and "fit" modes

3. **Performance on Older Devices**
   - Risk: Larger video area may impact performance
   - Mitigation: Same resolution trailers, just different aspect ratio display
   - Already optimized with lazy loading

4. **User Expectations**
   - Risk: Users may expect full horizontal trailers
   - Mitigation: Vertical format is familiar from TikTok/Reels/Stories
   - Better mobile experience outweighs concerns

## Success Criteria

- ✅ Video fills 85%+ of mobile screen height
- ✅ Movie info readable with proper contrast on overlay
- ✅ Swipe gestures work smoothly with vertical cards
- ✅ Poster fallbacks look good in vertical format
- ✅ No performance degradation vs current implementation
- ✅ Works on iOS Safari and Android Chrome

## Design Notes

**Vertical Layout Structure**:
```
┌─────────────────┐
│                 │  ← Top safe area
│                 │
│                 │
│     VIDEO       │  ← Full height video (9:16)
│   (cropped)     │
│                 │
│                 │
├─────────────────┤
│ ▼ Gradient      │  ← Dark gradient overlay
│   Movie Title   │
│   Description   │  ← Bottom info overlay
│   ⭐ 7.2  2025  │
└─────────────────┘
```

**TikTok-Style Features**:
- Edge-to-edge video (no horizontal padding)
- Bottom-aligned info with gradient
- Favorite icon top-right
- Mute button bottom-right over gradient
- Seamless swipe between videos
