# Reading Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 7-unit princess-themed reading program inside Beary Learns, replacing the basic Reading module with a mastery-based journey covering Magic E, th/wh, Vowel Teams, R-Controlled, Compound Words, Sight Words, and Sentence Comprehension.

**Architecture:** A new `ReadingJourneyStore` (Zustand + AsyncStorage) tracks per-unit/lesson progress separately from the existing progress store. A unit map screen (`app/reading-journey.tsx`) shows 7 sequential units; tapping GO launches a 5-question lesson screen (`app/(sessions)/reading-lesson.tsx`) that cycles through Word Recognition → Read Aloud → Word Recognition → Read Aloud → Comprehension, then navigates to a results screen. The home screen's Reading card is rewired to go to the journey map instead of difficulty-select.

**Tech Stack:** Expo SDK 52, Expo Router v4, Zustand 5, expo-speech (TTS), expo-speech-recognition + Web Speech API (STT), react-native-reanimated 3, AsyncStorage, TypeScript.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| CREATE | `src/types/readingJourney.ts` | All TS types for questions, unit progress, lesson results |
| CREATE | `src/constants/readingJourneyContent.ts` | 7 unit word lists + comprehension items |
| CREATE | `src/constants/royalBadges.ts` | 12 princess badge definitions with personal unlock messages |
| CREATE | `src/store/readingJourneyStore.ts` | Zustand store — progress, badge logic, unlock logic |
| CREATE | `src/engines/readingJourneyEngine.ts` | Generates 5-question lessons per unit |
| CREATE | `src/components/exercises/WordRecognitionExercise.tsx` | Exercise A: word → tap emoji |
| CREATE | `src/components/exercises/ReadAloudExercise.tsx` | Exercise C: word + emoji → speak into mic |
| CREATE | `src/components/exercises/ComprehensionExercise.tsx` | Exercise D: passage → tap correct answer |
| CREATE | `src/components/journey/UnitCard.tsx` | Unit card: active / locked / complete states |
| CREATE | `src/components/journey/RoyalBadgeUnlock.tsx` | Princess-themed badge modal |
| CREATE | `app/reading-journey.tsx` | Unit map screen |
| CREATE | `app/(sessions)/reading-lesson.tsx` | 5-question lesson screen |
| CREATE | `app/reading-results.tsx` | Post-lesson results screen |
| MODIFY | `src/constants/badges.ts` | Add 12 royal badge IDs (type only — definitions in royalBadges.ts) |
| MODIFY | `app/index.tsx` | Reading card → `/reading-journey` |
| MODIFY | `app/difficulty-select.tsx` | Remove reading case |
| DELETE | `app/(sessions)/reading.tsx` | Replaced by reading-lesson.tsx |
| DELETE | `src/components/exercises/ReadingExercise.tsx` | Replaced by 3 focused components |

---

## Task 1: Types

**Files:**
- Create: `src/types/readingJourney.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/types/readingJourney.ts

export interface WordItem {
  word: string;
  emoji: string;
}

export interface ComprehensionItem {
  passage: string;
  question: string;
  answer: string;
  choices: string[]; // exactly 3, answer is one of them
}

export interface UnitContent {
  unitNumber: number;
  title: string;
  pattern: string;
  badgeId: string;
  words: WordItem[];
  comprehensionItems: ComprehensionItem[];
}

export interface WordRecognitionQuestion {
  type: 'word-recognition';
  word: string;
  correctEmoji: string;
  choices: string[];    // 3 emojis, shuffled, correctEmoji is one of them
  audioPrompt: string;
}

export interface ReadAloudQuestion {
  type: 'read-aloud';
  word: string;
  emoji: string;
  showPictureHint: boolean;  // false for units 4+
  matchThreshold: number;
  audioPrompt: string;
}

export interface ComprehensionQuestion {
  type: 'comprehension';
  passage: string;
  question: string;
  correctAnswer: string;
  choices: string[];    // 3 choices, shuffled, correctAnswer is one of them
  audioPrompt: string;
}

export type ReadingJourneyQuestion =
  | WordRecognitionQuestion
  | ReadAloudQuestion
  | ComprehensionQuestion;

export interface QuestionResult {
  correct: boolean;
  starsEarned: number;   // 3 = first try, 2 = second try, 1 = third+
  attempts: number;
}

export interface LessonResult {
  lessonIndex: number;    // 0–7
  passed: boolean;        // always true for a completed lesson
  starsEarned: number;    // sum of all 5 QuestionResult.starsEarned (max 15)
  correctAnswers: number; // always 5 for a passed lesson
  attemptedAt: string;    // ISO date string
}

export interface UnitProgress {
  unitNumber: number;
  unlocked: boolean;
  lessonsCompleted: number;  // count of passed lessons
  lessonsAttempted: number;
  starsEarned: number;       // total across all lessons
  completedAt: string | null;
  lessonResults: LessonResult[];
}

export interface ReadingJourneyProgress {
  units: Record<number, UnitProgress>;
  totalCorrectWords: number;  // for CRYSTAL_WORDS badge (5 correct answers)
  lastLessonDate: string | null;
  lessonStreakDays: number;   // consecutive days with a passed lesson
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/readingJourney.ts
git commit -m "feat(journey): add ReadingJourney TypeScript types"
```

---

## Task 2: Content — Word Lists & Comprehension Items

**Files:**
- Create: `src/constants/readingJourneyContent.ts`

- [ ] **Step 1: Create the content file**

