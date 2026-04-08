import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radius } from '../../constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

export function ProgressBar({ current, total, color = colors.secondary }: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(total > 0 ? (current / total) * 100 : 0, { duration: 400 });
  }, [current, total]);

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    backgroundColor: '#E8E0D5',
    borderRadius: radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
