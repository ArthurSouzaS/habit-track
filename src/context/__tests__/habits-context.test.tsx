import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { HabitsProvider, useHabits } from '@/context/habits-context';
import { addDaysToKey, todayKey } from '@/lib/dates';
import { habitStats } from '@/lib/stats';
import { currentStreak } from '@/lib/streak';

const wrapper = ({ children }: { children: ReactNode }) => <HabitsProvider>{children}</HabitsProvider>;

async function setup() {
  const hook = await renderHook(() => useHabits(), { wrapper });
  await waitFor(() => expect(hook.result.current.loaded).toBe(true));
  return hook;
}

describe('HabitsProvider', () => {
  it('cria um hábito e atualiza a sequência ao marcar os dias', async () => {
    const { result } = await setup();
    const today = todayKey();

    await act(async () => {
      await result.current.addHabit({
        name: 'Beber água',
        emoji: '💧',
        color: '#3B82F6',
        frequency: { type: 'daily' },
        weeklyGoal: 7,
        reminder: null,
      });
    });

    const id = result.current.habits[0].id;
    expect(result.current.habits).toHaveLength(1);
    expect(currentStreak(result.current.habits[0], today)).toBe(0);

    await act(() => {
      result.current.toggleCompletion(id, addDaysToKey(today, -1));
      result.current.toggleCompletion(id, today);
    });

    const habit = result.current.habits[0];
    expect(habit.completions).toEqual([addDaysToKey(today, -1), today]);
    expect(currentStreak(habit, today)).toBe(2);
    expect(habitStats(habit, today).totalCompletions).toBe(2);

    await act(() => {
      result.current.toggleCompletion(id, today);
    });
    expect(result.current.habits[0].completions).toEqual([addDaysToKey(today, -1)]);
    expect(currentStreak(result.current.habits[0], today)).toBe(1);
  });

  it('carrega exemplos com histórico e consegue apagar tudo', async () => {
    const { result } = await setup();

    await act(() => result.current.loadSampleData());
    expect(result.current.habits.length).toBeGreaterThan(0);
    expect(result.current.habits.every((h) => h.completions.length > 0)).toBe(true);

    await act(async () => {
      await result.current.clearAll();
    });
    expect(result.current.habits).toHaveLength(0);
  });
});
