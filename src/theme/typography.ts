import type { TextStyle } from 'react-native';

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

/**
 * Ready-made text styles (size / weight / line-height only – colour comes
 * from the active theme). Spread into StyleSheet entries:
 *   title: { ...typography.h1, color: colors.text }
 * Line heights are ~1.3–1.5× size for comfortable mobile reading.
 */
export const typography = {
  h1: { fontSize: fontSize.xxl, lineHeight: 34, fontWeight: fontWeight.bold },
  h2: { fontSize: fontSize.xl, lineHeight: 28, fontWeight: fontWeight.bold },
  h3: { fontSize: fontSize.lg, lineHeight: 24, fontWeight: fontWeight.semibold },
  body: { fontSize: fontSize.md, lineHeight: 24, fontWeight: fontWeight.regular },
  bodyStrong: { fontSize: fontSize.md, lineHeight: 24, fontWeight: fontWeight.semibold },
  label: { fontSize: fontSize.sm, lineHeight: 20, fontWeight: fontWeight.medium },
  caption: { fontSize: fontSize.xs, lineHeight: 16, fontWeight: fontWeight.regular },
  button: { fontSize: fontSize.md, lineHeight: 20, fontWeight: fontWeight.semibold },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
