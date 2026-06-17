// src/types/readingJourney.ts

export interface WordItem {
  word: string;
  emoji: string;
}

export interface ComprehensionItem {
  passage: string;
  question: string;
  answer: string;
  choices: string[]; // exactly 3, answer is one of them
}

export interface UnitContent {
  unitNumber: number;
  title: string;
  pattern: string;
  badgeId: string;
  words: WordItem[];
  comprehensionItems: ComprehensionItem[];
}

export interface WordRecognitionQuestion {
  type: 'word-recognition';
  word: string;
  correctEmoji: string;
  choices: string[];    // 3 emojis, shuffled, correctEmoji is one of them
  audioPrompt: string;
}

export interface ReadAloudQuestion {
  type: 'read-aloud';
  word: string;
  emoji: string;
  showPictureHint: boolean;  // false for units 4+
  matchThreshold: number;
  audioPrompt: string;
}

export interface ComprehensionQuestion {
  type: 'comprehension';
  passage: string;
  question: string;
  correctAnswer: string;
  choices: string[];    // 3 choices, shuffled, correctAnswer is one of them
  audioPrompt: string;
}

export type ReadingJourneyQuestion =
  | WordRecognitionQuestion
  | ReadAloudQuestion
  | ComprehensionQuestion;

export interface QuestionResult {
  correct: boolean;
  starsEarned: number;   // 3 = first try, 2 = second try, 1 = third+
  attempts: number;
}

export interface LessonResult {
  lessonIndex: number;    // 0–7
  passed: boolean;        // always true for a completed lesson
  starsEarned: number;    // sum of all 5 QuestionResult.starsEarned (max 15)
  correctAnswers: number; // always 5 for a passed lesson
  attemptedAt: string;    // ISO date string
}

export interface UnitProgress {
  unitNumber: number;
  unlocked: boolean;
  lessonsCompleted: number;  // count of passed lessons
  lessonsAttempted: number;
  starsEarned: number;       // total across all lessons
  completedAt: string | null;
  lessonResults: LessonResult[];
}

export interface ReadingJourneyProgress {
  units: Record<number, UnitProgress>;
  totalCorrectWords: number;  // for CRYSTAL_WORDS badge (5 correct answers)
  lastLessonDate: string | null;
  lessonStreakDays: number;   // consecutive days with a passed lesson
}
