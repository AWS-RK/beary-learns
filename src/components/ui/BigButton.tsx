import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, fontSize, radius, minTapSize } from '../../constants/theme';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  emoji?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function BigButton({
  label,
  onPress,
  color = colors.primary,
  textColor = '#FFFFFF',
  style,
  textStyle,
  disabled = false,
  emoji,
}: BigButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.94); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.button, { backgroundColor: disabled ? '#ccc' : color }, animStyle, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, { color: textColor }, textStyle]}>{label}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: minTapSize,
    minWidth: minTapSize,
    borderRadius: radius.xl,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 22,
  },
});
