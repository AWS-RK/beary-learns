// src/components/journey/RoyalBadgeUnlock.tsx
import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { fonts, fontSize, spacing, radius } from '../../constants/theme';
import { ROYAL_BADGES } from '../../constants/royalBadges';

interface Props {
  badgeId: string | null;
  onClose: () => void;
}

export function RoyalBadgeUnlock({ badgeId, onClose }: Props) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-15);

  useEffect(() => {
    if (badgeId) {
      scale.value = 0;
      scale.value = withSequence(withSpring(1.25), withSpring(1));
      rotate.value = withSequence(withTiming(-15), withSpring(0));
    }
  }, [badgeId]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const badge = badgeId ? ROYAL_BADGES[badgeId] : null;
  if (!badge) return null;

  return (
    <Modal transparent animationType="fade" visible={!!badgeId}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, animStyle]}>
          <Text style={styles.sparkleRow}>✨ 👑 ✨</Text>
          <View style={[styles.emojiCircle, { backgroundColor: badge.color + '33' }]}>
            <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
          </View>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.message}>{badge.message}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: badge.color }]}
            onPress={onClose}
          >
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff0fb',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '82%',
    borderWidth: 3,
    borderColor: '#A78BFA',
    shadowColor: '#A78BFA',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkleRow: { fontSize: 22, letterSpacing: 6 },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 56 },
  badgeName: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: '#2D3748', textAlign: 'center' },
  message: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: '#553C9A',
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  buttonText: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: '#fff' },
});
