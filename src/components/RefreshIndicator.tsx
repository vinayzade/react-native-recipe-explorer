import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  durations,
  radius,
  shadows,
  spacing,
  springs,
  typography,
  useThemedStyles,
  type Theme,
} from '../theme';

const FLIP_DURATION_MS = 480;

/** A frying pan that tosses back and forth for as long as it is mounted. */
function TossingPan() {
  const styles = useThemedStyles(makeStyles);
  const toss = useSharedValue(0);

  useEffect(() => {
    toss.value = withRepeat(
      withTiming(1, { duration: FLIP_DURATION_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(toss);
  }, [toss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(toss.value, [0, 1], [2, -5]) },
      { rotate: `${interpolate(toss.value, [0, 1], [-20, 20])}deg` },
    ],
  }));

  return (
    <Animated.Text style={[styles.icon, animatedStyle]} accessibilityElementsHidden>
      🍳
    </Animated.Text>
  );
}

interface RefreshIndicatorProps {
  visible: boolean;
  label?: string;
}

/**
 * Branded "refreshing" pill that drops in from the top of the list and
 * lifts away when the refresh finishes. Purely presentational: the pull
 * gesture itself is still handled by the native RefreshControl.
 */
export function RefreshIndicator({
  visible,
  label = 'Finding fresh recipes…',
}: RefreshIndicatorProps) {
  const styles = useThemedStyles(makeStyles);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.springify()
        .mass(springs.bouncy.mass)
        .damping(springs.bouncy.damping)
        .stiffness(springs.bouncy.stiffness)}
      exiting={FadeOutUp.duration(durations.fast)}
      style={styles.anchor}
      pointerEvents="none"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.pill}>
        <TossingPan />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Animated.View>
  );
}

/** Vertical space the grid should clear while the pill is showing. */
export const REFRESH_INDICATOR_HEIGHT = 56;

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    anchor: {
      position: 'absolute',
      top: spacing.xs,
      left: 0,
      right: 0,
      zIndex: 1,
      alignItems: 'center',
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      ...shadows.md,
    },
    icon: {
      fontSize: 20,
      lineHeight: 26,
      marginRight: spacing.sm,
    },
    label: {
      ...typography.label,
      color: colors.textSecondary,
    },
  });
