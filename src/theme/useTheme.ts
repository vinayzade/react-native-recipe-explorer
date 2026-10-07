import { useMemo } from 'react';
import {
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './colors';

/** Same constraint StyleSheet.create() uses: every key must be a valid style object. */
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

/** Resolves the active palette from the OS colour scheme. */
export function useTheme(): Theme {
  const isDark = useColorScheme() === 'dark';
  return useMemo(
    () => ({ colors: isDark ? darkColors : lightColors, isDark }),
    [isDark],
  );
}

/**
 * Builds a StyleSheet from the active theme, memoised per scheme.
 * Declare the factory at module level so its identity is stable:
 *
 *   const makeStyles = ({ colors }: Theme) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
