/**
 * Item from GET filter.php?c={category}.
 * Only the fields needed to render a card in the meal grid. Also the shape
 * persisted for favourites.
 */
export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

/** TheMealDB exposes exactly 20 ingredient/measure slots per meal. */
export type IngredientSlot =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export type IngredientKey = `strIngredient${IngredientSlot}`;
export type MeasureKey = `strMeasure${IngredientSlot}`;

/**
 * strIngredient1..20 and strMeasure1..20, typed as explicit keys rather than
 * an index signature, so a typo like `strIngredient21` is a compile error.
 * Unused slots arrive as "" or null.
 */
export type MealIngredientFields = Record<IngredientKey | MeasureKey, string | null>;

/**
 * Full meal from GET lookup.php?i={id}, search.php?s={query} and random.php.
 */
export interface MealDetail extends MealSummary, MealIngredientFields {
  strDrinkAlternate: string | null;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  /** Comma-separated, e.g. "Pasta,Baked" */
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
  strImageSource: string | null;
  strCreativeCommonsConfirmed: string | null;
  dateModified: string | null;
}

/** Normalised ingredient row for the detail screen; see utils/parseIngredients. */
export interface Ingredient {
  ingredient: string;
  measure: string;
}

/**
 * Envelope for every meals endpoint.
 * TheMealDB returns `meals: null` (not `[]`) when nothing matches.
 */
export interface MealsResponse<T extends MealSummary = MealDetail> {
  meals: T[] | null;
}
