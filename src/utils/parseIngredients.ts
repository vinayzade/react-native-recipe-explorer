import type { Ingredient, IngredientSlot, MealDetail } from '../types';

const INGREDIENT_SLOT_COUNT = 20;

const INGREDIENT_SLOTS: readonly IngredientSlot[] = Array.from(
  { length: INGREDIENT_SLOT_COUNT },
  (_, index) => (index + 1) as IngredientSlot,
);

/**
 * Collapses TheMealDB's flattened `strIngredient1..20` / `strMeasure1..20`
 * fields into a list, skipping slots whose ingredient is null or blank.
 *
 * @example
 * parseIngredients({
 *   ...meal,
 *   strIngredient1: 'Chicken',  strMeasure1: '1 kg',
 *   strIngredient2: ' Salt ',   strMeasure2: null,
 *   strIngredient3: '',         strMeasure3: '1 tsp',   // no ingredient → skipped
 *   strIngredient4: null,       strMeasure4: null,
 * });
 * // → [
 * //   { ingredient: 'Chicken', measure: '1 kg' },
 * //   { ingredient: 'Salt',    measure: '' },
 * // ]
 */
export function parseIngredients(meal: MealDetail): Ingredient[] {
  const ingredients: Ingredient[] = [];

  for (const slot of INGREDIENT_SLOTS) {
    const ingredient = meal[`strIngredient${slot}`]?.trim() ?? '';
    if (!ingredient) {
      continue;
    }
    const measure = meal[`strMeasure${slot}`]?.trim() ?? '';
    ingredients.push({ ingredient, measure });
  }

  return ingredients;
}
