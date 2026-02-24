import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/theme/ThemeProvider';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <AppNavigator />
            <StatusBar style="auto" translucent backgroundColor="transparent" />
          </SafeAreaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
