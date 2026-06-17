import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../src/store/sessionStore';
import { useSpeechOutput } from '../src/hooks/useSpeechOutput';
import { DIFFICULTY_ENCOURAGEMENT } from '../src/constants/mascotPhrases';
import { generateCountingSession } from '../src/engines/countingEngine';
import { generateAdditionSession } from '../src/engines/additionEngine';
import { generateSubtractionSession } from '../src/engines/subtractionEngine';
import { generatePronunciationSession } from '../src/engines/pronunciationEngine';
import { generateReadingSession } from '../src/engines/readingEngine';
import { colors, fonts, fontSize, spacing, radius } from '../src/constants/theme';
import type { Difficulty } from '../src/types/exercises';

const LEVELS: { id: Difficulty; label: string; emoji: string; color: string; desc: string }[] = [
  { id: 'easy', label: 'Easy', emoji: '⭐', color: colors.easy, desc: '5 questions • Lots of help' },
  { id: 'medium', label: 'Medium', emoji: '⭐⭐', color: colors.medium, desc: '7 questions • Some help' },
  { id: 'hard', label: 'Hard', emoji: '⭐⭐⭐', color: colors.hard, desc: '10 questions • Challenge!' },
];

export default function DifficultySelect() {
  const { subject, setDifficulty, setQuestions } = useSessionStore();
  const { speak } = useSpeechOutput();

  const handleSelect = (difficulty: Difficulty) => {
    setDifficulty(difficulty);

    let questions;
    if (subject === 'counting') questions = generateCountingSession(difficulty);
    else if (subject === 'addition') questions = generateAdditionSession(difficulty);
    else if (subject === 'subtraction') questions = generateSubtractionSession(difficulty);
    else if (subject === 'reading') questions = generateReadingSession(difficulty);
    else questions = generatePronunciationSession(difficulty);

    setQuestions(questions as any);
    speak(DIFFICULTY_ENCOURAGEMENT[difficulty], 0.85);
    router.push(`/(sessions)/${subject}`);
  };

  const SUBJECT_LABELS: Record<string, string> = {
    counting: 'Counting 🔢',
    addition: 'Addition ➕',
    subtraction: 'Subtraction ➖',
    pronunciation: 'Pronunciation 🗣️',
    reading: 'Reading 📖',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose your level!</Text>
        <Text style={styles.subject}>{subject ? SUBJECT_LABELS[subject] : ''}</Text>

        <Text style={styles.mascot}>🐻</Text>
        <Text style={styles.mascotLine}>How brave are you feeling today?</Text>

        <View style={styles.cards}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[styles.card, { backgroundColor: level.color }]}
              onPress={() => handleSelect(level.id)}
              accessibilityLabel={`${level.label} difficulty`}
            >
              <Text style={styles.cardEmoji}>{level.emoji}</Text>
              <Text style={styles.cardLabel}>{level.label}</Text>
              <Text style={styles.cardDesc}>{level.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  back: { alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xxl, color: colors.text, textAlign: 'center' },
  subject: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.textLight },
  mascot: { fontSize: 64, marginTop: spacing.md },
  mascotLine: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text, textAlign: 'center' },
  cards: { gap: spacing.md, width: '100%', marginTop: spacing.md },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardEmoji: { fontSize: 28, width: 44 },
  cardLabel: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: '#fff', flex: 1 },
  cardDesc: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: '#ffffffcc' },
});
