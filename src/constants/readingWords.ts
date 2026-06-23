export interface ReadingWord {
  word: string;
  emoji: string;
}

export const EASY_WORDS: ReadingWord[] = [
  { word: 'cat', emoji: '🐱' },
  { word: 'dog', emoji: '🐶' },
  { word: 'sun', emoji: '☀️' },
  { word: 'hat', emoji: '🎩' },
  { word: 'cup', emoji: '☕' },
  { word: 'pig', emoji: '🐷' },
  { word: 'fox', emoji: '🦊' },
  { word: 'hen', emoji: '🐔' },
  { word: 'bug', emoji: '🐛' },
  { word: 'car', emoji: '🚗' },
  { word: 'fish', emoji: '🐟' },
  { word: 'duck', emoji: '🦆' },
  { word: 'tree', emoji: '🌳' },
  { word: 'ball', emoji: '⚽' },
  { word: 'star', emoji: '⭐' },
];

export const MEDIUM_WORDS: ReadingWord[] = [
  { word: 'apple', emoji: '🍎' },
  { word: 'house', emoji: '🏠' },
  { word: 'bird', emoji: '🐦' },
  { word: 'cloud', emoji: '☁️' },
  { word: 'moon', emoji: '🌙' },
  { word: 'flower', emoji: '🌸' },
  { word: 'rabbit', emoji: '🐰' },
  { word: 'turtle', emoji: '🐢' },
  { word: 'horse', emoji: '🐴' },
  { word: 'heart', emoji: '❤️' },
  { word: 'crown', emoji: '👑' },
  { word: 'plane', emoji: '✈️' },
  { word: 'train', emoji: '🚂' },
  { word: 'rain', emoji: '🌧️' },
  { word: 'snow', emoji: '❄️' },
];

export const HARD_SENTENCES: Array<{ sentence: string; emoji: string }> = [
  { sentence: 'The sun is hot and bright', emoji: '☀️' },
  { sentence: 'The dog runs very fast', emoji: '🐶' },
  { sentence: 'It is raining outside', emoji: '🌧️' },
  { sentence: 'The bird can fly up high', emoji: '🐦' },
  { sentence: 'The cat is fast asleep', emoji: '🐱' },
  { sentence: 'There is snow on the ground', emoji: '❄️' },
  { sentence: 'The rabbit hops away', emoji: '🐰' },
  { sentence: 'The flower is pretty and pink', emoji: '🌸' },
  { sentence: 'The fish swims in the water', emoji: '🐟' },
  { sentence: 'The moon shines at night', emoji: '🌙' },
  { sentence: 'A big heart means love', emoji: '❤️' },
  { sentence: 'The train goes very fast', emoji: '🚂' },
];
