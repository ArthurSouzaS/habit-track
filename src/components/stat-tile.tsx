import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Radius, Spacing, withAlpha } from '@/constants/theme';

import { Card } from './card';
import { ThemedText } from './themed-text';

interface StatTileProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  value: string;
  label: string;
  index?: number;
}

export function StatTile({ icon, color, value, label, index = 0 }: StatTileProps) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 70).duration(400)} style={styles.wrap}>
      <Card style={styles.card}>
        <View style={[styles.icon, { backgroundColor: withAlpha(color, 0.15) }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <ThemedText variant="title">{value}</ThemedText>
        <ThemedText variant="caption" numberOfLines={2}>
          {label}
        </ThemedText>
      </Card>
    </Animated.View>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  wrap: { flexGrow: 1, flexBasis: '45%' },
  card: { gap: Spacing.xs, padding: Spacing.md },
  icon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
});
