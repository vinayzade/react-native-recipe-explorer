import React, { useMemo } from 'react';
import { StatusBar } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { AppTabBar } from './AppTabBar';
import type { MealStackParamList, RootTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { MealDetailScreen } from '../screens/MealDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { useTheme, type Theme } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const RecipesStack = createNativeStackNavigator<MealStackParamList>();
const FavoritesStack = createNativeStackNavigator<MealStackParamList>();

function useStackScreenOptions(): NativeStackNavigationOptions {
  const { colors } = useTheme();
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.primary,
      headerTitleStyle: { color: colors.text, fontWeight: '600' },
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal',
      contentStyle: { backgroundColor: colors.surface },
    }),
    [colors],
  );
}

/**
 * Detail draws its own immersive header (photo under the status bar, floating
 * back button), so the native header is hidden. `ios_from_right` is the
 * iOS-style push on both platforms: the new screen slides over while the
 * previous one drifts back and dims – smoother than Android's default.
 */
const DETAIL_SCREEN_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'ios_from_right',
  gestureEnabled: true,
};

function RecipesStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <RecipesStack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      {/* Home draws its own header (title + Surprise Me) */}
      <RecipesStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <RecipesStack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={DETAIL_SCREEN_OPTIONS}
      />
    </RecipesStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <FavoritesStack.Navigator initialRouteName="Favorites" screenOptions={screenOptions}>
      <FavoritesStack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favourites' }}
      />
      <FavoritesStack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={DETAIL_SCREEN_OPTIONS}
      />
    </FavoritesStack.Navigator>
  );
}

// Module-level so the navigator does not see a new tabBar component each render.
const renderTabBar = (props: BottomTabBarProps) => <AppTabBar {...props} />;

function buildNavigationTheme({ colors, isDark }: Theme): NavigationTheme {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.surface,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
}

export function AppNavigator() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => buildNavigationTheme(theme), [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{ headerShown: false, animation: 'shift' }}
      >
        <Tab.Screen
          name="RecipesTab"
          component={RecipesStackNavigator}
          options={{ title: 'Recipes', tabBarAccessibilityLabel: 'Recipes tab' }}
        />
        <Tab.Screen
          name="FavoritesTab"
          component={FavoritesStackNavigator}
          options={{ title: 'Favourites', tabBarAccessibilityLabel: 'Favourites tab' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
