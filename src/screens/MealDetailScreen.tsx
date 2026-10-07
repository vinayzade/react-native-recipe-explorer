import React, { useCallback, useEffect, useMemo, type PropsWithChildren } from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyView } from '../components/EmptyView';
import { ErrorView } from '../components/ErrorView';
import { FadeInImage } from '../components/FadeInImage';
import { FadeInView } from '../components/FadeInView';
import { ScalePressable } from '../components/ScalePressable';
import { useFavorites } from '../hooks/useFavorites';
import { useMealDetail } from '../hooks/useMealDetail';
import { usePulse } from '../hooks/usePulse';
import type { MealDetailScreenProps } from '../navigation/types';
import {
  STAGGER_MS,
  radius,
  shadows,
  sizes,
  spacing,
  springs,
  typography,
  useThemedStyles,
  type Theme,
} from '../theme';
import type { MealDetail } from '../types';
import { getThumbnailUrl } from '../utils/images';
import { parseIngredients } from '../utils/parseIngredients';

const HERO_ASPECT_RATIO = 0.8;
const HERO_MAX_HEIGHT = 380;
/** How far the content sheet overlaps the hero image. */
const SHEET_OVERLAP = 28;
const TOP_BAR_HEIGHT = 56;
const ROUND_BUTTON_SIZE = 40;
const FAVORITE_BUTTON_SIZE = 52;
/** The hero starts slightly zoomed in and settles as the screen arrives. */
const HERO_INTRO_SCALE = 1.14;
const HERO_INTRO_MS = 700;

/** Splits raw instructions into trimmed paragraphs; blank lines are dropped. */
function toParagraphs(instructions: string | null): string[] {
  return (instructions ?? '')
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(Boolean);
}

export function MealDetailScreen({ route, navigation }: MealDetailScreenProps) {
  const { mealId, preview } = route.params;
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const { meal, loading, error, notFound, retry } = useMealDetail(mealId);

  // Photo and title come from the list (`preview`) until lookup.php answers,
  // so the screen is already "there" while it slides in.
  const name = meal?.strMeal ?? preview?.name ?? null;
  const imageUrl = meal?.strMealThumb ?? preview?.thumbnail ?? null;

  const heroHeight = Math.min(width * HERO_ASPECT_RATIO, HERO_MAX_HEIGHT) + insets.top;
  const topBarHeight = insets.top + TOP_BAR_HEIGHT;

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(mealId);
  const canFavorite = name !== null && imageUrl !== null;

  // ── Animations (all on the UI thread) ───────────────────────────────────
  const scrollY = useSharedValue(0);
  const intro = useSharedValue(0);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    intro.value = withTiming(1, { duration: HERO_INTRO_MS, easing: Easing.out(Easing.cubic) });
  }, [intro]);

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  // Parallax: the photo scrolls at about half speed, zooms when pulled down
  // (iOS bounce), and eases out of its intro zoom on arrival.
  const heroStyle = useAnimatedStyle(() => {
    const pullScale = interpolate(scrollY.value, [-heroHeight, 0], [2, 1], {
      extrapolateRight: Extrapolation.CLAMP,
    });
    const introScale = interpolate(intro.value, [0, 1], [HERO_INTRO_SCALE, 1]);
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-heroHeight, 0, heroHeight],
            [-heroHeight / 2, 0, heroHeight * 0.45],
            Extrapolation.CLAMP,
          ),
        },
        { scale: pullScale * introScale },
      ],
    };
  });

  // The solid top bar (with the title) fades in as the sheet reaches the top.
  const topBarStyle = useAnimatedStyle(() => {
    const end = heroHeight - SHEET_OVERLAP - topBarHeight;
    return {
      opacity: interpolate(scrollY.value, [end - 60, end], [0, 1], Extrapolation.CLAMP),
    };
  });

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleToggleFavorite = useCallback(() => {
    if (!name || !imageUrl) {
      return;
    }
    toggleFavorite({ idMeal: mealId, strMeal: name, strMealThumb: imageUrl });
    // Squash, then spring back past full size: a little "pop".
    heartScale.value = withSequence(
      withTiming(0.6, { duration: 90 }),
      withSpring(1, springs.bouncy),
    );
  }, [toggleFavorite, mealId, name, imageUrl, heartScale]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Hero: cached grid thumbnail first, full-size photo fades in over it */}
        <View style={[styles.heroFrame, { height: heroHeight }]}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            {imageUrl ? (
              <>
                <Image
                  source={{ uri: getThumbnailUrl(imageUrl, 'medium') }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                  fadeDuration={0}
                  accessible={false}
                />
                <FadeInImage
                  uri={imageUrl}
                  style={StyleSheet.absoluteFill}
                  transparent
                  accessibilityLabel={name ? `Photo of ${name}` : 'Recipe photo'}
                />
              </>
            ) : null}
          </Animated.View>
        </View>

        {/* Content sheet overlapping the hero */}
        <FadeInView
          offset={48}
          style={[styles.sheet, { minHeight: height - heroHeight + SHEET_OVERLAP }]}
        >
          {name ? (
            <Text style={styles.title} accessibilityRole="header">
              {name}
            </Text>
          ) : null}

          {meal ? (
            <MealBody meal={meal} />
          ) : loading ? (
            <DetailSkeleton showTitle={!name} />
          ) : notFound ? (
            <EmptyView
              title="Recipe not found"
              message="This recipe may have been removed. Try another one."
              icon="🔍"
            />
          ) : (
            <ErrorView
              title="Couldn’t load recipe"
              message={error ?? undefined}
              onRetry={retry}
            />
          )}
        </FadeInView>

        {/*
          Favourite button floats on the hero/sheet seam. It is a child of the
          scroll content (not of the sheet) so its whole area stays inside its
          parent's bounds and is tappable on Android.
        */}
        {canFavorite ? (
          <Animated.View
            style={[
              styles.favoriteAnchor,
              { top: heroHeight - SHEET_OVERLAP - FAVORITE_BUTTON_SIZE / 2 },
              heartStyle,
            ]}
          >
            <ScalePressable
              onPress={handleToggleFavorite}
              scaleTo={0.9}
              accessibilityRole="button"
              accessibilityLabel={favorite ? 'Remove from favourites' : 'Add to favourites'}
              accessibilityState={{ selected: favorite }}
              style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
            >
              <Text style={[styles.favoriteIcon, favorite && styles.favoriteIconActive]}>
                {favorite ? '♥' : '♡'}
              </Text>
            </ScalePressable>
          </Animated.View>
        ) : null}
      </Animated.ScrollView>

      {/* Solid bar that fades in on scroll */}
      <Animated.View
        style={[styles.topBar, { height: topBarHeight, paddingTop: insets.top }, topBarStyle]}
        pointerEvents="none"
      >
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {name ?? 'Recipe'}
        </Text>
      </Animated.View>

      {/* Back button: always visible, above both the photo and the bar */}
      <View
        style={[
          styles.backAnchor,
          { top: insets.top + (TOP_BAR_HEIGHT - ROUND_BUTTON_SIZE) / 2 },
        ]}
      >
        <ScalePressable
          onPress={handleBack}
          scaleTo={0.88}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </ScalePressable>
      </View>
    </View>
  );
}

