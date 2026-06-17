// app/(sessions)/reading-lesson.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useSpeechOutput } from '../../src/hooks/useSpeechOutput';
import { useSoundEffects } from '../../src/hooks/useSoundEffects';
import { MascotSpeech } from '../../src/components/ui/MascotSpeech';
import { WordRecognitionExercise } from '../../src/components/exercises/WordRecognitionExercise';
import { ReadAloudExercise } from '../../src/components/exercises/ReadAloudExercise';
import { ComprehensionExercise } from '../../src/components/exercises/ComprehensionExercise';
import { StarBurst } from '../../src/components/rewards/StarBurst';
import { generateLesson } from '../../src/engines/readingJourneyEngine';
import { ENCOURAGEMENT_CORRECT, ENCOURAGEMENT_WRONG, pickRandom } from '../../src/constants/mascotPhrases';
import { colors, fonts, fontSize, spacing } from '../../src/constants/theme';
import type { ReadingJourneyQuestion, QuestionResult } from '../../src/types/readingJourney';

export default function ReadingLessonScreen() {
  const { unitNumber: unitParam, lessonIndex: lessonParam } = useLocalSearchParams<{ unitNumber: string; lessonIndex: string }>();
  const unitNumber = Number(unitParam ?? '1');
  const lessonIndex = Number(lessonParam ?? '0');

  const { speak } = useSpeechOutput();
  const { play } = useSoundEffects();
  const voiceSpeed = useSettingsStore((s) => s.voiceSpeed);

  const [questions] = useState<ReadingJourneyQuestion[]>(() => generateLesson(unitNumber, lessonIndex));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAttemptsThisQ, setWrongAttemptsThisQ] = useState(0);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [mascotMsg, setMascotMsg] = useState('');
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'celebrate'>('happy');
  const [mascotAnimate, setMascotAnimate] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const [starBurstCount, setStarBurstCount] = useState(3);

  const question = questions[currentIndex];

  useEffect(() => {
    if (!question) return;
    setDisabled(false);
    setWrongAttemptsThisQ(0);
    setMascotMood('happy');
    setMascotMsg(question.audioPrompt);
    speak(question.audioPrompt, voiceSpeed);
  }, [currentIndex]);

  const starsForAttempts = (wrongAttempts: number) =>
    wrongAttempts === 0 ? 3 : wrongAttempts === 1 ? 2 : 1;

  const handleCorrect = useCallback(() => {
    const stars = starsForAttempts(wrongAttemptsThisQ);
    const newResult: QuestionResult = { correct: true, starsEarned: stars, attempts: wrongAttemptsThisQ + 1 };
    setQuestionResults((prev) => {
      const allResults = [...prev, newResult];
      if (currentIndex + 1 >= questions.length) {
        const totalStars = allResults.reduce((s, r) => s + r.starsEarned, 0);
        const wordCorrectCount = allResults.filter((r) => r.correct).length;
        setTimeout(() => {
          router.replace({
            pathname: '/reading-results',
            params: {
              unitNumber: String(unitNumber),
              lessonIndex: String(lessonIndex),
              starsEarned: String(totalStars),
              wordCorrectCount: String(wordCorrectCount),
            },
          });
        }, 1800);
      }
      return allResults;
    });
    setStarBurstCount(stars);
    setStarBurst(true);
    const msg = pickRandom(ENCOURAGEMENT_CORRECT);
    setMascotMsg(msg);
    setMascotMood('celebrate');
    setMascotAnimate(true);
    speak(msg, voiceSpeed);
    play(stars === 3 ? 'celebrate' : 'correct');
    setDisabled(true);

    if (currentIndex + 1 < questions.length) {
      setTimeout(() => {
        setMascotAnimate(false);
        setCurrentIndex((i) => i + 1);
      }, 1800);
    }
  }, [wrongAttemptsThisQ, currentIndex, questions.length, unitNumber, lessonIndex, voiceSpeed, play, speak]);

  const handleWrong = useCallback(() => {
    setWrongAttemptsThisQ((w) => w + 1);
    const msg = pickRandom(ENCOURAGEMENT_WRONG);
    setMascotMsg(msg);
    setMascotMood('thinking');
    speak(msg, voiceSpeed);
    play('wrong');
  }, [voiceSpeed, play, speak]);

  const handleWordRecognitionAnswer = useCallback((emoji: string) => {
    if (question?.type !== 'word-recognition') return;
    if (emoji === question.correctEmoji) handleCorrect();
    else handleWrong();
  }, [question, handleCorrect, handleWrong]);

  const handleReadAloudAnswer = useCallback((correct: boolean) => {
    if (correct) handleCorrect();
    else handleWrong();
  }, [handleCorrect, handleWrong]);

  const handleComprehensionAnswer = useCallback((choice: string) => {
    if (question?.type !== 'comprehension') return;
    if (choice === question.correctAnswer) handleCorrect();
    else handleWrong();
  }, [question, handleCorrect, handleWrong]);

  const handleHearAgain = useCallback(() => {
    if (!question) return;
    speak(question.audioPrompt, voiceSpeed * 0.8);
  }, [question, voiceSpeed, speak]);

  if (!question) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Exit session">
          <Text style={styles.exit}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {questions.length}
        </Text>
        <Text style={styles.stars}>
          ⭐ {questionResults.reduce((s, r) => s + r.starsEarned, 0)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MascotSpeech message={mascotMsg} mood={mascotMood} animate={mascotAnimate} />

        {question.type === 'word-recognition' && (
          <WordRecognitionExercise
            question={question}
            disabled={disabled}
            onAnswer={handleWordRecognitionAnswer}
          />
        )}
        {question.type === 'read-aloud' && (
          <ReadAloudExercise
            question={question}
            disabled={disabled}
            onAnswer={handleReadAloudAnswer}
            onHearAgain={handleHearAgain}
          />
        )}
        {question.type === 'comprehension' && (
          <ComprehensionExercise
            question={question}
            disabled={disabled}
            onAnswer={handleComprehensionAnswer}
          />
        )}
      </ScrollView>

      <StarBurst visible={starBurst} stars={starBurstCount} onDone={() => setStarBurst(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exit: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.textLight },
  progress: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.text },
  stars: { fontFamily: fonts.extraBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
});
