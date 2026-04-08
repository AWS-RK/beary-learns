import type { Subject, Difficulty } from './exercises';

export interface SubjectProgress {
  sessionsCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  highestDifficulty: Difficulty;
}

export interface ProgressData {
  totalStars: number;
  badgesEarned: string[];
  subjects: Record<Subject, SubjectProgress>;
  currentStreak: number;
  lastPlayedDate: string | null;
  daysPlayed: number;
}
