import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgressStore } from '../src/store/progressStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { BADGES, BADGE_IDS } from '../src/constants/badges';
import { ProgressBar } from '../src/components/ui/ProgressBar';
import { colors, fonts, fontSize, spacing, radius } from '../src/constants/theme';

const SUBJECT_INFO = [
  { id: 'counting', label: 'Counting', emoji: '🔢', color: colors.counting },
  { id: 'addition', label: 'Addition', emoji: '➕', color: colors.addition },
  { id: 'subtraction', label: 'Subtraction', emoji: '➖', color: colors.subtraction },
  { id: 'pronunciation', label: 'Pronunciation', emoji: '🗣️', color: colors.pronunciation },
] as const;

export default function Profile() {
  const { totalStars, badgesEarned, subjects } = useProgressStore();
  const childName = useSettingsStore((s) => s.childName);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.mascot}>🐻</Text>
        <Text style={styles.name}>{childName ? `${childName}'s Profile` : 'My Profile'}</Text>
        <View style={styles.starsRow}>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsCount}>{totalStars} Total Stars</Text>
        </View>

        {/* Subject Progress */}
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.subjectsCard}>
          {SUBJECT_INFO.map((s) => {
            const sub = subjects[s.id];
            const pct = sub.totalAnswers > 0 ? sub.correctAnswers / sub.totalAnswers : 0;
            return (
              <View key={s.id} style={styles.subjectRow}>
                <Text style={styles.subjectEmoji}>{s.emoji}</Text>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectLabel}>{s.label}</Text>
                  <ProgressBar current={Math.round(pct * 100)} total={100} color={s.color} />
                  <Text style={styles.subjectStat}>
                    {sub.correctAnswers}/{sub.totalAnswers} correct • {sub.sessionsCompleted} sessions
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>
          Badges ({badgesEarned.length}/{BADGE_IDS.length})
        </Text>
        <View style={styles.badgesGrid}>
          {BADGE_IDS.map((id) => {
            const badge = BADGES[id];
            const earned = badgesEarned.includes(id);
            return (
              <View
                key={id}
                style={[
                  styles.badgeCard,
                  earned ? { backgroundColor: badge.color + '22', borderColor: badge.color } : styles.lockedBadge,
                ]}
              >
                <Text style={[styles.badgeEmoji, !earned && styles.lockedEmoji]}>
                  {earned ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !earned && styles.lockedText]}>{badge.name}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  back: { alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  mascot: { fontSize: 72, textAlign: 'center' },
  name: { fontFamily: fonts.extraBold, fontSize: fontSize.xxl, color: colors.text, textAlign: 'center' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'center' },
  starsEmoji: { fontSize: 28 },
  starsCount: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.text },
  subjectsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  subjectEmoji: { fontSize: 32, width: 44 },
  subjectInfo: { flex: 1, gap: 6 },
  subjectLabel: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  subjectStat: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textLight },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeCard: {
    width: '30%',
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
  },
  lockedBadge: { backgroundColor: '#f0f0f0', borderColor: '#ddd' },
  badgeEmoji: { fontSize: 28 },
  lockedEmoji: { opacity: 0.4 },
  badgeName: { fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.text, textAlign: 'center' },
  lockedText: { color: colors.textLight },
});
