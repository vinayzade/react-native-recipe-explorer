# Recipe Explorer

## Overview

Recipe Explorer is a React Native (CLI, no Expo) app built as a 3–4 hour machine test. It browses recipes from the free [TheMealDB](https://www.themealdb.com/api.php) API: filter by category, search by name, open a detail page with ingredients, instructions and a YouTube link, and save favourites locally.

## Features

- Debounced recipe search (500 ms) that overrides the category grid while active
- Horizontal category list; the first category is selected automatically on launch
- Two-column meal grid with pull-to-refresh, skeleton loaders, error-with-retry and empty states
- Meal detail: hero image, name, category, cuisine, parsed ingredients with measurements, instructions, "Watch on YouTube"
- "Surprise me" button that opens a random recipe
- Favourites persisted with AsyncStorage, shown in a second tab
- Native-driven animations (built-in `Animated`, no extra library): staggered card entrance, spring press feedback, image fade-in, parallax hero, animated tab bar, favourite "pop"
- Light / dark mode via `useColorScheme()`
- Basic accessibility: roles, labels, selected/busy states, 44 pt touch targets
- Android and iOS

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native 0.87 (CLI), TypeScript |
| Navigation | `@react-navigation/native`, `native-stack`, `bottom-tabs` |
| HTTP | Axios |
| Persistence | `@react-native-async-storage/async-storage` |
| Styling | `StyleSheet` + a small token-based theme (no UI library) |
| State | React hooks + one Context (favourites); no Redux |
| Tests | Jest (`@react-native/jest-preset`) |

## Architecture

```
src/
├── api/          apiClient.ts (Axios instance, ApiError) · mealApi.ts (typed endpoint functions)
├── components/   Presentational, reusable: SearchBar, CategoryChip, MealCard, MealCardSkeleton,
│                 LoadingView, ErrorView, EmptyView
│                 Animation primitives: ScalePressable, FadeInView, FadeInImage
├── hooks/        Data + behaviour: useCategories, useMeals, useMealDetail, useDebounce, useFavorites
├── navigation/   AppNavigator.tsx (tabs → stacks) · types.ts (typed param lists)
├── screens/      HomeScreen, MealDetailScreen, FavoritesScreen – composition only
├── services/     favoritesService.ts (AsyncStorage read/write)
├── theme/        colors (light/dark), spacing, typography, shadows, useTheme/useThemedStyles
├── types/        TheMealDB models: Category, MealSummary, MealDetail, response envelopes
└── utils/        parseIngredients.ts
```

The layout is organised by responsibility with a strict one-way dependency flow:

```
screens → hooks → api → (axios)
   ↓         ↓
components  services
   ↓
 theme / types / utils (leaf modules, imported by anyone)
```

- **Screens** only compose hooks and components; they contain no fetching or parsing logic.
- **Hooks** own async state (loading / error / data), cancellation and retry.
- **`api/`** is the only module that knows about Axios or TheMealDB's response envelopes. Everything above it receives clean typed arrays or a user-readable `ApiError`.
- **Components** take props and theme tokens only, so they are reusable across screens (the same `MealCard` renders category results, search results and favourites).

Adding a feature (e.g. "Areas") means a new `mealApi` function, a hook, and a screen — no existing module changes shape.

## API

[TheMealDB](https://www.themealdb.com/api.php) — free tier, base URL `https://www.themealdb.com/api/json/v1/1/`.

| Endpoint | Used for |
|---|---|
| `categories.php` | Category chips |
| `filter.php?c={category}` | Meal grid for a category |
| `search.php?s={query}` | Search |
| `lookup.php?i={id}` | Meal detail |
| `random.php` | "Surprise me" |

Note: the API returns `{ "meals": null }` rather than an empty array when nothing matches; `mealApi` normalises this to `[]`.

## Installation

```bash
npm install
```

Android:

```bash
npm run android
```

iOS:

```bash
cd ios
bundle install        # first time only
bundle exec pod install
cd ..
npm run ios
```

Checks:

```bash
npx tsc --noEmit   # type-check
npm run lint
npm test
```

## App Screens

**Home** — header with "Surprise me", search bar, horizontal category chips, two-column meal grid. Search results replace the grid while the query is non-empty; clearing the search immediately restores the selected category.

**Meal Detail** — 4:3 hero image, title with favourite toggle, category / cuisine tags, ingredients card (ingredient + measure per row), instructions as paragraphs, "Watch on YouTube" (hidden when the API has no link). Handles loading, error-with-retry and not-found.

**Favourites** — grid of saved meals from AsyncStorage, with an empty state. Tapping a card opens the same detail screen inside the Favourites tab's stack.

## Key Technical Decisions

- **Custom hooks over screen-level fetching.** `useCategories`, `useMeals` and `useMealDetail` encapsulate request lifecycle (loading / refreshing / error / retry) so screens stay declarative and the logic is testable in isolation.
- **No Redux.** State is either local to one screen (query, selected category) or a single shared list (favourites). A Context + `useReducer`-free provider covers the shared case; Redux would add boilerplate without benefit at this size.
- **Debounced search.** `useDebounce(query, 500)` means one request per pause in typing instead of one per keystroke. Clearing the input bypasses the debounce so the category grid comes back instantly.
- **Reusable Axios layer.** One `apiClient.get<T>()` sets the base URL, timeout and headers, and converts every failure into an `ApiError` with a user-friendly message (offline, timeout, 4xx, 5xx). Hooks never see raw Axios errors or responses.
- **Ingredient parser.** TheMealDB flattens ingredients into `strIngredient1..20` / `strMeasure1..20`. These are typed as template-literal keys (`` `strIngredient${1|…|20}` ``) so `parseIngredients` iterates them with full type safety and no `any`, skipping null/blank slots.
- **Stale-request handling.** Each request gets an `AbortController`; the effect cleanup aborts it when the category/query changes or the screen unmounts. A late response from an aborted request is discarded, so rapid typing or category switching can never show the wrong results, and nothing sets state after unmount.
- **FlatList optimisations.** Module-level `keyExtractor`s, `useCallback` render functions, `React.memo` on `MealCard` / `CategoryChip`, a stable empty-array constant, `initialNumToRender` / `windowSize` tuned for a 2-column grid, `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"` for search UX. Nothing beyond what the list sizes justify.
- **Animations.** Three small primitives (`ScalePressable`, `FadeInView`, `FadeInImage`) built on React Native's `Animated` with `useNativeDriver: true`, so every animation (opacity / transform only) runs off the JS thread and stays smooth during fetches. Grid thumbnails use TheMealDB's `/medium` variant (~30 KB vs ~125 KB) with a fallback to the full image.
- **Theming.** Colours live in two palettes (`lightColors`, `darkColors`); `useThemedStyles(makeStyles)` memoises a `StyleSheet` per scheme, so no component duplicates styles for dark mode.

## Trade-offs

This was a 3–4 hour machine test; the priority was core requirements done well and code that is easy to maintain and explain.

- Navigation uses a shared `MealStackParamList` for both tab stacks (Home/Favourites each push the same `MealDetail`), trading a little type precision for one `navigate('MealDetail', …)` signature everywhere.
- Icons are Unicode/emoji rather than an icon font, avoiding a native dependency.
- The category list and search bar sit above the grid rather than scrolling with it, which keeps `TextInput` focus stable without a `ListHeaderComponent` workaround.
- Search results use `search.php`, which returns full `MealDetail` objects — heavier than `filter.php`, but it is the only search endpoint TheMealDB offers.
- Tests cover the pure ingredient parser and an `<App />` smoke render; hooks and screens are untested.

## Future Improvements

- Unit tests for hooks (`useMeals` stale-request behaviour, `useDebounce`) and component tests with React Native Testing Library
- In-memory / persistent caching of category results and meal details to avoid refetching on every visit
- Pagination or infinite scroll if the API supported it (TheMealDB returns full lists)
- Offline mode: serve cached meals when the network is unavailable and surface an offline banner
- Replace emoji icons with an icon set; add shared-element transition from card to hero image
