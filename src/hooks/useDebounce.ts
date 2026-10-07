import { useEffect, useState } from 'react';

/**
 * Returns `value` only after it has stopped changing for `delayMs`.
 *
 *   const debouncedQuery = useDebounce(query, 500);
 *   useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
 *
 * Each change schedules a new timer and the effect cleanup cancels the previous
 * one, so only the last value in a burst is ever committed. The cleanup also
 * runs on unmount, so no timer fires against an unmounted component.
 */
export function useDebounce<T>(value: T, delayMs = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (delayMs <= 0) {
      setDebouncedValue(value);
      return;
    }

    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
