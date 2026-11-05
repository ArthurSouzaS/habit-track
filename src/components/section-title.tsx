import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.row}>
      <ThemedText variant="subtitle">{title}</ThemedText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -4 },
});
