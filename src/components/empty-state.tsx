import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';

import { Card } from './card';
import { ThemedText } from './themed-text';

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  children?: ReactNode;
}

export function EmptyState({ emoji, title, message, children }: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Card style={styles.card}>
        <Animated.View entering={ZoomIn.delay(150).springify()}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </Animated.View>
        <ThemedText variant="title" style={styles.center}>
          {title}
        </ThemedText>
        <ThemedText variant="body" color="textSecondary" style={styles.center}>
          {message}
        </ThemedText>
        {children && <View style={styles.actions}>{children}</View>}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl },
  emoji: { fontSize: 52, lineHeight: 64 },
  center: { textAlign: 'center' },
  actions: { marginTop: Spacing.md, gap: Spacing.sm, alignSelf: 'stretch' },
});
