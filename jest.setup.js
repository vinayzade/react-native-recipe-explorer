/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// Reanimated 4 official Jest setup (pairs with `resolver` in jest.config.js).
require('react-native-reanimated').setUpTests();
