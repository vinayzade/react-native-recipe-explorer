import React, { useCallback } from 'react';
import { FlatList, StyleSheet, type ListRenderItem } from 'react-native';
import { EmptyView } from '../components/EmptyView';
import { LoadingView } from '../components/LoadingView';
import { MealCard } from '../components/MealCard';
import { useFavorites } from '../hooks/useFavorites';
import type { FavoritesScreenProps } from '../navigation/types';
import { sizes, spacing, useThemedStyles, type Theme } from '../theme';
import type { MealSummary } from '../types';

const GRID_COLUMNS = 2;
const keyExtractor = (item: MealSummary) => item.idMeal;

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const styles = useThemedStyles(makeStyles);
  const { favorites, isReady } = useFavorites();

  const handleMealPress = useCallback(
    (meal: MealSummary) =>
      navigation.navigate('MealDetail', {
        mealId: meal.idMeal,
        preview: { name: meal.strMeal, thumbnail: meal.strMealThumb },
      }),
    [navigation],
  );

  const renderMeal: ListRenderItem<MealSummary> = useCallback(
    ({ item, index }) => (
      <MealCard meal={item} index={index} onPress={() => handleMealPress(item)} />
    ),
    [handleMealPress],
  );

  if (!isReady) {
    return <LoadingView text="Loading favourites…" />;
  }

  return (
    <FlatList
      style={styles.list}
      data={favorites}
      renderItem={renderMeal}
      keyExtractor={keyExtractor}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={favorites.length === 0 ? styles.contentEmpty : styles.content}
      ListEmptyComponent={
        <EmptyView
          title="No favourites yet"
          message="Tap the heart on any recipe to save it here."
          icon="❤️"
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      padding: sizes.screenPadding,
      paddingBottom: spacing.xl,
    },
    contentEmpty: {
      flexGrow: 1,
      padding: sizes.screenPadding,
    },
    gridRow: {
      justifyContent: 'space-between',
      marginBottom: sizes.gridGap,
    },
  });
