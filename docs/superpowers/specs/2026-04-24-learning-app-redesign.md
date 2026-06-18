# Learning App Redesign — Design Spec
**Date:** 2026-04-24
**Status:** Approved

---

## Context

This app is a personalised learning tool built for a 10-year-old girl with an intellectual disability. She loves Disney princesses, music, dance, and is social by nature. The existing app has solid foundations — 4 exercises (counting, addition, subtraction, pronunciation), a star/badge reward system, voice input, a mascot, and progress tracking — but needs to be more engaging and fun for her specifically.

The parent also wants to continuously shape the app over time: adding custom content tailored to her interests, and rating sessions so the app learns what works and what doesn't.

**Goal:** Transform the app into a princess-themed, music-driven learning world (Phase 1), then add a parent feedback and personalisation loop (Phase 2).

---

## Phase 1 — Princess World + New Activities

### 1.1 Princess Theme

Replace the bear mascot with princess characters. Each subject is assigned a princess with a matching colour palette and background music:

| Subject | Princess | Rationale |
|---|---|---|
| Counting | Snow White | "count the dwarfs" |
| Addition | Cinderella | "count the guests" |
| Subtraction | Rapunzel | "count the lanterns left" |
| Pronunciation | Ariel | "she wants to learn words" |
| Rhythm Tap | Jasmine | "dance to the music" |
| Picture Match | Moana | "name what you see" |
| Reading | Belle | "she loves books!" |

- Princess characters are illustrated emoji/icon based (no licensed Disney IP — generic fairy tale princess style)
- Each subject screen has a themed background (soft castle walls, ocean, ballroom, etc.)
- Background music plays softly during exercises (subject-appropriate, looping)
- On correct answers: royal fanfare sound + princess celebrates with a dance animation
- On session complete: full confetti + music swell + princess dances

**Files to modify:**
- `src/types/exercises.ts` — extend `Subject` type: `'counting' | 'addition' | 'subtraction' | 'pronunciation' | 'rhythm' | 'picture-match' | 'reading'`
- `src/constants/theme.ts` — extend with princess colour palettes per subject
- `src/constants/mascotPhrases.ts` — rewrite phrases per princess character
- `src/components/ui/MascotSpeech.tsx` — render princess avatar instead of bear
- `app/(sessions)/*.tsx` — add themed backgrounds and music per subject
- `src/hooks/useSoundEffects.ts` — add fanfare, background music, celebration sounds

### 1.2 New Activity: Rhythm Tap

**Location:** `src/engines/rhythmEngine.ts`, `src/components/exercises/RhythmExercise.tsx`, `app/(sessions)/rhythm.tsx`

**How it works:**
- A short musical phrase plays (3–8 beats at a tempo matched to difficulty)
- Two input modes (both always available):
  - **Tap mode:** Large drum button — she taps once per beat she hears; her tap count becomes her answer
  - **Select mode:** After the phrase ends, 3 answer buttons appear; she picks the count
- Visual note icons (🎵) animate on screen in sync with the audio on Easy mode; hidden on Hard
- Scoring: correct count within ±0 = 3 stars, ±1 = 1 star, else 0; same star system as existing exercises

**Difficulty config (extend `src/engines/difficultyConfig.ts`):**
- Easy: 3–4 beats, slow tempo (60 BPM), visual notes shown, 5 questions
- Medium: 4–6 beats, moderate tempo (80 BPM), visual notes shown, 7 questions
- Hard: 5–8 beats, fast tempo (100 BPM), no visual aids, 10 questions

**Data types (extend `src/types/exercises.ts`):**
```ts
type RhythmQuestion = {
  beatCount: number;
  tempo: number; // BPM
  showVisualNotes: boolean;
  answer: number;
  hint: string;
};
```

**Subject card addition:** Add Rhythm Tap card to `app/index.tsx` home screen.

### 1.3 New Activity: Picture Match

**Location:** `src/engines/pictureMatchEngine.ts`, `src/components/exercises/PictureMatchExercise.tsx`, `app/(sessions)/picture-match.tsx`

**How it works:**
- A word appears on screen with a "tap to hear" audio button (TTS)
- 4 picture choices are shown in a 2×2 grid (emoji by default; photos in Phase 2)
- Child taps the picture that matches the word
- On correct answer: princess celebrates, star awarded

**Default picture set:** Extend `src/constants/wordLists.ts` with picture-word pairs (word → emoji mapping, 20+ entries per difficulty)

**Difficulty config:**
- Easy: Common concrete nouns (cat, sun, ball), 2-3 letter words, audio auto-plays, 5 questions
- Medium: Familiar nouns + simple adjectives, audio on request, 7 questions
- Hard: Action words + less familiar nouns, no auto-play, 10 questions

**Data types (extend `src/types/exercises.ts`):**
```ts
type PictureMatchQuestion = {
  word: string;
  correctEmoji: string;
  distractors: string[]; // 3 wrong emoji options
  answer: string;
  hint: string;
  customImageUri?: string; // Phase 2: parent-uploaded photo
};
```

**Subject card addition:** Add Picture Match card to `app/index.tsx`.

