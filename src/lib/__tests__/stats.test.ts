import {
  bestWeekday,
  completionRate,
  dayScore,
  daysPerWeek,
  habitStats,
  heatLevel,
  overview,
  recentActivity,
  weekdayDistribution,
  weeklyHistory,
  weeklyProgress,
} from '../stats';
import { MON_WED_FRI, makeHabit } from './factories';

describe('daysPerWeek', () => {
  it('calcula dias por semana da frequência', () => {
    expect(daysPerWeek({ type: 'daily' })).toBe(7);
    expect(daysPerWeek(MON_WED_FRI)).toBe(3);
  });
});

describe('completionRate', () => {
  it('é 0 sem dias programados', () => {
    const habit = makeHabit({ createdAt: '2024-06-10' });
    expect(completionRate(habit, '2024-06-10')).toBe(0);
  });

  it('divide concluídos por programados, sem penalizar hoje', () => {
    // criado em 01/06, hoje 04/06 (não feito): programados 01, 02, 03 → 2 feitos
    const habit = makeHabit({ completions: ['2024-06-01', '2024-06-03'] });
    expect(completionRate(habit, '2024-06-04')).toBeCloseTo(2 / 3);
  });

  it('conta hoje quando já concluído', () => {
    const habit = makeHabit({ completions: ['2024-06-01', '2024-06-03', '2024-06-04'] });
    expect(completionRate(habit, '2024-06-04')).toBeCloseTo(3 / 4);
  });

  it('usa só os dias programados de hábitos semanais', () => {
    // de 01/06 a 08/06: seg 03, qua 05, sex 07 programados
    const habit = makeHabit({ frequency: MON_WED_FRI, completions: ['2024-06-03', '2024-06-07'] });
    expect(completionRate(habit, '2024-06-08')).toBeCloseTo(2 / 3);
  });

  it('respeita a janela de dias', () => {
    const habit = makeHabit({ completions: ['2024-06-09', '2024-06-10'] });
    expect(completionRate(habit, '2024-06-10', 2)).toBe(1);
    expect(completionRate(habit, '2024-06-10', 4)).toBe(0.5);
  });

  it('nunca passa de 100%', () => {
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: ['2024-06-03', '2024-06-04', '2024-06-05'],
    });
    expect(completionRate(habit, '2024-06-05')).toBeLessThanOrEqual(1);
  });
});

describe('metas semanais', () => {
  it('calcula o progresso da semana atual', () => {
    const habit = makeHabit({
      weeklyGoal: 3,
      completions: ['2024-06-01', '2024-06-02', '2024-06-04'], // 01 é da semana anterior
    });
    const week = weeklyProgress(habit, '2024-06-06');
    expect(week).toEqual({
      weekStart: '2024-06-02',
      count: 2,
      goal: 3,
      progress: 2 / 3,
      met: false,
    });
  });

  it('marca a meta como cumprida e limita o progresso a 100%', () => {
    const habit = makeHabit({
      weeklyGoal: 2,
      completions: ['2024-06-02', '2024-06-03', '2024-06-04'],
    });
    const week = weeklyProgress(habit, '2024-06-08');
    expect(week.met).toBe(true);
    expect(week.progress).toBe(1);
  });

  it('gera o histórico das últimas semanas em ordem cronológica', () => {
    const habit = makeHabit({ weeklyGoal: 1, completions: ['2024-06-03', '2024-06-17'] });
    const history = weeklyHistory(habit, '2024-06-20', 3);
    expect(history.map((w) => w.weekStart)).toEqual(['2024-06-02', '2024-06-09', '2024-06-16']);
    expect(history.map((w) => w.met)).toEqual([true, false, true]);
  });
});

describe('distribuição por dia da semana', () => {
  it('conta conclusões por dia e acha o melhor', () => {
    const habit = makeHabit({ completions: ['2024-06-03', '2024-06-10', '2024-06-05'] });
    expect(weekdayDistribution(habit)).toEqual([0, 2, 0, 1, 0, 0, 0]);
    expect(bestWeekday(habit)).toBe(1);
    expect(bestWeekday(makeHabit())).toBeNull();
  });
});

describe('habitStats', () => {
  it('reúne as estatísticas do hábito', () => {
    const habit = makeHabit({
      weeklyGoal: 5,
      completions: ['2024-06-08', '2024-06-09', '2024-06-10'],
    });
    const stats = habitStats(habit, '2024-06-10');
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalCompletions).toBe(3);
    expect(stats.week.count).toBe(2);
    expect(stats.rate30).toBeCloseTo(3 / 10);
  });
});

describe('heatmap e visão geral', () => {
  const daily = makeHabit({ id: 'a', completions: ['2024-06-03', '2024-06-04'] });
  const weekly = makeHabit({ id: 'b', frequency: MON_WED_FRI, completions: ['2024-06-03'] });

  it('agrega o desempenho do dia', () => {
    expect(dayScore([daily, weekly], '2024-06-03')).toEqual({ scheduled: 2, done: 2, ratio: 1 });
    expect(dayScore([daily, weekly], '2024-06-05')).toEqual({ scheduled: 2, done: 0, ratio: 0 });
    expect(dayScore([daily, weekly], '2024-06-04')).toEqual({ scheduled: 1, done: 1, ratio: 1 });
  });

  it('ignora hábitos que ainda não existiam', () => {
    const late = makeHabit({ id: 'c', createdAt: '2024-06-10' });
    expect(dayScore([late], '2024-06-03').scheduled).toBe(0);
  });

  it('converte razão em nível de intensidade', () => {
    expect([0, 0.2, 0.5, 0.8, 1].map(heatLevel)).toEqual([0, 1, 2, 3, 4]);
  });

  it('resume o dia e a semana', () => {
    const result = overview([daily, weekly], '2024-06-04');
    expect(result.todayTotal).toBe(1); // terça: só o diário
    expect(result.todayDone).toBe(1);
    expect(result.bestCurrentStreak).toBe(2);
    expect(result.totalCompletions).toBe(3);
  });

  it('lista a atividade recente', () => {
    const activity = recentActivity([daily], '2024-06-04', 3);
    expect(activity.map((d) => [d.key, d.done])).toEqual([
      ['2024-06-02', 0],
      ['2024-06-03', 1],
      ['2024-06-04', 1],
    ]);
  });
});
