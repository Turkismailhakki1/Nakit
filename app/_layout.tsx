import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { FinanceDataProvider, useFinanceData } from '@/hooks/use-finance-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export const unstable_settings = {
  anchor: 'tabs',
};

function InnerLayout() {
  const systemScheme = useColorScheme();
  const { settings } = useFinanceData();

  const colorScheme = settings.theme === 'system' ? systemScheme : settings.theme;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <FinanceDataProvider>
      <InnerLayout />
    </FinanceDataProvider>
  );
}
