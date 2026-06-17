import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, fontSize, spacing, radius, minTapSize } from '../../constants/theme';
import type { ReadingQuestion } from '../../types/exercises';
import type { Difficulty } from '../../types/exercises';

interface Props {
  question: ReadingQuestion;
  difficulty: Difficulty;
  disabled: boolean;
  onAnswer: (choice: string) => void;
  onHearAgain: () => void;
}

export function ReadingExercise({ question, disabled, onAnswer, onHearAgain }: Props) {
  const isEmojiChoice = question.mode === 'word-to-picture' || question.mode === 'sentence-to-picture';

  return (
    <View style={styles.container}>
      {/* Prompt area */}
      <View style={styles.promptCard}>
        {question.mode === 'picture-to-word' ? (
          <Text style={styles.promptEmoji}>{question.prompt}</Text>
        ) : (
          <Text style={styles.promptWord}>{question.prompt}</Text>
        )}
      </View>

      {/* Hear again button */}
      <TouchableOpacity style={styles.hearBtn} onPress={onHearAgain} accessibilityLabel="Hear again">
        <Text style={styles.hearBtnText}>🔊 Hear it again</Text>
      </TouchableOpacity>

      {/* Choices */}
      <Text style={styles.choiceLabel}>
        {isEmojiChoice ? 'Tap the right picture!' : 'Tap the right word!'}
      </Text>
      <View style={styles.choices}>
        {question.choices.map((choice) => (
          <TouchableOpacity
            key={choice}
            style={[styles.choiceBtn, disabled && styles.choiceBtnDisabled]}
            onPress={() => !disabled && onAnswer(choice)}
            accessibilityLabel={`Choice: ${choice}`}
          >
            <Text style={isEmojiChoice ? styles.choiceEmoji : styles.choiceWord}>
              {choice}
            </Text>
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  promptWord: {
    fontFamily: fonts.extraBold,
    fontSize: 52,
    color: colors.reading,
    textAlign: 'center',
    letterSpacing: 2,
  },
  promptEmoji: {
    fontSize: 96,
    textAlign: 'center',
  },
  hearBtn: {
    backgroundColor: colors.accentYellow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: minTapSize,
    justifyContent: 'center',
  },
  hearBtnText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  choiceLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  choices: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  choiceBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.reading,
    padding: spacing.md,
    minWidth: 100,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  choiceBtnDisabled: { opacity: 0.5 },
  choiceEmoji: { fontSize: 52, textAlign: 'center' },
  choiceWord: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
  },
});
