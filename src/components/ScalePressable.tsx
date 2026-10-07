import React, { useCallback, type ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { springs } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScalePressableProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  /** Accepts plain and Reanimated animated styles. */
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  /** Scale while the finger is down. */
  scaleTo?: number;
}

/**
 * Pressable with a springy scale-down on touch. The spring runs on the UI
 * thread, so feedback stays instant even while JS is busy (e.g. mid-fetch).
 */
export function ScalePressable({
  children,
  style,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  ...rest
}: ScalePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(scaleTo, springs.snappy);
      onPressIn?.(event);
    },
    [scale, scaleTo, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(1, springs.snappy);
      onPressOut?.(event);
    },
    [scale, onPressOut],
  );

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
