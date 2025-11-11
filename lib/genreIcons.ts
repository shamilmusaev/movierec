/**
 * Genre Icon Mappings
 * Maps TMDB genre IDs and names to Lucide React icons
 */

import {
  Sword,
  Compass,
  Sparkles,
  Laugh,
  ShieldAlert,
  Film,
  Drama,
  Heart,
  Wand2,
  BookOpen,
  Ghost,
  Music,
  Search,
  HeartHandshake,
  Rocket,
  Tv,
  Zap,
  Crosshair,
  Mountain,
  Star,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';

interface GenreIconMap {
  [key: string]: LucideIcon;
}

// Map genre IDs to icons
export const genreIconsById: Record<number, LucideIcon> = {
  28: Sword,           // Action
  12: Compass,         // Adventure
  16: Sparkles,        // Animation
  35: Laugh,           // Comedy
  80: ShieldAlert,     // Crime
  99: Film,            // Documentary
  18: Drama,           // Drama
  10751: Heart,        // Family
  14: Wand2,           // Fantasy
  36: BookOpen,        // History
  27: Ghost,           // Horror
  10402: Music,        // Music
  9648: Search,        // Mystery
  10749: HeartHandshake, // Romance
  878: Rocket,         // Science Fiction
  10770: Tv,           // TV Movie
  53: Zap,             // Thriller
  10752: Crosshair,    // War
  37: Mountain,        // Western
};

// Map genre names to icons (for custom categories)
export const genreIconsByName: GenreIconMap = {
  'Action': Sword,
  'Adventure': Compass,
  'Animation': Sparkles,
  'Comedy': Laugh,
  'Crime': ShieldAlert,
  'Documentary': Film,
  'Drama': Drama,
  'Family': Heart,
  'Fantasy': Wand2,
  'History': BookOpen,
  'Horror': Ghost,
  'Music': Music,
  'Mystery': Search,
  'Romance': HeartHandshake,
  'Science Fiction': Rocket,
  'TV Movie': Tv,
  'Thriller': Zap,
  'War': Crosshair,
  'Western': Mountain,
  // Custom categories
  'Top Choices': Star,
  'Trending': TrendingUp,
  'Popular': TrendingUp,
};

/**
 * Get icon for a genre by ID or name
 */
export function getGenreIcon(idOrName: string | number): LucideIcon {
  // Try by ID first
  if (typeof idOrName === 'number' && genreIconsById[idOrName]) {
    return genreIconsById[idOrName];
  }

  // Try by name
  if (typeof idOrName === 'string' && genreIconsByName[idOrName]) {
    return genreIconsByName[idOrName];
  }

  // Default fallback icon
  return Film;
}
