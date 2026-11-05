import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { withAlpha } from '@/constants/theme';

interface CheckButtonProps {
  done: boolean;
  color: string;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function CheckButton({
  done,
  color,
  onPress,
  size = 44,
  disabled,
  accessibilityLabel,
}: CheckButtonProps) {
  const progress = useSharedValue(done ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.set(withTiming(done ? 1 : 0, { duration: 220 }));
    if (done) scale.set(withSequence(withSpring(1.18, { damping: 6 }), withSpring(1)));
  }, [done, progress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [withAlpha(color, 0.12), color]),
    borderColor: interpolateColor(progress.get(), [0, 1], [withAlpha(color, 0.45), color]),
    transform: [{ scale: scale.get() }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.5 + progress.get() * 0.5 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done, disabled }}
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => scale.set(withSpring(0.9))}
      onPressOut={() => scale.set(withSpring(1))}>
      <Animated.View
        style={[
          styles.button,
          { width: size, height: size, borderRadius: size / 2, opacity: disabled ? 0.4 : 1 },
          animatedStyle,
        ]}>
        <Animated.View style={iconStyle}>
          <Ionicons name="checkmark" size={size * 0.55} color="#fff" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});
