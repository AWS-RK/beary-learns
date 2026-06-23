// src/components/journey/UnitCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';
import type { UnitProgress, UnitContent } from '../../types/readingJourney';

const UNIT_COLORS = ['#45B7D1', '#38BDF8', '#34D399', '#F87171', '#FB923C', '#C084FC', '#FBBF24'];
const UNIT_EMOJIS = ['✨', '🐋', '🧜‍♀️', '🌹', '🦋', '🔮', '📖'];

interface Props {
  content: UnitContent;
  progress: UnitProgress;
  isActive: boolean;
  onPress: () => void;
}

export function UnitCard({ content, progress, isActive, onPress }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const color = UNIT_COLORS[(content.unitNumber - 1) % UNIT_COLORS.length];
  const emoji = UNIT_EMOJIS[(content.unitNumber - 1) % UNIT_EMOJIS.length];
  const isComplete = progress.lessonsCompleted >= 6;
  const isLocked = !progress.unlocked;

  const cardStyle = [
    styles.card,
    isActive && { borderColor: color, borderWidth: 3 },
    isComplete && styles.completeCard,
    isLocked && styles.lockedCard,
    isWide && isActive && styles.heroCard,
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={!isLocked ? onPress : undefined}
      accessibilityLabel={`Unit ${content.unitNumber}: ${content.title}`}
      disabled={isLocked}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: isLocked ? '#e2e8f0' : color + '22' }]}>
          <Text style={styles.iconEmoji}>{isLocked ? '🔒' : emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, isLocked && styles.lockedText]}>
            Unit {content.unitNumber}: {content.title}
          </Text>
          <Text style={[styles.pattern, isLocked && styles.lockedText]} numberOfLines={1}>
            {content.pattern}
          </Text>
          {!isLocked && (
            <>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: isComplete ? colors.success : color, width: `${(progress.lessonsCompleted / 8) * 100}%` },
                  ]}
                />
              </View>
              <Text style={[styles.progressLabel, { color: isComplete ? colors.success : color }]}>
                {isComplete ? '⭐ Complete!' : `${progress.lessonsCompleted} / 8 lessons`}
              </Text>
            </>
          )}
          {isLocked && (
            <Text style={styles.lockedHint}>Complete Unit {content.unitNumber - 1} to unlock</Text>
          )}
        </View>
        {isActive && !isLocked && (
          <View style={[styles.goBtn, { backgroundColor: color }]}>
            <Text style={styles.goBtnText}>GO →</Text>
          </View>
        )}
        {isComplete && <Text style={styles.completeEmoji}>⭐</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  heroCard: { padding: spacing.lg },
  completeCard: { borderColor: '#F59E0B', borderWidth: 2.5 },
  lockedCard: { opacity: 0.6, backgroundColor: '#f7f8fa' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  info: { flex: 1 },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.md, color: colors.text },
  pattern: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textLight, marginTop: 2 },
  lockedText: { color: '#a0aec0' },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { fontFamily: fonts.bold, fontSize: 11, marginTop: 3 },
  lockedHint: { fontFamily: fonts.regular, fontSize: 11, color: '#a0aec0', marginTop: 3 },
  goBtn: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexShrink: 0,
  },
  goBtnText: { fontFamily: fonts.extraBold, fontSize: fontSize.sm, color: '#fff' },
  completeEmoji: { fontSize: 28 },
});
