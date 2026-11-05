/** Dia da semana no padrão do JavaScript: 0 = domingo … 6 = sábado. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Data local no formato `AAAA-MM-DD`. */
export type DateKey = string;

export type Frequency = { type: 'daily' } | { type: 'weekly'; days: Weekday[] };

export interface Reminder {
  enabled: boolean;
  hour: number;
  minute: number;
  /** IDs das notificações agendadas no aparelho (para poder cancelá-las). */
  notificationIds: string[];
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: Frequency;
  /** Quantas vezes por semana o usuário quer cumprir o hábito. */
  weeklyGoal: number;
  reminder: Reminder | null;
  /** Dia em que o hábito foi criado (início das estatísticas). */
  createdAt: DateKey;
  /** Dias em que o hábito foi marcado como feito. */
  completions: DateKey[];
}

export type HabitInput = Omit<Habit, 'id' | 'createdAt' | 'completions'>;
