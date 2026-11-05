import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { BarChart } from '@/components/bar-chart';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { CheckButton } from '@/components/check-button';
import { EmptyState } from '@/components/empty-state';
import { Heatmap } from '@/components/heatmap';
import { ProgressBar } from '@/components/progress-bar';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { StatGrid, StatTile } from '@/components/stat-tile';
import { ThemedText } from '@/components/themed-text';
import { Spacing, withAlpha } from '@/constants/theme';
import { useHabit, useHabits } from '@/context/habits-context';
import { useAppTheme } from '@/context/theme-context';
import { useToday } from '@/hooks/use-today';
import { WEEKDAY_ABBR, WEEKDAY_LONG, formatTime, fromDateKey } from '@/lib/dates';
import { confirm } from '@/lib/confirm';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { habitStats, weekdayDistribution, weeklyHistory } from '@/lib/stats';
import { historyStart, isScheduledOn } from '@/lib/streak';
import type { DateKey, Habit } from '@/types/habit';

const pct = (v: number) => `${Math.round(v * 100)}%`;

function describeFrequency(habit: Habit): string {
  if (habit.frequency.type === 'daily') return 'Todos os dias';
  if (habit.frequency.days.length === 7) return 'Todos os dias';
  return habit.frequency.days.map((d) => WEEKDAY_ABBR[d]).join(', ');
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabit(id);
  const { loaded, toggleCompletion, deleteHabit } = useHabits();
  const { colors } = useAppTheme();
  const today = useToday();
  const now = fromDateKey(today);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  if (!habit) {
    return (
      <Screen edges={['bottom']}>
        {loaded && (
          <EmptyState emoji="🔍" title="Hábito não encontrado" message="Ele pode ter sido excluído.">
            <Button title="Voltar ao início" onPress={() => router.replace('/')} />
          </EmptyState>
        )}
      </Screen>
    );
  }

  const stats = habitStats(habit, today);
  const history = weeklyHistory(habit, today, 8);
  const distribution = weekdayDistribution(habit);
  const maxWeekday = Math.max(1, ...distribution);
  const doneToday = habit.completions.includes(today);
  const start = historyStart(habit);

  const toggle = (day: DateKey) => {
    const nowDone = toggleCompletion(habit.id, day);
    if (nowDone) successFeedback();
    else tapFeedback();
  };

  const onDelete = async () => {
    const ok = await confirm('Excluir hábito?', `"${habit.name}" e todo o histórico serão apagados.`, 'Excluir');
    if (!ok) return;
    await deleteHabit(habit.id);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: habit.name }} />

      <Animated.View entering={FadeInDown.duration(400)}>
        <Card style={[styles.header, { backgroundColor: withAlpha(habit.color, 0.12) }]}>
          <Animated.View entering={ZoomIn.springify()} style={[styles.emoji, { backgroundColor: withAlpha(habit.color, 0.22) }]}>
            <ThemedText style={styles.emojiText}>{habit.emoji}</ThemedText>
          </Animated.View>
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText variant="title" numberOfLines={2}>
              {habit.name}
            </ThemedText>
            <ThemedText variant="caption">
              {describeFrequency(habit)}
              {habit.reminder?.enabled ? ` · ⏰ ${formatTime(habit.reminder.hour, habit.reminder.minute)}` : ''}
            </ThemedText>
          </View>
          <CheckButton
            done={doneToday}
            color={habit.color}
            size={52}
            onPress={() => toggle(today)}
            accessibilityLabel={doneToday ? 'Desmarcar hoje' : 'Marcar hoje como feito'}
          />
        </Card>
      </Animated.View>

      {!isScheduledOn(habit, today) && (
        <ThemedText variant="caption" style={{ textAlign: 'center', marginTop: -6 }}>
          Hoje não está programado — se fizer mesmo assim, conta como bônus. ✨
        </ThemedText>
      )}

      <StatGrid>
        <StatTile index={0} icon="flame" color="#F97316" value={`${stats.currentStreak}`} label="sequência atual (dias)" />
        <StatTile index={1} icon="trophy" color="#F59E0B" value={`${stats.longestStreak}`} label="maior sequência" />
        <StatTile index={2} icon="pie-chart" color={habit.color} value={pct(stats.rate30)} label="conclusão em 30 dias" />
        <StatTile index={3} icon="checkmark-done" color={colors.success} value={`${stats.totalCompletions}`} label="vezes concluído" />
      </StatGrid>

      <Card style={{ gap: Spacing.md }}>
        <SectionTitle
          title="Meta da semana"
          right={
            <ThemedText variant="label" style={{ color: stats.week.met ? colors.success : colors.textSecondary }}>
              {stats.week.met ? 'Meta batida! 🎯' : `${stats.week.count}/${stats.week.goal}`}
            </ThemedText>
          }
        />
        <ProgressBar progress={stats.week.progress} color={habit.color} trackColor={colors.cardAlt} height={12} />
        <BarChart
          color={habit.color}
          height={90}
          data={history.map((w, i) => ({
            key: w.weekStart,
            label: i === history.length - 1 ? 'Atual' : `${Number(w.weekStart.slice(8))}/${Number(w.weekStart.slice(5, 7))}`,
            value: w.progress,
            caption: `${w.count}`,
          }))}
        />
        <ThemedText variant="caption">
          Meta de {habit.weeklyGoal}× por semana · batida em {history.filter((w) => w.met).length} das últimas 8 semanas
        </ThemedText>
      </Card>

      <Card style={{ gap: Spacing.md }}>
        <SectionTitle title="Histórico" />
        <Heatmap
          year={year}
          month={month}
          color={habit.color}
          today={today}
          getLevel={(key) => (habit.completions.includes(key) ? 4 : key < start ? null : 0)}
          onDayPress={toggle}
          onMonthChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
        <ThemedText variant="caption">Toque em um dia para marcar ou desmarcar.</ThemedText>
      </Card>

      <Card style={{ gap: Spacing.md }}>
        <SectionTitle title="Dias da semana" />
        {distribution.map((count, day) => (
          <View key={day} style={styles.weekdayRow}>
            <ThemedText variant="label" style={styles.weekdayLabel}>
              {WEEKDAY_ABBR[day]}
            </ThemedText>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={count / maxWeekday} color={habit.color} trackColor={colors.cardAlt} height={10} />
            </View>
            <ThemedText variant="caption" style={styles.weekdayCount}>
              {count}
            </ThemedText>
          </View>
        ))}
        {stats.bestWeekday !== null && (
          <ThemedText variant="caption">
            Seu melhor dia é {WEEKDAY_LONG[stats.bestWeekday]}.
          </ThemedText>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Editar"
          icon="create-outline"
          variant="secondary"
          color={habit.color}
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/habit/[id]/edit', params: { id: habit.id } })}
        />
        <Button title="Excluir" icon="trash-outline" variant="danger" style={{ flex: 1 }} onPress={onDelete} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emoji: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 32, lineHeight: 40 },
  weekdayRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  weekdayLabel: { width: 34 },
  weekdayCount: { width: 24, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: Spacing.md },
});
