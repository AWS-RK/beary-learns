import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors, fonts, fontSize, radius, spacing } from '../../constants/theme';

type MascotMood = 'happy' | 'thinking' | 'celebrate';

interface MascotSpeechProps {
  message: string;
  mood?: MascotMood;
  animate?: boolean;
}

const MASCOT_EMOJIS: Record<MascotMood, string> = {
  happy: '🐻',
  thinking: '🐻',
  celebrate: '🐻',
};

const MOOD_BACKGROUNDS: Record<MascotMood, string> = {
  happy: colors.accentYellow,
  thinking: '#E8F4FD',
  celebrate: '#FFE0FF',
};

export function MascotSpeech({ message, mood = 'happy', animate = false }: MascotSpeechProps) {
  const bounce = useSharedValue(0);

  React.useEffect(() => {
    if (animate) {
      bounce.value = withRepeat(
        withSequence(withTiming(-8, { duration: 300 }), withTiming(0, { duration: 300 })),
        3,
        false
      );
    }
  }, [animate, message]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mascotContainer, mascotStyle]}>
        <Text style={styles.mascotEmoji}>{MASCOT_EMOJIS[mood]}</Text>
      </Animated.View>
      <View style={[styles.bubble, { backgroundColor: MOOD_BACKGROUNDS[mood] }]}>
        <View style={styles.bubbleTail} />
        <Text style={styles.bubbleText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  mascotContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotEmoji: {
    fontSize: 52,
  },
  bubble: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    position: 'relative',
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleTail: {
    position: 'absolute',
    left: -10,
    bottom: 16,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: colors.accentYellow,
  },
  bubbleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 26,
  },
});
