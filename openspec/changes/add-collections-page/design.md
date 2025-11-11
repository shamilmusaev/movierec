# Collections Page - Design Specification

## Visual Design

### Collections List Page

**Layout:**
```
┌─────────────────────────────┐
│   [Collections Header]      │ ← pt-safe
├─────────────────────────────┤
│                             │
│  ┌────────┐  ┌────────┐    │ ← Grid: 2 cols mobile
│  │ Card 1 │  │ Card 2 │    │          3 cols desktop
│  │        │  │        │    │
│  │ Title  │  │ Title  │    │
│  │ 15 🎬  │  │ 12 🎬  │    │
│  └────────┘  └────────┘    │
│                             │
│  ┌────────┐  ┌────────┐    │
│  │ Card 3 │  │ Card 4 │    │
│  └────────┘  └────────┘    │
│                             │
├─────────────────────────────┤
│  [Home] [Collections] [♥]  │ ← pb-safe
└─────────────────────────────┘
```

**Collection Card:**
```
┌─────────────────┐
│                 │
│  Cover Image    │ ← 3:4 aspect ratio
│  (Movie poster) │
│                 │
├─────────────────┤
│ Collection Name │ ← Bold, 2 lines max
│ 15 movies       │ ← Small text, gray
└─────────────────┘
```

### Collection Detail Page

**Layout:**
```
┌─────────────────────────────┐
│ ← Back  Collection Name     │ ← Fixed header, pt-safe
│ Brief description...        │
├─────────────────────────────┤
│                             │
│                             │
│    [Movie Card 1]           │ ← Vertical scroll
│    Trailer playing          │   Snap-to-card
│                             │
│                             │
├─────────────────────────────┤
│  [Movie Card 2] (below)     │
│  Poster showing            │
└─────────────────────────────┘
```

## Component Specifications

### CollectionCard Component

```typescript
interface CollectionCardProps {
  collection: Collection;
  onClick: () => void;
}
```

**Visual States:**
- Default: Shadow elevation-1
- Hover/Tap: Scale 0.98, shadow elevation-2
- Loading: Skeleton with pulse animation

**Styling:**
- Border radius: 12px
- Cover image: object-cover, aspect-ratio 3/4
- Title: text-lg font-bold, line-clamp-2
- Count: text-sm text-zinc-400
- Padding: 12px
- Gap: 8px

### CollectionGrid Component

```typescript
interface CollectionGridProps {
  collections: Collection[];
  isLoading?: boolean;
}
```

**Responsive Grid:**
- Mobile: 2 columns, gap-4, px-4
- Tablet: 3 columns, gap-6, px-6
- Desktop: 3 columns, gap-8, max-w-7xl, mx-auto

### CollectionHeader Component

```typescript
interface CollectionHeaderProps {
  title: string;
  description: string;
  movieCount: number;
  onBack: () => void;
}
```

**Layout:**
- Sticky top-0, z-10
- Background: black/95 with backdrop-blur
- Border bottom: border-zinc-800
- Padding: pt-safe px-4 py-3
- Back button: left side with chevron icon
- Title: text-xl font-bold
- Description: text-sm text-zinc-400, line-clamp-2

## Color Palette

```css
--collection-card-bg: #18181B;      /* zinc-900 */
--collection-card-border: #27272A;  /* zinc-800 */
--collection-text: #FAFAFA;         /* zinc-50 */
--collection-text-muted: #A1A1AA;   /* zinc-400 */
--collection-accent: #EF4444;       /* red-500 */
--collection-hover: #09090B;        /* zinc-950 */
```

## Typography

**Collections Page:**
- Page title: text-2xl font-bold
- Card title: text-lg font-bold
- Card count: text-sm text-zinc-400
- Card description: text-sm text-zinc-500

**Collection Detail:**
- Header title: text-xl font-bold
- Header description: text-sm text-zinc-400
- Back button: text-base

## Animations

**Card Hover/Tap:**
```css
transition: transform 200ms ease, box-shadow 200ms ease;
transform: scale(0.98);
```

**Page Transitions:**
```css
/* Slide in from right */
animation: slideInRight 300ms ease-out;

/* Slide out to left */
animation: slideOutLeft 300ms ease-in;
```

**Loading Skeleton:**
```css
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

## Spacing System

- Screen padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)
- Grid gap: gap-4 (mobile), gap-6 (tablet), gap-8 (desktop)
- Card internal padding: p-3
- Section spacing: mb-6
- Safe area: pt-safe, pb-safe

## Iconography

**Collections Tab Icon:**
```svg
<!-- Stack/Grid Icon -->
<svg width="24" height="24" viewBox="0 0 24 24">
  <rect x="3" y="3" width="7" height="7" rx="1"/>
  <rect x="14" y="3" width="7" height="7" rx="1"/>
  <rect x="3" y="14" width="7" height="7" rx="1"/>
  <rect x="14" y="14" width="7" height="7" rx="1"/>
</svg>
```

**Back Button Icon:**
```svg
<!-- Chevron Left -->
<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M15 18l-6-6 6-6"/>
</svg>
```

## Collection Cover Strategy

**Option 1: Use First Movie Poster**
- Pros: Automatic, always available
- Cons: May not represent collection theme

**Option 2: Custom Curated Image**
- Pros: Perfect representation
- Cons: Need to create/source images

**Option 3: Collage of 4 Movie Posters**
- Pros: Shows variety, looks professional
- Cons: More complex to implement

**Recommendation**: Start with Option 1 (first movie poster) for MVP, upgrade to Option 3 in Phase 2.

## Accessibility

- All interactive elements: min-height 44px (touch target)
- Color contrast: WCAG AA compliant
- Focus indicators: visible outline on keyboard navigation
- Screen reader: Proper ARIA labels for cards and navigation
- Semantic HTML: nav, main, article elements

## Responsive Breakpoints

```css
mobile: 0-639px    (2 column grid)
tablet: 640-1023px (3 column grid)
desktop: 1024px+   (3 column grid, max-width)
```

## Performance Targets

- Initial load: < 2s
- Collection card render: < 50ms each
- Page transition: < 300ms
- Image loading: Progressive (blur-up placeholder)
- Scroll performance: 60 FPS

## Edge Cases

1. **No collections available**: Show empty state with call-to-action
2. **Collection with 0 movies**: Don't display card
3. **Missing cover image**: Use placeholder gradient
4. **Very long collection names**: Truncate with ellipsis (line-clamp-2)
5. **Movies without trailers**: Skip or show poster only
6. **Slow network**: Show loading skeletons

## Design Tokens

```typescript
export const collectionDesignTokens = {
  card: {
    aspectRatio: '3/4',
    borderRadius: '12px',
    shadow: {
      default: '0 1px 3px rgba(0,0,0,0.12)',
      hover: '0 4px 6px rgba(0,0,0,0.16)',
    },
  },
  grid: {
    mobile: { columns: 2, gap: '1rem' },
    tablet: { columns: 3, gap: '1.5rem' },
    desktop: { columns: 3, gap: '2rem' },
  },
  animation: {
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
};
```

## Future Enhancements

- [ ] Add collection themes with color coding
- [ ] Implement "New" badge for recent collections
- [ ] Show collection popularity (view count)
- [ ] Add collection search/filter UI
- [ ] Create collection detail hero image
- [ ] Add swipe gestures for collection navigation
