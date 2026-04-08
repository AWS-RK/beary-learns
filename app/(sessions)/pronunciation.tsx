import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSessionStore } from '../../src/store/sessionStore';
import { useProgressStore } from '../../src/store/progressStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useSpeechOutput } from '../../src/hooks/useSpeechOutput';
import { useSoundEffects } from '../../src/hooks/useSoundEffects';
import { useRewards } from '../../src/hooks/useRewards';
import { scorePronunciation } from '../../src/engines/pronunciationEngine';
import { MascotSpeech } from '../../src/components/ui/MascotSpeech';
import { PronunciationExercise } from '../../src/components/exercises/PronunciationExercise';
import { StarBurst } from '../../src/components/rewards/StarBurst';
import { Confetti } from '../../src/components/rewards/Confetti';
import { BadgeUnlock } from '../../src/components/rewards/BadgeUnlock';
import { ENCOURAGEMENT_CORRECT, ENCOURAGEMENT_WRONG, pickRandom } from '../../src/constants/mascotPhrases';
import { spacing } from '../../src/constants/theme';
import type { PronunciationQuestion } from '../../src/types/exercises';
import { DIFFICULTY_CONFIG } from '../../src/engines/difficultyConfig';

export default function PronunciationSession() {
  const session = useSessionStore();
  const progress = useProgressStore();
  const settings = useSettingsStore();
  const { speak } = useSpeechOutput();
  const { play } = useSoundEffects();
  const { checkAndAwardBadges, calculateStars } = useRewards();

  const [mascotMsg, setMascotMsg] = useState('Listen and then say the word!');
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'celebrate'>('happy');
  const [mascotAnimate, setMascotAnimate] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const [starBurstCount, setStarBurstCount] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const question = session.questions[session.currentIndex] as PronunciationQuestion | undefined;
  const config = DIFFICULTY_CONFIG[session.difficulty].pronunciation;

  useEffect(() => {
    if (!question) return;
    const msg = `Listen carefully, then say: ${question.word}`;
    setMascotMsg(msg);
    setMascotMood('happy');
    setDisabled(false);
    setAttemptsLeft(config.maxAttempts);
    speak(msg, settings.voiceSpeed);
  }, [session.currentIndex]);

  const handleAnswer = useCallback((spoken: string, usedVoice: boolean) => {
    if (disabled || !question) return;
    if (usedVoice) session.incrementVoiceUsed();

    const correct = scorePronunciation(spoken, question.word, question.matchThreshold);
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    progress.recordAnswer('pronunciation', correct);

    if (correct || newAttemptsLeft <= 0) {
      setDisabled(true);
      if (correct) {
        const stars = calculateStars(true, false, config.maxAttempts - attemptsLeft);
        session.addStars(stars);
        session.incrementStreak();
        progress.addStars(stars);
        progress.updateStreak();
        setStarBurstCount(stars);
        setStarBurst(true);
        if (stars === 3) setShowConfetti(true);
        const msg = pickRandom(ENCOURAGEMENT_CORRECT);
        setMascotMsg(msg);
        setMascotMood('celebrate');
        setMascotAnimate(true);
        speak(msg, settings.voiceSpeed);
        play(stars === 3 ? 'celebrate' : 'correct');
        const newBadges = checkAndAwardBadges('pronunciation', session.difficulty);
        if (newBadges.length > 0) { play('badge'); setBadgeQueue(newBadges); setCurrentBadge(newBadges[0]); }
      } else {
        session.resetStreak();
        const msg = `The word was "${question.word}". Let's try the next one!`;
        setMascotMsg(msg);
        speak(msg, settings.voiceSpeed);
      }
      setTimeout(() => {
        setMascotAnimate(false);
        if (session.currentIndex + 1 >= session.questions.length) {
          progress.completeSession('pronunciation');
          router.replace('/results');
        } else {
          session.nextQuestion();
        }
      }, 2500);
    } else {
      const msg = pickRandom(ENCOURAGEMENT_WRONG);
      setMascotMsg(msg);
      setMascotMood('thinking');
      speak(msg, settings.voiceSpeed);
      play('wrong');
    }
  }, [disabled, question, attemptsLeft, session, progress, settings, config, calculateStars, checkAndAwardBadges, play, speak]);

  if (!question) return null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <MascotSpeech message={mascotMsg} mood={mascotMood} animate={mascotAnimate} />
      <PronunciationExercise
        question={question}
        difficulty={session.difficulty}
        disabled={disabled}
        attemptsLeft={attemptsLeft}
        onAnswer={handleAnswer}
      />
      <StarBurst visible={starBurst} stars={starBurstCount} onDone={() => setStarBurst(false)} />
      <Confetti visible={showConfetti} onDone={() => setShowConfetti(false)} />
      <BadgeUnlock badgeId={currentBadge} onClose={() => { const r = badgeQueue.slice(1); setBadgeQueue(r); setCurrentBadge(r[0] ?? null); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
});
