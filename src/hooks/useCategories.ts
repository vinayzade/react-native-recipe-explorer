import { useCallback, useEffect, useState } from 'react';
import { mealApi } from '../api/mealApi';
import { getErrorMessage, isCanceledError } from '../api/apiClient';
import type { Category } from '../types';

export interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/** Loads the category list once on mount; `retry()` re-runs the request. */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Aborting on cleanup both cancels the network call and marks any late
    // response as stale, so nothing is set on an unmounted component.
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError(null);

    mealApi
      .getCategories(signal)
      .then(result => {
        if (!signal.aborted) {
          setCategories(result);
        }
      })
      .catch((err: unknown) => {
        if (!signal.aborted && !isCanceledError(err)) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt(count => count + 1), []);

  return { categories, loading, error, retry };
}
