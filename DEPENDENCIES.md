# Required Dependencies

Based on your tech stack requirements, here are the dependencies you'll need to install:

## Core Dependencies

```bash
# Animation library (choose one)
npm install framer-motion
# OR
npm install embla-carousel-react embla-carousel-autoplay

# Video player
npm install react-player

# Utilities
npm install react-intersection-observer  # For lazy loading videos
```

## Optional but Recommended

```bash
# Better data fetching & caching
npm install @tanstack/react-query

# Virtualization for favorites list
npm install @tanstack/react-virtual

# Touch gestures helper
npm install react-swipeable
```

## Current Package.json

Your current setup includes:
- Next.js 16.0.1 (latest, supports all App Router features)
- React 19.2.0 (latest)
- TypeScript 5
- Tailwind CSS 4 (latest)
- ESLint with Next.js config

## Installation Command

```bash
# Recommended minimal setup for MVP
npm install framer-motion react-player react-intersection-observer

# Alternative with Embla Carousel
npm install embla-carousel-react embla-carousel-autoplay react-player react-intersection-observer
```

## Updated package.json

After installation, your `package.json` should look like:

```json
{
  "name": "movierec",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "next": "16.0.1",
    "framer-motion": "^12.0.0",
    "react-player": "^2.16.0",
    "react-intersection-observer": "^9.13.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "16.0.1"
  }
}
```

## Version Compatibility Notes

All recommended packages are compatible with:
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Node.js 20+

## Alternative: Embla Carousel Setup

If choosing Embla Carousel instead of Framer Motion:

```json
{
  "dependencies": {
    "embla-carousel-react": "^8.3.2",
    "embla-carousel-autoplay": "^8.3.2",
    "react-player": "^2.16.0",
    "react-intersection-observer": "^9.13.0"
  }
}
```

## Library Comparison

### Framer Motion
**Pros:**
- Full animation control
- Better for custom swipe gestures
- Smaller bundle (if only using drag)
- More flexible

**Cons:**
- More code to write
- Need to implement carousel logic yourself

**Bundle Size:** ~60KB (gzipped)

### Embla Carousel
**Pros:**
- Built-in carousel functionality
- Easier to implement
- Touch gestures out of the box
- Good plugin ecosystem

**Cons:**
- Less flexible for custom animations
- Larger bundle if not using all features

**Bundle Size:** ~15KB + plugins

## Recommendation

For TrailerSwipe MVP, I recommend **Framer Motion** because:
1. Your PRD requires custom swipe gestures (Tinder-style)
2. You need fine control over animations
3. The drag & exit animations are core to the UX
4. You're already building custom components

However, if you want faster implementation and don't mind less custom animations, **Embla Carousel** is excellent and easier to set up.

## TypeScript Types

All recommended packages include TypeScript definitions:
- `framer-motion` - Built-in types
- `react-player` - Built-in types
- `embla-carousel-react` - Built-in types
- `react-intersection-observer` - Built-in types

No additional `@types/*` packages needed.
