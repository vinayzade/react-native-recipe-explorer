import { useCallback, useEffect, useState } from 'react';
import { mealApi } from '../api/mealApi';
import {
  getErrorMessage,
  isCanceledError,
  isNotFoundError,
} from '../api/apiClient';
import type { MealDetail } from '../types';

export interface UseMealDetailResult {
  meal: MealDetail | null;
  loading: boolean;
  error: string | null;
  /** The API answered but has no meal for this id (distinct from a failure). */
  notFound: boolean;
  retry: () => void;
}

/** Loads one meal via lookup.php?i={mealId} on mount and whenever the id changes. */
export function useMealDetail(mealId: string): UseMealDetailResult {
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError(null);
    setNotFound(false);

    mealApi
      .getMealDetails(mealId, signal)
      .then(result => {
        if (!signal.aborted) {
          setMeal(result);
        }
      })
      .catch((err: unknown) => {
        if (signal.aborted || isCanceledError(err)) {
          return;
        }
        setMeal(null);
        if (isNotFoundError(err)) {
          setNotFound(true);
        } else {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [mealId, attempt]);

  const retry = useCallback(() => setAttempt(count => count + 1), []);

  return { meal, loading, error, notFound, retry };
}
