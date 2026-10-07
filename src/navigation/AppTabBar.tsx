import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  radius,
  shadows,
  sizes,
  spacing,
  springs,
  typography,
  useThemedStyles,
  type Theme,
} from '../theme';
import type { RootTabParamList } from './types';

const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  RecipesTab: '🍳',
  FavoritesTab: '❤️',
};

interface TabItemProps {
  label: string;
  icon: string;
  focused: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({
  label,
  icon,
  focused,
  accessibilityLabel,
  onPress,
  onLongPress,
}: TabItemProps) {
  const styles = useThemedStyles(makeStyles);

  // 0 = inactive, 1 = active. Springs so the highlight pill "pops" into place.
  const progress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, springs.bouncy);
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.5, 1]) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.55, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.9, 1.12]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={styles.item}
    >
      <View style={styles.iconSlot}>
        <Animated.View style={[styles.pill, pillStyle]} />
        <Animated.Text
          style={[styles.icon, iconStyle]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {icon}
        </Animated.Text>
      </View>
      <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Custom bottom bar: fixed content height plus the device's bottom inset
 * (gesture bar / home indicator), a soft top shadow, and an animated
 * highlight pill behind the active tab.
 */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = options.title ?? route.name;

        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const handleLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabItem
            key={route.key}
            label={label}
            icon={TAB_ICONS[route.name as keyof RootTabParamList] ?? '•'}
            focused={focused}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={handlePress}
            onLongPress={handleLongPress}
          />
        );
      })}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      ...shadows.lg,
    },
    item: {
      flex: 1,
      height: sizes.tabBarHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSlot: {
      width: 60,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pill: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryLight,
    },
    icon: {
      fontSize: 18,
      lineHeight: 24,
      textAlign: 'center',
    },
    label: {
      ...typography.caption,
      fontWeight: '500',
      color: colors.textMuted,
      marginTop: spacing.xxs,
    },
    labelFocused: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
