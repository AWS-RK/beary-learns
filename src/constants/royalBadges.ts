// src/constants/royalBadges.ts
export interface RoyalBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  message: string;
}

export const ROYAL_BADGES: Record<string, RoyalBadge> = {
  SPARKLE_STARTER: {
    id: 'SPARKLE_STARTER',
    name: 'Sparkle Starter',
    emoji: '✨',
    description: 'Complete your first Reading Journey lesson',
    color: '#A78BFA',
    message: 'You took your very first step on the Royal Reading Road! Every great princess started right here. ✨',
  },
  CRYSTAL_WORDS: {
    id: 'CRYSTAL_WORDS',
    name: 'Crystal Words',
    emoji: '💎',
    description: 'Read 5 words correctly in the Journey',
    color: '#60A5FA',
    message: 'Your words shine like precious crystals! You read 5 words perfectly. Keep sparkling! 💎',
  },
  UNICORN_MAGIC: {
    id: 'UNICORN_MAGIC',
    name: 'Unicorn Magic',
    emoji: '🦄',
    description: 'Complete Unit 1: Magic E',
    color: '#F472B6',
    message: 'You mastered Magic E words — you made silent letters come alive! Only a true unicorn reader can do that. 🦄',
  },
  WHALE_WHISPERER: {
    id: 'WHALE_WHISPERER',
    name: 'Whale Whisperer',
    emoji: '🐋',
    description: 'Complete Unit 2: th and wh Words',
    color: '#38BDF8',
    message: 'You tamed the trickiest sounds — th and wh! Now you speak the language of whales and wizards. 🐋',
  },
  MERMAID_VOWELS: {
    id: 'MERMAID_VOWELS',
    name: 'Mermaid Vowels',
    emoji: '🧜‍♀️',
    description: 'Complete Unit 3: Vowel Teams',
    color: '#34D399',
    message: 'You swim through vowel teams like a mermaid through the sea! CVVC words hold no secrets from you. 🧜‍♀️',
  },
  DRAGON_TAMER: {
    id: 'DRAGON_TAMER',
    name: 'Dragon Tamer',
    emoji: '🌹',
    description: 'Complete Unit 4: R-Controlled Vowels',
    color: '#F87171',
    message: 'R-controlled vowels used to roar like dragons — but YOU tamed them all! You are fearless! 🌹',
  },
  WORD_WEAVER: {
    id: 'WORD_WEAVER',
    name: 'Word Weaver',
    emoji: '🦋',
    description: 'Complete Unit 5: Compound Words',
    color: '#FB923C',
    message: 'You wove two words into one like magic! Compound words are your superpower now. 🦋',
  },
  SIGHT_WORD_SORCERESS: {
    id: 'SIGHT_WORD_SORCERESS',
    name: 'Sight Word Sorceress',
    emoji: '🔮',
    description: 'Complete Unit 6: Sight Words',
    color: '#C084FC',
    message: 'You know the secret words that appear in every story! Now you can read anything. 🔮',
  },
  STORY_QUEEN: {
    id: 'STORY_QUEEN',
    name: 'Story Queen',
    emoji: '📖',
    description: 'Complete Unit 7: Sentence Comprehension',
    color: '#FBBF24',
    message: 'You understand every story you read — that is the greatest magic of all! 📖',
  },
  ROYAL_PERFECTIONIST: {
    id: 'ROYAL_PERFECTIONIST',
    name: 'Royal Perfectionist',
    emoji: '⭐',
    description: 'Score 5/5 on any lesson',
    color: '#F59E0B',
    message: 'Five out of five — a PERFECT score! Only a true princess of reading can do that. Bow down! ⭐',
  },
  MAGIC_STREAK: {
    id: 'MAGIC_STREAK',
    name: 'Magic Streak',
    emoji: '🔥',
    description: 'Complete a lesson 3 days in a row',
    color: '#EF4444',
    message: 'Three days of reading magic in a row! Your royal powers grow stronger every day! 🔥',
  },
  READING_PRINCESS: {
    id: 'READING_PRINCESS',
    name: 'Reading Princess',
    emoji: '👸',
    description: 'Complete ALL 7 units',
    color: '#EC4899',
    message: 'YOU DID IT! You completed the entire Royal Reading Journey! You are the one true Reading Princess! 👸✨👑',
  },
};

export const ROYAL_BADGE_IDS = Object.keys(ROYAL_BADGES);
