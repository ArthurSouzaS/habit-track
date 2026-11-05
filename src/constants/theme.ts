import { Platform } from 'react-native';

export const palette = {
  primary: '#6C5CE7',
  primaryDark: '#8B7FF0',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const Colors = {
  light: {
    background: '#F5F6FB',
    card: '#FFFFFF',
    cardAlt: '#EEF0F7',
    border: '#E3E6EF',
    text: '#141826',
    textSecondary: '#6B7287',
    primary: palette.primary,
    onPrimary: '#FFFFFF',
    success: palette.success,
    danger: palette.danger,
    heatEmpty: '#E8EAF2',
    shadow: 'rgba(20, 24, 38, 0.08)',
    overlay: 'rgba(15, 18, 30, 0.4)',
  },
  dark: {
    background: '#0C0E16',
    card: '#161A26',
    cardAlt: '#1E2333',
    border: '#272D40',
    text: '#F2F4FA',
    textSecondary: '#9AA2B8',
    primary: palette.primaryDark,
    onPrimary: '#FFFFFF',
    success: palette.success,
    danger: '#F87171',
    heatEmpty: '#1F2434',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export type ThemeColors = (typeof Colors)['light'];
export type ColorSchemeName = keyof typeof Colors;

/** Cores disponíveis para os hábitos. */
export const HABIT_COLORS = [
  '#6C5CE7',
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#84CC16',
  '#F59E0B',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#A855F7',
];

export const HABIT_EMOJIS = [
  '💧', '📚', '🏃', '🧘', '💪', '🥗', '😴', '✍️',
  '🎸', '💻', '🌱', '🧹', '💊', '🚭', '☀️', '🙏',
  '🚴', '🎨', '🦷', '💰', '📵', '🐶', '🧠', '❤️',
];

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const Radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const MaxContentWidth = 640;

export const Fonts = Platform.select({
  ios: { rounded: 'ui-rounded' },
  web: {
    rounded:
      "'SF Pro Rounded', ui-rounded, 'Nunito', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  default: { rounded: undefined },
});

/** Mistura uma cor hex com transparência (0–1). */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${a}`;
}
