import { parseIngredients } from '../src/utils/parseIngredients';
import type { IngredientSlot, MealDetail, MealIngredientFields } from '../src/types';

function emptyIngredientFields(): MealIngredientFields {
  const fields: Partial<MealIngredientFields> = {};
  for (let slot = 1; slot <= 20; slot++) {
    fields[`strIngredient${slot as IngredientSlot}`] = null;
    fields[`strMeasure${slot as IngredientSlot}`] = null;
  }
  return fields as MealIngredientFields;
}

function makeMeal(overrides: Partial<MealDetail> = {}): MealDetail {
  return {
    idMeal: '52772',
    strMeal: 'Teriyaki Chicken Casserole',
    strMealThumb: 'https://example.com/thumb.jpg',
    strDrinkAlternate: null,
    strCategory: 'Chicken',
    strArea: 'Japanese',
    strInstructions: null,
    strTags: null,
    strYoutube: null,
    strSource: null,
    strImageSource: null,
    strCreativeCommonsConfirmed: null,
    dateModified: null,
    ...emptyIngredientFields(),
    ...overrides,
  };
}

describe('parseIngredients', () => {
  it('keeps ingredients with their measures, trimmed', () => {
    const meal = makeMeal({
      strIngredient1: 'Chicken',
      strMeasure1: ' 1 kg ',
      strIngredient2: ' Salt ',
      strMeasure2: null,
    });

    expect(parseIngredients(meal)).toEqual([
      { ingredient: 'Chicken', measure: '1 kg' },
      { ingredient: 'Salt', measure: '' },
    ]);
  });

  it('skips null and blank ingredient slots even if a measure is present', () => {
    const meal = makeMeal({
      strIngredient1: '',
      strMeasure1: '1 tsp',
      strIngredient2: '   ',
      strMeasure2: '2 tbsp',
      strIngredient3: null,
      strMeasure3: '3 cups',
      strIngredient4: 'Soy Sauce',
      strMeasure4: '3/4 cup',
    });

    expect(parseIngredients(meal)).toEqual([{ ingredient: 'Soy Sauce', measure: '3/4 cup' }]);
  });

  it('returns an empty list when no slots are filled', () => {
    expect(parseIngredients(makeMeal())).toEqual([]);
  });

  it('reads all 20 slots', () => {
    const meal = makeMeal({ strIngredient20: 'Sesame Seeds', strMeasure20: '1 tbsp' });
    expect(parseIngredients(meal)).toEqual([{ ingredient: 'Sesame Seeds', measure: '1 tbsp' }]);
  });
});
