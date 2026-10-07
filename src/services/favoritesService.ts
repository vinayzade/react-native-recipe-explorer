import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MealSummary } from '../types';

const STORAGE_KEY = '@RecipeExplorer:favorites';

function isMealSummary(value: unknown): value is MealSummary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.idMeal === 'string' &&
    typeof candidate.strMeal === 'string' &&
    typeof candidate.strMealThumb === 'string'
  );
}

/**
 * Reads persisted favourites. Corrupt or missing data resolves to [] rather
 * than throwing, so a bad storage entry can never block the app from starting.
 */
export async function loadFavorites(): Promise<MealSummary[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isMealSummary) : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(favorites: MealSummary[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export const favoritesService = { loadFavorites, saveFavorites };
