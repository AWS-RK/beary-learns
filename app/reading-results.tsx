// app/reading-results.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReadingJourneyStore } from '../src/store/readingJourneyStore';
import { useSpeechOutput } from '../src/hooks/useSpeechOutput';
import { useSoundEffects } from '../src/hooks/useSoundEffects';
import { Confetti } from '../src/components/rewards/Confetti';
import { RoyalBadgeUnlock } from '../src/components/journey/RoyalBadgeUnlock';
import { colors, fonts, fontSize, spacing, radius } from '../src/constants/theme';
import type { LessonResult } from '../src/types/readingJourney';

export default function ReadingResultsScreen() {
  const { unitNumber: uParam, lessonIndex: lParam, starsEarned: sParam, wordCorrectCount: wParam } =
    useLocalSearchParams<{ unitNumber: string; lessonIndex: string; starsEarned: string; wordCorrectCount: string }>();

  const unitNumber = Number(uParam ?? '1');
  const lessonIndex = Number(lParam ?? '0');
  const starsEarned = Number(sParam ?? '0');
  const wordCorrectCount = Number(wParam ?? '0');

  const { recordLessonResult, getNextLessonIndex } = useReadingJourneyStore();
  const { speak } = useSpeechOutput();
  const { play } = useSoundEffects();

  const [showConfetti, setShowConfetti] = useState(false);
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);

  const isPerfect = starsEarned === 15;
  const isGood = starsEarned >= 10;

  useEffect(() => {
    if (recorded) return;
    setRecorded(true);

    const result: LessonResult = {
      lessonIndex,
      passed: true,
      starsEarned,
      correctAnswers: 5,
      attemptedAt: new Date().toISOString(),
    };

    const newBadges = recordLessonResult(unitNumber, result, wordCorrectCount);

    if (isPerfect) {
      setShowConfetti(true);
      play('celebrate');
      speak('You did it! A perfect score! You are a true Reading Princess! ✨', 0.9);
    } else if (isGood) {
      play('correct');
      speak('Wonderful job! You completed the lesson! Keep going! 🌟', 0.9);
    } else {
      speak('Great effort! Every lesson makes you stronger! 💪', 0.9);
    }

    if (newBadges.length > 0) {
      play('badge');
      setBadgeQueue(newBadges);
      setCurrentBadge(newBadges[0]);
    }
  }, []);

  const handleBadgeClose = () => {
    const remaining = badgeQueue.slice(1);
    setBadgeQueue(remaining);
    setCurrentBadge(remaining[0] ?? null);
  };

  const handleNextLesson = () => {
    const nextIdx = getNextLessonIndex(unitNumber);
    router.replace({
      pathname: '/(sessions)/reading-lesson',
      params: { unitNumber: String(unitNumber), lessonIndex: String(nextIdx) },
    });
  };

  const maxStarsPerQ = 3;
  const numQuestions = 5;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.resultCard}>
          <Text style={styles.mascot}>🐻</Text>
          <Text style={styles.resultTitle}>
            {isPerfect ? 'You did it! 👸✨' : isGood ? 'Great job! 🌟' : 'So close! Keep going! 💪'}
          </Text>
          <Text style={styles.starRow}>
            {'⭐'.repeat(Math.min(Math.floor(starsEarned / maxStarsPerQ), numQuestions))}
          </Text>
          <View style={styles.starsBox}>
            <Text style={styles.starsNum}>{starsEarned}</Text>
            <Text style={styles.starsLabel}>stars earned</Text>
          </View>
          <Text style={styles.maxStars}>out of {numQuestions * maxStarsPerQ}</Text>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNextLesson}>
          <Text style={styles.nextBtnText}>Next Lesson →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapBtn} onPress={() => router.replace('/reading-journey')}>
          <Text style={styles.mapBtnText}>Back to Journey Map</Text>
        </TouchableOpacity>
      </ScrollView>

      <Confetti visible={showConfetti} onDone={() => setShowConfetti(false)} />
      <RoyalBadgeUnlock badgeId={currentBadge} onClose={handleBadgeClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, alignItems: 'center' },
  resultCard: {
    backgroundColor: '#fff0fb',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 3,
    borderColor: '#A78BFA',
    gap: spacing.sm,
  },
  mascot: { fontSize: 56 },
  resultTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: '#553C9A', textAlign: 'center' },
  starRow: { fontSize: 28, letterSpacing: 4 },
  starsBox: { alignItems: 'center' },
  starsNum: { fontFamily: fonts.extraBold, fontSize: 64, color: '#F59E0B' },
  starsLabel: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  maxStars: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textLight },
  nextBtn: {
    backgroundColor: colors.reading,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.reading,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: '#fff' },
  mapBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.reading,
  },
  mapBtnText: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.reading },
});
