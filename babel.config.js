module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Must be listed last: compiles Reanimated worklets to run on the UI thread.
  plugins: ['react-native-worklets/plugin'],
};
