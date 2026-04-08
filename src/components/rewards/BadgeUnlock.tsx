import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, fontSize, radius, spacing } from '../../constants/theme';
import { BADGES } from '../../constants/badges';

interface BadgeUnlockProps {
  badgeId: string | null;
  onClose: () => void;
}

export function BadgeUnlock({ badgeId, onClose }: BadgeUnlockProps) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-10);

  useEffect(() => {
    if (badgeId) {
      scale.value = 0;
      scale.value = withSequence(withSpring(1.2), withSpring(1));
      rotate.value = withSequence(withTiming(-10), withSpring(0));
    }
  }, [badgeId]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const badge = badgeId ? BADGES[badgeId] : null;
  if (!badge) return null;

  return (
    <Modal transparent animationType="fade" visible={!!badgeId}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { borderColor: badge.color }, animStyle]}>
          <Text style={styles.title}>Badge Unlocked!</Text>
          <View style={[styles.emojiCircle, { backgroundColor: badge.color + '33' }]}>
            <Text style={styles.emoji}>{badge.emoji}</Text>
          </View>
          <Text style={styles.name}>{badge.name}</Text>
          <Text style={styles.desc}>{badge.description}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: badge.color }]} onPress={onClose}>
            <Text style={styles.buttonText}>Yay! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '80%',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: colors.text },
  emojiCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 52 },
  name: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.text },
  desc: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.textLight, textAlign: 'center' },
  button: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  buttonText: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: '#fff' },
});
