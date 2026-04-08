import { create } from 'zustand';
import type { Subject, Difficulty, Question } from '../types/exercises';

interface SessionState {
  subject: Subject | null;
  difficulty: Difficulty;
  questions: Question[];
  currentIndex: number;
  starsEarned: number;
  streak: number;
  wrongAttempts: number;
  voiceUsedCount: number;
  newBadges: string[];

  setSubject: (subject: Subject) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setQuestions: (questions: Question[]) => void;
  nextQuestion: () => void;
  addStars: (stars: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  incrementWrongAttempts: () => void;
  resetWrongAttempts: () => void;
  incrementVoiceUsed: () => void;
  addNewBadge: (badgeId: string) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  subject: null,
  difficulty: 'easy',
  questions: [],
  currentIndex: 0,
  starsEarned: 0,
  streak: 0,
  wrongAttempts: 0,
  voiceUsedCount: 0,
  newBadges: [],

  setSubject: (subject) => set({ subject }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setQuestions: (questions) => set({ questions, currentIndex: 0, starsEarned: 0, streak: 0, wrongAttempts: 0, newBadges: [] }),
  nextQuestion: () => set((s) => ({ currentIndex: s.currentIndex + 1, wrongAttempts: 0 })),
  addStars: (stars) => set((s) => ({ starsEarned: s.starsEarned + stars })),
  incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
  incrementWrongAttempts: () => set((s) => ({ wrongAttempts: s.wrongAttempts + 1 })),
  resetWrongAttempts: () => set({ wrongAttempts: 0 }),
  incrementVoiceUsed: () => set((s) => ({ voiceUsedCount: s.voiceUsedCount + 1 })),
  addNewBadge: (badgeId) => set((s) => ({ newBadges: [...s.newBadges, badgeId] })),
  resetSession: () =>
    set({ subject: null, questions: [], currentIndex: 0, starsEarned: 0, streak: 0, wrongAttempts: 0, newBadges: [] }),
}));