/** Everything that needs the full lookup.php response; sections cascade in. */
function MealBody({ meal }: { meal: MealDetail }) {
  const styles = useThemedStyles(makeStyles);

  const ingredients = useMemo(() => parseIngredients(meal), [meal]);
  const paragraphs = useMemo(() => toParagraphs(meal.strInstructions), [meal.strInstructions]);
  const youtubeUrl = meal.strYoutube?.trim() || null;

  const handleOpenYoutube = useCallback(async () => {
    if (!youtubeUrl) {
      return;
    }
    try {
      const supported = await Linking.canOpenURL(youtubeUrl);
      if (!supported) {
        Alert.alert('Unable to open video', 'No app on this device can open YouTube links.');
        return;
      }
      await Linking.openURL(youtubeUrl);
    } catch {
      Alert.alert('Unable to open video', 'Please try again later.');
    }
  }, [youtubeUrl]);

  return (
    <>
      {meal.strCategory || meal.strArea ? (
        <FadeInView style={styles.tagRow}>
          {meal.strCategory ? <Tag label={meal.strCategory} /> : null}
          {meal.strArea ? <Tag label={`${meal.strArea} cuisine`} /> : null}
        </FadeInView>
      ) : null}

      <FadeInView delay={STAGGER_MS}>
        <Section title="Ingredients" meta={`${ingredients.length} items`}>
          {ingredients.length === 0 ? (
            <Text style={styles.muted}>No ingredients listed.</Text>
          ) : (
            <View style={styles.ingredientCard}>
              {ingredients.map((item, index) => (
                <View
                  key={`${item.ingredient}-${index}`}
                  style={[styles.ingredientRow, index > 0 && styles.ingredientRowDivider]}
                  accessible
                  accessibilityLabel={
                    item.measure ? `${item.measure} ${item.ingredient}` : item.ingredient
                  }
                >
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientName}>{item.ingredient}</Text>
                  {item.measure ? (
                    <Text style={styles.ingredientMeasure}>{item.measure}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </Section>
      </FadeInView>

      <FadeInView delay={STAGGER_MS * 2}>
        <Section title="Instructions">
          {paragraphs.length === 0 ? (
            <Text style={styles.muted}>No instructions provided.</Text>
          ) : (
            paragraphs.map((paragraph, index) => (
              <Text key={index} style={[styles.paragraph, index > 0 && styles.paragraphSpacing]}>
                {paragraph}
              </Text>
            ))
          )}
        </Section>
      </FadeInView>

      {youtubeUrl ? (
        <FadeInView delay={STAGGER_MS * 3}>
          <ScalePressable
            onPress={handleOpenYoutube}
            accessibilityRole="link"
            accessibilityLabel="Watch on YouTube"
            accessibilityHint="Opens the recipe video in YouTube"
            style={styles.youtubeButton}
          >
            <Text style={styles.youtubeIcon} accessibilityElementsHidden>
              ▶
            </Text>
            <Text style={styles.youtubeText}>Watch on YouTube</Text>
          </ScalePressable>
        </FadeInView>
      ) : null}
    </>
  );
}

/** Pulsing placeholder for the body while lookup.php is in flight. */
function DetailSkeleton({ showTitle }: { showTitle: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const opacity = usePulse();
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={animatedStyle}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading recipe"
    >
      {showTitle ? <View style={[styles.skeletonBar, styles.skeletonTitle]} /> : null}
      <View style={styles.skeletonTagRow}>
        <View style={[styles.skeletonBar, styles.skeletonTag]} />
        <View style={[styles.skeletonBar, styles.skeletonTag]} />
      </View>
      <View style={[styles.skeletonBar, styles.skeletonHeading]} />
      <View style={[styles.skeletonBar, styles.skeletonBlock]} />
      <View style={[styles.skeletonBar, styles.skeletonHeading]} />
      <View style={[styles.skeletonBar, styles.skeletonLine]} />
      <View style={[styles.skeletonBar, styles.skeletonLine]} />
      <View style={[styles.skeletonBar, styles.skeletonLineShort]} />
    </Animated.View>
  );
}

function Tag({ label }: { label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

interface SectionProps {
  title: string;
  meta?: string;
}

function Section({ title, meta, children }: PropsWithChildren<SectionProps>) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: 0,
    },
    heroFrame: {
      width: '100%',
      overflow: 'hidden',
      backgroundColor: colors.imagePlaceholder,
    },
    sheet: {
      marginTop: -SHEET_OVERLAP,
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.xl + spacing.sm,
      paddingBottom: spacing.xxxl,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      backgroundColor: colors.background,
    },
    title: {
      ...typography.h1,
      color: colors.text,
      // Leave room for the floating favourite button on the right.
      marginRight: FAVORITE_BUTTON_SIZE + spacing.sm,
    },

    // Floating controls
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: sizes.screenPadding + ROUND_BUTTON_SIZE + spacing.md,
      backgroundColor: colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    topBarTitle: {
      ...typography.h3,
      color: colors.text,
    },
    backAnchor: {
      position: 'absolute',
      left: sizes.screenPadding,
    },
    backButton: {
      width: ROUND_BUTTON_SIZE,
      height: ROUND_BUTTON_SIZE,
      borderRadius: ROUND_BUTTON_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      ...shadows.sm,
    },
    backIcon: {
      fontSize: 20,
      lineHeight: 24,
      textAlign: 'center',
      color: colors.text,
    },
    favoriteAnchor: {
      position: 'absolute',
      right: sizes.screenPadding,
    },
    favoriteButton: {
      width: FAVORITE_BUTTON_SIZE,
      height: FAVORITE_BUTTON_SIZE,
      borderRadius: FAVORITE_BUTTON_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      ...shadows.md,
    },
    favoriteButtonActive: {
      borderColor: colors.primary,
    },
    favoriteIcon: {
      fontSize: 26,
      lineHeight: 30,
      textAlign: 'center',
      color: colors.textMuted,
    },
    favoriteIconActive: {
      color: colors.primary,
    },

    // Body
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryLight,
    },
    tagText: {
      ...typography.label,
      color: colors.primary,
    },
    section: {
      marginTop: spacing.xxl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.h2,
      color: colors.text,
    },
    sectionMeta: {
      ...typography.caption,
      color: colors.textMuted,
    },
    muted: {
      ...typography.body,
      color: colors.textMuted,
    },
    ingredientCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
    },
    ingredientRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    ingredientRowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginRight: spacing.md,
    },
    ingredientName: {
      ...typography.body,
      color: colors.text,
      flex: 1,
      marginRight: spacing.md,
    },
    ingredientMeasure: {
      ...typography.label,
      color: colors.textMuted,
      textAlign: 'right',
      flexShrink: 1,
      maxWidth: '45%',
    },
    paragraph: {
      ...typography.body,
      color: colors.textSecondary,
    },
    paragraphSpacing: {
      marginTop: spacing.md,
    },
    youtubeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      marginTop: spacing.xxl,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    youtubeIcon: {
      fontSize: 14,
      color: colors.textOnPrimary,
      marginRight: spacing.sm,
    },
    youtubeText: {
      ...typography.button,
      color: colors.textOnPrimary,
    },

    // Skeleton
    skeletonBar: {
      borderRadius: radius.sm,
      backgroundColor: colors.skeleton,
    },
    skeletonTitle: {
      width: '70%',
      height: 28,
    },
    skeletonTagRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    skeletonTag: {
      width: 84,
      height: 28,
      borderRadius: radius.pill,
    },
    skeletonHeading: {
      width: '45%',
      height: 22,
      marginTop: spacing.xxl,
    },
    skeletonBlock: {
      height: 180,
      marginTop: spacing.md,
      borderRadius: radius.lg,
    },
    skeletonLine: {
      height: 14,
      marginTop: spacing.md,
    },
    skeletonLineShort: {
      width: '60%',
      height: 14,
      marginTop: spacing.md,
    },
  });
