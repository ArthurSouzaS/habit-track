import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Heatmap, type HeatValue } from '@/components/heatmap';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useHabits } from '@/context/habits-context';
import { useAppTheme } from '@/context/theme-context';
import { useToday } from '@/hooks/use-today';
import { capitalize, formatLongDate, fromDateKey, monthMatrix } from '@/lib/dates';
import { tapFeedback } from '@/lib/haptics';
import { dayScore, heatLevel } from '@/lib/stats';
import { historyStart, isScheduledOn } from '@/lib/streak';
import type { DateKey } from '@/types/habit';

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const { habits, toggleCompletion } = useHabits();
  const today = useToday();
  const now = fromDateKey(today);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<DateKey>(today);

  const habit = habits.find((h) => h.id === filter);
  const visible = habit ? [habit] : habits;
  const color = habit?.color ?? colors.primary;

  const getLevel = (key: DateKey): HeatValue | null => {
    if (habit) {
      if (key < historyStart(habit)) return null;
      return habit.completions.includes(key) ? 4 : 0;
    }
    const score = dayScore(habits, key);
    return score.scheduled === 0 ? null : heatLevel(score.ratio);
  };

  const monthDays = monthMatrix(year, month)
    .flat()
    .filter((k): k is DateKey => k !== null && k <= today);
  const monthCompletions = monthDays.reduce((sum, key) => sum + dayScore(visible, key).done, 0);
  const perfectDays = monthDays.filter((key) => {
    const s = dayScore(visible, key);
    return s.scheduled > 0 && s.done === s.scheduled;
  }).length;

  const dayHabits = visible.filter((h) => isScheduledOn(h, selected) || h.completions.includes(selected));

  if (habits.length === 0) {
    return (
      <Screen>
        <ThemedText variant="display">Calendário</ThemedText>
        <EmptyState
          emoji="🗓️"
          title="Nada por aqui ainda"
          message="Quando você criar hábitos, o calendário mostra a intensidade de cada dia como um mapa de calor."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ThemedText variant="display">Calendário</ThemedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <FilterChip label="Todos" emoji="✨" active={!filter} color={colors.primary} onPress={() => setFilter(null)} />
        {habits.map((h) => (
          <FilterChip
            key={h.id}
            label={h.name}
            emoji={h.emoji}
            active={filter === h.id}
            color={h.color}
            onPress={() => setFilter(h.id)}
          />
        ))}
      </ScrollView>

      <Card>
        <Heatmap
          year={year}
          month={month}
          color={color}
          today={today}
          getLevel={getLevel}
          selected={selected}
          onDayPress={setSelected}
          onMonthChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
      </Card>

      <View style={styles.summary}>
        <Card style={styles.summaryCard}>
          <ThemedText variant="title">{monthCompletions}</ThemedText>
          <ThemedText variant="caption">conclusões no mês</ThemedText>
        </Card>
        <Card style={styles.summaryCard}>
          <ThemedText variant="title">{perfectDays}</ThemedText>
          <ThemedText variant="caption">dias 100% completos</ThemedText>
        </Card>
      </View>

      <Animated.View key={selected} entering={FadeIn.duration(250)}>
        <Card style={{ gap: Spacing.md }}>
          <ThemedText variant="subtitle">
            {capitalize(formatLongDate(selected))}
          </ThemedText>
          {dayHabits.length === 0 ? (
            <ThemedText variant="caption">Nenhum hábito programado neste dia.</ThemedText>
          ) : (
            dayHabits.map((h) => {
              const done = h.completions.includes(selected);
              return (
                <Pressable
                  key={h.id}
                  onPress={() => {
                    toggleCompletion(h.id, selected);
                    tapFeedback();
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  style={styles.dayRow}>
                  <ThemedText style={styles.dayEmoji}>{h.emoji}</ThemedText>
                  <ThemedText variant="body" style={{ flex: 1 }} numberOfLines={1}>
                    {h.name}
                  </ThemedText>
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={done ? h.color : colors.textSecondary}
                  />
                </Pressable>
              );
            })
          )}
          <ThemedText variant="caption">Toque em um hábito para marcar ou desmarcar este dia.</ThemedText>
        </Card>
      </Animated.View>
    </Screen>
  );
}

function FilterChip({
  label,
  emoji,
  active,
  color,
  onPress,
}: {
  label: string;
  emoji: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? withAlpha(color, 0.16) : colors.card,
          borderColor: active ? color : colors.border,
        },
      ]}>
      <ThemedText>{emoji}</ThemedText>
      <ThemedText variant="label" style={{ color: active ? color : colors.textSecondary }} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: { gap: Spacing.sm, paddingRight: Spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    maxWidth: 200,
  },
  summary: { flexDirection: 'row', gap: Spacing.md },
  summaryCard: { flex: 1, gap: 2 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 4 },
  dayEmoji: { fontSize: 20, lineHeight: 26 },
});
