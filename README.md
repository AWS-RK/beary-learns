# 🐻 Beary Learns

An interactive learning app for children with special needs — teaching **counting**, **addition**, **subtraction**, and **pronunciation** through a fun, game-like experience with Beary the bear mascot.

Built with a single codebase that runs as both a **web app** and an **Android APK**.

---

## Screenshots

| Home | Counting | Results |
|------|----------|---------|
| Subject cards with colorful icons | Visual counting with emoji objects | Stars earned + badge unlocks |

---

## Features

- 🎤 **Voice input & output** — Beary speaks every question aloud; kids can answer by voice or number pad
- 🔢 **4 learning modules** — Counting, Addition, Subtraction, Pronunciation
- ⭐ **3 difficulty levels** — Easy (1–5), Medium (1–10), Hard (1–20)
- 🏆 **13 collectible badges** — First Step, Streak badges, Subject Master, and more
- 🌟 **Star reward system** — 1–3 stars per correct answer, never subtracted
- 🎉 **Celebrations** — Confetti, star bursts, and animated badge unlock modals
- ♿ **Accessibility first** — 56dp+ tap targets, max 2–3 elements per screen, no punishment for wrong answers
- ⚙️ **Parent settings** — Child's name, voice speed, animations toggle, high contrast mode

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 52 + TypeScript |
| Routing | Expo Router v4 |
| State | Zustand |
| Text-to-Speech | expo-speech |
| Speech Recognition | expo-speech-recognition (Android) / Web Speech API (web) |
| Animations | react-native-reanimated 3 |
| Persistence | AsyncStorage |
| Font | Nunito (rounded, child-friendly) |
| Android Build | EAS Build |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) LTS
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Run on Web
```bash
git clone https://github.com/AWS-RK/beary-learns.git
cd beary-learns
npm install --legacy-peer-deps
npx expo start --web
```
Open **Chrome** at `http://localhost:8081` (Chrome has the best Web Speech API support).

### Run on Android
```bash
npx expo run:android
```
Or build a shareable APK:
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## Project Structure

```
beary-learns/
├── app/                        # Expo Router screens
│   ├── index.tsx               # Home — subject selection
│   ├── difficulty-select.tsx   # Easy / Medium / Hard
│   ├── results.tsx             # Session results + rewards
│   ├── profile.tsx             # Badge collection + progress
│   ├── settings.tsx            # Parent settings
│   └── (sessions)/             # Learning session screens
│       ├── counting.tsx
│       ├── addition.tsx
│       ├── subtraction.tsx
│       └── pronunciation.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/                 # BigButton, NumberPad, VoiceButton, MascotSpeech…
│   │   ├── rewards/            # Confetti, StarBurst, BadgeUnlock
│   │   └── exercises/          # CountingExercise, AdditionExercise…
│   ├── engines/                # Question generators + difficulty config
│   ├── hooks/                  # useSpeechInput, useSpeechOutput, useRewards…
│   ├── store/                  # Zustand stores (session, progress, settings)
│   └── constants/              # Theme colors, badges, word lists, mascot phrases
│
└── assets/
    ├── fonts/
    ├── sounds/                 # correct.mp3, wrong.mp3, celebrate.mp3, badge.mp3
    └── images/mascot/
```

---

## Difficulty Levels

| Subject | Easy | Medium | Hard |
|---------|------|--------|------|
| Counting | 1–5, linear layout | 1–10, grid | 1–20, scattered |
| Addition | Max sum 10, dots shown | Max sum 20, dots on request | Max sum 40, no aid |
| Subtraction | From 1–5, cross-out shown | From 1–10 | From 1–20 |
| Pronunciation | CVC words (cat, dog) | Blends (frog, play) | Multi-syllable |

---

## Reward System

- **Stars** — 1 star (used hint), 2 stars (correct, some attempts), 3 stars (first try, no hint)
- **Wrong answers** never subtract stars — encouragement only
- **Badges** unlock on milestones: streaks, subject completions, voice use, hard mode
- **Celebrations** scale with stars: sparkle → star burst → full confetti

---

## Adding Sound Effects

Place these files in `assets/sounds/` to enable audio feedback:

| File | Purpose |
|------|---------|
| `correct.mp3` | Cheerful chime on correct answer |
| `wrong.mp3` | Gentle soft tone on wrong answer |
| `celebrate.mp3` | Fanfare for 3-star answers |
| `badge.mp3` | Special sound on badge unlock |

Free sounds: [freesound.org](https://freesound.org) — search "children correct answer", "celebration chime".

---

## License

MIT — built with love for a special kid. 🐻⭐
