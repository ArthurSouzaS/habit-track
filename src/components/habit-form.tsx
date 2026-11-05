import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { HABIT_COLORS, HABIT_EMOJIS, Radius, Spacing, withAlpha } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { formatTime } from '@/lib/dates';
import { remindersSupported } from '@/lib/notifications';
import { daysPerWeek } from '@/lib/stats';
import type { Frequency, HabitInput, Weekday } from '@/types/habit';

import { Button } from './button';
import { Card } from './card';
import { SegmentedControl } from './segmented-control';
import { ThemedText } from './themed-text';
import { WeekdayPicker } from './weekday-picker';

interface HabitFormProps {
  initial?: HabitInput;
  submitLabel: string;
  onSubmit: (input: HabitInput) => void;
}

const TIME_PRESETS: [number, number][] = [
  [7, 0],
  [12, 0],
  [18, 30],
  [21, 0],
];

export function HabitForm({ initial, submitLabel, onSubmit }: HabitFormProps) {
  const { colors } = useAppTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? HABIT_EMOJIS[0]);
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const [frequencyType, setFrequencyType] = useState<Frequency['type']>(initial?.frequency.type ?? 'daily');
  const [days, setDays] = useState<Weekday[]>(
    initial?.frequency.type === 'weekly' ? initial.frequency.days : [1, 3, 5],
  );
  const [weeklyGoal, setWeeklyGoal] = useState(initial?.weeklyGoal ?? 7);
  const [reminderOn, setReminderOn] = useState(initial?.reminder?.enabled ?? false);
  const [hour, setHour] = useState(initial?.reminder?.hour ?? 8);
  const [minute, setMinute] = useState(initial?.reminder?.minute ?? 0);
  const [touched, setTouched] = useState(false);

  const frequency: Frequency = frequencyType === 'daily' ? { type: 'daily' } : { type: 'weekly', days };
  const maxGoal = 7;
  const nameError = touched && name.trim().length === 0;
  const daysError = frequencyType === 'weekly' && days.length === 0;

  const changeFrequency = (type: Frequency['type']) => {
    setFrequencyType(type);
    const next = type === 'daily' ? 7 : days.length || 1;
    setWeeklyGoal(next);
  };

  const changeDays = (next: Weekday[]) => {
    setDays(next);
    if (next.length > 0) setWeeklyGoal(next.length);
  };

  const submit = () => {
    setTouched(true);
    if (name.trim().length === 0 || daysError) return;
    onSubmit({
      name: name.trim(),
      emoji,
      color,
      frequency,
      weeklyGoal: Math.max(1, Math.min(maxGoal, weeklyGoal)),
      reminder: reminderOn ? { enabled: true, hour, minute, notificationIds: [] } : null,
    });
  };

  return (
    <View style={styles.form}>
      {/* Pré-visualização */}
      <Animated.View layout={LinearTransition} style={styles.preview}>
        <View style={[styles.previewEmoji, { backgroundColor: withAlpha(color, 0.18), borderColor: color }]}>
          <ThemedText style={styles.previewEmojiText}>{emoji}</ThemedText>
        </View>
        <ThemedText variant="title" numberOfLines={1}>
          {name.trim() || 'Novo hábito'}
        </ThemedText>
      </Animated.View>

      <Card style={styles.section}>
        <ThemedText variant="label">Nome</ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={() => setTouched(true)}
          placeholder="Ex.: Beber água, Ler, Meditar…"
          placeholderTextColor={colors.textSecondary}
          maxLength={40}
          returnKeyType="done"
          accessibilityLabel="Nome do hábito"
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.cardAlt,
              borderColor: nameError ? colors.danger : 'transparent',
            },
          ]}
        />
        {nameError && (
          <ThemedText variant="caption" color="danger">
            Dê um nome ao seu hábito.
          </ThemedText>
        )}
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="label">Ícone</ThemedText>
        <View style={styles.emojiGrid}>
          {HABIT_EMOJIS.map((item) => {
            const active = item === emoji;
            return (
              <Pressable
                key={item}
                onPress={() => setEmoji(item)}
                accessibilityLabel={`Ícone ${item}`}
                accessibilityState={{ selected: active }}
                style={[
                  styles.emojiOption,
                  {
                    backgroundColor: active ? withAlpha(color, 0.2) : colors.cardAlt,
                    borderColor: active ? color : 'transparent',
                  },
                ]}>
                <ThemedText style={styles.emojiOptionText}>{item}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText variant="label" style={{ marginTop: Spacing.sm }}>
          Cor
        </ThemedText>
        <View style={styles.colorRow}>
          {HABIT_COLORS.map((item) => {
            const active = item === color;
            return (
              <Pressable
                key={item}
                onPress={() => setColor(item)}
                accessibilityLabel={`Cor ${item}`}
                accessibilityState={{ selected: active }}
                style={[styles.colorOption, { backgroundColor: item, borderColor: active ? colors.text : 'transparent' }]}>
                {active && <Ionicons name="checkmark" size={16} color="#fff" />}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="label">Frequência</ThemedText>
        <SegmentedControl
          value={frequencyType}
          onChange={changeFrequency}
          options={[
            { value: 'daily', label: 'Todos os dias' },
            { value: 'weekly', label: 'Dias da semana' },
          ]}
        />
        {frequencyType === 'weekly' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={{ gap: Spacing.sm }}>
            <WeekdayPicker value={days} onChange={changeDays} color={color} />
            {daysError && (
              <ThemedText variant="caption" color="danger">
                Escolha pelo menos um dia.
              </ThemedText>
            )}
          </Animated.View>
        )}

        <View style={styles.goalRow}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="label">Meta semanal</ThemedText>
            <ThemedText variant="caption">
              {weeklyGoal}× por semana · {daysPerWeek(frequency)} dia(s) programado(s)
            </ThemedText>
          </View>
          <Stepper
            value={weeklyGoal}
            onChange={(v) => setWeeklyGoal(Math.max(1, Math.min(maxGoal, v)))}
            label="meta semanal"
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.goalRow}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="label">Lembrete</ThemedText>
            <ThemedText variant="caption">
              {remindersSupported
                ? 'Notificação local nos dias programados.'
                : 'Os lembretes funcionam no app para celular (Expo Go).'}
            </ThemedText>
          </View>
          <Switch
            value={reminderOn}
            onValueChange={setReminderOn}
            trackColor={{ true: color, false: colors.border }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
            accessibilityLabel="Ativar lembrete"
          />
        </View>

        {reminderOn && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={{ gap: Spacing.md }}>
            <View style={styles.timeRow}>
              <Stepper value={hour} onChange={(v) => setHour((v + 24) % 24)} label="hora" format={(v) => String(v).padStart(2, '0')} />
              <ThemedText variant="display">:</ThemedText>
              <Stepper
                value={minute}
                onChange={(v) => setMinute((v + 60) % 60)}
                step={5}
                label="minuto"
                format={(v) => String(v).padStart(2, '0')}
              />
            </View>
            <View style={styles.presets}>
              {TIME_PRESETS.map(([h, m]) => {
                const active = h === hour && m === minute;
                return (
                  <Pressable
                    key={`${h}:${m}`}
                    onPress={() => {
                      setHour(h);
                      setMinute(m);
                    }}
                    style={[styles.preset, { backgroundColor: active ? color : colors.cardAlt }]}>
                    <ThemedText variant="label" style={{ color: active ? '#fff' : colors.textSecondary }}>
                      {formatTime(h, m)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}
      </Card>

      <Button title={submitLabel} icon="checkmark-circle" color={color} onPress={submit} />
    </View>
  );
}

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
  format?: (value: number) => string;
}

function Stepper({ value, onChange, step = 1, label, format = String }: StepperProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.stepper, { backgroundColor: colors.cardAlt }]}>
      <Pressable
        onPress={() => onChange(value - step)}
        hitSlop={6}
        accessibilityLabel={`Diminuir ${label}`}
        style={styles.stepperButton}>
        <Ionicons name="remove" size={18} color={colors.text} />
      </Pressable>
      <ThemedText variant="subtitle" style={styles.stepperValue}>
        {format(value)}
      </ThemedText>
      <Pressable
        onPress={() => onChange(value + step)}
        hitSlop={6}
        accessibilityLabel={`Aumentar ${label}`}
        style={styles.stepperButton}>
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.lg },
  preview: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  previewEmoji: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmojiText: { fontSize: 38, lineHeight: 46 },
  section: { gap: Spacing.md },
  input: {
    fontSize: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionText: { fontSize: 22, lineHeight: 28 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  colorOption: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  preset: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.pill },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.pill, padding: 4 },
  stepperButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepperValue: { minWidth: 32, textAlign: 'center' },
});
