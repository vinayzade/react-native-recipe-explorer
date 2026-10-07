import { apiClient, ApiError } from './apiClient';
import type {
  CategoriesResponse,
  Category,
  MealDetail,
  MealSummary,
  MealsResponse,
} from '../types';

const ENDPOINTS = {
  categories: 'categories.php',
  filterByCategory: 'filter.php',
  searchMeals: 'search.php',
  lookupMeal: 'lookup.php',
  randomMeal: 'random.php',
} as const;

/**
 * Every function below:
 *  - returns clean typed data (never the response envelope),
 *  - normalises TheMealDB's `meals: null` / `categories: null` to `[]`,
 *  - accepts an optional AbortSignal so hooks can cancel stale requests.
 */

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  const data = await apiClient.get<CategoriesResponse>(ENDPOINTS.categories, {
    signal,
  });
  return data?.categories ?? [];
}

export async function getMealsByCategory(
  category: string,
  signal?: AbortSignal,
): Promise<MealSummary[]> {
  const data = await apiClient.get<MealsResponse<MealSummary>>(
    ENDPOINTS.filterByCategory,
    { params: { c: category }, signal },
  );
  return data?.meals ?? [];
}

/** Resolves to [] for no matches (the API responds `{ "meals": null }`). */
export async function searchMeals(
  query: string,
  signal?: AbortSignal,
): Promise<MealDetail[]> {
  const data = await apiClient.get<MealsResponse>(ENDPOINTS.searchMeals, {
    params: { s: query.trim() },
    signal,
  });
  return data?.meals ?? [];
}

/** Rejects with ApiError(404) when the id is unknown. */
export async function getMealDetails(
  id: string,
  signal?: AbortSignal,
): Promise<MealDetail> {
  const data = await apiClient.get<MealsResponse>(ENDPOINTS.lookupMeal, {
    params: { i: id },
    signal,
  });
  const meal = data?.meals?.[0];
  if (!meal) {
    throw new ApiError('We couldn’t find that recipe.', { status: 404 });
  }
  return meal;
}

export async function getRandomMeal(signal?: AbortSignal): Promise<MealDetail> {
  const data = await apiClient.get<MealsResponse>(ENDPOINTS.randomMeal, {
    signal,
  });
  const meal = data?.meals?.[0];
  if (!meal) {
    throw new ApiError('No recipe came back. Please try again.');
  }
  return meal;
}

export const mealApi = {
  getCategories,
  getMealsByCategory,
  searchMeals,
  getMealDetails,
  getRandomMeal,
};