```typescript
// src/constants/readingJourneyContent.ts
import type { UnitContent } from '../types/readingJourney';

export const JOURNEY_UNITS: UnitContent[] = [
  {
    unitNumber: 1,
    title: 'Magic E',
    pattern: 'CVCe — silent E makes the vowel say its name',
    badgeId: 'UNICORN_MAGIC',
    words: [
      { word: 'cake', emoji: '🎂' },
      { word: 'bike', emoji: '🚲' },
      { word: 'home', emoji: '🏠' },
      { word: 'cute', emoji: '🐱' },
      { word: 'time', emoji: '⏰' },
      { word: 'rope', emoji: '🪢' },
      { word: 'late', emoji: '🌙' },
      { word: 'pine', emoji: '🌲' },
      { word: 'kite', emoji: '🪁' },
      { word: 'note', emoji: '📝' },
      { word: 'cube', emoji: '🧊' },
      { word: 'mole', emoji: '🐭' },
      { word: 'fame', emoji: '⭐' },
      { word: 'huge', emoji: '🐘' },
      { word: 'made', emoji: '🍰' },
    ],
    comprehensionItems: [
      {
        passage: 'Jake baked a big cake. He put it on the table at home.',
        question: 'What did Jake bake?',
        answer: 'a cake',
        choices: ['a cake', 'a kite', 'a note'],
      },
      {
        passage: 'I like to ride my bike. I ride it to the pine tree.',
        question: 'Where does she ride her bike?',
        answer: 'to the pine tree',
        choices: ['to the pine tree', 'to the lake', 'to the cube'],
      },
      {
        passage: 'The cute cat made a huge mess. It was late at night.',
        question: 'When did the cat make a mess?',
        answer: 'late at night',
        choices: ['late at night', 'at home', 'on the rope'],
      },
      {
        passage: 'She flew a kite on a rope. It went up and up in the sky.',
        question: 'What held the kite up?',
        answer: 'a rope',
        choices: ['a rope', 'a cube', 'a note'],
      },
      {
        passage: 'He wrote a note about his bike ride. It was a fun time.',
        question: 'What did he write about?',
        answer: 'his bike ride',
        choices: ['his bike ride', 'his kite', 'his home'],
      },
    ],
  },
  {
    unitNumber: 2,
    title: 'th / wh Words',
    pattern: 'Digraph reinforcement with richer vocabulary',
    badgeId: 'WHALE_WHISPERER',
    words: [
      { word: 'thick', emoji: '📏' },
      { word: 'thin', emoji: '🪡' },
      { word: 'three', emoji: '3️⃣' },
      { word: 'throw', emoji: '🥎' },
      { word: 'thumb', emoji: '👍' },
      { word: 'teeth', emoji: '🦷' },
      { word: 'cloth', emoji: '🧣' },
      { word: 'math', emoji: '🔢' },
      { word: 'bath', emoji: '🛁' },
      { word: 'whale', emoji: '🐋' },
      { word: 'wheat', emoji: '🌾' },
      { word: 'wheel', emoji: '⚙️' },
      { word: 'white', emoji: '🤍' },
      { word: 'whisper', emoji: '🤫' },
      { word: 'whistle', emoji: '🎵' },
    ],
    comprehensionItems: [
      {
        passage: 'The whale is white and very thick. It swims in the deep sea.',
        question: 'What color is the whale?',
        answer: 'white',
        choices: ['white', 'thin', 'wheat'],
      },
      {
        passage: 'Three thin kittens had a bath. They used a soft white cloth.',
        question: 'How many kittens had a bath?',
        answer: 'three',
        choices: ['three', 'thick', 'two'],
      },
      {
        passage: 'She whispered the math answer to her friend. They did not want to throw the test.',
        question: 'What did she whisper?',
        answer: 'the math answer',
        choices: ['the math answer', 'the wheel', 'the wheat'],
      },
      {
        passage: 'The thick wheel on the cart has three bolts. It does not throw off the cloth.',
        question: 'What is thick?',
        answer: 'the wheel',
        choices: ['the wheel', 'the whale', 'the bath'],
      },
      {
        passage: 'He blew the whistle with his thumb. The whole team could hear it.',
        question: 'What did he blow?',
        answer: 'the whistle',
        choices: ['the whistle', 'the wheel', 'the wheat'],
      },
    ],
  },
  {
    unitNumber: 3,
    title: 'Vowel Teams',
    pattern: 'CVVC — two vowels make one long sound',
    badgeId: 'MERMAID_VOWELS',
    words: [
      { word: 'rain', emoji: '🌧️' },
      { word: 'tail', emoji: '🦊' },
      { word: 'mail', emoji: '📬' },
      { word: 'braid', emoji: '💇' },
      { word: 'beat', emoji: '🥁' },
      { word: 'meat', emoji: '🥩' },
      { word: 'feet', emoji: '👣' },
      { word: 'seed', emoji: '🌱' },
      { word: 'tree', emoji: '🌳' },
      { word: 'boat', emoji: '⛵' },
      { word: 'coat', emoji: '🧥' },
      { word: 'road', emoji: '🛣️' },
      { word: 'pool', emoji: '🏊' },
      { word: 'food', emoji: '🍱' },
      { word: 'moon', emoji: '🌙' },
    ],
    comprehensionItems: [
      {
        passage: 'The rain fell on the green tree. The seed in the soil got a good drink.',
        question: 'What got a drink of water?',
        answer: 'the seed',
        choices: ['the seed', 'the boat', 'the coat'],
      },
      {
        passage: 'She put on her coat in the rain. Then she ran down the road to get the mail.',
        question: 'What did she wear in the rain?',
        answer: 'her coat',
        choices: ['her coat', 'her braid', 'her tail'],
      },
      {
        passage: 'A small boat floated on the pool under the moon. It had food on it.',
        question: 'Where was the boat?',
        answer: 'on the pool',
        choices: ['on the pool', 'on the road', 'on the tree'],
      },
      {
        passage: 'The fox wagged its tail and beat its feet on the road. It ran to find food.',
        question: 'What did the fox wag?',
        answer: 'its tail',
        choices: ['its tail', 'its coat', 'its braid'],
      },
      {
        passage: 'She braided her hair and ate some meat with her feet in the pool.',
        question: 'Where were her feet?',
        answer: 'in the pool',
        choices: ['in the pool', 'on the road', 'in the rain'],
      },
    ],
  },
  {
    unitNumber: 4,
    title: 'R-Controlled Vowels',
    pattern: 'R changes the vowel sound (ar, ir, er, or, ur)',
    badgeId: 'DRAGON_TAMER',
    words: [
      { word: 'car', emoji: '🚗' },
      { word: 'star', emoji: '⭐' },
      { word: 'farm', emoji: '🏡' },
      { word: 'bark', emoji: '🌳' },
      { word: 'jar', emoji: '🫙' },
      { word: 'bird', emoji: '🐦' },
      { word: 'girl', emoji: '👧' },
      { word: 'shirt', emoji: '👕' },
      { word: 'her', emoji: '👩' },
      { word: 'fern', emoji: '🌿' },
      { word: 'corn', emoji: '🌽' },
      { word: 'horn', emoji: '📯' },
      { word: 'storm', emoji: '⛈️' },
      { word: 'fur', emoji: '🦊' },
      { word: 'burn', emoji: '🔥' },
    ],
    comprehensionItems: [
      {
        passage: 'The girl wore her star shirt to the farm. She fed corn to the birds.',
        question: 'What did she wear to the farm?',
        answer: 'her star shirt',
        choices: ['her star shirt', 'her fur coat', 'her horn'],
      },
      {
        passage: 'A bird sat on the bark of the tree near the farm. It had brown fur.',
        question: 'Where did the bird sit?',
        answer: 'on the bark',
        choices: ['on the bark', 'in the jar', 'on the horn'],
      },
      {
        passage: 'The storm hit the farm hard. Her car got stuck in the mud near the barn.',
        question: 'What got stuck in the mud?',
        answer: 'her car',
        choices: ['her car', 'her fern', 'her shirt'],
      },
      {
        passage: 'She put a fern in a big jar. She kept it on the shelf near the horn.',
        question: 'Where did she put the fern?',
        answer: 'in a jar',
        choices: ['in a jar', 'in the car', 'on the farm'],
      },
      {
        passage: 'The fur on the dog got a burn from the hot corn. It hurt a lot.',
        question: 'What burned the dog\'s fur?',
        answer: 'the hot corn',
        choices: ['the hot corn', 'the storm', 'the bark'],
      },
    ],
  },
  {
    unitNumber: 5,
    title: 'Compound Words',
    pattern: 'Two smaller words joined into one new word',
    badgeId: 'WORD_WEAVER',
    words: [
      { word: 'sunshine', emoji: '☀️' },
      { word: 'cupcake', emoji: '🧁' },
      { word: 'football', emoji: '🏈' },
      { word: 'rainbow', emoji: '🌈' },
      { word: 'bedroom', emoji: '🛏️' },
      { word: 'butterfly', emoji: '🦋' },
      { word: 'lunchbox', emoji: '🍱' },
      { word: 'starfish', emoji: '⭐' },
      { word: 'treehouse', emoji: '🌳' },
      { word: 'birthday', emoji: '🎂' },
      { word: 'notebook', emoji: '📓' },
      { word: 'snowball', emoji: '⛄' },
      { word: 'popcorn', emoji: '🍿' },
      { word: 'firefly', emoji: '✨' },
      { word: 'sandbox', emoji: '🏖️' },
    ],
    comprehensionItems: [
      {
        passage: 'The sunshine made a rainbow in the sky. A butterfly flew under it.',
        question: 'What made the rainbow?',
        answer: 'the sunshine',
        choices: ['the sunshine', 'the firefly', 'the snowball'],
      },
      {
        passage: 'She got a notebook and a cupcake for her birthday. She put them in her bedroom.',
        question: 'What did she get for her birthday?',
        answer: 'a notebook and a cupcake',
        choices: ['a notebook and a cupcake', 'a football and a lunchbox', 'a treehouse and a sandbox'],
      },
      {
        passage: 'A firefly lit up the treehouse at night. The kids ate popcorn and watched it glow.',
        question: 'What did the firefly light up?',
        answer: 'the treehouse',
        choices: ['the treehouse', 'the sandbox', 'the bedroom'],
      },
      {
        passage: 'He packed a sandwich and popcorn in his lunchbox. He found a starfish near the sandbox.',
        question: 'What was in his lunchbox?',
        answer: 'a sandwich and popcorn',
        choices: ['a sandwich and popcorn', 'a cupcake and a notebook', 'a snowball and a football'],
      },
      {
        passage: 'The kids made a snowball and played football in the sunshine. Then they ate birthday cupcakes.',
        question: 'What did they make?',
        answer: 'a snowball',
        choices: ['a snowball', 'a lunchbox', 'a starfish'],
      },
    ],
  },
  {
    unitNumber: 6,
    title: 'Sight Words',
    pattern: 'High-frequency words that don\'t follow phonics rules',
    badgeId: 'SIGHT_WORD_SORCERESS',
    words: [
      { word: 'said', emoji: '💬' },
      { word: 'come', emoji: '🚶' },
      { word: 'because', emoji: '💡' },
      { word: 'friend', emoji: '🤝' },
      { word: 'people', emoji: '👨‍👩‍👧' },
      { word: 'water', emoji: '💧' },
      { word: 'many', emoji: '🔢' },
      { word: 'where', emoji: '📍' },
      { word: 'were', emoji: '⏪' },
      { word: 'their', emoji: '👐' },
      { word: 'some', emoji: '🤏' },
      { word: 'have', emoji: '🫴' },
      { word: 'from', emoji: '📤' },
      { word: 'every', emoji: '🔄' },
      { word: 'could', emoji: '💪' },
    ],
    comprehensionItems: [
      {
        passage: 'She said she could come to the party. Many people were there from her school.',
        question: 'What did she say she could do?',
        answer: 'come to the party',
        choices: ['come to the party', 'have some water', 'go from there'],
      },
      {
        passage: 'People were thirsty because there was no water. Every friend had to come and help.',
        question: 'Why were people thirsty?',
        answer: 'there was no water',
        choices: ['there was no water', 'they were tired', 'their friend said so'],
      },
      {
        passage: 'She did not know where her friend was. She could have some help from her mom.',
        question: 'Who could help her?',
        answer: 'her mom',
        choices: ['her mom', 'every person', 'some water'],
      },
      {
        passage: 'Many people said the food from their friend was good. Every one of them could have some more.',
        question: 'What did people say about the food?',
        answer: 'it was good',
        choices: ['it was good', 'it was some water', 'it were from there'],
      },
      {
        passage: 'Their friend said come and have some water. People were happy because it was cold.',
        question: 'Why were people happy?',
        answer: 'the water was cold',
        choices: ['the water was cold', 'every friend were there', 'many could come'],
      },
    ],
  },
  {
    unitNumber: 7,
    title: 'Sentence Comprehension',
    pattern: 'Read mini-stories and answer questions',
    badgeId: 'STORY_QUEEN',
    words: [], // No word-recognition or read-aloud in Unit 7 — all comprehension
    comprehensionItems: [
      {
        passage: 'The whale swam in the deep pool. It made a big splash with its tail.',
        question: 'What did the whale make with its tail?',
        answer: 'a big splash',
        choices: ['a big splash', 'a rainbow', 'a snowball'],
      },
      {
        passage: 'The rainbow came after the rain. It had many bright colors in the sky.',
        question: 'When did the rainbow come?',
        answer: 'after the rain',
        choices: ['after the rain', 'before the rain', 'from the sunshine'],
      },
      {
        passage: 'She baked a cupcake for her friend. It was sweet and warm from the oven.',
        question: 'Who was the cupcake for?',
        answer: 'her friend',
        choices: ['her friend', 'her mom', 'her teacher'],
      },
      {
        passage: 'A firefly lit up the dark farm at night. It flew near the old barn by the corn.',
        question: 'Where did the firefly fly?',
        answer: 'near the old barn',
        choices: ['near the old barn', 'into the treehouse', 'over the pool'],
      },
      {
        passage: 'The girl wore her birthday crown all day long. She felt like a real princess.',
        question: 'How did she feel?',
        answer: 'like a real princess',
        choices: ['like a real princess', 'like a firefly', 'like a whale'],
      },
      {
        passage: 'The star was bright in the dark sky. Many people could see it from their bedroom window.',
        question: 'Where could people see the star from?',
        answer: 'their bedroom window',
        choices: ['their bedroom window', 'the farm', 'the pool'],
      },
      {
        passage: 'Her friend said come and play in the sunshine. They ran to the sandbox and made a big castle.',
        question: 'What did they make?',
        answer: 'a big castle',
        choices: ['a big castle', 'a snowball', 'a cupcake'],
      },
      {
        passage: 'The bird sang every morning from the tree. People said its song was sweet because it was so clear.',
        question: 'When did the bird sing?',
        answer: 'every morning',
        choices: ['every morning', 'at night', 'in the rain'],
      },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/readingJourneyContent.ts
git commit -m "feat(journey): add 7-unit word lists and comprehension items"
```

