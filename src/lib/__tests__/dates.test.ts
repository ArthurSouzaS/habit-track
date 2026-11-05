import {
  addDaysToKey,
  diffInDays,
  eachDay,
  formatLongDate,
  formatTime,
  monthMatrix,
  startOfWeek,
  toDateKey,
  weekdayOf,
} from '../dates';

describe('datas', () => {
  it('gera chaves locais AAAA-MM-DD', () => {
    expect(toDateKey(new Date(2024, 0, 5, 23, 59))).toBe('2024-01-05');
  });

  it('soma dias atravessando meses e anos', () => {
    expect(addDaysToKey('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDaysToKey('2024-12-31', 1)).toBe('2025-01-01');
    expect(addDaysToKey('2024-03-01', -1)).toBe('2024-02-29');
  });

  it('calcula dia da semana e início da semana (domingo)', () => {
    expect(weekdayOf('2024-06-02')).toBe(0);
    expect(startOfWeek('2024-06-06')).toBe('2024-06-02');
    expect(startOfWeek('2024-06-02')).toBe('2024-06-02');
  });

  it('lista dias e calcula diferenças', () => {
    expect(eachDay('2024-06-29', '2024-07-02')).toEqual([
      '2024-06-29',
      '2024-06-30',
      '2024-07-01',
      '2024-07-02',
    ]);
    expect(eachDay('2024-06-02', '2024-06-01')).toEqual([]);
    expect(diffInDays('2024-01-01', '2024-03-01')).toBe(60);
  });

  it('monta a matriz do mês com semanas completas', () => {
    const june = monthMatrix(2024, 5);
    expect(june).toHaveLength(6);
    expect(june.every((week) => week.length === 7)).toBe(true);
    expect(june[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(june[0][6]).toBe('2024-06-01');
    expect(june.flat().filter(Boolean)).toHaveLength(30);
  });

  it('formata datas e horários em português', () => {
    expect(formatLongDate('2026-11-05')).toBe('quinta-feira, 5 de novembro');
    expect(formatTime(7, 5)).toBe('07:05');
  });
});
