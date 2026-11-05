import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'label' | 'caption';

export interface ThemedTextProps extends TextProps {
  variant?: Variant;
  color?: keyof ThemeColors | (string & {});
}

export function ThemedText({ variant = 'body', color, style, ...rest }: ThemedTextProps) {
  const { colors } = useAppTheme();
  const resolved =
    color && color in colors
      ? colors[color as keyof ThemeColors]
      : (color ?? (variant === 'caption' ? colors.textSecondary : colors.text));
  return <Text style={[styles[variant], { color: resolved }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800', fontFamily: Fonts?.rounded, letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', fontFamily: Fonts?.rounded, letterSpacing: -0.3 },
  subtitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', fontFamily: Fonts?.rounded },
  body: { fontSize: 15, lineHeight: 21 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.2 },
  caption: { fontSize: 12, lineHeight: 16 },
});
