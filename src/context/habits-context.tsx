import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { addDaysToKey, todayKey } from '@/lib/dates';
import { createId } from '@/lib/id';
import { cancelReminders, syncReminders } from '@/lib/notifications';
import { isScheduledOn } from '@/lib/streak';
import { loadHabits, saveHabits } from '@/storage/storage';
import type { DateKey, Habit, HabitInput } from '@/types/habit';

interface HabitsContextValue {
  habits: Habit[];
  loaded: boolean;
  addHabit: (input: HabitInput) => Promise<Habit>;
  updateHabit: (id: string, input: HabitInput) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (id: string, day: DateKey) => boolean;
  loadSampleData: () => void;
  rescheduleReminders: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const habitsRef = useRef<Habit[]>([]);

  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  useEffect(() => {
    loadHabits().then((stored) => {
      setHabits(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveHabits(habits).catch(() => {});
  }, [habits, loaded]);

  const patchReminderIds = useCallback((id: string, ids: string[]) => {
    setHabits((list) =>
      list.map((h) =>
        h.id === id && h.reminder ? { ...h, reminder: { ...h.reminder, notificationIds: ids } } : h,
      ),
    );
  }, []);

  const addHabit = useCallback(
    async (input: HabitInput) => {
      const habit: Habit = {
        ...input,
        reminder: input.reminder ? { ...input.reminder, notificationIds: [] } : null,
        id: createId(),
        createdAt: todayKey(),
        completions: [],
      };
      setHabits((list) => [...list, habit]);
      const ids = await syncReminders(habit).catch(() => []);
      if (ids.length) patchReminderIds(habit.id, ids);
      return habit;
    },
    [patchReminderIds],
  );

  const updateHabit = useCallback(
    async (id: string, input: HabitInput) => {
      const previous = habitsRef.current.find((h) => h.id === id);
      if (!previous) return;
      const next: Habit = {
        ...previous,
        ...input,
        reminder: input.reminder
          ? { ...input.reminder, notificationIds: previous.reminder?.notificationIds ?? [] }
          : null,
      };
      setHabits((list) => list.map((h) => (h.id === id ? next : h)));
      if (!next.reminder) {
        await cancelReminders(previous.reminder?.notificationIds ?? []);
        return;
      }
      const ids = await syncReminders(next).catch(() => []);
      patchReminderIds(id, ids);
    },
    [patchReminderIds],
  );

  const deleteHabit = useCallback(async (id: string) => {
    const habit = habitsRef.current.find((h) => h.id === id);
    setHabits((list) => list.filter((h) => h.id !== id));
    if (habit?.reminder) await cancelReminders(habit.reminder.notificationIds);
  }, []);

  /** Alterna a conclusão e devolve `true` se o dia ficou marcado. */
  const toggleCompletion = useCallback((id: string, day: DateKey) => {
    const habit = habitsRef.current.find((h) => h.id === id);
    const willBeDone = !habit?.completions.includes(day);
    setHabits((list) =>
      list.map((h) => {
        if (h.id !== id) return h;
        const completions = h.completions.includes(day)
          ? h.completions.filter((k) => k !== day)
          : [...h.completions, day].sort();
        return { ...h, completions };
      }),
    );
    return willBeDone;
  }, []);

  const loadSampleData = useCallback(() => {
    setHabits((list) => [...list, ...createSampleHabits(todayKey())]);
  }, []);

  /** Reagenda todos os lembretes (ex.: depois que o usuário concede a permissão). */
  const rescheduleReminders = useCallback(async () => {
    const withReminder = habitsRef.current.filter((h) => h.reminder?.enabled);
    for (const habit of withReminder) {
      const ids = await syncReminders(habit).catch(() => []);
      patchReminderIds(habit.id, ids);
    }
  }, [patchReminderIds]);

  const clearAll = useCallback(async () => {
    const ids = habitsRef.current.flatMap((h) => h.reminder?.notificationIds ?? []);
    setHabits([]);
    await cancelReminders(ids);
  }, []);

  const value = useMemo(
    () => ({
      habits,
      loaded,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      loadSampleData,
      rescheduleReminders,
      clearAll,
    }),
    [
      habits,
      loaded,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      loadSampleData,
      rescheduleReminders,
      clearAll,
    ],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits precisa estar dentro de <HabitsProvider>');
  return ctx;
}

export function useHabit(id: string | undefined): Habit | undefined {
  const { habits } = useHabits();
  return habits.find((h) => h.id === id);
}

/** Hábitos de exemplo com ~10 semanas de histórico, para explorar o app rapidamente. */
function createSampleHabits(today: DateKey): Habit[] {
  const start = addDaysToKey(today, -70);
  // gerador pseudoaleatório determinístico para o histórico parecer natural
  let seed = 42;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const templates: (Omit<Habit, 'id' | 'createdAt' | 'completions'> & { chance: number })[] = [
    {
      name: 'Beber 2L de água',
      emoji: '💧',
      color: '#3B82F6',
      frequency: { type: 'daily' },
      weeklyGoal: 7,
      reminder: null,
      chance: 0.85,
    },
    {
      name: 'Ler 20 páginas',
      emoji: '📚',
      color: '#6C5CE7',
      frequency: { type: 'daily' },
      weeklyGoal: 5,
      reminder: null,
      chance: 0.7,
    },
    {
      name: 'Treinar',
      emoji: '💪',
      color: '#F97316',
      frequency: { type: 'weekly', days: [1, 3, 5] },
      weeklyGoal: 3,
      reminder: null,
      chance: 0.8,
    },
    {
      name: 'Meditar',
      emoji: '🧘',
      color: '#10B981',
      frequency: { type: 'weekly', days: [0, 2, 4, 6] },
      weeklyGoal: 3,
      reminder: null,
      chance: 0.6,
    },
  ];

  return templates.map(({ chance, ...template }, index) => {
    const habit: Habit = {
      ...template,
      id: createId() + index,
      createdAt: start,
      completions: [],
    };
    for (let offset = 0; offset < 70; offset++) {
      const day = addDaysToKey(start, offset);
      // a última semana é mais consistente, para mostrar sequências em andamento
      const boost = offset > 62 ? 0.25 : 0;
      if (isScheduledOn(habit, day) && random() < chance + boost) habit.completions.push(day);
    }
    return habit;
  });
}
