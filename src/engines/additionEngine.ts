import type { MathQuestion, Difficulty } from '../types/exercises';
import { DIFFICULTY_CONFIG } from './difficultyConfig';

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateAdditionQuestion(difficulty: Difficulty): MathQuestion {
  const config = DIFFICULTY_CONFIG[difficulty].addition;
  const a = randomBetween(config.minOperand, config.maxOperand);
  const b = randomBetween(config.minOperand, config.maxOperand);

  return {
    type: 'addition',
    a,
    b,
    answer: a + b,
    hint: `Count all ${a} and ${b} together!`,
    showDots: config.showDotsAlways,
  };
}

export function generateAdditionSession(difficulty: Difficulty): MathQuestion[] {
  const count = DIFFICULTY_CONFIG[difficulty].questionsPerSession;
  return Array.from({ length: count }, () => generateAdditionQuestion(difficulty));
}
