'use client';

import { useState, useEffect } from 'react';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  toggleFavorite,
  getFavoritesCount,
} from '@/lib/favorites/storage';

/**
 * Custom hook for managing favorites
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
    setIsLoaded(true);
  }, []);

  const add = (movieId: number) => {
    const success = addFavorite(movieId);
    if (success) {
      setFavorites(getFavorites());
    }
    return success;
  };

  const remove = (movieId: number) => {
    const success = removeFavorite(movieId);
    if (success) {
      setFavorites(getFavorites());
    }
    return success;
  };

  const toggle = (movieId: number) => {
    const newState = toggleFavorite(movieId);
    setFavorites(getFavorites());
    return newState;
  };

  const checkIsFavorite = (movieId: number): boolean => {
    return favorites.includes(movieId);
  };

  return {
    favorites,
    count: favorites.length,
    isLoaded,
    add,
    remove,
    toggle,
    isFavorite: checkIsFavorite,
  };
}
