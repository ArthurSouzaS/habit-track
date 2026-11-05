import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { Fab } from '@/components/fab';
import { HabitCard } from '@/components/habit-card';
import { ProgressRing } from '@/components/progress-ring';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useHabits } from '@/context/habits-context';
import { useAppTheme } from '@/context/theme-context';
import { useToday } from '@/hooks/use-today';
import { WEEKDAY_ABBR, addDaysToKey, capitalize, formatLongDate, fromDateKey, startOfWeek } from '@/lib/dates';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { dayScore } from '@/lib/stats';
import { isScheduledOn } from '@/lib/streak';
import type { Habit } from '@/types/habit';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function motivation(done: number, total: number): string {
  if (total === 0) return 'Nenhum hábito programado. Aproveite o descanso! 🌿';
  if (done === 0) return 'Bora começar? Um passo de cada vez. 🚀';
  if (done === total) return 'Dia completo! Você mandou muito bem. 🎉';
  if (done / total >= 0.5) return 'Mais da metade! Continue assim. 💪';
  return 'Bom começo! Mantenha o ritmo. ✨';
}

export default function TodayScreen() {
  const { colors } = useAppTheme();
  const { habits, loaded, toggleCompletion, loadSampleData } = useHabits();
  const today = useToday();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const day = selectedDay ?? today;
  const isToday = day === today;

  const scheduled = habits.filter((h) => isScheduledOn(h, day));
  const others = habits.filter((h) => !isScheduledOn(h, day));
  const done = scheduled.filter((h) => h.completions.includes(day)).length;
  const progress = scheduled.length ? done / scheduled.length : 0;

  const weekStart = startOfWeek(today);
  const week = Array.from({ length: 7 }, (_, i) => addDaysToKey(weekStart, i));

  const onToggle = (habit: Habit) => {
    const nowDone = toggleCompletion(habit.id, day);
    if (nowDone) successFeedback();
    else tapFeedback();
  };

  return (
    <Screen overlay={<Fab label="Novo hábito" onPress={() => router.push('/habit/new')} />}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ThemedText variant="caption" style={styles.date}>
          {capitalize(formatLongDate(today))}
        </ThemedText>
        <ThemedText variant="display">{greeting()}! 👋</ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(450)}>
        <LinearGradient
          colors={[colors.primary, '#A78BFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroText}>
            <ThemedText variant="label" style={styles.heroLabel}>
              {isToday ? 'PROGRESSO DE HOJE' : formatLongDate(day).toUpperCase()}
            </ThemedText>
            <ThemedText variant="display" style={styles.white}>
              {done} de {scheduled.length}
            </ThemedText>
            <ThemedText variant="body" style={styles.heroMessage}>
              {motivation(done, scheduled.length)}
            </ThemedText>
          </View>
          <ProgressRing progress={progress} size={92} strokeWidth={10} color="#fff" trackColor="rgba(255,255,255,0.25)">
            <ThemedText variant="subtitle" style={styles.white}>
              {Math.round(progress * 100)}%
            </ThemedText>
          </ProgressRing>
        </LinearGradient>
      </Animated.View>

      <View style={styles.week}>
        {week.map((key) => {
          const score = dayScore(habits, key);
          const active = key === day;
          const future = key > today;
          const complete = score.scheduled > 0 && score.done === score.scheduled;
          return (
            <Pressable
              key={key}
              disabled={future}
              onPress={() => setSelectedDay(key === today ? null : key)}
              accessibilityLabel={formatLongDate(key)}
              accessibilityState={{ selected: active }}
              style={[
                styles.weekDay,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: key === today && !active ? colors.primary : colors.border,
                  opacity: future ? 0.45 : 1,
                },
              ]}>
              <ThemedText variant="caption" style={{ color: active ? '#fff' : colors.textSecondary }}>
                {WEEKDAY_ABBR[fromDateKey(key).getDay()]}
              </ThemedText>
              <ThemedText variant="subtitle" style={{ color: active ? '#fff' : colors.text }}>
                {fromDateKey(key).getDate()}
              </ThemedText>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: complete
                      ? active
                        ? '#fff'
                        : colors.success
                      : score.done > 0
                        ? withAlpha(active ? '#ffffff' : colors.primary, 0.5)
                        : 'transparent',
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {loaded && habits.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="Comece um novo hábito"
          message="Crie seu primeiro hábito e acompanhe sua sequência, metas semanais e evolução no calendário.">
          <Button title="Criar hábito" icon="add-circle" onPress={() => router.push('/habit/new')} />
          <Button title="Explorar com exemplos" icon="sparkles" variant="secondary" onPress={loadSampleData} />
        </EmptyState>
      ) : (
        <>
          {scheduled.length > 0 && (
            <View style={styles.list}>
              <SectionTitle title={isToday ? 'Para hoje' : 'Programados'} />
              {scheduled.map((habit, i) => (
                <HabitCard key={habit.id} habit={habit} day={day} today={today} index={i} onToggle={onToggle} />
              ))}
            </View>
          )}
          {others.length > 0 && (
            <View style={styles.list}>
              <SectionTitle title="Fora da programação" />
              <ThemedText variant="caption" style={{ marginTop: -4 }}>
                Também dá para marcar — conta como bônus na sequência.
              </ThemedText>
              {others.map((habit, i) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  day={day}
                  today={today}
                  index={scheduled.length + i}
                  onToggle={onToggle}
                />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  date: { marginBottom: 2 },
  hero: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  heroText: { flex: 1, gap: 4 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  heroMessage: { color: 'rgba(255,255,255,0.92)' },
  white: { color: '#fff' },
  week: { flexDirection: 'row', gap: 6 },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  list: { gap: Spacing.md },
});
