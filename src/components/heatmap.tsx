import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { MONTHS, capitalize, WEEKDAY_SHORT, fromDateKey, monthMatrix } from '@/lib/dates';
import type { DateKey } from '@/types/habit';

import { ThemedText } from './themed-text';

export type HeatValue = 0 | 1 | 2 | 3 | 4;

const ALPHAS = [0, 0.28, 0.5, 0.75, 1];

interface HeatmapProps {
  year: number;
  month: number;
  color: string;
  today: DateKey;
  /** Intensidade de cada dia; `null` = fora do histórico (não pintado). */
  getLevel: (key: DateKey) => HeatValue | null;
  selected?: DateKey | null;
  onDayPress?: (key: DateKey) => void;
  onMonthChange?: (year: number, month: number) => void;
}

export function Heatmap({
  year,
  month,
  color,
  today,
  getLevel,
  selected,
  onDayPress,
  onMonthChange,
}: HeatmapProps) {
  const { colors } = useAppTheme();
  const weeks = monthMatrix(year, month);
  const todayDate = fromDateKey(today);
  const isCurrentMonth = year === todayDate.getFullYear() && month === todayDate.getMonth();

  const shift = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onMonthChange?.(next.getFullYear(), next.getMonth());
  };

  return (
    <View style={styles.container}>
      {onMonthChange && (
        <View style={styles.header}>
          <Pressable
            onPress={() => shift(-1)}
            hitSlop={10}
            accessibilityLabel="Mês anterior"
            style={[styles.navButton, { backgroundColor: colors.cardAlt }]}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>
          <ThemedText variant="subtitle" style={styles.monthLabel}>
            {capitalize(MONTHS[month])} de {year}
          </ThemedText>
          <Pressable
            onPress={() => shift(1)}
            hitSlop={10}
            disabled={isCurrentMonth}
            accessibilityLabel="Próximo mês"
            style={[styles.navButton, { backgroundColor: colors.cardAlt, opacity: isCurrentMonth ? 0.35 : 1 }]}>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </Pressable>
        </View>
      )}

      <View style={styles.row}>
        {WEEKDAY_SHORT.map((label, i) => (
          <View key={i} style={styles.cellWrap}>
            <ThemedText variant="caption" style={styles.weekday}>
              {label}
            </ThemedText>
          </View>
        ))}
      </View>

      <Animated.View key={`${year}-${month}`} entering={FadeIn.duration(250)} style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.row}>
            {week.map((key, di) => {
              if (!key) return <View key={di} style={styles.cellWrap} />;
              const level = key > today ? null : getLevel(key);
              const isToday = key === today;
              const isSelected = key === selected;
              const background =
                level === null || level === 0 ? colors.heatEmpty : withAlpha(color, ALPHAS[level]);
              const strong = level !== null && level >= 3;
              return (
                <View key={key} style={styles.cellWrap}>
                  <Pressable
                    disabled={!onDayPress || key > today}
                    onPress={() => onDayPress?.(key)}
                    accessibilityLabel={`Dia ${Number(key.slice(8))}`}
                    style={({ pressed }) => [
                      styles.cell,
                      {
                        backgroundColor: background,
                        opacity: key > today ? 0.4 : pressed ? 0.7 : 1,
                        borderColor: isSelected ? colors.text : isToday ? color : 'transparent',
                      },
                    ]}>
                    <ThemedText
                      variant="caption"
                      style={[styles.dayNumber, { color: strong ? '#fff' : colors.textSecondary }]}>
                      {Number(key.slice(8))}
                    </ThemedText>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>

      <View style={styles.legend}>
        <ThemedText variant="caption">Menos</ThemedText>
        {ALPHAS.map((alpha, i) => (
          <View
            key={i}
            style={[
              styles.legendCell,
              { backgroundColor: i === 0 ? colors.heatEmpty : withAlpha(color, alpha) },
            ]}
          />
        ))}
        <ThemedText variant="caption">Mais</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  monthLabel: {},
  navButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  grid: { gap: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cellWrap: { flex: 1, alignItems: 'center' },
  weekday: { fontWeight: '600' },
  cell: {
    width: '100%',
    maxWidth: 48,
    aspectRatio: 1,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: { fontSize: 11, fontWeight: '600' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: Spacing.xs },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});
