// app/reading-journey.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReadingJourneyStore } from '../src/store/readingJourneyStore';
import { useProgressStore } from '../src/store/progressStore';
import { useSpeechOutput } from '../src/hooks/useSpeechOutput';
import { UnitCard } from '../src/components/journey/UnitCard';
import { StarCounter } from '../src/components/ui/StarCounter';
import { JOURNEY_UNITS } from '../src/constants/readingJourneyContent';
import { pickRandom } from '../src/constants/mascotPhrases';
import { colors, fonts, fontSize, spacing } from '../src/constants/theme';

const JOURNEY_GREETINGS = [
  'Welcome back, Reading Princess! 👸',
  'Ready to learn new words today? ✨',
  'Your crown grows with every lesson! 👑',
  'Keep going — you are doing amazing! 🦄',
  'Every word makes you stronger! 💎',
];

export default function ReadingJourneyScreen() {
  const { units, getNextLessonIndex } = useReadingJourneyStore();
  const totalStars = useProgressStore((s) => s.totalStars);
  const { speak } = useSpeechOutput();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  useEffect(() => {
    const msg = pickRandom(JOURNEY_GREETINGS);
    const t = setTimeout(() => speak(msg, 0.85), 400);
    return () => clearTimeout(t);
  }, []);

  const handleUnitPress = (unitNumber: number) => {
    const lessonIndex = getNextLessonIndex(unitNumber);
    router.push({ pathname: '/(sessions)/reading-lesson' as any, params: { unitNumber: String(unitNumber), lessonIndex: String(lessonIndex) } });
  };

  const greeting = pickRandom(JOURNEY_GREETINGS);

  const completedUnits = Object.values(units).filter((u) => u.lessonsCompleted >= 6).length;
  const totalUnits = JOURNEY_UNITS.length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reading Journey</Text>
        <StarCounter count={totalStars} />
      </View>

      <View style={styles.mascotRow}>
        <Text style={styles.mascotEmoji}>🐻</Text>
        <View style={styles.mascotBubble}>
          <Text style={styles.mascotText}>{greeting}</Text>
        </View>
      </View>

      <View style={styles.crownRow}>
        <Text style={styles.crownEmoji}>👑</Text>
        <View style={styles.crownInfo}>
          <Text style={styles.crownTitle}>Princess Reading Crown</Text>
          <Text style={styles.crownSub}>{completedUnits} of {totalUnits} units complete</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]} showsVerticalScrollIndicator={false}>
        {isWide ? (
          <>
            {JOURNEY_UNITS.filter((u) => {
              const p = units[u.unitNumber];
              return p?.unlocked && p.lessonsCompleted < 6;
            }).slice(0, 1).map((unit) => (
              <UnitCard
                key={unit.unitNumber}
                content={unit}
                progress={units[unit.unitNumber]}
                isActive={true}
                onPress={() => handleUnitPress(unit.unitNumber)}
              />
            ))}
            <View style={styles.grid}>
              {JOURNEY_UNITS.filter((u) => {
                const p = units[u.unitNumber];
                return !(p?.unlocked && p.lessonsCompleted < 6);
              }).map((unit) => (
                <View key={unit.unitNumber} style={styles.gridItem}>
                  <UnitCard
                    content={unit}
                    progress={units[unit.unitNumber] ?? { unitNumber: unit.unitNumber, unlocked: false, lessonsCompleted: 0, lessonsAttempted: 0, starsEarned: 0, completedAt: null, lessonResults: [] }}
                    isActive={!!(units[unit.unitNumber]?.unlocked)}
                    onPress={() => handleUnitPress(unit.unitNumber)}
                  />
                </View>
              ))}
            </View>
          </>
        ) : (
          JOURNEY_UNITS.map((unit) => (
            <UnitCard
              key={unit.unitNumber}
              content={unit}
              progress={units[unit.unitNumber] ?? { unitNumber: unit.unitNumber, unlocked: false, lessonsCompleted: 0, lessonsAttempted: 0, starsEarned: 0, completedAt: null, lessonResults: [] }}
              isActive={!!(units[unit.unitNumber]?.unlocked)}
              onPress={() => handleUnitPress(unit.unitNumber)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  back: { paddingRight: spacing.sm },
  backText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: colors.reading, flex: 1 },
  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  mascotEmoji: { fontSize: 44 },
  mascotBubble: { flex: 1, backgroundColor: colors.accentYellow, borderRadius: 16, padding: spacing.sm },
  mascotText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text },
  crownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: '#f0e6ff',
    borderRadius: 16,
    padding: spacing.md,
  },
  crownEmoji: { fontSize: 32 },
  crownInfo: { flex: 1 },
  crownTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.md, color: '#553C9A' },
  crownSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: '#7C3AED' },
  scrollView: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 64 },
  scrollWide: { padding: spacing.lg, paddingBottom: 64 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  gridItem: { width: '47%' },
});
