export type Subject = 'counting' | 'addition' | 'subtraction' | 'pronunciation';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CountingQuestion {
  type: 'counting';
  count: number;
  emoji: string;
  answer: number;
  hint: string;
}

export interface MathQuestion {
  type: 'addition' | 'subtraction';
  a: number;
  b: number;
  answer: number;
  hint: string;
  showDots: boolean;
}

export interface PronunciationQuestion {
  type: 'pronunciation';
  word: string;
  emoji: string;
  answer: string;
  slowRate: number;
  matchThreshold: number;
}

export type Question = CountingQuestion | MathQuestion | PronunciationQuestion;

export interface AnswerResult {
  correct: boolean;
  stars: number;
  usedHint: boolean;
}
