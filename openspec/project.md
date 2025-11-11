# Project Context

## Purpose

**TrailerSwipe** is a mobile-first web application that allows users to swipe through movie trailers like cards (similar to TikTok) and instantly decide whether to watch a film or not. The app provides an emotional "hook" experience focused on movie discovery through trailers.

**MVP Goals:**

- Create an engaging swipe-based movie discovery experience
- Auto-play trailers as users navigate through cards
- Allow users to save favorites (swipe right) or skip (swipe left)
- Provide movie filtering by categories (Trending, Action, Drama, Comedy, etc.)
- Target audience: Movie lovers aged 18-35 who prefer browsing trailers over endless catalogs

## Tech Stack

### Core Framework

- **Next.js 16.0.1** (App Router architecture)
- **React 19.2.0** with React DOM 19.2.0
- **TypeScript 5.x** (strict mode enabled)
- **Node.js 20+**

### Styling & UI

- **Tailwind CSS 4.x** (PostCSS integration)
- **Geist & Geist Mono** fonts (Next.js font optimization)
- Planned: **Framer Motion** or **Embla Carousel** for swipe animations
- **Mobile-first responsive design**

### State Management & Storage

- **React Hooks** for state management
- **LocalStorage** for favorites persistence

### Video & Media

- **YouTube Embed** for trailer playback
- Alternative: **ReactPlayer** for flexible video handling
- Auto-play with mute on initial load

### API Integration

- **TMDB API** (The Movie Database)
  - `/movie/popular` - Popular movies
  - `/movie/{id}/videos` - Movie trailers
  - `/genre/movie/list` - Genre categories

### Development Tools

- **ESLint 9.x** with Next.js config
- **PostCSS** for Tailwind processing
- TypeScript path aliases: `@/*` maps to project root

## Project Conventions

### Code Style

- **TypeScript strict mode** enabled
- **ES2017 target** with ESNext modules
- **JSX transform**: react-jsx (React 19)
- **File naming**: kebab-case for files, PascalCase for React components
- **Component structure**: Functional components with hooks
- **Imports**: Use `@/` path alias for absolute imports
- **Formatting**: Follow Next.js and ESLint config conventions
- **CSS**: Tailwind utility classes, prefer composition over custom CSS
- Use `className` prop for styling (Tailwind conventions)

### Architecture Patterns

- **App Router** architecture (Next.js 13+ pattern)
- **File-based routing** in `/app` directory
- **Layout composition**: Root layout with font optimization
- **Component organization**:
  - `/app` - Pages and layouts
  - `/components` (planned) - Reusable UI components
  - `/lib` (planned) - Utilities and API clients
  - `/types` (planned) - TypeScript type definitions
- **API Layer**: Use `fetch` for TMDB REST API calls
- **Client-side rendering** for interactive swipe functionality
- **Server components** where possible for static content

### Testing Strategy

- Testing framework: TBD (consider Vitest or Jest for Next.js)
- Focus on component testing for swipe interactions
- API mocking for TMDB endpoints
- E2E testing for core user flows (swipe, favorite, navigation)

### Git Workflow

- **Main branch**: `main`
- Repository: `shamilmusaev/movierec`
- Commit conventions: TBD (consider Conventional Commits)
- Feature branches for new functionality
- OpenSpec for change proposals and architecture decisions

## Domain Context

### Movie Discovery UX

- **Single-screen experience**: One trailer per view
- **Swipe gestures**:
  - 👉 Right: "Interested" (add to favorites)
  - 👈 Left: "Not interested" (skip)
- **Auto-play behavior**: Active trailer plays automatically, previous stops
- **Navigation**: Top categories (Trending, Action, Drama, Comedy)
- **Bottom tab bar**: Home, Explore, Favorite, Profile sections

### TMDB Integration

- Use TMDB API for movie data and trailer URLs
- Trailer sources: YouTube/Vimeo embeds
- Filter by genres using TMDB genre IDs
- Display movie metadata: title, poster, description, rating

### Mobile-First Design

- Primary platform: Mobile browsers (iOS/Android)
- Responsive breakpoints: Mobile → Tablet → Desktop
- Touch-optimized swipe interactions
- Vertical scrolling for favorites list
- Centered active card with blurred background poster

## Important Constraints

### Technical Constraints

- **MVP Scope**: Focus on core swipe functionality first
- **Browser compatibility**: Modern mobile browsers (iOS Safari, Chrome)
- **Performance**: Optimize video loading and playback
- **Storage limitations**: LocalStorage for favorites (no backend yet)
- **API rate limits**: TMDB API has request limits

### UX Constraints

- **One trailer at a time**: Only active card plays video
- **Mobile-first**: Desktop is secondary
- **No authentication** in MVP (LocalStorage persistence only)
- **Trailers must be available**: Fallback needed for movies without trailers

### Business Constraints

- **MVP timeline**: Focus on core features first
- **Target market**: Russian-speaking audience (PRD in Russian)
- **Potential partnerships**: Streaming services (future consideration)

## External Dependencies

### TMDB API

- **Base URL**: `https://api.themoviedb.org/3`
- **Authentication**: API key required (store in environment variables)
- **Key endpoints**:
  - `GET /movie/popular` - Popular movies list
  - `GET /movie/{id}/videos` - Movie trailers
  - `GET /genre/movie/list` - Available genres
- **Rate limits**: Check TMDB documentation
- **Documentation**: <https://developers.themoviedb.org/3>

### YouTube Embed

- **Embed URL format**: `https://www.youtube.com/embed/{key}?autoplay=1&mute=1`
- **Features used**: Auto-play, mute control, inline playback
- **Mobile considerations**: iOS inline playback settings

### Vercel (Deployment)

- **Platform**: Vercel (Next.js native deployment)
- **Environment**: Production and preview environments
- **Environment variables**: TMDB API key storage

### Font CDN

- **Geist fonts**: Loaded via Next.js font optimization
- **Fallback fonts**: System fonts for progressive loading

