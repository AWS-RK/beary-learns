import type { Badge } from '../types/rewards';

export const BADGES: Record<string, Badge> = {
  FIRST_STEP: {
    id: 'FIRST_STEP',
    name: 'First Step!',
    description: 'Complete your very first exercise',
    emoji: '🌟',
    color: '#FFE66D',
  },
  COUNTER_5: {
    id: 'COUNTER_5',
    name: 'Counter Cub',
    description: 'Count to 5 correctly 10 times',
    emoji: '🐾',
    color: '#FF6B6B',
  },
  COUNTER_10: {
    id: 'COUNTER_10',
    name: 'Counter Pro',
    description: 'Count to 10 correctly 10 times',
    emoji: '🔢',
    color: '#FF6B6B',
  },
  ADDER_BEGINNER: {
    id: 'ADDER_BEGINNER',
    name: 'Adder Pal',
    description: 'Complete 5 addition exercises',
    emoji: '➕',
    color: '#4ECDC4',
  },
  ADDER_PRO: {
    id: 'ADDER_PRO',
    name: 'Math Wizard',
    description: 'Complete 20 addition exercises',
    emoji: '🧙',
    color: '#4ECDC4',
  },
  SUBTRACT_START: {
    id: 'SUBTRACT_START',
    name: 'Subtractor',
    description: 'Complete your first subtraction',
    emoji: '➖',
    color: '#A78BFA',
  },
  WORD_STAR: {
    id: 'WORD_STAR',
    name: 'Word Star',
    description: 'Pronounce 5 words correctly',
    emoji: '🎤',
    color: '#F6C90E',
  },
  VOICE_HERO: {
    id: 'VOICE_HERO',
    name: 'Voice Hero',
    description: 'Use voice input 10 times',
    emoji: '🦸',
    color: '#FF6B6B',
  },
  HARD_MODE: {
    id: 'HARD_MODE',
    name: 'Brave Bear',
    description: 'Complete an exercise on Hard difficulty',
    emoji: '🏆',
    color: '#FF6B6B',
  },
  STREAK_3: {
    id: 'STREAK_3',
    name: 'On a Roll!',
    description: 'Get 3 correct answers in a row',
    emoji: '🔥',
    color: '#FFE66D',
  },
  STREAK_5: {
    id: 'STREAK_5',
    name: 'Superstar!',
    description: 'Get 5 correct answers in a row',
    emoji: '⭐',
    color: '#FFE66D',
  },
  DAILY_LEARNER: {
    id: 'DAILY_LEARNER',
    name: 'Daily Learner',
    description: 'Use the app 3 days in a row',
    emoji: '📅',
    color: '#4ECDC4',
  },
  STAR_COLLECTOR: {
    id: 'STAR_COLLECTOR',
    name: 'Star Collector',
    description: 'Earn 50 total stars',
    emoji: '💫',
    color: '#FFE66D',
  },
};

export const BADGE_IDS = Object.keys(BADGES) as (keyof typeof BADGES)[];
