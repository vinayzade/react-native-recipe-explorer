import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  radius,
  sizes,
  spacing,
  typography,
  useThemedStyles,
  type Theme,
} from '../theme';

interface ErrorViewProps {
  title?: string;
  /** Shown under the title. Defaults to a generic friendly message. */
  message?: string;
  /** When provided, a retry button is rendered and calls this on press. */
  onRetry?: () => void;
  retryLabel?: string;
}

const DEFAULT_MESSAGE =
  'We couldn’t load this right now. Please check your connection and try again.';

export function ErrorView({
  title = 'Something went wrong',
  message = DEFAULT_MESSAGE,
  onRetry,
  retryLabel = 'Try again',
}: ErrorViewProps) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
        ⚠️
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          accessibilityHint="Reloads the content"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.xl,
    },
    icon: {
      fontSize: 40,
      lineHeight: 48,
      marginBottom: spacing.md,
    },
    title: {
      ...typography.h3,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    message: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: 320,
      marginBottom: spacing.xl,
    },
    button: {
      minHeight: sizes.touchTarget,
      minWidth: 140,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
    },
    buttonPressed: {
      backgroundColor: colors.primaryDark,
    },
    buttonText: {
      ...typography.button,
      color: colors.textOnPrimary,
    },
  });
