import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';

import { useAppTheme } from '@/context/theme-context';

export function Fab({ onPress, label }: { onPress: () => void; label: string }) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Animated.View entering={ZoomIn.delay(300).springify()} style={styles.wrap}>
      <Pressable
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(0.9))}
        onPressOut={() => scale.set(withSpring(1))}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <Animated.View
          style={[
            styles.fab,
            { backgroundColor: colors.primary },
            Platform.select({
              web: { boxShadow: `0 8px 24px ${colors.primary}66` },
              default: { shadowColor: colors.primary },
            }),
            style,
          ]}>
          <Ionicons name="add" size={30} color="#fff" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 20, bottom: 24 },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
