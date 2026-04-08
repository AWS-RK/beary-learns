import type { Difficulty } from '../types/exercises';

export interface CountingConfig {
  minCount: number;
  maxCount: number;
  layout: 'row' | 'grid' | 'scattered';
  hintAlways: boolean;
}

export interface MathConfig {
  minOperand: number;
  maxOperand: number;
  showDotsAlways: boolean;
  showVisualAid: boolean;
}

export interface PronunciationConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  ttsRate: number;
  matchThreshold: number;
  maxAttempts: number;
  showPictureAlways: boolean;
  oneListen: boolean;
}

export interface DifficultyConfig {
  counting: CountingConfig;
  addition: MathConfig;
  subtraction: MathConfig;
  pronunciation: PronunciationConfig;
  questionsPerSession: number;
  timePressure: boolean;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    counting: { minCount: 1, maxCount: 5, layout: 'row', hintAlways: true },
    addition: { minOperand: 1, maxOperand: 5, showDotsAlways: true, showVisualAid: true },
    subtraction: { minOperand: 1, maxOperand: 5, showDotsAlways: true, showVisualAid: true },
    pronunciation: {
      difficulty: 'easy',
      ttsRate: 0.7,
      matchThreshold: 0.6,
      maxAttempts: 5,
      showPictureAlways: true,
      oneListen: false,
    },
    questionsPerSession: 5,
    timePressure: false,
  },
  medium: {
    counting: { minCount: 1, maxCount: 10, layout: 'grid', hintAlways: false },
    addition: { minOperand: 1, maxOperand: 10, showDotsAlways: false, showVisualAid: true },
    subtraction: { minOperand: 1, maxOperand: 10, showDotsAlways: false, showVisualAid: true },
    pronunciation: {
      difficulty: 'medium',
      ttsRate: 1.0,
      matchThreshold: 0.75,
      maxAttempts: 3,
      showPictureAlways: false,
      oneListen: false,
    },
    questionsPerSession: 7,
    timePressure: false,
  },
  hard: {
    counting: { minCount: 1, maxCount: 20, layout: 'scattered', hintAlways: false },
    addition: { minOperand: 1, maxOperand: 20, showDotsAlways: false, showVisualAid: false },
    subtraction: { minOperand: 1, maxOperand: 20, showDotsAlways: false, showVisualAid: false },
    pronunciation: {
      difficulty: 'hard',
      ttsRate: 1.0,
      matchThreshold: 0.9,
      maxAttempts: 2,
      showPictureAlways: false,
      oneListen: true,
    },
    questionsPerSession: 10,
    timePressure: false,
  },
};
