import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { spacing, typography, useTheme, useThemedStyles, type Theme } from '../theme';

interface LoadingViewProps {
  /** Optional caption under the spinner, e.g. "Loading recipes…" */
  text?: string;
  /** `fill` (default) centres in the available space; `inline` sits in a list row. */
  size?: 'fill' | 'inline';
}

export function LoadingView({ text, size = 'fill' }: LoadingViewProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      style={size === 'fill' ? styles.fill : styles.inline}
      accessibilityRole="progressbar"
      accessibilityLabel={text ?? 'Loading'}
    >
      <ActivityIndicator
        size={size === 'fill' ? 'large' : 'small'}
        color={colors.primary}
      />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    inline: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
    },
    text: {
      ...typography.label,
      color: colors.textMuted,
      marginTop: spacing.md,
      textAlign: 'center',
    },
  });
