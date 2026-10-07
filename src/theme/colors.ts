/**
 * Colour tokens, one palette per colour scheme. Components reference these
 * by role (e.g. `colors.textMuted`) via `useTheme()` / `useThemedStyles()`,
 * never by raw hex, so light/dark is handled in one place.
 */
export interface ThemeColors {
  // Brand – warm, food-friendly orange
  primary: string;
  primaryDark: string;
  primaryLight: string; // chip / badge backgrounds

  // Surfaces
  background: string;
  surface: string; // screen-level tint behind cards
  card: string;
  inputBackground: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // Lines
  border: string;
  divider: string;

  // Feedback
  error: string;
  success: string;

  // Misc
  overlay: string;
  imagePlaceholder: string;
  skeleton: string;
}

export const lightColors: ThemeColors = {
  primary: '#E8590C',
  primaryDark: '#C94A08',
  primaryLight: '#FFE8D9',

  background: '#FFFFFF',
  surface: '#F4F5F7',
  card: '#FFFFFF',
  inputBackground: '#F1F3F5',

  text: '#212529',
  textSecondary: '#495057',
  textMuted: '#868E96',
  textOnPrimary: '#FFFFFF',

  border: '#E9ECEF',
  divider: '#F1F3F5',

  error: '#DC3545',
  success: '#2F9E44',

  overlay: 'rgba(0, 0, 0, 0.35)',
  imagePlaceholder: '#E9ECEF',
  skeleton: '#E9ECEF',
};

export const darkColors: ThemeColors = {
  primary: '#FF7A2F',
  primaryDark: '#E8590C',
  primaryLight: 'rgba(255, 122, 47, 0.18)',

  background: '#121212',
  surface: '#121212',
  card: '#1E1E1E',
  inputBackground: '#262626',

  text: '#F1F3F5',
  textSecondary: '#CED4DA',
  textMuted: '#8E959C',
  textOnPrimary: '#FFFFFF',

  border: '#2E2E2E',
  divider: '#262626',

  error: '#FF6B6B',
  success: '#51CF66',

  overlay: 'rgba(0, 0, 0, 0.5)',
  imagePlaceholder: '#2A2A2A',
  skeleton: '#2E2E2E',
};
