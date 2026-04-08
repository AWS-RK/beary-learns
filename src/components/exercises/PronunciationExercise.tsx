import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';
import { BigButton } from '../ui/BigButton';
import { VoiceButton } from '../ui/VoiceButton';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { useSpeechOutput } from '../../hooks/useSpeechOutput';
import { scorePronunciation } from '../../engines/pronunciationEngine';
import type { PronunciationQuestion, Difficulty } from '../../types/exercises';
import { DIFFICULTY_CONFIG } from '../../engines/difficultyConfig';

interface PronunciationExerciseProps {
  question: PronunciationQuestion;
  difficulty: Difficulty;
  disabled: boolean;
  attemptsLeft: number;
  onAnswer: (spoken: string, usedVoice: boolean) => void;
}

export function PronunciationExercise({
  question,
  difficulty,
  disabled,
  attemptsLeft,
  onAnswer,
}: PronunciationExerciseProps) {
  const config = DIFFICULTY_CONFIG[difficulty].pronunciation;
  const [textInput, setTextInput] = useState('');
  const [listened, setListened] = useState(false);
  const { speak } = useSpeechOutput();
  const { isListening, transcript, available, startListening, stopListening, reset } = useSpeechInput();

  const waveScale = useSharedValue(1);

  React.useEffect(() => {
    if (isListening) {
      waveScale.value = withRepeat(withSequence(withTiming(1.3, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true);
    } else {
      cancelAnimation(waveScale);
      waveScale.value = withTiming(1);
    }
  }, [isListening]);

  React.useEffect(() => {
    if (transcript) {
      reset();
      onAnswer(transcript, true);
    }
  }, [transcript]);

  const handleListen = () => {
    speak(question.word, config.ttsRate);
    setListened(true);
  };

  const waveStyle = useAnimatedStyle(() => ({ transform: [{ scale: waveScale.value }] }));

  return (
    <View style={styles.container}>
      <View style={styles.wordCard}>
        {config.showPictureAlways && (
          <Text style={styles.wordEmoji}>{question.emoji}</Text>
        )}
        {!config.showPictureAlways && !config.oneListen && (
          <BigButton
            label="Show picture 🖼️"
            onPress={() => {}}
            color={colors.accentYellow + '44'}
            textColor={colors.text}
          />
        )}
        <Text style={styles.word}>{question.word}</Text>
        <Text style={styles.attemptsText}>
          {attemptsLeft} {attemptsLeft === 1 ? 'try' : 'tries'} left
        </Text>
      </View>

      <BigButton
        label={listened && config.oneListen ? "Only one listen! 🎧" : "Listen 🔊"}
        onPress={handleListen}
        color={colors.secondary}
        disabled={listened && config.oneListen}
      />

      {available ? (
        <Animated.View style={waveStyle}>
          <VoiceButton
            isListening={isListening}
            onPress={() => (isListening ? stopListening() : startListening())}
            disabled={disabled || !listened}
            available={available}
          />
        </Animated.View>
      ) : (
        <View style={styles.textInputRow}>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Type the word..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <BigButton
            label="✓"
            onPress={() => { onAnswer(textInput, false); setTextInput(''); }}
            color={colors.success}
            disabled={!textInput}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', gap: spacing.lg, paddingBottom: spacing.xl },
  wordCard: {
    backgroundColor: colors.card, borderRadius: 24, padding: spacing.xl,
    alignItems: 'center', gap: spacing.md, width: '100%',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  wordEmoji: { fontSize: 72 },
  word: { fontFamily: fonts.extraBold, fontSize: 52, color: colors.text, letterSpacing: 4 },
  attemptsText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.textLight },
  textInputRow: { flexDirection: 'row', gap: spacing.sm, width: '100%', alignItems: 'center' },
  textInput: {
    flex: 1, height: 56, backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border, paddingHorizontal: spacing.md,
    fontFamily: fonts.bold, fontSize: fontSize.lg,
  },
});
