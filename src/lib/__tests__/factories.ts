import type { DateKey, Frequency, Habit } from '@/types/habit';

export function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Ler',
    emoji: '📚',
    color: '#6C5CE7',
    frequency: { type: 'daily' } as Frequency,
    weeklyGoal: 7,
    reminder: null,
    createdAt: '2024-06-01',
    completions: [] as DateKey[],
    ...overrides,
  };
}

/** Segunda, quarta e sexta. */
export const MON_WED_FRI: Frequency = { type: 'weekly', days: [1, 3, 5] };
