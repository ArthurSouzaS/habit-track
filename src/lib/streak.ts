import type { DateKey, Habit } from '@/types/habit';

import { addDaysToKey, weekdayOf } from './dates';

type StreakHabit = Pick<Habit, 'frequency' | 'createdAt' | 'completions'>;

/** O hábito está programado para este dia? */
export function isScheduledOn(habit: Pick<Habit, 'frequency'>, key: DateKey): boolean {
  if (habit.frequency.type === 'daily') return true;
  return habit.frequency.days.includes(weekdayOf(key));
}

/** Primeiro dia relevante para o histórico: criação ou a conclusão mais antiga. */
export function historyStart(habit: StreakHabit): DateKey {
  let start = habit.createdAt;
  for (const key of habit.completions) if (key < start) start = key;
  return start;
}

/**
 * Sequência atual de dias.
 *
 * Regras:
 * - Cada dia programado e concluído soma 1.
 * - Um dia programado e **não** concluído quebra a sequência.
 * - Dias não programados não quebram a sequência (e somam 1 se concluídos como bônus).
 * - Hoje ainda não concluído não quebra: o usuário ainda tem o dia inteiro.
 */
export function currentStreak(habit: StreakHabit, today: DateKey): number {
  const done = new Set(habit.completions);
  const start = historyStart(habit);
  let streak = 0;
  let cursor = today;

  if (!done.has(today)) cursor = addDaysToKey(today, -1);

  while (cursor >= start) {
    if (done.has(cursor)) streak++;
    else if (isScheduledOn(habit, cursor)) break;
    cursor = addDaysToKey(cursor, -1);
  }
  return streak;
}

/** Maior sequência já registrada até `today` (mesmas regras de `currentStreak`). */
export function longestStreak(habit: StreakHabit, today: DateKey): number {
  const done = new Set(habit.completions);
  let best = 0;
  let run = 0;
  let cursor = historyStart(habit);

  while (cursor <= today) {
    if (done.has(cursor)) {
      run++;
      if (run > best) best = run;
    } else if (isScheduledOn(habit, cursor) && cursor !== today) {
      run = 0;
    }
    cursor = addDaysToKey(cursor, 1);
  }
  return best;
}
