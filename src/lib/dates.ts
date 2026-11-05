import type { DateKey, Weekday } from '@/types/habit';

const pad = (n: number) => String(n).padStart(2, '0');

/** Converte uma data para a chave local `AAAA-MM-DD` (sem fuso horário). */
export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Converte `AAAA-MM-DD` para um `Date` local ao meio-dia (evita problemas de horário de verão). */
export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
  return next;
}

export function addDaysToKey(key: DateKey, amount: number): DateKey {
  return toDateKey(addDays(fromDateKey(key), amount));
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now);
}

export function weekdayOf(key: DateKey): Weekday {
  return fromDateKey(key).getDay() as Weekday;
}

/** Domingo da semana que contém a data. */
export function startOfWeek(key: DateKey): DateKey {
  return addDaysToKey(key, -weekdayOf(key));
}

/** Todas as chaves entre `from` e `to` (inclusive). */
export function eachDay(from: DateKey, to: DateKey): DateKey[] {
  const days: DateKey[] = [];
  if (from > to) return days;
  let cursor = from;
  while (cursor <= to) {
    days.push(cursor);
    cursor = addDaysToKey(cursor, 1);
  }
  return days;
}

export function diffInDays(from: DateKey, to: DateKey): number {
  const ms = fromDateKey(to).getTime() - fromDateKey(from).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Matriz de semanas (domingo → sábado) de um mês. Dias fora do mês são `null`.
 * `month` vai de 0 (janeiro) a 11 (dezembro).
 */
export function monthMatrix(year: number, month: number): (DateKey | null)[][] {
  const first = new Date(year, month, 1, 12);
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
  const cells: (DateKey | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateKey(new Date(year, month, d, 12)));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (DateKey | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const WEEKDAY_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
export const WEEKDAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const WEEKDAY_LONG = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const;
export const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

/** Ex.: "quinta-feira, 5 de novembro" */
export function formatLongDate(key: DateKey): string {
  const date = fromDateKey(key);
  return `${WEEKDAY_LONG[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatTime(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}
