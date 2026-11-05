import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { WEEKDAY_ABBR, WEEKDAY_SHORT } from '@/lib/dates';
import type { Weekday } from '@/types/habit';

import { ThemedText } from './themed-text';

interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
  color: string;
}

export function WeekdayPicker({ value, onChange, color }: WeekdayPickerProps) {
  const { colors } = useAppTheme();

  const toggle = (day: Weekday) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day];
    onChange(next.sort((a, b) => a - b));
  };

  return (
    <View style={styles.row}>
      {WEEKDAY_SHORT.map((label, i) => {
        const day = i as Weekday;
        const active = value.includes(day);
        return (
          <Pressable
            key={i}
            onPress={() => toggle(day)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={WEEKDAY_ABBR[i]}
            style={[
              styles.day,
              {
                backgroundColor: active ? color : colors.cardAlt,
                borderColor: active ? color : colors.border,
              },
            ]}>
            <ThemedText variant="label" style={{ color: active ? '#fff' : colors.textSecondary }}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.xs },
  day: {
    flex: 1,
    maxWidth: 46,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
