// src/store/readingJourneyStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReadingJourneyProgress, UnitProgress, LessonResult } from '../types/readingJourney';
import { JOURNEY_UNITS } from '../constants/readingJourneyContent';
import { useProgressStore } from './progressStore';

const STORAGE_KEY = 'beary_reading_journey';

const defaultUnitProgress = (unitNumber: number): UnitProgress => ({
  unitNumber,
  unlocked: unitNumber === 1,
  lessonsCompleted: 0,
  lessonsAttempted: 0,
  starsEarned: 0,
  completedAt: null,
  lessonResults: [],
});

const defaultProgress = (): ReadingJourneyProgress => ({
  units: Object.fromEntries(
    JOURNEY_UNITS.map((u) => [u.unitNumber, defaultUnitProgress(u.unitNumber)])
  ) as Record<number, UnitProgress>,
  totalCorrectWords: 0,
  lastLessonDate: null,
  lessonStreakDays: 0,
});

interface ReadingJourneyStore extends ReadingJourneyProgress {
  hydrated: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  recordLessonResult: (unitNumber: number, result: LessonResult, wordCorrectCount: number) => string[];
  getNextLessonIndex: (unitNumber: number) => number;
  isUnitComplete: (unitNumber: number) => boolean;
}

export const useReadingJourneyStore = create<ReadingJourneyStore>((set, get) => ({
  ...defaultProgress(),
  hydrated: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as ReadingJourneyProgress;
        const merged = defaultProgress();
        merged.totalCorrectWords = data.totalCorrectWords ?? 0;
        merged.lastLessonDate = data.lastLessonDate ?? null;
        merged.lessonStreakDays = data.lessonStreakDays ?? 0;
        for (const key of Object.keys(data.units ?? {})) {
          const n = Number(key);
          if (merged.units[n] !== undefined) merged.units[n] = data.units[n];
        }
        set({ ...merged, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  save: async () => {
    try {
      const { hydrated, load, save, recordLessonResult, getNextLessonIndex, isUnitComplete, ...data } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // silent
    }
  },

  getNextLessonIndex: (unitNumber) => {
    const unit = get().units[unitNumber];
    if (!unit) return 0;
    for (let i = 0; i < 8; i++) {
      const hasResult = unit.lessonResults.some((r) => r.lessonIndex === i && r.passed);
      if (!hasResult) return i;
    }
    return 0;
  },

  isUnitComplete: (unitNumber) => {
    const unit = get().units[unitNumber];
    return !!unit && unit.lessonsCompleted >= 6;
  },

  recordLessonResult: (unitNumber, result, wordCorrectCount) => {
    const newBadges: string[] = [];
    const state = get();
    const unit = state.units[unitNumber];
    if (!unit) return newBadges;

    const existingResults = unit.lessonResults.filter((r) => r.lessonIndex !== result.lessonIndex);
    const updatedResults = [...existingResults, result];
    const passedCount = updatedResults.filter((r) => r.passed).length;
    const totalStars = updatedResults.reduce((sum, r) => sum + r.starsEarned, 0);
    const isNowComplete = passedCount >= 6;

    const updatedUnit: UnitProgress = {
      ...unit,
      lessonResults: updatedResults,
      lessonsCompleted: passedCount,
      lessonsAttempted: unit.lessonsAttempted + (existingResults.length === unit.lessonResults.length ? 1 : 0),
      starsEarned: totalStars,
      completedAt: isNowComplete && !unit.completedAt ? new Date().toISOString() : unit.completedAt,
    };

    const updatedUnits = { ...state.units, [unitNumber]: updatedUnit };
    const maxUnit = JOURNEY_UNITS[JOURNEY_UNITS.length - 1].unitNumber;
    if (isNowComplete && unitNumber < maxUnit) {
      updatedUnits[unitNumber + 1] = { ...updatedUnits[unitNumber + 1], unlocked: true };
    }

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = state.lessonStreakDays;
    if (state.lastLessonDate !== today) {
      newStreak = state.lastLessonDate === yesterday ? state.lessonStreakDays + 1 : 1;
    }

    const newTotalWords = state.totalCorrectWords + wordCorrectCount;

    set({
      units: updatedUnits,
      totalCorrectWords: newTotalWords,
      lastLessonDate: today,
      lessonStreakDays: newStreak,
    });
    get().save();

    useProgressStore.getState().addStars(result.starsEarned);

    const globalProgress = useProgressStore.getState();
    const earned = globalProgress.badgesEarned;
    const earn = (id: string) => {
      if (!earned.includes(id)) {
        useProgressStore.getState().earnBadge(id);
        newBadges.push(id);
      }
    };

    const totalCompleted = Object.values(updatedUnits).reduce((s, u) => s + u.lessonsCompleted, 0);
    if (totalCompleted === 1) earn('SPARKLE_STARTER');

    if (newTotalWords >= 5) earn('CRYSTAL_WORDS');

    if (result.starsEarned === 15) earn('ROYAL_PERFECTIONIST');

    if (newStreak >= 3) earn('MAGIC_STREAK');

    const unitBadgeMap: Record<number, string> = {
      1: 'UNICORN_MAGIC',
      2: 'WHALE_WHISPERER',
      3: 'MERMAID_VOWELS',
      4: 'DRAGON_TAMER',
      5: 'WORD_WEAVER',
      6: 'SIGHT_WORD_SORCERESS',
      7: 'STORY_QUEEN',
      8: 'SKATE_STAR',
      9: 'SEAL_SWIMMER',
      10: 'PARK_PRINCESS',
    };
    if (isNowComplete && unitBadgeMap[unitNumber]) earn(unitBadgeMap[unitNumber]);

    const allDone = JOURNEY_UNITS.every((u) => updatedUnits[u.unitNumber]?.lessonsCompleted >= 6);
    if (allDone) earn('READING_PRINCESS');

    return newBadges;
  },
}));
