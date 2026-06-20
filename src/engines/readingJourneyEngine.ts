// src/engines/readingJourneyEngine.ts
import type { ReadingJourneyQuestion, WordRecognitionQuestion, ReadAloudQuestion, ComprehensionQuestion } from '../types/readingJourney';
import { JOURNEY_UNITS } from '../constants/readingJourneyContent';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickDistractorEmojis(correctEmoji: string, allWords: { word: string; emoji: string }[], count: number): string[] {
  const pool = allWords.filter((w) => w.emoji !== correctEmoji).map((w) => w.emoji);
  return shuffle(pool).slice(0, count);
}

export function generateLesson(unitNumber: number, lessonIndex: number): ReadingJourneyQuestion[] {
  const unit = JOURNEY_UNITS.find((u) => u.unitNumber === unitNumber);
  if (!unit) return [];

  // Unit 7 is all comprehension
  if (unitNumber === 7) {
    const items = shuffle(unit.comprehensionItems).slice(0, 5);
    return items.map((item): ComprehensionQuestion => ({
      type: 'comprehension',
      passage: item.passage,
      question: item.question,
      correctAnswer: item.answer,
      choices: shuffle(item.choices),
      audioPrompt: item.passage,
    }));
  }

  // For units 1–6: pick 4 words and 1 comprehension item for this lesson
  const wordPool = shuffle([...unit.words]);
  const offset = (lessonIndex * 4) % unit.words.length;
  const lessonWords = [...wordPool.slice(offset, offset + 4), ...wordPool.slice(0, Math.max(0, offset + 4 - unit.words.length))].slice(0, 4);

  const showPictureHint = unitNumber < 4;

  const q1: WordRecognitionQuestion = {
    type: 'word-recognition',
    word: lessonWords[0].word,
    correctEmoji: lessonWords[0].emoji,
    choices: shuffle([lessonWords[0].emoji, ...pickDistractorEmojis(lessonWords[0].emoji, unit.words, 2)]),
    audioPrompt: `Can you find the picture for the word: ${lessonWords[0].word}?`,
  };

  const q2: ReadAloudQuestion = {
    type: 'read-aloud',
    word: lessonWords[1].word,
    emoji: lessonWords[1].emoji,
    showPictureHint,
    matchThreshold: 0.75,
    audioPrompt: 'Your turn! Read this word.',
  };

  const q3: WordRecognitionQuestion = {
    type: 'word-recognition',
    word: lessonWords[2].word,
    correctEmoji: lessonWords[2].emoji,
    choices: shuffle([lessonWords[2].emoji, ...pickDistractorEmojis(lessonWords[2].emoji, unit.words, 2)]),
    audioPrompt: `Can you find the picture for the word: ${lessonWords[2].word}?`,
  };

  const q4: ReadAloudQuestion = {
    type: 'read-aloud',
    word: lessonWords[3].word,
    emoji: lessonWords[3].emoji,
    showPictureHint,
    matchThreshold: 0.75,
    audioPrompt: 'Your turn! Read this word.',
  };

  const compItem = unit.comprehensionItems[lessonIndex % unit.comprehensionItems.length];
  const q5: ComprehensionQuestion = {
    type: 'comprehension',
    passage: compItem.passage,
    question: compItem.question,
    correctAnswer: compItem.answer,
    choices: shuffle(compItem.choices),
    audioPrompt: compItem.passage,
  };

  return [q1, q2, q3, q4, q5];
}
