import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

import { ThemedText } from './themed-text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ComponentProps<typeof Ionicons>['name'];
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', icon, color, disabled, style }: ButtonProps) {
  const { colors } = useAppTheme();
  const tint = color ?? (variant === 'danger' ? colors.danger : colors.primary);
  const background =
    variant === 'primary' ? tint : variant === 'ghost' ? 'transparent' : withAlpha(tint, 0.12);
  const foreground = variant === 'primary' ? '#fff' : tint;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={18} color={foreground} />}
      <ThemedText variant="label" style={[styles.label, { color: foreground }]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  label: { fontSize: 15 },
});