### 1.4 New Activity: Reading

**Location:** `src/engines/readingEngine.ts`, `src/components/exercises/ReadingExercise.tsx`, `app/(sessions)/reading.tsx`

**Princess:** Belle — "she loves books!"

Reading has three levels, all using a **tap-along** approach (no voice scoring). The child reads at her own pace and taps to confirm each word or move forward. A 🔊 button is always available to hear the current word/sentence spoken aloud.

#### Level 1 — Word Reading
- One word displayed per screen, centred, very large
- She reads it aloud to herself then taps "I read it!" to advance
- Easy: CVC words (cat, sun, hat, big, run, top, red, dog)
- Medium: CCVC/CVCC words (frog, lamp, jump, ship, plan, nest)
- Hard: Multisyllabic words (princess, garden, morning, flower, castle)
- 5 / 7 / 10 words per session matching easy / medium / hard question counts

#### Level 2 — Sentence Reading
- Full sentence shown at once (4–8 words, Lexile ≤ 300)
- Words displayed as individually tappable tokens in a wrapping row
- Tapped words turn grey (✓ done); the next unread word is highlighted in the subject colour
- She taps each word left-to-right as she reads it
- Princess celebrates after each completed sentence
- 4 / 6 / 8 sentences per session

#### Level 3 — Story Time
- 3–5 sentence princess-themed stories (Lexile ≤ 300)
- One sentence per page with dot-progress indicator
- Same tap-along word highlighting as Level 2
- After the final page: one picture comprehension question (e.g. "Who was in the story?" → tap the right picture from 3 choices)
- 1 story per session; story length increases with difficulty

**Typography for all reading modes (reading exercises only):**

| Mode | Font size | Font weight | Letter spacing | Line height |
|---|---|---|---|---|
| Word Reading | 52px | 900 (extra bold) | 6px | — |
| Sentence Reading | 30px | 800 (bold) | 2px | 1.8 |
| Story Time | 26px | 800 (bold) | 2px | 2.2 |

These sizes apply only inside `ReadingExercise.tsx` — the rest of the app uses existing theme typography.

**Data types (extend `src/types/exercises.ts`):**
```ts
type ReadingLevel = 'word' | 'sentence' | 'story';

type ReadingQuestion = {
  level: ReadingLevel;
  text: string;              // full word, sentence, or story page text
  words: string[];           // tokenised for tap-along
  audioHint?: string;        // TTS string (same as text for word/sentence; page text for story)
  comprehensionQuestion?: {  // story level only, last page
    prompt: string;
    choices: string[];       // emoji or short words
    answer: string;
  };
};
```

**Story content:** Seed with 10+ short stories across difficulty levels in `src/constants/stories.ts`. Stories should feature princesses, gardens, castles, animals, and everyday objects to connect with her interests. Each story is tagged with its Lexile estimate (max 300).

**Subject card addition:** Add Reading card to `app/index.tsx`.

### 1.5 Enhanced Celebrations

- Upgrade `src/components/rewards/Confetti.tsx` to include musical particle effects (note/star shapes)
- Add a dance animation sequence to `src/components/rewards/StarBurst.tsx` on 3-star sessions
- Increase animation intensity across `src/components/rewards/` — more particles, longer duration on perfect sessions
- Reading story completion: special "You read a whole story!" badge animation

---

## Phase 2 — Parent Feedback Loop

### 2.1 Post-Session Feedback Card

**Location:** New screen `app/session-feedback.tsx`, new store `src/store/feedbackStore.ts`

**Flow:** Results screen shows child the usual celebration, then displays a "Parent Review" button at the bottom. Parent taps it → feedback card opens. Child does not see the feedback card. "Skip" is always available to return to Home.

**UI:**
- Shows only the activity types played in that session
- One row per activity: name + emoji rating buttons (💕 Loved it / 😐 It was ok / ❌ Skip next time)
- Default state: 😐 for all (no selection required)
- Optional free-text note field (single line, soft keyboard)
- "Save & Done" button + "Skip" link (both return to Home)

**Data model (new `src/types/feedback.ts`):**
```ts
type ActivityRating = 'loved' | 'ok' | 'skip';

type SessionFeedback = {
  sessionId: string;
  date: string;
  activityRatings: Record<Subject, ActivityRating>;
  note?: string;
};
```

**Store (`src/store/feedbackStore.ts`):**
- Persists to AsyncStorage
- `addFeedback(feedback: SessionFeedback): void`
- `getRatingsFor(subject: Subject): ActivityRating[]` — last N sessions
- `getWeeklyInsight(): InsightSummary` — computed from recent ratings + progress data

```ts
type InsightSummary = {
  loved: Subject[];      // activities rated 💕 most in last 7 sessions
  mixed: Subject[];      // activities rated 😐 most
  lowRated: Subject[];   // activities rated ❌ most
  topStreak: Subject;    // subject with highest correct-answer streak
  tip?: string;          // auto-generated suggestion for parent
};
```

### 2.2 Magic Wand Studio (Parent Dashboard)

