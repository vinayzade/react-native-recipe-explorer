import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mealApi } from '../api/mealApi';
import { getErrorMessage } from '../api/apiClient';
import { CategoryChip } from '../components/CategoryChip';
import { EmptyView } from '../components/EmptyView';
import { ErrorView } from '../components/ErrorView';
import { FadeInView } from '../components/FadeInView';
import { LoadingView } from '../components/LoadingView';
import { MealCard, type MealCardData } from '../components/MealCard';
import { MealCardSkeletonGrid } from '../components/MealCardSkeleton';
import {
  REFRESH_INDICATOR_HEIGHT,
  RefreshIndicator,
} from '../components/RefreshIndicator';
import { ScalePressable } from '../components/ScalePressable';
import { SearchBar } from '../components/SearchBar';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce';
import { useMeals } from '../hooks/useMeals';
import type { HomeScreenProps } from '../navigation/types';
import {
  STAGGER_MS,
  sizes,
  spacing,
  springs,
  typography,
  useTheme,
  useThemedStyles,
  type Theme,
} from '../theme';
import type { Category, MealSummary } from '../types';

const SEARCH_DEBOUNCE_MS = 500;
const GRID_COLUMNS = 2;
const SKELETON_COUNT = 4;
const EMPTY_MEALS: MealSummary[] = [];
const CATEGORY_ROW_PADDING = spacing.md;
/** How far the grid dims while a refresh is in flight. */
const REFRESHING_GRID_OPACITY = 0.35;

