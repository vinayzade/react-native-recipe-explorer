/**
 * 4-pt spacing scale. Use these for margin / padding / gap so vertical
 * rhythm stays consistent across screens.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Corner radii. Cards use `lg`, chips/buttons `pill` or `md`. */
export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Fixed sizes shared by several components. */
export const sizes = {
  screenPadding: spacing.lg,
  gridGap: spacing.md,
  touchTarget: 44, // minimum tappable height (iOS HIG / Material)
  tabBarHeight: 60,
  searchBarHeight: 48,
  categoryChipHeight: 40,
  categoryThumb: 28,
  mealCardImage: 140,
  detailHeroImage: 300,
  iconSm: 16,
  iconMd: 24,
} as const;
