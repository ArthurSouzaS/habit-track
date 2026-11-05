import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

import { ThemedText } from './themed-text';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.cardAlt }]} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.option}>
            {active && (
              <Animated.View
                layout={LinearTransition.springify().damping(18)}
                style={[styles.indicator, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
              />
            )}
            <ThemedText variant="label" style={{ color: active ? colors.text : colors.textSecondary }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: Radius.md, padding: 4 },
  option: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.md - 4,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
