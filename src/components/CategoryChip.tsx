import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ScalePressable } from './ScalePressable';
import {
  durations,
  radius,
  sizes,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Theme,
} from '../theme';

interface CategoryChipProps {
  title: string;
  selected: boolean;
  onPress: () => void;
}

function CategoryChipComponent({ title, selected, onPress }: CategoryChipProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  // 0 = idle, 1 = selected. Colours cross-fade instead of snapping.
  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: durations.base });
  }, [selected, progress]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.card, colors.primary]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [colors.textSecondary, colors.textOnPrimary],
    ),
  }));

  return (
    <ScalePressable
      onPress={onPress}
      scaleTo={0.92}
      // Chip is 40pt tall; hitSlop extends the tappable area to the 44pt minimum.
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title} category`}
      accessibilityHint="Shows recipes in this category"
      style={[styles.chip, chipStyle]}
    >
      <Animated.Text
        style={[styles.label, selected && styles.labelSelected, labelStyle]}
        numberOfLines={1}
      >
        {title}
      </Animated.Text>
    </ScalePressable>
  );
}

/**
 * Rendered ~14× in a horizontal list; memo means only the chips whose
 * `selected` flips re-render when the active category changes.
 */
export const CategoryChip = memo(CategoryChipComponent);

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    chip: {
      height: sizes.categoryChipHeight,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    label: {
      ...typography.label,
      color: colors.textSecondary,
    },
    labelSelected: {
      fontWeight: '600',
    },
  });
