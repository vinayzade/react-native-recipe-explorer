import { useEffect } from 'react';
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const PULSE_DURATION_MS = 750;
const MIN_OPACITY = 0.45;

/**
 * Opacity value looping between dim and full on the UI thread – the
 * "breathing" used by skeleton placeholders. Cancelled on unmount.
 * Share one value across sibling placeholders so they pulse in sync.
 */
export function usePulse(): SharedValue<number> {
  const opacity = useSharedValue(MIN_OPACITY);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: PULSE_DURATION_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  return opacity;
}
