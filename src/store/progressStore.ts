import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProgressData, SubjectProgress } from '../types/progress';
import type { Subject } from '../types/exercises';

const STORAGE_KEY = 'beary_progress';

const defaultSubjectProgress = (): SubjectProgress => ({
  sessionsCompleted: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  highestDifficulty: 'easy',
});

const defaultProgress = (): ProgressData => ({
  totalStars: 0,
  badgesEarned: [],
  subjects: {
    counting: defaultSubjectProgress(),
    addition: defaultSubjectProgress(),
    subtraction: defaultSubjectProgress(),
    pronunciation: defaultSubjectProgress(),
    reading: defaultSubjectProgress(),
  },
  currentStreak: 0,
  lastPlayedDate: null,
  daysPlayed: 0,
});

interface ProgressStore extends ProgressData {
  hydrated: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  addStars: (stars: number) => void;
  earnBadge: (badgeId: string) => void;
  recordAnswer: (subject: Subject, correct: boolean) => void;
  completeSession: (subject: Subject) => void;
  updateStreak: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  ...defaultProgress(),
  hydrated: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as ProgressData;
        set({ ...data, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  save: async () => {
    try {
      const { hydrated, load, save, addStars, earnBadge, recordAnswer, completeSession, updateStreak, ...data } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // silent
    }
  },

  addStars: (stars) => {
    set((s) => ({ totalStars: s.totalStars + stars }));
    get().save();
  },

  earnBadge: (badgeId) => {
    const { badgesEarned } = get();
    if (badgesEarned.includes(badgeId)) return;
    set((s) => ({ badgesEarned: [...s.badgesEarned, badgeId] }));
    get().save();
  },

  recordAnswer: (subject, correct) => {
    set((s) => ({
      subjects: {
        ...s.subjects,
        [subject]: {
          ...s.subjects[subject],
          correctAnswers: s.subjects[subject].correctAnswers + (correct ? 1 : 0),
          totalAnswers: s.subjects[subject].totalAnswers + 1,
        },
      },
    }));
    get().save();
  },

  completeSession: (subject) => {
    set((s) => ({
      subjects: {
        ...s.subjects,
        [subject]: {
          ...s.subjects[subject],
          sessionsCompleted: s.subjects[subject].sessionsCompleted + 1,
        },
      },
    }));
    get().save();
  },

  updateStreak: () => {
    const today = new Date().toDateString();
    const { lastPlayedDate, daysPlayed } = get();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = 1;
    let newDays = daysPlayed;
    if (lastPlayedDate === today) return;
    if (lastPlayedDate === yesterday) {
      newStreak = get().currentStreak + 1;
    }
    if (lastPlayedDate !== today) newDays += 1;
    set({ currentStreak: newStreak, lastPlayedDate: today, daysPlayed: newDays });
    get().save();
  },
}));
