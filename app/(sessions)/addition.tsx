import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSessionStore } from '../../src/store/sessionStore';
import { useProgressStore } from '../../src/store/progressStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useSpeechOutput } from '../../src/hooks/useSpeechOutput';
import { useSoundEffects } from '../../src/hooks/useSoundEffects';
import { useRewards } from '../../src/hooks/useRewards';
import { MascotSpeech } from '../../src/components/ui/MascotSpeech';
import { AdditionExercise } from '../../src/components/exercises/AdditionExercise';
import { StarBurst } from '../../src/components/rewards/StarBurst';
import { Confetti } from '../../src/components/rewards/Confetti';
import { BadgeUnlock } from '../../src/components/rewards/BadgeUnlock';
import { ENCOURAGEMENT_CORRECT, ENCOURAGEMENT_WRONG, HINT_OFFER, pickRandom } from '../../src/constants/mascotPhrases';
import { spacing } from '../../src/constants/theme';
import type { MathQuestion } from '../../src/types/exercises';

export default function AdditionSession() {
  const session = useSessionStore();
  const progress = useProgressStore();
  const settings = useSettingsStore();
  const { speak } = useSpeechOutput();
  const { play } = useSoundEffects();
  const { checkAndAwardBadges, calculateStars } = useRewards();

  const [mascotMsg, setMascotMsg] = useState('What is the answer?');
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'celebrate'>('happy');
  const [mascotAnimate, setMascotAnimate] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const [starBurstCount, setStarBurstCount] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);

  const question = session.questions[session.currentIndex] as MathQuestion | undefined;

  useEffect(() => {
    if (!question) return;
    const msg = `What is ${question.a} plus ${question.b}?`;
    setMascotMsg(msg);
    setMascotMood('happy');
    setHintUsed(false);
    setDisabled(false);
    speak(msg, settings.voiceSpeed);
  }, [session.currentIndex]);

  const handleAnswer = useCallback((value: number, usedVoice: boolean) => {
    if (disabled || !question) return;
    setDisabled(true);
    if (usedVoice) session.incrementVoiceUsed();

    const correct = value === question.answer;
    progress.recordAnswer('addition', correct);

    if (correct) {
      const stars = calculateStars(true, hintUsed, session.wrongAttempts);
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
      const newBadges = checkAndAwardBadges('addition', session.difficulty);
      if (newBadges.length > 0) { play('badge'); setBadgeQueue(newBadges); setCurrentBadge(newBadges[0]); }
      setTimeout(() => {
        setMascotAnimate(false);
        if (session.currentIndex + 1 >= session.questions.length) {
          progress.completeSession('addition');
          router.replace('/results');
        } else {
          session.nextQuestion();
        }
      }, 2000);
    } else {
      session.incrementWrongAttempts();
      session.resetStreak();
      const msg = pickRandom(ENCOURAGEMENT_WRONG);
      setMascotMsg(msg);
      setMascotMood('thinking');
      speak(msg, settings.voiceSpeed);
      play('wrong');
      if (session.wrongAttempts >= 1) {
        setHintUsed(true);
        setTimeout(() => { const h = pickRandom(HINT_OFFER); setMascotMsg(h); speak(h, settings.voiceSpeed); }, 1200);
      }
      setTimeout(() => setDisabled(false), 1500);
    }
  }, [disabled, question, hintUsed, session, progress, settings, calculateStars, checkAndAwardBadges, play, speak]);

  if (!question) return null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <MascotSpeech message={mascotMsg} mood={mascotMood} animate={mascotAnimate} />
      <AdditionExercise
        question={question}
        difficulty={session.difficulty}
        disabled={disabled}
        hintUsed={hintUsed}
        onAnswer={handleAnswer}
        onHint={() => { setHintUsed(true); speak(question.hint, settings.voiceSpeed); }}
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
