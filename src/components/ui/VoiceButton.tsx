import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, minTapSize, radius } from '../../constants/theme';

interface VoiceButtonProps {
  isListening: boolean;
  onPress: () => void;
  disabled?: boolean;
  available?: boolean;
}

export function VoiceButton({ isListening, onPress, disabled = false, available = true }: VoiceButtonProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1);
    }
  }, [isListening]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!available) return null;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.button,
          isListening && styles.listening,
          disabled && styles.disabled,
        ]}
        accessibilityLabel={isListening ? 'Stop recording' : 'Start voice answer'}
        accessibilityRole="button"
      >
        <Text style={styles.icon}>{isListening ? '🔴' : '🎤'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  listening: {
    backgroundColor: colors.primary,
  },
  disabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  icon: {
    fontSize: 30,
  },
});
