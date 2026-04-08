import type { MathQuestion, Difficulty } from '../types/exercises';
import { DIFFICULTY_CONFIG } from './difficultyConfig';

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSubtractionQuestion(difficulty: Difficulty): MathQuestion {
  const config = DIFFICULTY_CONFIG[difficulty].subtraction;
  const a = randomBetween(config.minOperand, config.maxOperand);
  // b is always <= a so result is never negative
  const b = randomBetween(0, a);

  return {
    type: 'subtraction',
    a,
    b,
    answer: a - b,
    hint: `Start with ${a} and take away ${b}. Cross them out one by one!`,
    showDots: config.showDotsAlways,
  };
}

export function generateSubtractionSession(difficulty: Difficulty): MathQuestion[] {
  const count = DIFFICULTY_CONFIG[difficulty].questionsPerSession;
  return Array.from({ length: count }, () => generateSubtractionQuestion(difficulty));
}