---

## Task 3: Royal Badge Definitions

**Files:**
- Create: `src/constants/royalBadges.ts`
- Modify: `src/constants/badges.ts`

- [ ] **Step 1: Create royalBadges.ts**

```typescript
// src/constants/royalBadges.ts
export interface RoyalBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  message: string; // personal unlock message shown in the modal
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
```

- [ ] **Step 2: Add royal badge IDs to badges.ts**

In `src/constants/badges.ts`, add at the bottom before the closing `};` of `BADGES`:

```typescript
  // Royal Reading Journey badges (definitions in royalBadges.ts)
  SPARKLE_STARTER: { id: 'SPARKLE_STARTER', name: 'Sparkle Starter', description: 'Complete your first Reading Journey lesson', emoji: '✨', color: '#A78BFA' },
  CRYSTAL_WORDS: { id: 'CRYSTAL_WORDS', name: 'Crystal Words', description: 'Read 5 words correctly in the Journey', emoji: '💎', color: '#60A5FA' },
  UNICORN_MAGIC: { id: 'UNICORN_MAGIC', name: 'Unicorn Magic', description: 'Complete Unit 1: Magic E', emoji: '🦄', color: '#F472B6' },
  WHALE_WHISPERER: { id: 'WHALE_WHISPERER', name: 'Whale Whisperer', description: 'Complete Unit 2: th and wh Words', emoji: '🐋', color: '#38BDF8' },
  MERMAID_VOWELS: { id: 'MERMAID_VOWELS', name: 'Mermaid Vowels', description: 'Complete Unit 3: Vowel Teams', emoji: '🧜‍♀️', color: '#34D399' },
  DRAGON_TAMER: { id: 'DRAGON_TAMER', name: 'Dragon Tamer', description: 'Complete Unit 4: R-Controlled Vowels', emoji: '🌹', color: '#F87171' },
  WORD_WEAVER: { id: 'WORD_WEAVER', name: 'Word Weaver', description: 'Complete Unit 5: Compound Words', emoji: '🦋', color: '#FB923C' },
  SIGHT_WORD_SORCERESS: { id: 'SIGHT_WORD_SORCERESS', name: 'Sight Word Sorceress', description: 'Complete Unit 6: Sight Words', emoji: '🔮', color: '#C084FC' },
  STORY_QUEEN: { id: 'STORY_QUEEN', name: 'Story Queen', description: 'Complete Unit 7: Comprehension', emoji: '📖', color: '#FBBF24' },
  ROYAL_PERFECTIONIST: { id: 'ROYAL_PERFECTIONIST', name: 'Royal Perfectionist', description: 'Score 5/5 on any lesson', emoji: '⭐', color: '#F59E0B' },
  MAGIC_STREAK: { id: 'MAGIC_STREAK', name: 'Magic Streak', description: 'Complete a lesson 3 days in a row', emoji: '🔥', color: '#EF4444' },
  READING_PRINCESS: { id: 'READING_PRINCESS', name: 'Reading Princess', description: 'Complete ALL 7 units', emoji: '👸', color: '#EC4899' },
```

- [ ] **Step 3: Commit**

```bash
git add src/constants/royalBadges.ts src/constants/badges.ts
git commit -m "feat(journey): add 12 royal reading badge definitions"
```

---

## Task 4: Reading Journey Store

**Files:**
- Create: `src/store/readingJourneyStore.ts`

