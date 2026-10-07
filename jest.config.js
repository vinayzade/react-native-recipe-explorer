module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // Reanimated 4 / Worklets: resolve the JS (non-native) entry points so no native runtime is needed.
  resolver: 'react-native-reanimated/jest/resolver',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context|@react-native-async-storage|react-native-reanimated|react-native-worklets)/)',
  ],
};
