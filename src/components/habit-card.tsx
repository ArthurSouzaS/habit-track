import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { formatTime } from '@/lib/dates';
import { weeklyProgress } from '@/lib/stats';
import { currentStreak } from '@/lib/streak';
import type { DateKey, Habit } from '@/types/habit';

import { Card } from './card';
import { CheckButton } from './check-button';
import { ProgressBar } from './progress-bar';
import { ThemedText } from './themed-text';

interface HabitCardProps {
  habit: Habit;
  day: DateKey;
  today: DateKey;
  index?: number;
  onToggle: (habit: Habit) => void;
}

export function HabitCard({ habit, day, today, index = 0, onToggle }: HabitCardProps) {
  const { colors } = useAppTheme();
  const done = habit.completions.includes(day);
  const streak = currentStreak(habit, today);
  const week = weeklyProgress(habit, day);
  const isFuture = day > today;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(16)} layout={LinearTransition}>
      <Pressable
        onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${habit.name}`}
        style={({ pressed }) => pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }}>
        <Card style={styles.card}>
          <View style={[styles.emoji, { backgroundColor: withAlpha(habit.color, 0.15) }]}>
            <ThemedText style={styles.emojiText}>{habit.emoji}</ThemedText>
          </View>

          <View style={styles.info}>
            <ThemedText
              variant="subtitle"
              numberOfLines={1}
              style={done && { textDecorationLine: 'line-through', opacity: 0.6 }}>
              {habit.name}
            </ThemedText>
            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Ionicons name="flame" size={13} color={streak > 0 ? '#F97316' : colors.textSecondary} />
                <ThemedText variant="caption">
                  {streak} {streak === 1 ? 'dia' : 'dias'}
                </ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flag" size={12} color={week.met ? colors.success : colors.textSecondary} />
                <ThemedText variant="caption">
                  {week.count}/{week.goal} na semana
                </ThemedText>
              </View>
              {habit.reminder?.enabled && (
                <View style={styles.metaItem}>
                  <Ionicons name="alarm-outline" size={12} color={colors.textSecondary} />
                  <ThemedText variant="caption">
                    {formatTime(habit.reminder.hour, habit.reminder.minute)}
                  </ThemedText>
                </View>
              )}
            </View>
            <ProgressBar
              progress={week.progress}
              color={habit.color}
              trackColor={colors.cardAlt}
              height={5}
            />
          </View>

          <CheckButton
            done={done}
            color={habit.color}
            disabled={isFuture}
            onPress={() => onToggle(habit)}
            accessibilityLabel={done ? `Desmarcar ${habit.name}` : `Marcar ${habit.name} como feito`}
          />
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  emoji: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 24, lineHeight: 30 },
  info: { flex: 1, gap: 6 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.md, rowGap: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
