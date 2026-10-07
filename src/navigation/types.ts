import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * What the list already knows about a meal. Passing it along lets the detail
 * screen show the photo and title during the push transition, instead of a
 * blank screen with a spinner while lookup.php loads.
 */
export interface MealPreview {
  name: string;
  thumbnail: string;
}

/**
 * One param list serves both stacks: the Recipes tab registers Home + MealDetail,
 * the Favourites tab registers Favorites + MealDetail. Sharing the type means
 * `navigation.navigate('MealDetail', { mealId })` is identical from either tab.
 */
export type MealStackParamList = {
  Home: undefined;
  Favorites: undefined;
  MealDetail: { mealId: string; preview?: MealPreview };
};

export type RootTabParamList = {
  RecipesTab: NavigatorScreenParams<MealStackParamList>;
  FavoritesTab: NavigatorScreenParams<MealStackParamList>;
};

/** Screen props for a stack screen, including the parent tab navigator. */
export type MealStackScreenProps<T extends keyof MealStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MealStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type HomeScreenProps = MealStackScreenProps<'Home'>;
export type FavoritesScreenProps = MealStackScreenProps<'Favorites'>;
export type MealDetailScreenProps = MealStackScreenProps<'MealDetail'>;

// Lets useNavigation() / useRoute() infer the param lists without generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