- [ ] **Step 1: Create the store**

```typescript
// src/store/readingJourneyStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReadingJourneyProgress, UnitProgress, LessonResult } from '../types/readingJourney';
import { useProgressStore } from './progressStore';

const STORAGE_KEY = 'beary_reading_journey';

const defaultUnitProgress = (unitNumber: number): UnitProgress => ({
  unitNumber,
  unlocked: unitNumber === 1,
  lessonsCompleted: 0,
  lessonsAttempted: 0,
  starsEarned: 0,
  completedAt: null,
  lessonResults: [],
});

const defaultProgress = (): ReadingJourneyProgress => ({
  units: Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7].map((n) => [n, defaultUnitProgress(n)])
  ) as Record<number, UnitProgress>,
  totalCorrectWords: 0,
  lastLessonDate: null,
  lessonStreakDays: 0,
});

interface ReadingJourneyStore extends ReadingJourneyProgress {
  hydrated: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  // Returns array of newly earned badge IDs
  recordLessonResult: (unitNumber: number, result: LessonResult, wordCorrectCount: number) => string[];
  getNextLessonIndex: (unitNumber: number) => number;
  isUnitComplete: (unitNumber: number) => boolean;
}

export const useReadingJourneyStore = create<ReadingJourneyStore>((set, get) => ({
  ...defaultProgress(),
  hydrated: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as ReadingJourneyProgress;
        // Merge to ensure any new units added in updates are present
        const merged = defaultProgress();
        merged.totalCorrectWords = data.totalCorrectWords ?? 0;
        merged.lastLessonDate = data.lastLessonDate ?? null;
        merged.lessonStreakDays = data.lessonStreakDays ?? 0;
        for (const key of Object.keys(data.units ?? {})) {
          const n = Number(key);
          if (merged.units[n]) merged.units[n] = data.units[n];
        }
        set({ ...merged, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  save: async () => {
    try {
      const { hydrated, load, save, recordLessonResult, getNextLessonIndex, isUnitComplete, ...data } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // silent
    }
  },

  getNextLessonIndex: (unitNumber) => {
    const unit = get().units[unitNumber];
    if (!unit) return 0;
    // Find first lesson index with no result, or 0 if all attempted
    for (let i = 0; i < 8; i++) {
      const hasResult = unit.lessonResults.some((r) => r.lessonIndex === i && r.passed);
      if (!hasResult) return i;
    }
    return 0; // all done — allow replay from start
  },

  isUnitComplete: (unitNumber) => {
    const unit = get().units[unitNumber];
    return !!unit && unit.lessonsCompleted >= 6;
  },

  recordLessonResult: (unitNumber, result, wordCorrectCount) => {
    const newBadges: string[] = [];
    const state = get();
    const unit = state.units[unitNumber];
    if (!unit) return newBadges;

    // Update lesson results (replace if same index exists)
    const existingResults = unit.lessonResults.filter((r) => r.lessonIndex !== result.lessonIndex);
    const updatedResults = [...existingResults, result];
    const passedCount = updatedResults.filter((r) => r.passed).length;
    const totalStars = updatedResults.reduce((sum, r) => sum + r.starsEarned, 0);
    const isNowComplete = passedCount >= 6;

    const updatedUnit: UnitProgress = {
      ...unit,
      lessonResults: updatedResults,
      lessonsCompleted: passedCount,
      lessonsAttempted: unit.lessonsAttempted + (existingResults.length === unit.lessonResults.length ? 1 : 0),
      starsEarned: totalStars,
      completedAt: isNowComplete && !unit.completedAt ? new Date().toISOString() : unit.completedAt,
    };

    // Unlock next unit if this one just became complete
    const updatedUnits = { ...state.units, [unitNumber]: updatedUnit };
    if (isNowComplete && unitNumber < 7) {
      updatedUnits[unitNumber + 1] = { ...updatedUnits[unitNumber + 1], unlocked: true };
    }

    // Update streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = state.lessonStreakDays;
    if (state.lastLessonDate !== today) {
      newStreak = state.lastLessonDate === yesterday ? state.lessonStreakDays + 1 : 1;
    }

    // Update word count
    const newTotalWords = state.totalCorrectWords + wordCorrectCount;

    set({
      units: updatedUnits,
      totalCorrectWords: newTotalWords,
      lastLessonDate: today,
      lessonStreakDays: newStreak,
    });
    get().save();

    // Also add stars to the global progress store
    useProgressStore.getState().addStars(result.starsEarned);

    // Check badges
    const globalProgress = useProgressStore.getState();
    const earned = globalProgress.badgesEarned;
    const earn = (id: string) => {
      if (!earned.includes(id)) {
        useProgressStore.getState().earnBadge(id);
        newBadges.push(id);
      }
    };

    // First lesson ever
    const totalCompleted = Object.values(updatedUnits).reduce((s, u) => s + u.lessonsCompleted, 0);
    if (totalCompleted === 1) earn('SPARKLE_STARTER');

    // 5 correct words
    if (newTotalWords >= 5) earn('CRYSTAL_WORDS');

    // Perfect 5/5 lesson
    if (result.starsEarned === 15) earn('ROYAL_PERFECTIONIST');

    // Streak badge
    if (newStreak >= 3) earn('MAGIC_STREAK');

    // Unit completion badges
    const unitBadgeMap: Record<number, string> = {
      1: 'UNICORN_MAGIC',
      2: 'WHALE_WHISPERER',
      3: 'MERMAID_VOWELS',
      4: 'DRAGON_TAMER',
      5: 'WORD_WEAVER',
      6: 'SIGHT_WORD_SORCERESS',
      7: 'STORY_QUEEN',
    };
    if (isNowComplete && unitBadgeMap[unitNumber]) earn(unitBadgeMap[unitNumber]);

    // All 7 units complete
    const allDone = [1,2,3,4,5,6,7].every((n) => updatedUnits[n]?.lessonsCompleted >= 6);
    if (allDone) earn('READING_PRINCESS');

    return newBadges;
  },
}));
```

- [ ] **Step 2: Load store in app root layout**

In `app/_layout.tsx`, import and call `useReadingJourneyStore` load alongside the existing progress load. Find the `useProgress` hook call and add:

```typescript
// Add this import at the top of app/_layout.tsx
import { useReadingJourneyStore } from '../src/store/readingJourneyStore';

// Add this inside the root layout component, alongside the existing useProgress() call
const loadJourney = useReadingJourneyStore((s) => s.load);
useEffect(() => { loadJourney(); }, []);
```

- [ ] **Step 3: Commit**

```bash
git add src/store/readingJourneyStore.ts app/_layout.tsx
git commit -m "feat(journey): add ReadingJourneyStore with badge logic and unit unlocking"
```

---

## Task 5: Question Engine

**Files:**
- Create: `src/engines/readingJourneyEngine.ts`

- [ ] **Step 1: Create the engine**

```typescript
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
  // Use lessonIndex to offset into the word pool so lessons vary
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
    audioPrompt: `Read this word: ${lessonWords[1].word}`,
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
    audioPrompt: `Read this word: ${lessonWords[3].word}`,
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
```

- [ ] **Step 2: Commit**

```bash
git add src/engines/readingJourneyEngine.ts
git commit -m "feat(journey): add question engine for 7 units"
```

---

## Task 6: Exercise Components

**Files:**
- Create: `src/components/exercises/WordRecognitionExercise.tsx`
- Create: `src/components/exercises/ReadAloudExercise.tsx`
- Create: `src/components/exercises/ComprehensionExercise.tsx`

- [ ] **Step 1: Create WordRecognitionExercise**

