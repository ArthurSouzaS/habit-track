import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, withAlpha } from '@/constants/theme';
import { useHabits } from '@/context/habits-context';
import { useAppTheme } from '@/context/theme-context';
import { confirm } from '@/lib/confirm';
import { ensurePermission, getPermissionStatus, remindersSupported } from '@/lib/notifications';
import type { ThemePreference } from '@/storage/storage';

const REPO_URL = 'https://github.com/arthursouzas/habit-track';
const WEB_URL = 'https://arthursouzas.github.io/habit-track';

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const { habits, loadSampleData, clearAll, rescheduleReminders } = useHabits();
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  useFocusEffect(
    useCallback(() => {
      getPermissionStatus().then(setPermission).catch(() => {});
    }, []),
  );

  const remindersCount = habits.filter((h) => h.reminder?.enabled).length;

  const requestPermission = async () => {
    const granted = await ensurePermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) await rescheduleReminders();
  };

  const onClear = async () => {
    const ok = await confirm('Apagar todos os dados?', 'Seus hábitos e histórico serão removidos deste aparelho.', 'Apagar');
    if (ok) await clearAll();
  };

  return (
    <Screen>
      <ThemedText variant="display">Ajustes</ThemedText>

      <Group title="Aparência">
        <Card style={styles.section}>
          <Row icon="contrast" color={colors.primary} title="Tema" subtitle="Escolha entre claro, escuro ou seguir o sistema." />
          <SegmentedControl<ThemePreference>
            value={preference}
            onChange={setPreference}
            options={[
              { value: 'system', label: 'Sistema' },
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
            ]}
          />
        </Card>
      </Group>

      <Group title="Lembretes">
        <Card style={styles.section}>
          {remindersSupported ? (
            <>
              <Row
                icon="notifications"
                color="#F59E0B"
                title={permission === 'granted' ? 'Notificações ativadas' : 'Notificações desativadas'}
                subtitle={`${remindersCount} hábito(s) com lembrete configurado.`}
              />
              {permission !== 'granted' && (
                <Button title="Permitir notificações" icon="notifications-outline" variant="secondary" onPress={requestPermission} />
              )}
            </>
          ) : (
            <Row
              icon="phone-portrait"
              color="#F59E0B"
              title="Disponível no celular"
              subtitle="Os lembretes usam notificações locais do iOS e Android. Abra o app no Expo Go para usá-los."
            />
          )}
        </Card>
      </Group>

      <Group title="Dados">
        <Card style={styles.section}>
          <Row
            icon="server"
            color="#06B6D4"
            title="Armazenamento local"
            subtitle="Tudo fica salvo apenas neste aparelho/navegador, com AsyncStorage."
          />
          <Button title="Adicionar hábitos de exemplo" icon="sparkles" variant="secondary" onPress={loadSampleData} />
          <Button title="Apagar todos os dados" icon="trash" variant="danger" onPress={onClear} disabled={habits.length === 0} />
        </Card>
      </Group>

      <Group title="Sobre">
        <Card style={styles.section}>
          <Row
            icon="person"
            color="#EC4899"
            title="Feito por Arthur Souza Soares"
            subtitle={`Habit Track v${Constants.expoConfig?.version ?? '1.0.0'} · React Native + Expo`}
          />
          <LinkRow icon="logo-github" label="Código no GitHub" url={REPO_URL} />
          <LinkRow icon="globe-outline" label="Versão web" url={WEB_URL} />
        </Card>
      </Group>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <ThemedText variant="label" color="textSecondary" style={styles.groupTitle}>
        {title.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];

function Row({ icon, color, title, subtitle }: { icon: IconName; color: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: withAlpha(color, 0.15) }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="subtitle">{title}</ThemedText>
        {subtitle && <ThemedText variant="caption">{subtitle}</ThemedText>}
      </View>
    </View>
  );
}

function LinkRow({ icon, label, url }: { icon: IconName; label: string; url: string }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => WebBrowser.openBrowserAsync(url)}
      accessibilityRole="link"
      style={({ pressed }) => [styles.link, { backgroundColor: colors.cardAlt, opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons name={icon} size={18} color={colors.text} />
      <ThemedText variant="label" style={{ flex: 1 }}>
        {label}
      </ThemedText>
      <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.md },
  groupTitle: { letterSpacing: 1, marginLeft: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.sm,
  },
});
