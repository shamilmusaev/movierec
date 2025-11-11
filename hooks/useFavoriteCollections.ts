import { useState, useEffect } from 'react';
import {
  getFavoriteCollections,
  addFavoriteCollection,
  removeFavoriteCollection,
  isFavoriteCollection,
  toggleFavoriteCollection,
  getFavoriteCollectionsCount,
} from '@/lib/favorites/storage';

/**
 * Hook to manage favorite collections
 * Syncs with LocalStorage and provides reactive state
 */
export function useFavoriteCollections() {
  const [favoriteCollections, setFavoriteCollections] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const collections = getFavoriteCollections();
    setFavoriteCollections(collections);
    setCount(collections.length);
  };

  const add = (collectionId: string) => {
    if (addFavoriteCollection(collectionId)) {
      loadFavorites();
      return true;
    }
    return false;
  };

  const remove = (collectionId: string) => {
    if (removeFavoriteCollection(collectionId)) {
      loadFavorites();
      return true;
    }
    return false;
  };

  const toggle = (collectionId: string) => {
    const newState = toggleFavoriteCollection(collectionId);
    loadFavorites();
    return newState;
  };

  const isFavorite = (collectionId: string) => {
    return favoriteCollections.includes(collectionId);
  };

  return {
    favoriteCollections,
    count,
    add,
    remove,
    toggle,
    isFavorite,
    refresh: loadFavorites,
  };
}
