import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';

import { HabitsProvider, useHabits } from '@/context/habits-context';
import { AppThemeProvider, useAppTheme } from '@/context/theme-context';
import { configureNotifications } from '@/lib/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotifications();

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <HabitsProvider>
        <RootNavigator />
      </HabitsProvider>
    </AppThemeProvider>
  );
}

function RootNavigator() {
  const { scheme, colors } = useAppTheme();
  const { loaded } = useHabits();

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [scheme, colors]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: 'Voltar',
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Habit Track' }} />
        <Stack.Screen name="habit/new" options={{ title: 'Novo hábito', presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]/index" options={{ title: 'Detalhes' }} />
        <Stack.Screen name="habit/[id]/edit" options={{ title: 'Editar hábito', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
