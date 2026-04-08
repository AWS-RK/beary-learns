import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface StarBurstProps {
  visible: boolean;
  stars: number;
  onDone?: () => void;
}

export function StarBurst({ visible, stars, onDone }: StarBurstProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 0;
      opacity.value = 1;
      scale.value = withSequence(
        withSpring(1.4),
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 300 }, (done) => {
          if (done && onDone) runOnJS(onDone)();
        })
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const starStr = stars === 1 ? '⭐' : stars === 2 ? '⭐⭐' : '🌟⭐🌟';

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Text style={styles.stars}>{starStr}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  } as any,
  stars: {
    fontSize: 56,
  },
});