**Location:** `app/parent-studio.tsx` (new), accessible via 🔑 button on home screen

**PIN protection:** 4-digit PIN set on first visit, stored in `settingsStore`. Simple numeric keypad modal.

**Four tabs:**

#### Tab 1 — Word Lists
- Create and name custom word lists (e.g. "Disney Words", "Family Names")
- Add/remove words per list
- Assign list to Pronunciation and/or Picture Match
- Stored in `settingsStore` (persisted via AsyncStorage)

#### Tab 2 — Photos
- Add photos for Picture Match: pick word → upload photo from device camera roll
- Photo stored locally (Expo FileSystem, not uploaded anywhere)
- Replaces the default emoji in that word's Picture Match card
- Relevant files: `src/store/settingsStore.ts` (extend), `expo-image-picker` dependency

#### Tab 3 — Princesses
- Reassign which princess character appears for each subject
- Simple picker row per subject (subject label → princess dropdown)
- Stored in `settingsStore`

#### Tab 4 — Insights
- Weekly summary card: top-rated activities, mixed, and low-rated
- Performance chart per subject (accuracy % over last 4 weeks)
- Auto-generated tip ("Try Picture Match with her own photos — she rated it 😐 last week")
- Reads from `feedbackStore` + `progressStore`

### 2.3 Personalisation Engine

**Location:** `src/engines/personalisationEngine.ts`

**Algorithm (simple, transparent):**
- For each subject, compute a `weight` score:
  - Base: 1.0
  - Each 💕 rating in last 7 sessions: +0.3
  - Each ❌ rating in last 7 sessions: -0.4
  - Clamp to [0.1, 2.0]
- Session mix: when generating a session, sample subjects proportional to their weights
- Parent can always override by selecting a specific subject manually (weights ignored)
- Weights recalculated after each session feedback save

**Files:**
- `src/engines/personalisationEngine.ts` (new)
- `src/store/sessionStore.ts` (extend: use weights when subject is auto-selected)

---

## What Stays the Same

- All 4 existing exercises: counting, addition, subtraction, pronunciation
- Difficulty system (easy / medium / hard) and `difficultyConfig.ts`
- Star reward system (1–3 stars per question)
- Badge unlock system (`src/constants/badges.ts`)
- Voice input support (`src/hooks/useSpeechOutput.ts`, `expo-speech-recognition`)
- Progress tracking (`src/store/progressStore.ts`)
- Profile screen (`app/profile.tsx`)
- Zustand + AsyncStorage persistence pattern

---

## New Files Summary

### Phase 1
| File | Purpose |
|---|---|
| `src/engines/rhythmEngine.ts` | Generate rhythm questions |
| `src/engines/pictureMatchEngine.ts` | Generate picture match questions |
| `src/engines/readingEngine.ts` | Generate word/sentence/story questions |
| `src/constants/stories.ts` | Seed stories (Lexile ≤ 300, princess-themed) |
| `src/components/exercises/RhythmExercise.tsx` | Rhythm Tap exercise UI |
| `src/components/exercises/PictureMatchExercise.tsx` | Picture Match exercise UI |
| `src/components/exercises/ReadingExercise.tsx` | Reading tap-along exercise UI (all 3 levels) |
| `app/(sessions)/rhythm.tsx` | Rhythm Tap session screen |
| `app/(sessions)/picture-match.tsx` | Picture Match session screen |
| `app/(sessions)/reading.tsx` | Reading session screen |

### Phase 2
| File | Purpose |
|---|---|
| `src/types/feedback.ts` | SessionFeedback, ActivityRating types |
| `src/store/feedbackStore.ts` | Persist session ratings + notes |
| `src/engines/personalisationEngine.ts` | Compute subject weights from ratings |
| `app/session-feedback.tsx` | Post-session parent feedback card |
| `app/parent-studio.tsx` | Magic Wand Studio (PIN-protected) |

---

## Verification

### Phase 1
1. Run `npx expo start` and open on device/simulator
2. Home screen shows 7 subject cards with princess characters and themed colours (Belle on Reading, Jasmine on Rhythm Tap)
3. Tap Rhythm Tap → difficulty select → session plays music, visual notes show on Easy, hidden on Hard
4. Tap Picture Match → words appear with audio, 4 picture choices in 2×2 grid
5. Tap Reading (Easy) → single CVC words shown at 52px, "I read it!" advances each word
6. Tap Reading (Medium) → sentence shown, tap each word left-to-right, words grey out as tapped
7. Tap Reading (Hard) → 3-page story, tap-along highlighting, comprehension question at end
8. Complete a session → results screen shows princess dance animation + confetti with music

### Phase 2
1. Long-press / tap 🔑 on home screen → PIN setup modal appears on first visit
2. Enter PIN → Magic Wand Studio opens with 4 tabs
3. Add a custom word list → start a Pronunciation session → custom words appear
4. Upload a photo for a word → start Picture Match → photo appears instead of emoji
5. Complete any session → session feedback card appears after results
6. Rate activities, save → start another session → highly-rated activities appear more frequently
7. Open Insights tab → weekly summary reflects saved ratings
