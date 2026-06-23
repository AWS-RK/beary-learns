// src/components/exercises/WordRecognitionExercise.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, fontSize, spacing, radius, minTapSize } from '../../constants/theme';
import type { WordRecognitionQuestion } from '../../types/readingJourney';

interface Props {
  question: WordRecognitionQuestion;
  disabled: boolean;
  onAnswer: (emoji: string) => void;
}

export function WordRecognitionExercise({ question, disabled, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.promptCard}>
        <Text style={styles.word}>{question.word}</Text>
        <Text style={styles.hint}>Find the picture 👇</Text>
      </View>
      <View style={styles.choices}>
        {question.choices.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[styles.choiceBtn, disabled && styles.disabled]}
            onPress={() => !disabled && onAnswer(emoji)}
            accessibilityLabel={`Picture choice: ${emoji}`}
          >
            <Text style={styles.choiceEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  word: {
    fontFamily: fonts.extraBold,
    fontSize: 52,
    color: colors.reading,
    textAlign: 'center',
    letterSpacing: 2,
  },
  hint: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  choices: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center', width: '100%' },
  choiceBtn: {
    flex: 1,
    minHeight: minTapSize * 1.4,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.reading,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  disabled: { opacity: 0.5 },
  choiceEmoji: { fontSize: 48 },
});
