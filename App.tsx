import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritesProvider } from './src/hooks/useFavorites';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <AppNavigator />
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}

export default App;
