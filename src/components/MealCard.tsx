import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FadeInImage } from './FadeInImage';
import { FadeInView } from './FadeInView';
import { ScalePressable } from './ScalePressable';
import {
  STAGGER_MS,
  radius,
  shadows,
  spacing,
  typography,
  useThemedStyles,
  type Theme,
} from '../theme';
import type { MealDetail, MealSummary } from '../types';
import { getThumbnailUrl } from '../utils/images';

/**
 * Accepts a plain MealSummary (category grid) or a MealDetail (search
 * results), which additionally carries strCategory.
 */
export type MealCardData = MealSummary & Partial<Pick<MealDetail, 'strCategory'>>;

interface MealCardProps {
  meal: MealCardData;
  onPress: () => void;
  /** Position in the grid; drives the staggered entrance. */
  index?: number;
}

const FIRST_SCREEN_ITEMS = 6;
const ENTRANCE_OFFSET = 28;

/**
 * First screenful cascades in one after another; anything mounted later
 * (while scrolling) only offsets the right column slightly, so cards never
 * feel late.
 */
function entranceDelay(index: number): number {
  return index < FIRST_SCREEN_ITEMS ? index * STAGGER_MS : (index % 2) * STAGGER_MS;
}

function MealCardComponent({ meal, onPress, index = 0 }: MealCardProps) {
  const styles = useThemedStyles(makeStyles);
  const category = meal.strCategory?.trim() || null;

  return (
    <FadeInView style={styles.wrapper} delay={entranceDelay(index)} offset={ENTRANCE_OFFSET}>
      <ScalePressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={category ? `${meal.strMeal}, ${category}` : meal.strMeal}
        accessibilityHint="Opens the recipe"
        style={styles.card}
      >
        {/* Decorative: the card's label already names the meal. */}
        <FadeInImage
          uri={getThumbnailUrl(meal.strMealThumb, 'medium')}
          fallbackUri={meal.strMealThumb}
          style={styles.image}
        />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {meal.strMeal}
          </Text>
          {category ? (
            <Text style={styles.category} numberOfLines={1}>
              {category}
            </Text>
          ) : null}
        </View>
      </ScalePressable>
    </FadeInView>
  );
}

/** Grid items re-render only when their own meal object changes. */
export const MealCard = memo(MealCardComponent);

/** Two columns with a gap; percentage width keeps it responsive to any screen. */
export const MEAL_CARD_WIDTH = '48%';

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    wrapper: {
      width: MEAL_CARD_WIDTH,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...shadows.card,
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      // Clip the image frame, not the card, so the iOS shadow survives.
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
    },
    body: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    name: {
      ...typography.label,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      minHeight: typography.label.lineHeight * 2, // reserve 2 lines so rows stay level
    },
    category: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xxs,
    },
  });
