/**
 * Favorites Storage Utility
 * Manages favorite movies and collections in LocalStorage
 */

const FAVORITES_MOVIES_KEY = 'trailerswipe_favorites_movies';
const FAVORITES_COLLECTIONS_KEY = 'trailerswipe_favorites_collections';
const MAX_FAVORITES = 500; // Soft limit to prevent storage issues

/**
 * Get all favorite movie IDs from LocalStorage
 */
export function getFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_MOVIES_KEY);
    if (!stored) return [];
    
    const favorites = JSON.parse(stored);
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error reading favorites from LocalStorage:', error);
    return [];
  }
}

/**
 * Get all favorite collection IDs from LocalStorage
 */
export function getFavoriteCollections(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_COLLECTIONS_KEY);
    if (!stored) return [];
    
    const favorites = JSON.parse(stored);
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error reading favorite collections from LocalStorage:', error);
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
    localStorage.setItem(FAVORITES_MOVIES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding favorite to LocalStorage:', error);
    return false;
  }
}

/**
 * Add a collection to favorites
 */
export function addFavoriteCollection(collectionId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const favorites = getFavoriteCollections();
    
    // Check if already favorited
    if (favorites.includes(collectionId)) {
      return true; // Already favorited
    }
    
    // Check limit
    if (favorites.length >= MAX_FAVORITES) {
      console.warn(`Favorites limit reached (${MAX_FAVORITES}). Removing oldest favorite.`);
      favorites.shift(); // Remove oldest (FIFO)
    }
    
    favorites.push(collectionId);
    localStorage.setItem(FAVORITES_COLLECTIONS_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding favorite collection to LocalStorage:', error);
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
    
    localStorage.setItem(FAVORITES_MOVIES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing favorite from LocalStorage:', error);
    return false;
  }
}

/**
 * Remove a collection from favorites
 */
export function removeFavoriteCollection(collectionId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const favorites = getFavoriteCollections();
    const filtered = favorites.filter(id => id !== collectionId);
    
    localStorage.setItem(FAVORITES_COLLECTIONS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing favorite collection from LocalStorage:', error);
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
 * Check if a collection is in favorites
 */
export function isFavoriteCollection(collectionId: string): boolean {
  const favorites = getFavoriteCollections();
  return favorites.includes(collectionId);
}

/**
 * Toggle favorite status for movie
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
 * Toggle favorite status for collection
 */
export function toggleFavoriteCollection(collectionId: string): boolean {
  if (isFavoriteCollection(collectionId)) {
    removeFavoriteCollection(collectionId);
    return false;
  } else {
    addFavoriteCollection(collectionId);
    return true;
  }
}

/**
 * Get count of favorite movies
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}

/**
 * Get count of favorite collections
 */
export function getFavoriteCollectionsCount(): number {
  return getFavoriteCollections().length;
}

/**
 * Clear all favorites (use with caution)
 */
export function clearFavorites(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(FAVORITES_MOVIES_KEY);
    localStorage.removeItem(FAVORITES_COLLECTIONS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
}
