import React, { useMemo, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { durations, springs } from '../theme';

interface FadeInViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Wait before starting; use for staggered sequences. */
  delay?: number;
  /** Distance in px the content rises from. 0 = plain fade. */
  offset?: number;
}

/**
 * Fades its children in while they spring up into place, on mount.
 * Built on Reanimated layout animations, so it runs entirely on the UI
 * thread and honours the system "reduce motion" setting.
 */
export function FadeInView({ children, style, delay = 0, offset = 18 }: FadeInViewProps) {
  const entering = useMemo(() => {
    if (offset === 0) {
      return FadeIn.delay(delay).duration(durations.base);
    }
    return FadeInDown.delay(delay)
      .springify()
      .mass(springs.gentle.mass)
      .damping(springs.gentle.damping)
      .stiffness(springs.gentle.stiffness)
      .withInitialValues({ opacity: 0, transform: [{ translateY: offset }] });
  }, [delay, offset]);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
