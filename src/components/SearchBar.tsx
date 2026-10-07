import React, { memo, useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  radius,
  sizes,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Theme,
} from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  /** Fired on the keyboard's "search" key; parent may trigger an immediate search. */
  onSubmit?: () => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

function SearchBarComponent({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search recipes...',
  onSubmit,
  autoFocus = false,
  style,
}: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const showClear = value.length > 0;

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <View style={[styles.container, focused && styles.containerFocused, style]}>
      <Text
        style={[styles.searchIcon, focused && styles.searchIconFocused]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        ⌕
      </Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        keyboardAppearance={isDark ? 'dark' : 'light'}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never" // we render our own, consistent on both platforms
        underlineColorAndroid="transparent"
        accessibilityLabel="Search recipes"
        accessibilityHint="Results update as you type"
      />

      {showClear ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.clearButtonPressed,
          ]}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** memo: parent re-renders on every keystroke; props are stable unless value changes. */
export const SearchBar = memo(SearchBarComponent);

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    // Flat (no elevation): a filled pill with a border reads cleanly on both platforms.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: sizes.searchBarHeight,
      paddingLeft: spacing.lg,
      paddingRight: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    containerFocused: {
      borderColor: colors.primary,
    },
    searchIcon: {
      fontSize: 22,
      lineHeight: 24,
      color: colors.textMuted,
      marginRight: spacing.sm,
    },
    searchIconFocused: {
      color: colors.primary,
    },
    input: {
      flex: 1,
      height: '100%',
      paddingVertical: 0, // Android adds vertical padding that mis-centres text
      ...typography.body,
      lineHeight: undefined, // explicit lineHeight clips TextInput text on Android
      color: colors.text,
    },
    clearButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    clearButtonPressed: {
      backgroundColor: colors.border,
    },
    clearIcon: {
      fontSize: 12,
      lineHeight: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
