import type { DateKey, Frequency, Habit, Weekday } from '@/types/habit';

import { addDaysToKey, eachDay, startOfWeek, weekdayOf } from './dates';
import { currentStreak, historyStart, isScheduledOn, longestStreak } from './streak';

/** Quantos dias por semana uma frequência representa. */
export function daysPerWeek(frequency: Frequency): number {
  return frequency.type === 'daily' ? 7 : frequency.days.length;
}

export function isDoneOn(habit: Pick<Habit, 'completions'>, key: DateKey): boolean {
  return habit.completions.includes(key);
}

/**
 * Taxa de conclusão (0–1) nos dias programados.
 * Considera a janela dos últimos `windowDays` dias (ou todo o histórico se omitido).
 * Hoje só entra na conta se já tiver sido concluído, para não penalizar o dia em andamento.
 */
export function completionRate(habit: Habit, today: DateKey, windowDays?: number): number {
  let from = historyStart(habit);
  if (windowDays !== undefined) {
    const windowStart = addDaysToKey(today, -(windowDays - 1));
    if (windowStart > from) from = windowStart;
  }
  const done = new Set(habit.completions);
  let scheduled = 0;
  let completed = 0;

  for (const key of eachDay(from, today)) {
    if (!isScheduledOn(habit, key)) continue;
    if (key === today && !done.has(key)) continue;
    scheduled++;
    if (done.has(key)) completed++;
  }
  return scheduled === 0 ? 0 : completed / scheduled;
}

export interface WeekProgress {
  weekStart: DateKey;
  count: number;
  goal: number;
  /** 0–1, limitado a 1. */
  progress: number;
  met: boolean;
}

/** Progresso da meta semanal na semana (domingo → sábado) que contém `day`. */
export function weeklyProgress(habit: Habit, day: DateKey): WeekProgress {
  const weekStart = startOfWeek(day);
  const weekEnd = addDaysToKey(weekStart, 6);
  const count = habit.completions.filter((k) => k >= weekStart && k <= weekEnd).length;
  const goal = Math.max(1, habit.weeklyGoal);
  return { weekStart, count, goal, progress: Math.min(1, count / goal), met: count >= goal };
}

/** Histórico das últimas `weeks` semanas (mais antiga primeiro), incluindo a atual. */
export function weeklyHistory(habit: Habit, today: DateKey, weeks = 8): WeekProgress[] {
  const current = startOfWeek(today);
  return Array.from({ length: weeks }, (_, i) =>
    weeklyProgress(habit, addDaysToKey(current, -7 * (weeks - 1 - i))),
  );
}

/** Quantas conclusões em cada dia da semana (índice 0 = domingo). */
export function weekdayDistribution(habit: Pick<Habit, 'completions'>): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const key of habit.completions) counts[weekdayOf(key)]++;
  return counts;
}

export function bestWeekday(habit: Pick<Habit, 'completions'>): Weekday | null {
  const counts = weekdayDistribution(habit);
  const max = Math.max(...counts);
  if (max === 0) return null;
  return counts.indexOf(max) as Weekday;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  rate30: number;
  rateAll: number;
  week: WeekProgress;
  bestWeekday: Weekday | null;
}

export function habitStats(habit: Habit, today: DateKey): HabitStats {
  return {
    currentStreak: currentStreak(habit, today),
    longestStreak: longestStreak(habit, today),
    totalCompletions: habit.completions.length,
    rate30: completionRate(habit, today, 30),
    rateAll: completionRate(habit, today),
    week: weeklyProgress(habit, today),
    bestWeekday: bestWeekday(habit),
  };
}

export interface DayScore {
  scheduled: number;
  done: number;
  /** 0–1 (0 se nada programado). */
  ratio: number;
}

/** Desempenho agregado de vários hábitos num dia (usado no heatmap geral). */
export function dayScore(habits: Habit[], key: DateKey): DayScore {
  let scheduled = 0;
  let done = 0;
  for (const habit of habits) {
    if (key < habit.createdAt && !isDoneOn(habit, key)) continue;
    const isDone = isDoneOn(habit, key);
    if (isScheduledOn(habit, key) || isDone) scheduled++;
    if (isDone) done++;
  }
  return { scheduled, done, ratio: scheduled === 0 ? 0 : done / scheduled };
}

/** Converte uma razão 0–1 em um nível de intensidade do heatmap (0–4). */
export function heatLevel(ratio: number): 0 | 1 | 2 | 3 | 4 {
  if (ratio <= 0) return 0;
  if (ratio < 0.34) return 1;
  if (ratio < 0.67) return 2;
  if (ratio < 1) return 3;
  return 4;
}

export interface Overview {
  todayTotal: number;
  todayDone: number;
  bestCurrentStreak: number;
  totalCompletions: number;
  averageRate30: number;
  weeklyGoalsMet: number;
}

export function overview(habits: Habit[], today: DateKey): Overview {
  const scheduledToday = habits.filter((h) => isScheduledOn(h, today));
  const rates = habits.map((h) => completionRate(h, today, 30));
  return {
    todayTotal: scheduledToday.length,
    todayDone: scheduledToday.filter((h) => isDoneOn(h, today)).length,
    bestCurrentStreak: habits.reduce((max, h) => Math.max(max, currentStreak(h, today)), 0),
    totalCompletions: habits.reduce((sum, h) => sum + h.completions.length, 0),
    averageRate30: rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0,
    weeklyGoalsMet: habits.filter((h) => weeklyProgress(h, today).met).length,
  };
}

/** Últimos `days` dias com o total concluído em cada um (para o gráfico de barras). */
export function recentActivity(habits: Habit[], today: DateKey, days = 7) {
  return eachDay(addDaysToKey(today, -(days - 1)), today).map((key) => ({
    key,
    ...dayScore(habits, key),
  }));
}
