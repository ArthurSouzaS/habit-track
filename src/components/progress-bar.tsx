import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
  color: string;
  trackColor: string;
  height?: number;
}

export function ProgressBar({ progress, color, trackColor, height = 8 }: ProgressBarProps) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.set(
      withTiming(Math.max(0, Math.min(1, progress)), {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [progress, value]);

  const fill = useAnimatedStyle(() => ({ width: `${value.get() * 100}%` }));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: height }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
