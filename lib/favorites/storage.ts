/**
 * Favorites Storage Utility
 * Manages favorite movies in LocalStorage
 */

const FAVORITES_KEY = 'trailerswipe_favorites';
const MAX_FAVORITES = 500; // Soft limit to prevent storage issues

/**
 * Get all favorite movie IDs from LocalStorage
 */
export function getFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    
    const favorites = JSON.parse(stored);
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error reading favorites from LocalStorage:', error);
    return [];
  }
}

/**
 * Add a movie to favorites
 */
export function addFavorite(movieId: number): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const favorites = getFavorites();
    
    // Check if already favorited
    if (favorites.includes(movieId)) {
      return true; // Already favorited
    }
    
    // Check limit
    if (favorites.length >= MAX_FAVORITES) {
      console.warn(`Favorites limit reached (${MAX_FAVORITES}). Removing oldest favorite.`);
      favorites.shift(); // Remove oldest (FIFO)
    }
    
    favorites.push(movieId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding favorite to LocalStorage:', error);
    return false;
  }
}

/**
 * Remove a movie from favorites
 */
export function removeFavorite(movieId: number): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(id => id !== movieId);
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing favorite from LocalStorage:', error);
    return false;
  }
}

/**
 * Check if a movie is in favorites
 */
export function isFavorite(movieId: number): boolean {
  const favorites = getFavorites();
  return favorites.includes(movieId);
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(movieId: number): boolean {
  if (isFavorite(movieId)) {
    removeFavorite(movieId);
    return false;
  } else {
    addFavorite(movieId);
    return true;
  }
}

/**
 * Get count of favorites
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}

/**
 * Clear all favorites (use with caution)
 */
export function clearFavorites(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
}
