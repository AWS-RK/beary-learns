// src/components/exercises/ReadAloudExercise.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, fonts, fontSize, spacing, radius, minTapSize } from '../../constants/theme';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { scorePronunciation } from '../../engines/pronunciationEngine';
import type { ReadAloudQuestion } from '../../types/readingJourney';

interface Props {
  question: ReadAloudQuestion;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  onHearAgain: () => void;
}

export function ReadAloudExercise({ question, disabled, onAnswer, onHearAgain }: Props) {
  const { isListening, transcript, startListening, stopListening, reset } = useSpeechInput();

  useEffect(() => {
    reset();
  }, [question.word]);

  useEffect(() => {
    if (transcript && !disabled) {
      const correct = scorePronunciation(transcript, question.word, question.matchThreshold);
      onAnswer(correct);
      reset();
    }
  }, [transcript]);

  return (
    <View style={styles.container}>
      <View style={styles.promptCard}>
        {question.showPictureHint && <Text style={styles.emoji}>{question.emoji}</Text>}
        <Text style={styles.word}>{question.word}</Text>
      </View>
      <TouchableOpacity style={styles.hearBtn} onPress={onHearAgain}>
        <Text style={styles.hearText}>🔊 Hear it again</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.micBtn, isListening && styles.micBtnActive, disabled && styles.disabled]}
        onPress={isListening ? stopListening : startListening}
        disabled={disabled}
        accessibilityLabel={isListening ? 'Stop recording' : 'Tap to read the word'}
      >
        {isListening ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.micEmoji}>🎤</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.micLabel}>
        {isListening ? 'Listening… say the word!' : 'Tap the mic and read the word'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, alignItems: 'center' },
  promptCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 3,
    borderColor: colors.reading,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emoji: { fontSize: 72, marginBottom: spacing.sm },
  word: {
    fontFamily: fonts.extraBold,
    fontSize: 48,
    color: colors.reading,
    textAlign: 'center',
    letterSpacing: 2,
  },
  hearBtn: {
    backgroundColor: colors.accentYellow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: minTapSize,
    justifyContent: 'center',
  },
  hearText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  micBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  micBtnActive: { backgroundColor: '#E53E3E', shadowColor: '#E53E3E' },
  disabled: { opacity: 0.5 },
  micEmoji: { fontSize: 36 },
  micLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, textAlign: 'center' },
});
