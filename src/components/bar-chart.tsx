import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

import { ThemedText } from './themed-text';

export interface Bar {
  key: string;
  label: string;
  /** 0–1 */
  value: number;
  caption?: string;
  highlight?: boolean;
}

interface BarChartProps {
  data: Bar[];
  color: string;
  height?: number;
}

export function BarChart({ data, color, height = 120 }: BarChartProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.bars, { height }]}>
        {data.map((bar, i) => (
          <View key={bar.key} style={styles.column}>
            {bar.caption !== undefined && (
              <ThemedText variant="caption" style={styles.caption}>
                {bar.caption}
              </ThemedText>
            )}
            <View style={[styles.track, { backgroundColor: colors.cardAlt }]}>
              <AnimatedBar value={bar.value} color={bar.highlight === false ? colors.textSecondary : color} delay={i * 50} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {data.map((bar) => (
          <ThemedText key={bar.key} variant="caption" style={styles.label}>
            {bar.label}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

function AnimatedBar({ value, color, delay }: { value: number; color: string; delay: number }) {
  const height = useSharedValue(0);
  useEffect(() => {
    height.set(withDelay(delay, withSpring(Math.max(0, Math.min(1, value)), { damping: 16 })));
  }, [value, delay, height]);
  const style = useAnimatedStyle(() => ({ height: `${height.get() * 100}%` }));
  return <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  column: { flex: 1, height: '100%', alignItems: 'center', gap: 4 },
  caption: { fontWeight: '600' },
  track: { flex: 1, width: '100%', maxWidth: 34, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  fill: { width: '100%', borderRadius: 8 },
  labels: { flexDirection: 'row', gap: Spacing.sm },
  label: { flex: 1, textAlign: 'center' },
});
