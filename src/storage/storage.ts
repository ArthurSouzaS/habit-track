import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Habit } from '@/types/habit';

const HABITS_KEY = '@habit-track/habits/v1';
const THEME_KEY = '@habit-track/theme/v1';

export type ThemePreference = 'system' | 'light' | 'dark';

export async function loadHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Habit[]) : [];
  } catch {
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemePreference(pref: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, pref);
}
