import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';

import type { Habit } from '@/types/habit';

/** Lembretes são locais e só existem no celular (iOS/Android). */
export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const CHANNEL_ID = 'lembretes';

let configured = false;

export function configureNotifications() {
  if (!remindersSupported || configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de hábitos',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 120, 200],
      lightColor: '#6C5CE7',
    }).catch(() => {});
  }
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (!remindersSupported) return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}

export async function ensurePermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function cancelReminders(ids: string[]): Promise<void> {
  if (!remindersSupported) return;
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
  );
}

/**
 * Agenda os lembretes do hábito e devolve os IDs criados.
 * Hábitos diários usam um gatilho diário; hábitos semanais, um gatilho por dia escolhido.
 */
export async function scheduleReminders(habit: Habit): Promise<string[]> {
  if (!remindersSupported || !habit.reminder?.enabled) return [];
  if (!(await ensurePermission())) return [];

  const { hour, minute } = habit.reminder;
  const content: Notifications.NotificationContentInput = {
    title: `${habit.emoji} ${habit.name}`,
    body: 'Hora de cuidar do seu hábito! Não quebre a sequência. 🔥',
    data: { habitId: habit.id },
    sound: true,
  };
  const channelId = Platform.OS === 'android' ? CHANNEL_ID : undefined;

  if (habit.frequency.type === 'daily') {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId },
    });
    return [id];
  }

  return Promise.all(
    habit.frequency.days.map((day) =>
      Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          // expo-notifications: 1 = domingo … 7 = sábado
          weekday: day + 1,
          hour,
          minute,
          channelId,
        },
      }),
    ),
  );
}

/** Cancela os lembretes antigos e agenda novamente conforme a configuração atual. */
export async function syncReminders(habit: Habit): Promise<string[]> {
  await cancelReminders(habit.reminder?.notificationIds ?? []);
  return scheduleReminders(habit);
}
