import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing } from '../../constants/theme';

interface StarCounterProps {
  count: number;
}

export function StarCounter({ count }: StarCounterProps) {
  const scale = useSharedValue(1);
  const prevCount = React.useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      scale.value = withSequence(withSpring(1.5), withSpring(1));
    }
    prevCount.current = count;
  }, [count]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Text style={styles.star}>⭐</Text>
      <Text style={styles.count}>{count}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentYellow,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  star: { fontSize: 22 },
  count: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.text },
});