```typescript
// src/components/exercises/WordRecognitionExercise.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, fontSize, spacing, radius, minTapSize } from '../../constants/theme';
import type { WordRecognitionQuestion } from '../../types/readingJourney';

interface Props {
  question: WordRecognitionQuestion;
  disabled: boolean;
  onAnswer: (emoji: string) => void;
}

export function WordRecognitionExercise({ question, disabled, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.promptCard}>
        <Text style={styles.word}>{question.word}</Text>
        <Text style={styles.hint}>Find the picture 👇</Text>
      </View>
      <View style={styles.choices}>
        {question.choices.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[styles.choiceBtn, disabled && styles.disabled]}
            onPress={() => !disabled && onAnswer(emoji)}
            accessibilityLabel={`Picture choice: ${emoji}`}
          >
            <Text style={styles.choiceEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, alignItems: 'center' },
  promptCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 3,
    borderColor: colors.reading,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  word: {
    fontFamily: fonts.extraBold,
    fontSize: 52,
    color: colors.reading,
    textAlign: 'center',
    letterSpacing: 2,
  },
  hint: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  choices: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center', width: '100%' },
  choiceBtn: {
    flex: 1,
    minHeight: minTapSize * 1.4,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.reading,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  disabled: { opacity: 0.5 },
  choiceEmoji: { fontSize: 48 },
});
```

- [ ] **Step 2: Create ReadAloudExercise**

```typescript
// src/components/exercises/ReadAloudExercise.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, fonts, fontSize, spacing, radius, minTapSize } from '../../constants/theme';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { scorePronunciation } from '../../engines/pronunciationEngine';
import type { ReadAloudQuestion } from '../../types/readingJourney';

interface Props {
  question: ReadAloudQuestion;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  onHearAgain: () => void;
}

export function ReadAloudExercise({ question, disabled, onAnswer, onHearAgain }: Props) {
  const { isListening, transcript, startListening, stopListening, reset } = useSpeechInput();

  useEffect(() => {
    reset();
  }, [question.word]);

  useEffect(() => {
    if (transcript && !disabled) {
      const correct = scorePronunciation(transcript, question.word, question.matchThreshold);
      onAnswer(correct);
      reset();
    }
  }, [transcript]);

  return (
    <View style={styles.container}>
      <View style={styles.promptCard}>
        {question.showPictureHint && <Text style={styles.emoji}>{question.emoji}</Text>}
        <Text style={styles.word}>{question.word}</Text>
      </View>
      <TouchableOpacity style={styles.hearBtn} onPress={onHearAgain}>
        <Text style={styles.hearText}>🔊 Hear it again</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.micBtn, isListening && styles.micBtnActive, disabled && styles.disabled]}
        onPress={isListening ? stopListening : startListening}
        disabled={disabled}
        accessibilityLabel={isListening ? 'Stop recording' : 'Tap to read the word'}
      >
        {isListening ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.micEmoji}>🎤</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.micLabel}>
        {isListening ? 'Listening… say the word!' : 'Tap the mic and read the word'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, alignItems: 'center' },
  promptCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 3,
    borderColor: colors.reading,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emoji: { fontSize: 72, marginBottom: spacing.sm },
  word: {
    fontFamily: fonts.extraBold,
    fontSize: 48,
    color: colors.reading,
    textAlign: 'center',
    letterSpacing: 2,
  },
  hearBtn: {
    backgroundColor: colors.accentYellow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: minTapSize,
    justifyContent: 'center',
  },
  hearText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  micBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  micBtnActive: { backgroundColor: '#E53E3E', shadowColor: '#E53E3E' },
  disabled: { opacity: 0.5 },
  micEmoji: { fontSize: 36 },
  micLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, textAlign: 'center' },
});
```

- [ ] **Step 3: Create ComprehensionExercise**

```typescript
// src/components/exercises/ComprehensionExercise.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, fonts, fontSize, spacing, radius, minTapSize } from '../../constants/theme';
import type { ComprehensionQuestion } from '../../types/readingJourney';

interface Props {
  question: ComprehensionQuestion;
  disabled: boolean;
  onAnswer: (choice: string) => void;
}

export function ComprehensionExercise({ question, disabled, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.passageCard}>
        <Text style={styles.passageLabel}>Read this:</Text>
        <Text style={styles.passage}>{question.passage}</Text>
        <View style={styles.divider} />
        <Text style={styles.question}>{question.question}</Text>
      </View>
      <Text style={styles.choiceLabel}>Tap the right answer:</Text>
      <View style={styles.choices}>
        {question.choices.map((choice) => (
          <TouchableOpacity
            key={choice}
            style={[styles.choiceBtn, disabled && styles.disabled]}
            onPress={() => !disabled && onAnswer(choice)}
            accessibilityLabel={`Answer: ${choice}`}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  passageCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.reading,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  passageLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, marginBottom: spacing.xs },
  passage: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 30,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  question: {
    fontFamily: fonts.extraBold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
  },
  choiceLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textLight, textAlign: 'center' },
  choices: { gap: spacing.sm },
  choiceBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2.5,
    borderColor: colors.reading,
    padding: spacing.md,
    minHeight: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disabled: { opacity: 0.5 },
  choiceText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/components/exercises/WordRecognitionExercise.tsx src/components/exercises/ReadAloudExercise.tsx src/components/exercises/ComprehensionExercise.tsx
git commit -m "feat(journey): add 3 reading exercise components"
```

---

## Task 7: Journey UI Components

**Files:**
- Create: `src/components/journey/UnitCard.tsx`
- Create: `src/components/journey/RoyalBadgeUnlock.tsx`

- [ ] **Step 1: Create UnitCard**

```typescript
// src/components/journey/UnitCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';
import type { UnitProgress } from '../../types/readingJourney';
import type { UnitContent } from '../../types/readingJourney';

const UNIT_COLORS = ['#45B7D1', '#38BDF8', '#34D399', '#F87171', '#FB923C', '#C084FC', '#FBBF24'];
const UNIT_EMOJIS = ['✨', '🐋', '🧜‍♀️', '🌹', '🦋', '🔮', '📖'];

interface Props {
  content: UnitContent;
  progress: UnitProgress;
  isActive: boolean;
  onPress: () => void;
}

export function UnitCard({ content, progress, isActive, onPress }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const color = UNIT_COLORS[(content.unitNumber - 1) % UNIT_COLORS.length];
  const emoji = UNIT_EMOJIS[(content.unitNumber - 1) % UNIT_EMOJIS.length];
  const isComplete = progress.lessonsCompleted >= 6;
  const isLocked = !progress.unlocked;

  const cardStyle = [
    styles.card,
    isActive && { borderColor: color, borderWidth: 3 },
    isComplete && styles.completeCard,
    isLocked && styles.lockedCard,
    isWide && isActive && styles.heroCard,
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={!isLocked ? onPress : undefined}
      accessibilityLabel={`Unit ${content.unitNumber}: ${content.title}`}
      disabled={isLocked}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: isLocked ? '#e2e8f0' : color + '22' }]}>
          <Text style={styles.iconEmoji}>{isLocked ? '🔒' : emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, isLocked && styles.lockedText]}>
            Unit {content.unitNumber}: {content.title}
          </Text>
          <Text style={[styles.pattern, isLocked && styles.lockedText]} numberOfLines={1}>
            {content.pattern}
          </Text>
          {!isLocked && (
            <>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: isComplete ? colors.success : color, width: `${(progress.lessonsCompleted / 8) * 100}%` },
                  ]}
                />
              </View>
              <Text style={[styles.progressLabel, { color: isComplete ? colors.success : color }]}>
                {isComplete ? '⭐ Complete!' : `${progress.lessonsCompleted} / 8 lessons`}
              </Text>
            </>
          )}
          {isLocked && (
            <Text style={styles.lockedHint}>Complete Unit {content.unitNumber - 1} to unlock</Text>
          )}
        </View>
        {isActive && !isLocked && (
          <View style={[styles.goBtn, { backgroundColor: color }]}>
            <Text style={styles.goBtnText}>GO →</Text>
          </View>
        )}
        {isComplete && <Text style={styles.completeEmoji}>⭐</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  heroCard: { padding: spacing.lg },
  completeCard: { borderColor: '#F59E0B', borderWidth: 2.5 },
  lockedCard: { opacity: 0.6, backgroundColor: '#f7f8fa' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  info: { flex: 1 },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.md, color: colors.text },
  pattern: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textLight, marginTop: 2 },
  lockedText: { color: '#a0aec0' },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { fontFamily: fonts.bold, fontSize: 11, marginTop: 3 },
  lockedHint: { fontFamily: fonts.regular, fontSize: 11, color: '#a0aec0', marginTop: 3 },
  goBtn: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexShrink: 0,
  },
  goBtnText: { fontFamily: fonts.extraBold, fontSize: fontSize.sm, color: '#fff' },
  completeEmoji: { fontSize: 28 },
});
```

