import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { favoritesService } from '../services/favoritesService';
import type { MealSummary } from '../types';

export interface FavoritesContextValue {
  favorites: MealSummary[];
  /** False until AsyncStorage has been read on startup. */
  isReady: boolean;
  isFavorite: (mealId: string) => boolean;
  addFavorite: (meal: MealSummary) => void;
  removeFavorite: (mealId: string) => void;
  toggleFavorite: (meal: MealSummary) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * Holds favourites in React state (shared by every screen via context) and
 * mirrors them to AsyncStorage. No Redux needed for a single list.
 */
export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<MealSummary[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Hydrate once on mount.
  useEffect(() => {
    let active = true;
    favoritesService.loadFavorites().then(stored => {
      if (active) {
        setFavorites(stored);
        setIsReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist after every change, but never before hydration finished
  // (otherwise the initial [] would overwrite what is on disk).
  useEffect(() => {
    if (!isReady) {
      return;
    }
    favoritesService.saveFavorites(favorites).catch(() => {
      // Persistence failure is non-fatal: in-memory state is still correct.
    });
  }, [favorites, isReady]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map(meal => meal.idMeal)),
    [favorites],
  );

  const isFavorite = useCallback(
    (mealId: string) => favoriteIds.has(mealId),
    [favoriteIds],
  );

  const addFavorite = useCallback((meal: MealSummary) => {
    setFavorites(current =>
      current.some(item => item.idMeal === meal.idMeal)
        ? current
        : [
            { idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb },
            ...current,
          ],
    );
  }, []);

  const removeFavorite = useCallback((mealId: string) => {
    setFavorites(current => current.filter(item => item.idMeal !== mealId));
  }, []);

  const toggleFavorite = useCallback(
    (meal: MealSummary) => {
      if (favoriteIds.has(meal.idMeal)) {
        removeFavorite(meal.idMeal);
      } else {
        addFavorite(meal);
      }
    },
    [favoriteIds, addFavorite, removeFavorite],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isReady,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    }),
    [favorites, isReady, isFavorite, addFavorite, removeFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used inside <FavoritesProvider>.');
  }
  return context;
}
