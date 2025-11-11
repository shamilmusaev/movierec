# Add Collections Page - Letterboxd-Style Movie Collections

## Overview
Add a new "Collections" page featuring curated movie lists organized by themes, moods, and cinematic milestones (similar to Letterboxd). Each collection contains 10-20 movies that can be browsed with the same vertical swipe interface.

## Motivation
- **Discovery**: Help users discover movies through curated themes rather than just genres
- **Engagement**: Increase time spent in app through compelling collections
- **Curation**: Provide editorial value with handpicked movie lists
- **Navigation**: Give users a second browsing mode beyond genre-based discovery

## Goals
1. Create a Collections page accessible via bottom tab navigation
2. Display ~10 curated collections with appealing titles and cover images
3. Allow users to tap into any collection and swipe through movies
4. Maintain the same TikTok-style vertical video experience inside collections
5. Support both static and dynamic collections (can expand with TMDB lists later)

## Non-Goals
- User-generated collections (future feature)
- Sharing collections (future feature)
- Collection bookmarking/following (future feature)
- Real-time collection updates

## Proposed Solution

### UI/UX Design

**Collections List Page:**
- Grid layout (2 columns on mobile, 3 on desktop)
- Each collection shows:
  - Cover image (from first movie or custom)
  - Collection title
  - Movie count
  - Brief description/tagline
- Tappable cards that navigate to collection detail

**Collection Detail Page:**
- Same vertical scroll snap interface as main feed
- Header showing collection name & description
- Back button to return to collections list
- Movies play automatically as you scroll
- Favorite button works same as main feed

**Bottom Tab Navigation:**
- Add "Collections" tab between Home and Favorites
- Icon: Stack of cards or grid icon
- Active state styling

### Technical Architecture

**New Components:**
```
components/
  CollectionCard.tsx      - Individual collection preview card
  CollectionGrid.tsx      - Grid layout for collections list
  CollectionHeader.tsx    - Header for collection detail page

app/
  collections/
    page.tsx             - Collections list page
    [id]/
      page.tsx           - Collection detail with vertical feed
```

**Data Structure:**
```typescript
interface Collection {
  id: string;
  title: string;
  description: string;
  tagline?: string;
  coverImage?: string; // Custom or from first movie
  movieIds: number[];  // TMDB movie IDs
  theme: string;       // 'inspirational' | 'dark' | 'comedy' etc
}
```

**Initial Collections (10 curated lists):**
1. "Movies You Need to Watch Before You Die" - Cinematic masterpieces
2. "Feel-Good Escapes" - Uplifting, heartwarming films
3. "Mind-Bending Thrillers" - Psychological twists
4. "Epic Sci-Fi Journeys" - Space opera & futuristic worlds
5. "Romantic Classics" - Timeless love stories
6. "Dark & Disturbing" - Psychological horror & dark themes
7. "Laugh-Out-Loud Comedies" - Best comedy films
8. "Action-Packed Adventures" - Non-stop action
9. "Oscar Winners Collection" - Academy Award Best Pictures
10. "Hidden Gems" - Underrated masterpieces

### Implementation Plan

**Phase 1: Core Collections Feature (MVP)**
- Create static collections data file with 10 collections
- Build CollectionCard and CollectionGrid components
- Create /collections page with grid layout
- Add Collections tab to bottom navigation
- Implement collection detail page reusing existing feed logic

**Phase 2: Enhanced Experience**
- Add collection filtering/sorting
- Implement search within collections
- Add loading skeletons
- Optimize image loading for collection covers
- Add share collection functionality

**Phase 3: Dynamic Collections**
- Integrate with TMDB Lists API
- Allow admin to create collections via config
- Add collection recommendations based on viewing history
- Implement collection analytics

## Success Metrics
- % of users who tap into Collections tab
- Average collections viewed per session
- Time spent in collection detail pages
- Favorite rate from collections vs main feed
- User retention after discovering collections

## Risks & Mitigations

**Risk: Performance issues with many collections**
- Mitigation: Lazy load collection images, virtualize grid on scroll

**Risk: Static data becomes stale**
- Mitigation: Start with timeless classics, add TMDB integration in Phase 3

**Risk: UI consistency between pages**
- Mitigation: Reuse MovieCard and vertical scroll components

## Open Questions
1. Should collections be sortable by theme/mood?
2. Do we show user's progress through a collection?
3. Should there be a "Random Collection" option?
4. How do we handle collections with unavailable trailers?

## Timeline Estimate
- **Phase 1 (MVP)**: 2-3 days
  - Day 1: Data structure + Collections list page
  - Day 2: Collection detail page + navigation
  - Day 3: Polish + testing
- **Phase 2**: 2 days
- **Phase 3**: 3-4 days

## Dependencies
- Existing vertical feed implementation
- TMDB API for movie data
- TabBar component modifications
- Route navigation setup

## Related Changes
- fix-ux-issues (archived) - Vertical scroll implementation we'll reuse
- Future: User profiles could show favorite collections

---

**Status**: Proposal  
**Created**: 2025-11-11  
**Author**: AI Assistant  
**Reviewers**: User
