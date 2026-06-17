# Reading Journey — Design Spec
**Date:** 2026-06-17
**App:** Beary Learns (Expo SDK 52, React Native + Web)
**For:** Special needs 10-year-old — current phonics level: CVC, Blends, Digraphs

---

## 1. Goal

Build a structured, princess-themed reading skills program called the **Reading Journey** that takes the child from her current phonics level through CVCe, CVVC/Vowel Teams, R-Controlled Vowels, Compound Words, Sight Words, and Sentence Comprehension — using 3 exercise types and a mastery-based unit progression.

---

## 2. Architecture

The existing `Reading` subject card on the home screen launches the **Reading Journey Map** directly instead of the generic difficulty-select screen. The rest of the app (Counting, Addition, Subtraction, Pronunciation) is untouched.

```
Home Screen
  └── Reading card  →  ReadingJourneyScreen  (NEW — replaces difficulty-select for reading)
        └── Unit card "GO →" (tap)  →  ReadingLessonScreen  (NEW — starts next uncompleted lesson)
              └── 5 questions (Recognition / Read Aloud / Comprehension)
              └── ReadingResultsScreen  (NEW)
```

Tapping "GO →" on an active unit starts the next uncompleted lesson directly — no intermediate list screen. Tapping a completed unit shows a "Replay" prompt to pick any of its 8 lessons to redo.

The current `app/(sessions)/reading.tsx` and `src/components/exercises/ReadingExercise.tsx` are replaced entirely by the new lesson flow.

---

## 3. Unit Structure

7 units in fixed sequence. Each unit unlocks after the previous reaches 75% completion (6 of 8 lessons passed with a perfect 5/5 score).

| # | Unit | Pattern | Example Words |
|---|------|---------|---------------|
| 1 | Magic E | CVCe — silent E makes vowel say its name | cake, bike, home, cute, time, rope, late, pine, made, kite, note, cube, mole, fame, huge |
| 2 | th / wh Words | Digraph reinforcement with richer vocabulary | thick, thin, three, throw, thumb, teeth, cloth, math, bath; whale, wheat, wheel, white, whisper, whistle |
| 3 | Vowel Teams (CVVC) | Two vowels make one long sound | rain, tail, mail, braid; beat, meat, feet, seed, tree; boat, coat, road, soap, pool, food, moon |
| 4 | R-Controlled Vowels | R changes the vowel sound | car, star, farm, bark, jar; bird, girl, her, fern, shirt; corn, horn, storm, fur, burn, turn |
| 5 | Compound Words | Two words joined into one | sunshine, cupcake, football, rainbow, bedroom, butterfly, lunchbox, starfish, treehouse, birthday, notebook, snowball, popcorn, firefly, sandbox |
| 6 | Sight Words | High-frequency words that don't follow phonics rules | said, come, because, friend, people, water, many, what, where, which, were, there, their, some, have, from, one, once, every, could |
| 7 | Sentence Comprehension | Short 2-sentence mini-stories using words from all units | "The whale swam in the deep sea. It made a big splash with its tail." |

---

## 4. Lesson Flow

Each unit has **8 lessons**. Each lesson has **5 questions** in this fixed order:

```
Q1: Word Recognition  →  Q2: Read Aloud  →  Q3: Word Recognition  →  Q4: Read Aloud  →  Q5: Comprehension
```

A lesson is **passed** when all 5 questions are answered correctly. The child always sees all 5 questions — no early exit. If she misses any question, she sees encouragement and can retry the lesson immediately.

### 4a. Exercise Types

