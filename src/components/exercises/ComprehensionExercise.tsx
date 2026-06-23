// src/components/exercises/ComprehensionExercise.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, fontSize, spacing, radius, minTapSize } from '../../constants/theme';
import type { ComprehensionQuestion } from '../../types/readingJourney';

interface Props {
  question: ComprehensionQuestion;
  disabled: boolean;
  onAnswer: (choice: string) => void;
}

export function ComprehensionExercise({ question, disabled, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.passageCard}>
        <Text style={styles.passageLabel}>Read this:</Text>
        <Text style={styles.passage}>{question.passage}</Text>
        <View style={styles.divider} />
        <Text style={styles.question}>{question.question}</Text>
      </View>
      <Text style={styles.choiceLabel}>Tap the right answer:</Text>
      <View style={styles.choices}>
        {question.choices.map((choice) => (
          <TouchableOpacity
            key={choice}
            style={[styles.choiceBtn, disabled && styles.disabled]}
            onPress={() => !disabled && onAnswer(choice)}
            accessibilityLabel={`Answer: ${choice}`}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  passageCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.reading,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  passageLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, marginBottom: spacing.xs },
  passage: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 30,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  question: {
    fontFamily: fonts.extraBold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
  },
  choiceLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, textAlign: 'center' },
  choices: { gap: spacing.sm },
  choiceBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2.5,
    borderColor: colors.reading,
    padding: spacing.md,
    minHeight: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disabled: { opacity: 0.5 },
  choiceText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
});
