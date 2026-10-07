import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mealApi } from '../api/mealApi';
import { getErrorMessage, isCanceledError } from '../api/apiClient';
import type { MealSummary } from '../types';

export interface UseMealsParams {
  /** Active category; null until categories have loaded. */
  selectedCategory: string | null;
  /** Debounced search text. Non-empty text takes precedence over the category. */
  searchQuery: string;
}

export interface UseMealsResult {
  meals: MealSummary[];
  /** Initial load for the current category / query (show skeletons). */
  loading: boolean;
  /** Pull-to-refresh in progress (keep existing meals visible). */
  refreshing: boolean;
  error: string | null;
  /** True when results come from search rather than the category. */
  isSearching: boolean;
  /** Increments each time a pull-to-refresh succeeds; lets the UI replay its entrance. */
  refreshId: number;
  refresh: () => void;
  retry: () => void;
}

type MealsTarget =
  | { kind: 'search'; value: string }
  | { kind: 'category'; value: string };

type ReloadMode = 'load' | 'refresh';

/**
 * TheMealDB often answers in ~200 ms, which would make the refresh animation
 * a flicker. A refresh therefore stays "in progress" at least this long so the
 * user can see that something happened. Initial loads are never delayed.
 */
const MIN_REFRESH_MS = 900;

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Loads the meal grid for either the search query or the selected category.
 *
 * Stale responses are handled with an AbortController per request: when the
 * target changes (new query, new category, cleared search) or the screen
 * unmounts, the previous request is aborted and its result ignored.
 */
export function useMeals({
  selectedCategory,
  searchQuery,
}: UseMealsParams): UseMealsResult {
  const query = searchQuery.trim();
  const isSearching = query.length > 0;

  // While searching, the category is irrelevant – fixing it to null here means
  // switching categories mid-search does not trigger a duplicate search call.
  const categoryForFetch = isSearching ? null : selectedCategory;

  const target = useMemo<MealsTarget | null>(() => {
    if (isSearching) {
      return { kind: 'search', value: query };
    }
    return categoryForFetch ? { kind: 'category', value: categoryForFetch } : null;
  }, [isSearching, query, categoryForFetch]);

  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshId, setRefreshId] = useState(0);

  // Bumping `reloadCount` re-runs the effect for the same target; `modeRef`
  // tells the effect whether to show skeletons (load) or the refresh animation.
  const [reloadCount, setReloadCount] = useState(0);
  const modeRef = useRef<ReloadMode>('load');

  useEffect(() => {
    if (!target) {
      setMeals([]);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    const isRefresh = modeRef.current === 'refresh';
    modeRef.current = 'load';

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const request: Promise<MealSummary[]> =
      target.kind === 'search'
        ? mealApi.searchMeals(target.value, signal)
        : mealApi.getMealsByCategory(target.value, signal);

    const settled = isRefresh
      ? Promise.all([request, wait(MIN_REFRESH_MS)]).then(([result]) => result)
      : request;

    settled
      .then(result => {
        if (!signal.aborted) {
          setMeals(result);
          if (isRefresh) {
            setRefreshId(id => id + 1);
          }
        }
      })
      .catch((err: unknown) => {
        if (!signal.aborted && !isCanceledError(err)) {
          setMeals([]);
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [target, reloadCount]);

  const refresh = useCallback(() => {
    modeRef.current = 'refresh';
    setReloadCount(count => count + 1);
  }, []);

  const retry = useCallback(() => {
    modeRef.current = 'load';
    setReloadCount(count => count + 1);
  }, []);

  return { meals, loading, refreshing, error, isSearching, refreshId, refresh, retry };
}