**Word Recognition (A)**
- Display: Large word in sky blue (#45B7D1), centred on a white card
- Beary reads the word aloud automatically via TTS on question load
- Child taps one of 3 emoji choices — one correct, two distractors from the same unit
- Correct → stars + encouragement. Wrong → encouragement only, try again

**Read Aloud (C)**
- Display: Large word + picture/emoji hint on a white card
- Child taps the red microphone button and reads the word aloud
- Voice recognition scores pronunciation (Levenshtein distance, same engine as Pronunciation module)
- Picture hint fades on Unit 4+ to increase challenge
- A "Hear it again" button lets Beary re-read the word slowly

**Comprehension (D)**
- Display: 1–2 sentence mini-story using words from the current unit, followed by a simple question
- Child taps one of 3 word/phrase choices
- All sentence vocabulary is drawn from the current unit's word list plus previously learned units

### 4b. Lesson Results Screen

After Q5:
- Shows stars earned (up to 3 per question, 15 total maximum)
- Animated sparkle celebration scaled to score (≥12 stars = full confetti + sound)
- "You did it! 👸✨" (all 5 correct) or "So close! Let's try again!" (any missed) — never "You failed"
- Badge unlock modal fires if a milestone is hit
- Buttons: "Next Lesson" or "Back to Journey"

---

## 5. Unit Map Screen (ReadingJourneyScreen)

### Phone layout (< 600px)
Units stack vertically as full-width cards.

### Web layout (≥ 600px)
Active unit spans full width as a hero card. Locked units sit in a 2-column grid below.

### Card states
| State | Visual |
|-------|--------|
| Active / in-progress | Sky blue border (#45B7D1), progress bar, "GO →" button |
| Locked | Grey, padlock icon, "Complete Unit N to unlock" |
| Complete | Gold border, ⭐ badge, full green progress bar, "Replay" option |

Header shows: back arrow, "Reading Journey" title, total star count.
Beary speech bubble shows a random encouragement phrase on each visit.

---

## 6. Progress & Data

### New progress fields (extend `ProgressData`)
```ts
readingJourney: {
  units: Record<number, UnitProgress>;  // unit 1–7
}

interface UnitProgress {
  lessonsCompleted: number;   // how many lessons passed (≥ 3/5 correct)
  lessonsAttempted: number;
  starsEarned: number;        // total stars across all lessons in this unit
  unlocked: boolean;
  completedAt: string | null; // ISO date
  lessonResults: LessonResult[];
}

interface LessonResult {
  lessonIndex: number;        // 0–7
  passed: boolean;
  starsEarned: number;        // 0–15
  attemptedAt: string;        // ISO date
}
```

Stored in AsyncStorage under key `beary_reading_journey` (separate from the existing `beary_progress` key to avoid migration issues with existing users).

---

## 7. Princess Badge System

12 new Royal Reading Badges. Added to `src/constants/badges.ts` alongside existing badges.

| Emoji | ID | Name | Trigger |
|-------|----|------|---------|
| ✨ | SPARKLE_STARTER | Sparkle Starter | Complete first Reading Journey lesson |
| 💎 | CRYSTAL_WORDS | Crystal Words | Read 5 words correctly in the Journey |
| 🦄 | UNICORN_MAGIC | Unicorn Magic | Complete Unit 1 (Magic E) |
| 🐋 | WHALE_WHISPERER | Whale Whisperer | Complete Unit 2 (th/wh) |
| 🧜‍♀️ | MERMAID_VOWELS | Mermaid Vowels | Complete Unit 3 (CVVC) |
| 🌹 | DRAGON_TAMER | Dragon Tamer | Complete Unit 4 (R-Controlled) |
| 🦋 | WORD_WEAVER | Word Weaver | Complete Unit 5 (Compound Words) |
| 🔮 | SIGHT_WORD_SORCERESS | Sight Word Sorceress | Complete Unit 6 (Sight Words) |
| 📖 | STORY_QUEEN | Story Queen | Complete Unit 7 (Comprehension) |
| ⭐ | ROYAL_PERFECTIONIST | Royal Perfectionist | Score 5/5 on any lesson |
| 🔥 | MAGIC_STREAK | Magic Streak | Complete a lesson 3 days in a row |
| 👸 | READING_PRINCESS | Reading Princess | Complete ALL 7 units |

Badge unlock modal: purple/pink gradient background, sparkle animation, personal message (e.g. "You mastered Magic E words — you made silent letters come alive! 🦄"). Child taps "Yay! 🎉" to dismiss.

---

## 8. New Files

| File | Purpose |
|------|---------|
| `app/reading-journey.tsx` | Unit map screen |
| `app/(sessions)/reading-lesson.tsx` | 5-question lesson screen (replaces reading.tsx) |
| `app/reading-results.tsx` | Post-lesson results screen |
| `src/store/readingJourneyStore.ts` | Zustand store for journey progress |
| `src/engines/readingJourneyEngine.ts` | Question generator per unit/lesson |
| `src/constants/readingJourneyContent.ts` | All 7 unit word lists + sentences |
| `src/constants/royalBadges.ts` | 12 princess badge definitions |
| `src/components/exercises/WordRecognitionExercise.tsx` | Exercise type A |
| `src/components/exercises/ReadAloudExercise.tsx` | Exercise type C |
| `src/components/exercises/ComprehensionExercise.tsx` | Exercise type D |
| `src/components/journey/UnitCard.tsx` | Unit card component (active/locked/complete states) |
| `src/components/journey/LessonResultsCard.tsx` | Post-lesson results display |

### Modified Files

| File | Change |
|------|--------|
| `app/index.tsx` | Reading card navigates to `/reading-journey` instead of `/difficulty-select` |
| `app/difficulty-select.tsx` | Remove reading case (journey handles its own routing) |
| `src/constants/badges.ts` | Add 12 royal badge definitions |
| `src/types/exercises.ts` | Add `ReadingJourneyQuestion` types |
| `src/types/progress.ts` | Add `readingJourney` field to `ProgressData` |

---

## 9. Accessibility & Special Needs Considerations

- All tap targets ≥ 56dp (existing `minTapSize` constant)
- Max 3 choices per question — never overwhelming
- Beary speaks every question automatically — no reading required to start
- Wrong answers show encouragement only — never a negative sound or "X" icon
- "Hear it again" button on every Read Aloud question
- Sessions have no time pressure
- Child can exit a lesson at any time; partial progress is not penalised
- Badge messages are warm and personal, written in second person ("YOU did it!")

---

## 10. Out of Scope

- Handwriting / tracing exercises
- Leaderboards or comparison with other children
- Parent-controlled word list customisation (future consideration)
- Audio recording playback for the child to hear herself