// Module-level so FlatList receives the same function reference every render.
const keyExtractorCategory = (item: Category) => item.idCategory;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  // ── Search ──────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  // Typing is debounced, but clearing applies immediately so the category grid
  // returns without a half-second pause.
  const searchQuery = query.trim() === '' ? '' : debouncedQuery;

  // ── Categories ──────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    retry: retryCategories,
  } = useCategories();

  // Auto-select the first category once; this also kicks off the first meals load.
  useEffect(() => {
    if (selectedCategory === null && categories.length > 0) {
      setSelectedCategory(categories[0].strCategory);
    }
  }, [categories, selectedCategory]);

  // ── Meals ───────────────────────────────────────────────────────────────
  const { meals, loading, refreshing, error, isSearching, refreshId, refresh, retry } =
    useMeals({ selectedCategory, searchQuery });

  // ── Refresh choreography ────────────────────────────────────────────────
  // While refreshing, the grid springs down and dims to make room for the
  // RefreshIndicator pill; when it finishes, it springs back and the cards
  // replay their staggered entrance (see keyExtractorMeal below).
  const refreshProgress = useSharedValue(0);
  useEffect(() => {
    refreshProgress.value = withSpring(refreshing ? 1 : 0, springs.gentle);
  }, [refreshing, refreshProgress]);

  const gridStyle = useAnimatedStyle(() => ({
    opacity: interpolate(refreshProgress.value, [0, 1], [1, REFRESHING_GRID_OPACITY]),
    transform: [
      { translateY: interpolate(refreshProgress.value, [0, 1], [0, REFRESH_INDICATOR_HEIGHT]) },
    ],
  }));

  // Including refreshId in the key remounts the cards after a successful
  // refresh, which is what re-triggers their entering animation.
  const keyExtractorMeal = useCallback(
    (item: MealSummary) => `${item.idMeal}-${refreshId}`,
    [refreshId],
  );

  // ── Surprise Me ─────────────────────────────────────────────────────────
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSurpriseMe = useCallback(async () => {
    setSurpriseLoading(true);
    try {
      const meal = await mealApi.getRandomMeal();
      if (isMounted.current) {
        navigation.navigate('MealDetail', {
          mealId: meal.idMeal,
          preview: { name: meal.strMeal, thumbnail: meal.strMealThumb },
        });
      }
    } catch (err) {
      if (isMounted.current) {
        Alert.alert('No surprise this time', getErrorMessage(err));
      }
    } finally {
      if (isMounted.current) {
        setSurpriseLoading(false);
      }
    }
  }, [navigation]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleClearSearch = useCallback(() => setQuery(''), []);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setQuery(''); // a category tap always shows that category, even mid-search
  }, []);

  const handleMealPress = useCallback(
    (meal: MealSummary) =>
      navigation.navigate('MealDetail', {
        mealId: meal.idMeal,
        preview: { name: meal.strMeal, thumbnail: meal.strMealThumb },
      }),
    [navigation],
  );

  // ── Renderers ───────────────────────────────────────────────────────────
  const renderCategory: ListRenderItem<Category> = useCallback(
    ({ item }) => (
      <CategoryChip
        title={item.strCategory}
        selected={!isSearching && item.strCategory === selectedCategory}
        onPress={() => handleSelectCategory(item.strCategory)}
      />
    ),
    [isSearching, selectedCategory, handleSelectCategory],
  );

  const renderMeal: ListRenderItem<MealCardData> = useCallback(
    ({ item, index }) => (
      <MealCard meal={item} index={index} onPress={() => handleMealPress(item)} />
    ),
    [handleMealPress],
  );

  // Hide stale meals while a new category/search is loading so skeletons show.
  const gridData = loading ? EMPTY_MEALS : meals;

  const listEmptyComponent = useMemo(() => {
    if (loading || categoriesLoading) {
      return <MealCardSkeletonGrid count={SKELETON_COUNT} />;
    }
    if (error) {
      return (
        <FadeInView style={styles.fill}>
          <ErrorView message={error} onRetry={retry} />
        </FadeInView>
      );
    }
    if (isSearching) {
      return (
        <FadeInView style={styles.fill}>
          <EmptyView
            title={`No results for “${searchQuery.trim()}”`}
            message="Check the spelling or try another dish."
            icon="🔍"
          />
        </FadeInView>
      );
    }
    return (
      <FadeInView style={styles.fill}>
        <EmptyView />
      </FadeInView>
    );
  }, [loading, categoriesLoading, error, retry, isSearching, searchQuery, styles.fill]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <FadeInView style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={styles.title}
            accessibilityRole="header"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            Recipe Explorer
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            What would you like to cook?
          </Text>
        </View>
        <ScalePressable
          onPress={handleSurpriseMe}
          disabled={surpriseLoading}
          scaleTo={0.88}
          accessibilityRole="button"
          accessibilityLabel="Surprise me"
          accessibilityHint="Opens a random recipe"
          accessibilityState={{ busy: surpriseLoading, disabled: surpriseLoading }}
          style={styles.surpriseButton}
        >
          {surpriseLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.surpriseEmoji}>🎲</Text>
          )}
        </ScalePressable>
      </FadeInView>

      {/* Search */}
      <FadeInView delay={STAGGER_MS}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={handleClearSearch}
          style={styles.searchBar}
        />
      </FadeInView>

      {categoriesError ? (
        <ErrorView
          title="Couldn’t load categories"
          message={categoriesError}
          onRetry={retryCategories}
        />
      ) : (
        <>
          {/* Categories – fixed-height row so the grid below can never squeeze it */}
          <View style={styles.categoryRow}>
            {categoriesLoading ? (
              <LoadingView size="inline" />
            ) : (
              <FadeInView style={styles.fill} offset={0}>
                <FlatList
                  data={categories}
                  renderItem={renderCategory}
                  keyExtractor={keyExtractorCategory}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryList}
                  keyboardShouldPersistTaps="handled"
                />
              </FadeInView>
            )}
          </View>

          {/* Meal grid */}
          <View style={styles.gridArea}>
            <RefreshIndicator visible={refreshing} />
            <Animated.View style={[styles.fill, gridStyle]}>
              <FlatList
                style={styles.fill}
                data={gridData}
                extraData={refreshId}
                renderItem={renderMeal}
                keyExtractor={keyExtractorMeal}
                numColumns={GRID_COLUMNS}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={
                  gridData.length === 0 ? styles.gridContentEmpty : styles.gridContent
                }
                ListEmptyComponent={listEmptyComponent}
                refreshControl={
                  // `refreshing` stays false on purpose: the native spinner only
                  // gives feedback during the pull, then hands over to our own
                  // RefreshIndicator animation for the actual refresh.
                  <RefreshControl
                    refreshing={false}
                    onRefresh={refresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                    progressBackgroundColor={colors.card}
                  />
                }
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                windowSize={7}
              />
            </Animated.View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    fill: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    headerText: {
      flex: 1,
      marginRight: spacing.md,
    },
    title: {
      ...typography.h1,
      color: colors.text,
    },
    subtitle: {
      ...typography.label,
      fontWeight: '400',
      color: colors.textMuted,
      marginTop: spacing.xxs,
    },
    surpriseButton: {
      width: sizes.touchTarget,
      height: sizes.touchTarget,
      borderRadius: sizes.touchTarget / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    surpriseEmoji: {
      fontSize: 20,
      lineHeight: 26,
      textAlign: 'center',
    },
    searchBar: {
      marginHorizontal: sizes.screenPadding,
    },
    categoryRow: {
      height: sizes.categoryChipHeight + CATEGORY_ROW_PADDING * 2,
      flexShrink: 0,
      justifyContent: 'center',
    },
    categoryList: {
      paddingHorizontal: sizes.screenPadding,
      alignItems: 'center',
      gap: spacing.sm,
    },
    gridArea: {
      flex: 1,
      overflow: 'hidden', // the grid slides down behind the tab bar while refreshing
    },
    gridContent: {
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    gridContentEmpty: {
      flexGrow: 1, // lets Empty/Error views centre vertically
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    gridRow: {
      justifyContent: 'space-between',
      marginBottom: sizes.gridGap,
    },
  });
