import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography, useThemedStyles, type Theme } from '../theme';

interface EmptyViewProps {
  title?: string;
  /** Secondary hint, e.g. "Try a different search or category." */
  message?: string;
  /** Emoji or single glyph used as the visual. */
  icon?: string;
}

export function EmptyView({
  title = 'No recipes found',
  message = 'Try a different search or pick another category.',
  icon = '🍽️',
}: EmptyViewProps) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
          {icon}
        </Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
      paddingVertical: spacing.xxl,
    },
    iconBadge: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    icon: {
      fontSize: 40,
      lineHeight: 48,
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
      maxWidth: 300,
    },
  });
