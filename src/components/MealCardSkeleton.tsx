import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { MEAL_CARD_WIDTH } from './MealCard';
import { usePulse } from '../hooks/usePulse';
import {
  radius,
  sizes,
  spacing,
  typography,
  useThemedStyles,
  type Theme,
} from '../theme';

interface MealCardSkeletonProps {
  /** Shared pulse so a grid of skeletons breathes in sync. */
  opacity: SharedValue<number>;
}

export function MealCardSkeleton({ opacity }: MealCardSkeletonProps) {
  const styles = useThemedStyles(makeStyles);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.image} />
      <View style={styles.body}>
        <View style={[styles.line, styles.lineWide]} />
        <View style={[styles.line, styles.lineNarrow]} />
      </View>
    </Animated.View>
  );
}

interface MealCardSkeletonGridProps {
  /** Number of placeholder cards; laid out two per row. */
  count?: number;
}

export function MealCardSkeletonGrid({ count = 4 }: MealCardSkeletonGridProps) {
  const opacity = usePulse();
  const styles = useThemedStyles(makeStyles);
  const rows = Math.ceil(count / 2);

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading recipes">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          <MealCardSkeleton opacity={opacity} />
          {rowIndex * 2 + 1 < count ? <MealCardSkeleton opacity={opacity} /> : null}
        </View>
      ))}
    </View>
  );
}

const LINE_HEIGHT = 12;

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: sizes.gridGap,
    },
    // Mirrors MealCard dimensions so the layout does not jump when data arrives.
    card: {
      width: MEAL_CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.skeleton,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
    },
    body: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      // Same reserved height as MealCard's two-line name.
      minHeight: typography.label.lineHeight * 2 + spacing.sm + spacing.md,
    },
    line: {
      height: LINE_HEIGHT,
      borderRadius: radius.sm,
      backgroundColor: colors.skeleton,
    },
    lineWide: {
      width: '90%',
      marginTop: (typography.label.lineHeight - LINE_HEIGHT) / 2,
    },
    lineNarrow: {
      width: '55%',
      marginTop: typography.label.lineHeight - LINE_HEIGHT,
    },
  });
