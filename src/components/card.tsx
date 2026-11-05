import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export function Card({ style, ...rest }: ViewProps) {
  const { colors, scheme } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: scheme === 'dark' ? StyleSheet.hairlineWidth : 0,
        },
        Platform.select({
          web: { boxShadow: `0 4px 18px ${colors.shadow}` },
          default: {
            shadowColor: '#000',
            shadowOpacity: scheme === 'dark' ? 0 : 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: scheme === 'dark' ? 0 : 2,
          },
        }),
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
});
