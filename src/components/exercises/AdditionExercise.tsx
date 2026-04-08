import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';
import { NumberPad } from '../ui/NumberPad';
import { VoiceButton } from '../ui/VoiceButton';
import { BigButton } from '../ui/BigButton';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { normalizeAnswer } from '../../utils/numberToWords';
import type { MathQuestion, Difficulty } from '../../types/exercises';
import { DIFFICULTY_CONFIG } from '../../engines/difficultyConfig';

interface AdditionExerciseProps {
  question: MathQuestion;
  difficulty: Difficulty;
  disabled: boolean;
  hintUsed: boolean;
  onAnswer: (value: number, usedVoice: boolean) => void;
  onHint: () => void;
}

const DOT_EMOJI = '🔵';

function DotGroup({ count, color }: { count: number; color: string }) {
  return (
    <View style={styles.dotGroup}>
      {Array.from({ length: count }).map((_, i) => (
        <Text key={i} style={styles.dot}>{DOT_EMOJI}</Text>
      ))}
    </View>
  );
}

export function AdditionExercise({
  question,
  difficulty,
  disabled,
  hintUsed,
  onAnswer,
  onHint,
}: AdditionExerciseProps) {
  const config = DIFFICULTY_CONFIG[difficulty].addition;
  const [showDots, setShowDots] = React.useState(config.showDotsAlways);
  const { isListening, transcript, available, startListening, stopListening, reset } = useSpeechInput();

  React.useEffect(() => {
    if (transcript) {
      const normalized = normalizeAnswer(transcript);
      const num = parseInt(normalized, 10);
      if (!isNaN(num)) { reset(); onAnswer(num, true); }
    }
  }, [transcript]);

  return (
    <View style={styles.container}>
      <View style={styles.questionCard}>
        <View style={styles.equationRow}>
          <Text style={styles.number}>{question.a}</Text>
          <Text style={styles.operator}>+</Text>
          <Text style={styles.number}>{question.b}</Text>
          <Text style={styles.operator}>=</Text>
          <Text style={styles.unknown}>?</Text>
        </View>

        {showDots && (
          <View style={styles.dotsRow}>
            <DotGroup count={question.a} color={colors.secondary} />
            <Text style={styles.plus}>+</Text>
            <DotGroup count={question.b} color={colors.primary} />
          </View>
        )}

        {!showDots && config.showVisualAid && (
          <BigButton
            label="Show me dots 🔵"
            onPress={() => setShowDots(true)}
            color={colors.secondary + '33'}
            textColor={colors.secondary}
          />
        )}
      </View>

      {hintUsed && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>💡 {question.hint}</Text>
        </View>
      )}
      {!hintUsed && (
        <BigButton label="Need a hint? 💡" onPress={onHint} color={colors.accentYellow} textColor={colors.text} />
      )}

      <NumberPad onSubmit={(v) => onAnswer(v, false)} disabled={disabled} maxDigits={2} />
      <VoiceButton isListening={isListening} onPress={() => isListening ? stopListening() : startListening()} disabled={disabled} available={available} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', gap: spacing.lg, paddingBottom: spacing.xl },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  equationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  number: { fontFamily: fonts.extraBold, fontSize: fontSize.display, color: colors.text },
  operator: { fontFamily: fonts.extraBold, fontSize: fontSize.xxl, color: colors.secondary },
  unknown: { fontFamily: fonts.extraBold, fontSize: fontSize.display, color: colors.primary },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  dotGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: 140 },
  dot: { fontSize: 20 },
  plus: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: colors.secondary },
  hintBox: { backgroundColor: colors.accentYellow + '55', borderRadius: 12, padding: spacing.md, width: '100%' },
  hintText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
});
