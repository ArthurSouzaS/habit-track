import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  edges?: Edge[];
  /** Elemento fixo (ex.: botão flutuante) sobre o conteúdo. */
  overlay?: ReactNode;
}

export function Screen({ children, edges = ['top'], overlay, contentContainerStyle, ...rest }: ScreenProps) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...rest}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 120 },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.lg },
});
