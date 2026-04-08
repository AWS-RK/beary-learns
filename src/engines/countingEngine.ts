import type { CountingQuestion, Difficulty } from '../types/exercises';
import { DIFFICULTY_CONFIG } from './difficultyConfig';

const COUNTING_EMOJIS = ['⭐', '🌸', '🐾', '🍎', '🐝', '🦋', '🌈', '🎈', '🍭', '🐠'];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateCountingQuestion(difficulty: Difficulty): CountingQuestion {
  const config = DIFFICULTY_CONFIG[difficulty].counting;
  const count = randomBetween(config.minCount, config.maxCount);
  const emoji = COUNTING_EMOJIS[Math.floor(Math.random() * COUNTING_EMOJIS.length)];

  return {
    type: 'counting',
    count,
    emoji,
    answer: count,
    hint: `Count each ${emoji} one by one: 1, 2, 3...`,
  };
}

export function generateCountingSession(difficulty: Difficulty): CountingQuestion[] {
  const count = DIFFICULTY_CONFIG[difficulty].questionsPerSession;
  return Array.from({ length: count }, () => generateCountingQuestion(difficulty));
}
