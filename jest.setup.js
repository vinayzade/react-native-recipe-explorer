jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// Reanimated's official mock: animations resolve instantly, no native runtime needed.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