- [ ] **Step 2: Create RoyalBadgeUnlock**

```typescript
// src/components/journey/RoyalBadgeUnlock.tsx
import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { fonts, fontSize, spacing, radius } from '../../constants/theme';
import { ROYAL_BADGES } from '../../constants/royalBadges';

interface Props {
  badgeId: string | null;
  onClose: () => void;
}

export function RoyalBadgeUnlock({ badgeId, onClose }: Props) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-15);

  useEffect(() => {
    if (badgeId) {
      scale.value = 0;
      scale.value = withSequence(withSpring(1.25), withSpring(1));
      rotate.value = withSequence(withTiming(-15), withSpring(0));
    }
  }, [badgeId]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const badge = badgeId ? ROYAL_BADGES[badgeId] : null;
  if (!badge) return null;

  return (
    <Modal transparent animationType="fade" visible={!!badgeId}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, animStyle]}>
          <Text style={styles.sparkleRow}>✨ 👑 ✨</Text>
          <View style={[styles.emojiCircle, { backgroundColor: badge.color + '33' }]}>
            <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
          </View>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.message}>{badge.message}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: badge.color }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Yay! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: 'linear-gradient(135deg, #fff0fb, #f0e6ff)',
    backgroundColor: '#fff0fb',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '82%',
    borderWidth: 3,
    borderColor: '#A78BFA',
    shadowColor: '#A78BFA',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkleRow: { fontSize: 22, letterSpacing: 6 },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 56 },
  badgeName: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: '#2D3748', textAlign: 'center' },
  message: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: '#553C9A',
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  buttonText: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: '#fff' },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/components/journey/UnitCard.tsx src/components/journey/RoyalBadgeUnlock.tsx
git commit -m "feat(journey): add UnitCard and RoyalBadgeUnlock components"
```

---

## Task 8: Reading Journey Map Screen

**Files:**
- Create: `app/reading-journey.tsx`

- [ ] **Step 1: Create the screen**

```typescript
// app/reading-journey.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReadingJourneyStore } from '../src/store/readingJourneyStore';
import { useProgressStore } from '../src/store/progressStore';
import { useSpeechOutput } from '../src/hooks/useSpeechOutput';
import { UnitCard } from '../src/components/journey/UnitCard';
import { StarCounter } from '../src/components/ui/StarCounter';
import { JOURNEY_UNITS } from '../src/constants/readingJourneyContent';
import { pickRandom } from '../src/constants/mascotPhrases';
import { colors, fonts, fontSize, spacing } from '../src/constants/theme';

const JOURNEY_GREETINGS = [
  'Welcome back, Reading Princess! 👸',
  'Ready to learn new words today? ✨',
  'Your crown grows with every lesson! 👑',
  'Keep going — you are doing amazing! 🦄',
  'Every word makes you stronger! 💎',
];

export default function ReadingJourneyScreen() {
  const { units, getNextLessonIndex } = useReadingJourneyStore();
  const totalStars = useProgressStore((s) => s.totalStars);
  const { speak } = useSpeechOutput();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  useEffect(() => {
    const msg = pickRandom(JOURNEY_GREETINGS);
    const t = setTimeout(() => speak(msg, 0.85), 400);
    return () => clearTimeout(t);
  }, []);

  const handleUnitPress = (unitNumber: number) => {
    const lessonIndex = getNextLessonIndex(unitNumber);
    router.push({ pathname: '/(sessions)/reading-lesson', params: { unitNumber: String(unitNumber), lessonIndex: String(lessonIndex) } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reading Journey</Text>
        <StarCounter count={totalStars} />
      </View>

      {/* Mascot */}
      <View style={styles.mascotRow}>
        <Text style={styles.mascotEmoji}>🐻</Text>
        <View style={styles.mascotBubble}>
          <Text style={styles.mascotText}>{pickRandom(JOURNEY_GREETINGS)}</Text>
        </View>
      </View>

      {/* Crown progress */}
      <View style={styles.crownRow}>
        <Text style={styles.crownEmoji}>👑</Text>
        <View style={styles.crownInfo}>
          <Text style={styles.crownTitle}>Princess Reading Crown</Text>
          <Text style={styles.crownSub}>
            {Object.values(units).filter((u) => u.lessonsCompleted >= 6).length} of 7 units complete
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]} showsVerticalScrollIndicator={false}>
        {isWide ? (
          // Wide: active unit full-width hero, rest in 2-col grid
          <>
            {JOURNEY_UNITS.filter((u) => units[u.unitNumber]?.unlocked && units[u.unitNumber]?.lessonsCompleted < 6).slice(0, 1).map((unit) => (
              <UnitCard
                key={unit.unitNumber}
                content={unit}
                progress={units[unit.unitNumber]}
                isActive={true}
                onPress={() => handleUnitPress(unit.unitNumber)}
              />
            ))}
            <View style={styles.grid}>
              {JOURNEY_UNITS.filter((u) => !(units[u.unitNumber]?.unlocked && units[u.unitNumber]?.lessonsCompleted < 6)).map((unit) => (
                <View key={unit.unitNumber} style={styles.gridItem}>
                  <UnitCard
                    content={unit}
                    progress={units[unit.unitNumber] ?? { unitNumber: unit.unitNumber, unlocked: false, lessonsCompleted: 0, lessonsAttempted: 0, starsEarned: 0, completedAt: null, lessonResults: [] }}
                    isActive={!!(units[unit.unitNumber]?.unlocked)}
                    onPress={() => handleUnitPress(unit.unitNumber)}
                  />
                </View>
              ))}
            </View>
          </>
        ) : (
          // Narrow: vertical stack
          JOURNEY_UNITS.map((unit) => (
            <UnitCard
              key={unit.unitNumber}
              content={unit}
              progress={units[unit.unitNumber] ?? { unitNumber: unit.unitNumber, unlocked: false, lessonsCompleted: 0, lessonsAttempted: 0, starsEarned: 0, completedAt: null, lessonResults: [] }}
              isActive={!!(units[unit.unitNumber]?.unlocked)}
              onPress={() => handleUnitPress(unit.unitNumber)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  back: { paddingRight: spacing.sm },
  backText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: colors.reading, flex: 1 },
  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  mascotEmoji: { fontSize: 44 },
  mascotBubble: { flex: 1, backgroundColor: colors.accentYellow, borderRadius: 16, padding: spacing.sm },
  mascotText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text },
  crownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: '#f0e6ff',
    borderRadius: 16,
    padding: spacing.md,
  },
  crownEmoji: { fontSize: 32 },
  crownInfo: { flex: 1 },
  crownTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.md, color: '#553C9A' },
  crownSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: '#7C3AED' },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  scrollWide: { padding: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  gridItem: { width: '47%' },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/reading-journey.tsx
git commit -m "feat(journey): add ReadingJourneyScreen with responsive unit map"
```

---

## Task 9: Reading Lesson Screen

**Files:**
- Create: `app/(sessions)/reading-lesson.tsx`

- [ ] **Step 1: Create the lesson screen**

