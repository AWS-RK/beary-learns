import { useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { useProgressStore } from '../store/progressStore';
import type { Subject, Difficulty } from '../types/exercises';

export function useRewards() {
  const session = useSessionStore();
  const progress = useProgressStore();

  const checkAndAwardBadges = useCallback(
    (subject: Subject, difficulty: Difficulty) => {
      const awarded: string[] = [];
      const { badgesEarned, totalStars, subjects } = progress;
      const sub = subjects[subject];

      const earn = (id: string) => {
        if (!badgesEarned.includes(id)) {
          progress.earnBadge(id);
          session.addNewBadge(id);
          awarded.push(id);
        }
      };

      // First step ever
      const totalAnswers = Object.values(subjects).reduce((a, s) => a + s.correctAnswers, 0);
      if (totalAnswers === 1) earn('FIRST_STEP');

      // Counting badges
      if (subject === 'counting') {
        if (sub.correctAnswers >= 10 && difficulty === 'easy') earn('COUNTER_5');
        if (sub.correctAnswers >= 10 && difficulty !== 'easy') earn('COUNTER_10');
      }

      // Addition badges
      if (subject === 'addition') {
        if (sub.sessionsCompleted >= 1) earn('ADDER_BEGINNER');
        if (sub.sessionsCompleted >= 4) earn('ADDER_PRO');
      }

      // Subtraction badge
      if (subject === 'subtraction' && sub.sessionsCompleted >= 1) earn('SUBTRACT_START');

      // Pronunciation badge
      if (subject === 'pronunciation' && sub.correctAnswers >= 5) earn('WORD_STAR');

      // Reading badges
      if (subject === 'reading') {
        if (sub.sessionsCompleted >= 1) earn('READER_START');
        if (sub.correctAnswers >= 5) earn('READER_5');
        if (sub.sessionsCompleted >= 5) earn('READER_PRO');
      }

      // Voice hero
      if (session.voiceUsedCount >= 10) earn('VOICE_HERO');

      // Hard mode
      if (difficulty === 'hard') earn('HARD_MODE');

      // Streak badges
      if (session.streak >= 3) earn('STREAK_3');
      if (session.streak >= 5) earn('STREAK_5');

      // Daily learner
      if (progress.currentStreak >= 3) earn('DAILY_LEARNER');

      // Star collector
      if (totalStars + session.starsEarned >= 50) earn('STAR_COLLECTOR');

      return awarded;
    },
    [session, progress]
  );

  const calculateStars = useCallback((correct: boolean, usedHint: boolean, wrongAttempts: number): number => {
    if (!correct) return 0;
    if (usedHint || wrongAttempts > 0) return 1;
    return 3;
  }, []);

  return { checkAndAwardBadges, calculateStars };
}
