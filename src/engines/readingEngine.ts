import type { ReadingQuestion } from '../types/exercises';
import type { Difficulty } from '../types/exercises';
import { EASY_WORDS, MEDIUM_WORDS, HARD_SENTENCES } from '../constants/readingWords';
import { DIFFICULTY_CONFIG } from './difficultyConfig';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function generateReadingSession(difficulty: Difficulty): ReadingQuestion[] {
  const count = DIFFICULTY_CONFIG[difficulty].questionsPerSession;

  if (difficulty === 'easy') {
    const pool = shuffle(EASY_WORDS);
    return pool.slice(0, count).map((item) => {
      const distractors = EASY_WORDS.filter((w) => w.emoji !== item.emoji);
      const choices = shuffle([item.emoji, ...pickN(distractors, 2).map((d) => d.emoji)]);
      return {
        type: 'reading',
        mode: 'word-to-picture',
        prompt: item.word,
        answer: item.emoji,
        choices,
        audioPrompt: `Can you find the picture for the word: ${item.word}?`,
      };
    });
  }

  if (difficulty === 'medium') {
    const pool = shuffle(MEDIUM_WORDS);
    return pool.slice(0, count).map((item) => {
      const distractors = MEDIUM_WORDS.filter((w) => w.word !== item.word);
      const choices = shuffle([item.word, ...pickN(distractors, 2).map((d) => d.word)]);
      return {
        type: 'reading',
        mode: 'picture-to-word',
        prompt: item.emoji,
        answer: item.word,
        choices,
        audioPrompt: `Which word matches this picture?`,
      };
    });
  }

  // hard: sentence-to-picture
  const pool = shuffle(HARD_SENTENCES);
  return pool.slice(0, count).map((item) => {
    const distractors = HARD_SENTENCES.filter((s) => s.emoji !== item.emoji);
    const choices = shuffle([item.emoji, ...pickN(distractors, 2).map((d) => d.emoji)]);
    return {
      type: 'reading',
      mode: 'sentence-to-picture',
      prompt: item.sentence,
      answer: item.emoji,
      choices,
      audioPrompt: item.sentence,
    };
  });
}
