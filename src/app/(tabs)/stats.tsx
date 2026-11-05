import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BarChart } from '@/components/bar-chart';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ProgressRing } from '@/components/progress-ring';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/section-title';
import { StatGrid, StatTile } from '@/components/stat-tile';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/habits-context';
import { useAppTheme } from '@/context/theme-context';
import { useToday } from '@/hooks/use-today';
import { WEEKDAY_ABBR, weekdayOf } from '@/lib/dates';
import { habitStats, overview, recentActivity, weeklyHistory } from '@/lib/stats';

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function StatsScreen() {
  const { colors } = useAppTheme();
  const { habits } = useHabits();
  const today = useToday();

  if (habits.length === 0) {
    return (
      <Screen>
        <ThemedText variant="display">Estatísticas</ThemedText>
        <EmptyState
          emoji="📊"
          title="Sem dados ainda"
          message="Marque seus hábitos por alguns dias e acompanhe aqui sua evolução, sequências e metas."
        />
      </Screen>
    );
  }

  const summary = overview(habits, today);
  const activity = recentActivity(habits, today, 7);

  return (
    <Screen>
      <ThemedText variant="display">Estatísticas</ThemedText>

      <StatGrid>
        <StatTile index={0} icon="flame" color="#F97316" value={`${summary.bestCurrentStreak}`} label="maior sequência atual (dias)" />
        <StatTile index={1} icon="checkmark-done" color={colors.success} value={`${summary.totalCompletions}`} label="conclusões no total" />
        <StatTile index={2} icon="trending-up" color={colors.primary} value={pct(summary.averageRate30)} label="taxa média (30 dias)" />
        <StatTile index={3} icon="flag" color="#EC4899" value={`${summary.weeklyGoalsMet}/${habits.length}`} label="metas semanais batidas" />
      </StatGrid>

      <Card style={{ gap: Spacing.md }}>
        <SectionTitle title="Últimos 7 dias" />
        <BarChart
          color={colors.primary}
          data={activity.map((d) => ({
            key: d.key,
            label: WEEKDAY_ABBR[weekdayOf(d.key)],
            value: d.ratio,
            caption: `${d.done}`,
          }))}
        />
      </Card>

      <SectionTitle title="Por hábito" />
      {habits.map((habit, i) => {
        const stats = habitStats(habit, today);
        const history = weeklyHistory(habit, today, 8);
        return (
          <Animated.View key={habit.id} entering={FadeInDown.delay(i * 70).duration(400)}>
            <Pressable
              onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
              style={({ pressed }) => pressed && { opacity: 0.85 }}>
              <Card style={styles.habitCard}>
                <View style={styles.habitHeader}>
                  <ProgressRing progress={stats.rate30} size={58} strokeWidth={6} color={habit.color} trackColor={colors.cardAlt}>
                    <ThemedText style={styles.ringEmoji}>{habit.emoji}</ThemedText>
                  </ProgressRing>
                  <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText variant="subtitle" numberOfLines={1}>
                      {habit.name}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {pct(stats.rate30)} nos últimos 30 dias · {stats.totalCompletions} no total
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>

                <View style={styles.metrics}>
                  <Metric label="Sequência" value={`${stats.currentStreak}🔥`} />
                  <Metric label="Recorde" value={`${stats.longestStreak}`} />
                  <Metric label="Semana" value={`${stats.week.count}/${stats.week.goal}`} />
                  <Metric label="Melhor dia" value={stats.bestWeekday === null ? '—' : WEEKDAY_ABBR[stats.bestWeekday]} />
                </View>

                <View style={styles.weeks}>
                  {history.map((w) => (
                    <View
                      key={w.weekStart}
                      style={[
                        styles.weekPill,
                        { backgroundColor: colors.cardAlt },
                      ]}>
                      <View
                        style={[
                          styles.weekFill,
                          { height: `${w.progress * 100}%`, backgroundColor: w.met ? habit.color : `${habit.color}88` },
                        ]}
                      />
                    </View>
                  ))}
                </View>
                <ThemedText variant="caption">Meta semanal nas últimas 8 semanas</ThemedText>
              </Card>
            </Pressable>
          </Animated.View>
        );
      })}
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <ThemedText variant="subtitle">{value}</ThemedText>
      <ThemedText variant="caption">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  habitCard: { gap: Spacing.md },
  habitHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  ringEmoji: { fontSize: 22, lineHeight: 28 },
  metrics: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { alignItems: 'center', flex: 1 },
  weeks: { flexDirection: 'row', gap: 6, height: 36, alignItems: 'flex-end' },
  weekPill: { flex: 1, height: '100%', borderRadius: Radius.sm / 2, overflow: 'hidden', justifyContent: 'flex-end' },
  weekFill: { width: '100%', borderRadius: Radius.sm / 2 },
});