```typescript
// app/(sessions)/reading-lesson.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReadingJourneyStore } from '../../src/store/readingJourneyStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useSpeechOutput } from '../../src/hooks/useSpeechOutput';
import { useSoundEffects } from '../../src/hooks/useSoundEffects';
import { MascotSpeech } from '../../src/components/ui/MascotSpeech';
import { WordRecognitionExercise } from '../../src/components/exercises/WordRecognitionExercise';
import { ReadAloudExercise } from '../../src/components/exercises/ReadAloudExercise';
import { ComprehensionExercise } from '../../src/components/exercises/ComprehensionExercise';
import { StarBurst } from '../../src/components/rewards/StarBurst';
import { generateLesson } from '../../src/engines/readingJourneyEngine';
import { ENCOURAGEMENT_CORRECT, ENCOURAGEMENT_WRONG, pickRandom } from '../../src/constants/mascotPhrases';
import { colors, fonts, fontSize, spacing } from '../../src/constants/theme';
import type { ReadingJourneyQuestion, QuestionResult } from '../../src/types/readingJourney';

export default function ReadingLessonScreen() {
  const { unitNumber: unitParam, lessonIndex: lessonParam } = useLocalSearchParams<{ unitNumber: string; lessonIndex: string }>();
  const unitNumber = Number(unitParam ?? '1');
  const lessonIndex = Number(lessonParam ?? '0');

  const { speak } = useSpeechOutput();
  const { play } = useSoundEffects();
  const settings = useSettingsStore();

  const [questions] = useState<ReadingJourneyQuestion[]>(() => generateLesson(unitNumber, lessonIndex));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongAttemptsThisQ, setWrongAttemptsThisQ] = useState(0);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [mascotMsg, setMascotMsg] = useState('');
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'celebrate'>('happy');
  const [mascotAnimate, setMascotAnimate] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const [starBurstCount, setStarBurstCount] = useState(3);

  const question = questions[currentIndex];

  useEffect(() => {
    if (!question) return;
    setDisabled(false);
    setWrongAttemptsThisQ(0);
    setMascotMood('happy');
    setMascotMsg(question.audioPrompt);
    speak(question.audioPrompt, settings.voiceSpeed);
  }, [currentIndex]);

  const starsForAttempts = (wrongAttempts: number) => (wrongAttempts === 0 ? 3 : wrongAttempts === 1 ? 2 : 1);

  const handleCorrect = useCallback(() => {
    const stars = starsForAttempts(wrongAttemptsThisQ);
    setQuestionResults((prev) => [...prev, { correct: true, starsEarned: stars, attempts: wrongAttemptsThisQ + 1 }]);
    setStarBurstCount(stars);
    setStarBurst(true);
    const msg = pickRandom(ENCOURAGEMENT_CORRECT);
    setMascotMsg(msg);
    setMascotMood('celebrate');
    setMascotAnimate(true);
    speak(msg, settings.voiceSpeed);
    play(stars === 3 ? 'celebrate' : 'correct');
    setDisabled(true);

    setTimeout(() => {
      setMascotAnimate(false);
      if (currentIndex + 1 >= questions.length) {
        // All done — go to results
        const allResults = [...questionResults, { correct: true, starsEarned: stars, attempts: wrongAttemptsThisQ + 1 }];
        const totalStars = allResults.reduce((s, r) => s + r.starsEarned, 0);
        const wordCorrectCount = allResults.filter((r) => r.correct).length;
        router.replace({
          pathname: '/reading-results',
          params: {
            unitNumber: String(unitNumber),
            lessonIndex: String(lessonIndex),
            starsEarned: String(totalStars),
            wordCorrectCount: String(wordCorrectCount),
          },
        });
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 1800);
  }, [wrongAttemptsThisQ, questionResults, currentIndex, questions.length, unitNumber, lessonIndex, settings, play, speak]);

  const handleWrong = useCallback(() => {
    setWrongAttemptsThisQ((w) => w + 1);
    const msg = pickRandom(ENCOURAGEMENT_WRONG);
    setMascotMsg(msg);
    setMascotMood('thinking');
    speak(msg, settings.voiceSpeed);
    play('wrong');
  }, [settings, play, speak]);

  // Handlers for each exercise type
  const handleWordRecognitionAnswer = useCallback((emoji: string) => {
    if (question.type !== 'word-recognition') return;
    if (emoji === question.correctEmoji) handleCorrect();
    else handleWrong();
  }, [question, handleCorrect, handleWrong]);

  const handleReadAloudAnswer = useCallback((correct: boolean) => {
    if (correct) handleCorrect();
    else handleWrong();
  }, [handleCorrect, handleWrong]);

  const handleComprehensionAnswer = useCallback((choice: string) => {
    if (question.type !== 'comprehension') return;
    if (choice === question.correctAnswer) handleCorrect();
    else handleWrong();
  }, [question, handleCorrect, handleWrong]);

  const handleHearAgain = useCallback(() => {
    if (!question) return;
    speak(question.audioPrompt, settings.voiceSpeed * 0.8);
  }, [question, settings, speak]);

  if (!question) return null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Exit session">
          <Text style={styles.exit}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {questions.length}
        </Text>
        <Text style={styles.stars}>
          ⭐ {questionResults.reduce((s, r) => s + r.starsEarned, 0)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MascotSpeech message={mascotMsg} mood={mascotMood} animate={mascotAnimate} />

        {question.type === 'word-recognition' && (
          <WordRecognitionExercise
            question={question}
            disabled={disabled}
            onAnswer={handleWordRecognitionAnswer}
          />
        )}
        {question.type === 'read-aloud' && (
          <ReadAloudExercise
            question={question}
            disabled={disabled}
            onAnswer={handleReadAloudAnswer}
            onHearAgain={handleHearAgain}
          />
        )}
        {question.type === 'comprehension' && (
          <ComprehensionExercise
            question={question}
            disabled={disabled}
            onAnswer={handleComprehensionAnswer}
          />
        )}
      </ScrollView>

      <StarBurst visible={starBurst} stars={starBurstCount} onDone={() => setStarBurst(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exit: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.textLight },
  progress: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.text },
  stars: { fontFamily: fonts.extraBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(sessions)/reading-lesson.tsx"
git commit -m "feat(journey): add ReadingLessonScreen with 5-question flow"
```

---

## Task 10: Reading Results Screen

**Files:**
- Create: `app/reading-results.tsx`

- [ ] **Step 1: Create the results screen**

