import type { PronunciationQuestion, Difficulty } from '../types/exercises';
import { WORD_LISTS } from '../constants/wordLists';
import { DIFFICULTY_CONFIG } from './difficultyConfig';

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function scorePronunciation(spoken: string, target: string, threshold: number): boolean {
  const s = spoken.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (s === t) return true;
  const maxLen = Math.max(s.length, t.length);
  if (maxLen === 0) return true;
  const similarity = 1 - levenshtein(s, t) / maxLen;
  return similarity >= threshold;
}

export function generatePronunciationQuestion(difficulty: Difficulty): PronunciationQuestion {
  const config = DIFFICULTY_CONFIG[difficulty].pronunciation;
  const list = WORD_LISTS[difficulty];
  const item = list[Math.floor(Math.random() * list.length)];

  return {
    type: 'pronunciation',
    word: item.word,
    emoji: item.emoji,
    answer: item.word,
    slowRate: config.ttsRate,
    matchThreshold: config.matchThreshold,
  };
}

export function generatePronunciationSession(difficulty: Difficulty): PronunciationQuestion[] {
  const count = DIFFICULTY_CONFIG[difficulty].questionsPerSession;
  const list = WORD_LISTS[difficulty];
  // Shuffle and pick unique words
  const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, count);
  const config = DIFFICULTY_CONFIG[difficulty].pronunciation;
  return shuffled.map((item) => ({
    type: 'pronunciation' as const,
    word: item.word,
    emoji: item.emoji,
    answer: item.word,
    slowRate: config.ttsRate,
    matchThreshold: config.matchThreshold,
  }));
}
