import { currentStreak, historyStart, isScheduledOn, longestStreak } from '../streak';
import { MON_WED_FRI, makeHabit } from './factories';

describe('isScheduledOn', () => {
  it('hábito diário vale para todos os dias', () => {
    const habit = makeHabit();
    expect(isScheduledOn(habit, '2024-06-02')).toBe(true);
    expect(isScheduledOn(habit, '2024-06-08')).toBe(true);
  });

  it('hábito semanal respeita os dias escolhidos', () => {
    const habit = makeHabit({ frequency: MON_WED_FRI });
    expect(isScheduledOn(habit, '2024-06-03')).toBe(true); // segunda
    expect(isScheduledOn(habit, '2024-06-04')).toBe(false); // terça
    expect(isScheduledOn(habit, '2024-06-07')).toBe(true); // sexta
  });
});

describe('currentStreak', () => {
  it('é zero sem conclusões', () => {
    expect(currentStreak(makeHabit(), '2024-06-10')).toBe(0);
  });

  it('conta dias consecutivos terminando hoje', () => {
    const habit = makeHabit({ completions: ['2024-06-08', '2024-06-09', '2024-06-10'] });
    expect(currentStreak(habit, '2024-06-10')).toBe(3);
  });

  it('não quebra se hoje ainda não foi feito', () => {
    const habit = makeHabit({ completions: ['2024-06-08', '2024-06-09'] });
    expect(currentStreak(habit, '2024-06-10')).toBe(2);
  });

  it('quebra quando um dia programado passou sem conclusão', () => {
    const habit = makeHabit({ completions: ['2024-06-05', '2024-06-06', '2024-06-08'] });
    expect(currentStreak(habit, '2024-06-09')).toBe(1);
    expect(currentStreak(habit, '2024-06-10')).toBe(0);
  });

  it('ignora dias não programados em hábitos semanais', () => {
    // seg 03, qua 05, sex 07, seg 10 — terças, quintas e fim de semana não contam
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: ['2024-06-03', '2024-06-05', '2024-06-07', '2024-06-10'],
    });
    expect(currentStreak(habit, '2024-06-10')).toBe(4);
    expect(currentStreak(habit, '2024-06-11')).toBe(4); // terça: não programado
    expect(currentStreak(habit, '2024-06-12')).toBe(4); // quarta: ainda pode fazer hoje
    expect(currentStreak(habit, '2024-06-13')).toBe(0); // perdeu a quarta
  });

  it('conclusão em dia não programado soma como bônus', () => {
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: ['2024-06-03', '2024-06-04', '2024-06-05'],
    });
    expect(currentStreak(habit, '2024-06-05')).toBe(3);
  });

  it('não conta dias antes do início do histórico', () => {
    const habit = makeHabit({ createdAt: '2024-06-09', completions: ['2024-06-09'] });
    expect(currentStreak(habit, '2024-06-09')).toBe(1);
  });
});

describe('longestStreak', () => {
  it('encontra a maior sequência do histórico', () => {
    const habit = makeHabit({
      completions: [
        '2024-06-01',
        '2024-06-02',
        '2024-06-03',
        '2024-06-04',
        // 05 perdido
        '2024-06-06',
        '2024-06-07',
      ],
    });
    expect(longestStreak(habit, '2024-06-07')).toBe(4);
    expect(currentStreak(habit, '2024-06-07')).toBe(2);
  });

  it('a sequência atual nunca é maior que a maior sequência', () => {
    const habit = makeHabit({
      frequency: MON_WED_FRI,
      completions: ['2024-06-03', '2024-06-05', '2024-06-07', '2024-06-10'],
    });
    expect(longestStreak(habit, '2024-06-11')).toBe(4);
    expect(longestStreak(habit, '2024-06-20')).toBeGreaterThanOrEqual(
      currentStreak(habit, '2024-06-20'),
    );
  });

  it('considera conclusões anteriores à data de criação', () => {
    const habit = makeHabit({
      createdAt: '2024-06-10',
      completions: ['2024-06-08', '2024-06-09', '2024-06-10'],
    });
    expect(historyStart(habit)).toBe('2024-06-08');
    expect(longestStreak(habit, '2024-06-10')).toBe(3);
  });
});