```typescript
// app/reading-results.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReadingJourneyStore } from '../src/store/readingJourneyStore';
import { useSpeechOutput } from '../src/hooks/useSpeechOutput';
import { useSoundEffects } from '../src/hooks/useSoundEffects';
import { Confetti } from '../src/components/rewards/Confetti';
import { RoyalBadgeUnlock } from '../src/components/journey/RoyalBadgeUnlock';
import { colors, fonts, fontSize, spacing, radius } from '../src/constants/theme';
import type { LessonResult } from '../src/types/readingJourney';

export default function ReadingResultsScreen() {
  const { unitNumber: uParam, lessonIndex: lParam, starsEarned: sParam, wordCorrectCount: wParam } =
    useLocalSearchParams<{ unitNumber: string; lessonIndex: string; starsEarned: string; wordCorrectCount: string }>();

  const unitNumber = Number(uParam ?? '1');
  const lessonIndex = Number(lParam ?? '0');
  const starsEarned = Number(sParam ?? '0');
  const wordCorrectCount = Number(wParam ?? '0');

  const { recordLessonResult, getNextLessonIndex } = useReadingJourneyStore();
  const { speak } = useSpeechOutput();
  const { play } = useSoundEffects();

  const [showConfetti, setShowConfetti] = useState(false);
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);

  const isPerfect = starsEarned === 15;
  const isGood = starsEarned >= 10;

  useEffect(() => {
    if (recorded) return;
    setRecorded(true);

    const result: LessonResult = {
      lessonIndex,
      passed: true,
      starsEarned,
      correctAnswers: 5,
      attemptedAt: new Date().toISOString(),
    };

    const newBadges = recordLessonResult(unitNumber, result, wordCorrectCount);

    if (isPerfect) {
      setShowConfetti(true);
      play('celebrate');
      speak('You did it! A perfect score! You are a true Reading Princess! ✨', 0.9);
    } else if (isGood) {
      play('correct');
      speak('Wonderful job! You completed the lesson! Keep going! 🌟', 0.9);
    } else {
      speak('Great effort! Every lesson makes you stronger! 💪', 0.9);
    }

    if (newBadges.length > 0) {
      play('badge');
      setBadgeQueue(newBadges);
      setCurrentBadge(newBadges[0]);
    }
  }, []);

  const handleBadgeClose = () => {
    const remaining = badgeQueue.slice(1);
    setBadgeQueue(remaining);
    setCurrentBadge(remaining[0] ?? null);
  };

  const handleNextLesson = () => {
    const nextIdx = getNextLessonIndex(unitNumber);
    router.replace({
      pathname: '/(sessions)/reading-lesson',
      params: { unitNumber: String(unitNumber), lessonIndex: String(nextIdx) },
    });
  };

  const starEmojis = '⭐'.repeat(Math.min(Math.floor(starsEarned / 3), 5));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Result header */}
        <View style={styles.resultCard}>
          <Text style={styles.mascot}>🐻</Text>
          <Text style={styles.resultTitle}>
            {isPerfect ? 'You did it! 👸✨' : isGood ? 'Great job! 🌟' : 'So close! Keep going! 💪'}
          </Text>
          <Text style={styles.starRow}>{starEmojis || '⭐'}</Text>
          <View style={styles.starsBox}>
            <Text style={styles.starsNum}>{starsEarned}</Text>
            <Text style={styles.starsLabel}>stars earned</Text>
          </View>
          <Text style={styles.maxStars}>out of 15</Text>
        </View>

        {/* Star breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Your stars:</Text>
          {[1,2,3,4,5].map((q) => (
            <View key={q} style={styles.breakdownRow}>
              <Text style={styles.breakdownQ}>Question {q}</Text>
              <Text style={styles.breakdownStars}>{'⭐'.repeat(Math.floor(starsEarned / 5))}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNextLesson}>
          <Text style={styles.nextBtnText}>Next Lesson →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapBtn} onPress={() => router.replace('/reading-journey')}>
          <Text style={styles.mapBtnText}>Back to Journey Map</Text>
        </TouchableOpacity>
      </ScrollView>

      <Confetti visible={showConfetti} onDone={() => setShowConfetti(false)} />
      <RoyalBadgeUnlock badgeId={currentBadge} onClose={handleBadgeClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, alignItems: 'center' },
  resultCard: {
    backgroundColor: '#fff0fb',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 3,
    borderColor: '#A78BFA',
    gap: spacing.sm,
  },
  mascot: { fontSize: 56 },
  resultTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: '#553C9A', textAlign: 'center' },
  starRow: { fontSize: 28, letterSpacing: 4 },
  starsBox: { alignItems: 'center' },
  starsNum: { fontFamily: fonts.extraBold, fontSize: 64, color: '#F59E0B' },
  starsLabel: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  maxStars: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textLight },
  breakdownCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    gap: spacing.sm,
  },
  breakdownTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.md, color: colors.text },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownQ: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textLight },
  breakdownStars: { fontSize: 18 },
  nextBtn: {
    backgroundColor: colors.reading,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.reading,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: '#fff' },
  mapBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.reading,
  },
  mapBtnText: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.reading },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/reading-results.tsx
git commit -m "feat(journey): add ReadingResultsScreen with badge unlock and confetti"
```

---

## Task 11: Wire Up Navigation

**Files:**
- Modify: `app/index.tsx`
- Modify: `app/difficulty-select.tsx`
- Delete: `app/(sessions)/reading.tsx`
- Delete: `src/components/exercises/ReadingExercise.tsx`

- [ ] **Step 1: Update home screen — Reading card goes to /reading-journey**

In `app/index.tsx`, find the `handleSubject` function and add a special case for reading:

```typescript
const handleSubject = (subject: Subject) => {
  if (subject === 'reading') {
    router.push('/reading-journey');
    return;
  }
  setSubject(subject);
  router.push('/difficulty-select');
};
```

- [ ] **Step 2: Remove reading case from difficulty-select**

In `app/difficulty-select.tsx`:

1. Remove the import: `import { generateReadingSession } from '../src/engines/readingEngine';`
2. In `handleSelect`, change the else-if chain to remove the reading branch:
```typescript
let questions;
if (subject === 'counting') questions = generateCountingSession(difficulty);
else if (subject === 'addition') questions = generateAdditionSession(difficulty);
else if (subject === 'subtraction') questions = generateSubtractionSession(difficulty);
else questions = generatePronunciationSession(difficulty);
```
3. Remove `reading: 'Reading 📖'` from the `SUBJECT_LABELS` map.

- [ ] **Step 3: Delete replaced files**

```bash
# Windows PowerShell
Remove-Item "app/(sessions)/reading.tsx"
Remove-Item "src/components/exercises/ReadingExercise.tsx"
```

- [ ] **Step 4: Commit**

```bash
git add app/index.tsx app/difficulty-select.tsx
git rm "app/(sessions)/reading.tsx" "src/components/exercises/ReadingExercise.tsx"
git commit -m "feat(journey): wire up navigation, remove old reading module"
```

---

## Task 12: Manual Verification

- [ ] **Step 1: Start the app**

From the project root (where `package.json` has the `start` script):
```bash
npm start
```
Open **http://localhost:8081** in Chrome.

- [ ] **Step 2: Verify home screen has Reading card**

Expected: Sky blue "Reading" card with 📖 emoji visible in the grid alongside Counting, Addition, Subtraction, Pronunciation.

- [ ] **Step 3: Verify Reading Journey Map**

Tap the Reading card.
Expected:
- "Reading Journey" header in sky blue
- Purple crown progress bar ("0 of 7 units complete")
- Unit 1 "Magic E" is active with "GO →" button
- Units 2–7 are locked with padlock icons

- [ ] **Step 4: Verify Unit 1 lesson (Word Recognition)**

Tap "GO →" on Unit 1.
Expected:
- Progress shows "1 / 5"
- Beary says "Can you find the picture for the word: [word]?"
- Word shown in large sky blue text
- 3 large emoji buttons below
- Tapping wrong emoji shows encouragement from Beary, no penalty
- Tapping correct emoji shows star burst and Beary celebrates, then advances to Q2

- [ ] **Step 5: Verify Q2 (Read Aloud)**

Expected:
- Word + emoji picture shown
- Large red mic button
- "🔊 Hear it again" button works (Beary re-reads)
- Speaking the correct word advances to Q3

- [ ] **Step 6: Verify Q5 (Comprehension)**

Expected:
- Passage text shown in a card
- Question shown below
- 3 word choice buttons
- Correct choice → navigates to results screen

- [ ] **Step 7: Verify results screen**

Expected:
- "You did it! 👸✨" or "So close!" depending on stars
- Star count displayed
- "Next Lesson →" button works
- "Back to Journey Map" returns to unit map
- Unit 1's progress bar increments on the map

- [ ] **Step 8: Verify badge unlock**

After completing enough lessons, tap through until a badge triggers.
Expected: Purple/pink gradient modal with the badge emoji, name, personal message, and "Yay! 🎉" button.

- [ ] **Step 9: Verify web responsive layout**

Resize browser to > 600px wide.
Expected: Active unit shows as full-width hero card; locked units appear in a 2-column grid.

- [ ] **Step 10: Final commit and push**

```bash
git push origin feature/reading-skills
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 10 spec sections covered — unit structure (Task 2), lesson flow (Tasks 6+9), unit map (Tasks 7+8), progress/data (Task 4), badges (Task 3+10), new files (Tasks 1–10), modified files (Task 11), accessibility (minTapSize used, TTS auto-fires, no punishment for wrong answers, unlimited retries).
- [x] **No placeholders:** All steps include complete code with exact file paths.
- [x] **Type consistency:** `ReadingJourneyQuestion`, `WordRecognitionQuestion`, `ReadAloudQuestion`, `ComprehensionQuestion`, `LessonResult`, `UnitProgress`, `QuestionResult` defined in Task 1 and used consistently in Tasks 4–10. `correctEmoji` in `WordRecognitionQuestion` used in both engine (Task 5) and exercise component (Task 6). `correctAnswer` in `ComprehensionQuestion` used in both engine and exercise component.
