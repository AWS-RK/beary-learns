import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';
import { NumberPad } from '../ui/NumberPad';
import { VoiceButton } from '../ui/VoiceButton';
import { BigButton } from '../ui/BigButton';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { normalizeAnswer } from '../../utils/numberToWords';
import type { CountingQuestion, Difficulty } from '../../types/exercises';
import { DIFFICULTY_CONFIG } from '../../engines/difficultyConfig';

interface CountingExerciseProps {
  question: CountingQuestion;
  difficulty: Difficulty;
  disabled: boolean;
  hintUsed: boolean;
  onAnswer: (value: number, usedVoice: boolean) => void;
  onHint: () => void;
}

export function CountingExercise({
  question,
  difficulty,
  disabled,
  hintUsed,
  onAnswer,
  onHint,
}: CountingExerciseProps) {
  const config = DIFFICULTY_CONFIG[difficulty].counting;
  const { isListening, transcript, available, startListening, stopListening, reset } = useSpeechInput();

  // React to voice transcript
  React.useEffect(() => {
    if (transcript) {
      const normalized = normalizeAnswer(transcript);
      const num = parseInt(normalized, 10);
      if (!isNaN(num)) {
        reset();
        onAnswer(num, true);
      }
    }
  }, [transcript]);

  const handleVoicePress = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const renderObjects = () => {
    const items = Array.from({ length: question.count });
    const isScattered = config.layout === 'scattered';
    return (
      <View style={[styles.objectsContainer, isScattered && styles.scattered]}>
        {items.map((_, i) => (
          <Text key={i} style={styles.object}>{question.emoji}</Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>How many {question.emoji} do you see?</Text>
        {renderObjects()}
      </View>

      {config.hintAlways || hintUsed ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>💡 {question.hint}</Text>
        </View>
      ) : (
        <BigButton label="Need a hint? 💡" onPress={onHint} color={colors.accentYellow} textColor={colors.text} />
      )}

      <NumberPad onSubmit={(v) => onAnswer(v, false)} disabled={disabled} />

      <VoiceButton
        isListening={isListening}
        onPress={handleVoicePress}
        disabled={disabled}
        available={available}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', gap: spacing.lg, paddingBottom: spacing.xl },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text, textAlign: 'center' },
  objectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  scattered: { justifyContent: 'space-around' },
  object: { fontSize: 36 },
  hintBox: {
    backgroundColor: colors.accentYellow + '55',
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
  },
  hintText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
});
