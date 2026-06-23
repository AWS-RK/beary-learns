# Android APK Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a sideloadable Android APK of Beary Learns via EAS Cloud Build, installable directly on phones and tablets.

**Architecture:** Two scripted tasks (icon generation + app.json update) produce committed changes. Two manual tasks (EAS account setup + build trigger) are fully documented with exact commands. No Android Studio or local SDK required.

**Tech Stack:** Expo SDK 52, EAS CLI, `sharp` npm package (dev-only, for PNG generation via SVG), Expo Router v4.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `scripts/generate-icons.js` | Node script — renders SVG bear face to PNG using sharp |
| Create | `assets/images/icon.png` | 1024×1024 launcher icon (generated) |
| Create | `assets/images/adaptive-icon.png` | 1024×1024 adaptive icon foreground (generated) |
| Modify | `app.json` | Fix icon paths, add splash screen config |

---

## Task 1: Generate App Icons

**Files:**
- Create: `scripts/generate-icons.js`
- Create: `assets/images/icon.png` (output)
- Create: `assets/images/adaptive-icon.png` (output)

> **Note:** The spec mentions the `canvas` package but we use `sharp` instead — `canvas` requires native build tools (Visual Studio) on Windows, while `sharp` ships prebuilt binaries and works out of the box.

- [ ] **Step 1: Install sharp as a dev dependency**

Run inside `learning-app/`:

```bash
npm install --save-dev sharp
```

Expected: `package.json` devDependencies gains `"sharp": "^0.33.x"` (or similar). No errors.

- [ ] **Step 2: Create the icon generator script**

Create `scripts/generate-icons.js` with this exact content:

```js
const sharp = require('sharp');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

// SVG bear face on cream background — used for the launcher icon
const iconSvg = Buffer.from(`
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#FFF9F0"/>
  <!-- Bear head -->
  <circle cx="512" cy="530" r="280" fill="#8B6914"/>
  <!-- Ears -->
  <circle cx="310" cy="300" r="110" fill="#8B6914"/>
  <circle cx="714" cy="300" r="110" fill="#8B6914"/>
  <circle cx="310" cy="300" r="65" fill="#C49A3C"/>
  <circle cx="714" cy="300" r="65" fill="#C49A3C"/>
  <!-- Face (lighter muzzle area) -->
  <ellipse cx="512" cy="560" rx="210" ry="190" fill="#C49A3C"/>
  <!-- Eyes -->
  <circle cx="435" cy="480" r="38" fill="#2D1B00"/>
  <circle cx="589" cy="480" r="38" fill="#2D1B00"/>
  <!-- Eye shine -->
  <circle cx="448" cy="468" r="13" fill="white"/>
  <circle cx="602" cy="468" r="13" fill="white"/>
  <!-- Nose -->
  <ellipse cx="512" cy="590" rx="52" ry="38" fill="#2D1B00"/>
  <!-- Smile -->
  <path d="M 465 635 Q 512 685 559 635" stroke="#2D1B00" stroke-width="12" fill="none" stroke-linecap="round"/>
</svg>
`);

// Same bear face on transparent background — foreground layer of the adaptive icon
const adaptiveSvg = Buffer.from(`
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <!-- No background rect — transparent -->
  <!-- Bear head -->
  <circle cx="512" cy="530" r="280" fill="#8B6914"/>
  <!-- Ears -->
  <circle cx="310" cy="300" r="110" fill="#8B6914"/>
  <circle cx="714" cy="300" r="110" fill="#8B6914"/>
  <circle cx="310" cy="300" r="65" fill="#C49A3C"/>
  <circle cx="714" cy="300" r="65" fill="#C49A3C"/>
  <!-- Face (lighter muzzle area) -->
  <ellipse cx="512" cy="560" rx="210" ry="190" fill="#C49A3C"/>
  <!-- Eyes -->
  <circle cx="435" cy="480" r="38" fill="#2D1B00"/>
  <circle cx="589" cy="480" r="38" fill="#2D1B00"/>
  <!-- Eye shine -->
  <circle cx="448" cy="468" r="13" fill="white"/>
  <circle cx="602" cy="468" r="13" fill="white"/>
  <!-- Nose -->
  <ellipse cx="512" cy="590" rx="52" ry="38" fill="#2D1B00"/>
  <!-- Smile -->
  <path d="M 465 635 Q 512 685 559 635" stroke="#2D1B00" stroke-width="12" fill="none" stroke-linecap="round"/>
</svg>
`);

async function main() {
  await sharp(iconSvg)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(OUT_DIR, 'icon.png'));
  console.log('✅ assets/images/icon.png');

  await sharp(adaptiveSvg)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(OUT_DIR, 'adaptive-icon.png'));
  console.log('✅ assets/images/adaptive-icon.png');
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: Run the script**

```bash
node scripts/generate-icons.js
```

Expected output:
```
✅ assets/images/icon.png
✅ assets/images/adaptive-icon.png
```

If you see an error about `sharp` not found, re-run `npm install --save-dev sharp` first.

- [ ] **Step 4: Verify the files were created**

```bash
node -e "
const fs = require('fs');
const icon = fs.statSync('assets/images/icon.png');
const adaptive = fs.statSync('assets/images/adaptive-icon.png');
console.log('icon.png size:', icon.size, 'bytes');
console.log('adaptive-icon.png size:', adaptive.size, 'bytes');
if (icon.size < 1000 || adaptive.size < 1000) throw new Error('Files too small — something went wrong');
console.log('✅ Both files look good');
"
```

Expected: Both files reported with size > 1000 bytes, `✅ Both files look good`.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-icons.js assets/images/icon.png assets/images/adaptive-icon.png package.json package-lock.json
git commit -m "feat(android): add icon generator script and generated app icons"
```

---

## Task 2: Update app.json

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Replace app.json with the corrected version**

The current `app.json` has three wrong paths pointing to the non-existent `beary-happy.png`. Replace the entire file:

```json
{
  "expo": {
    "name": "Beary Learns",
    "slug": "beary-learns",
    "version": "1.0.0",
    "scheme": "bearylearns",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "backgroundColor": "#FFF9F0"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/icon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-speech-recognition",
        {
          "microphonePermission": "Allow Beary Learns to use the microphone for voice answers.",
          "speechRecognitionPermission": "Allow Beary Learns to recognize your voice."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "android": {
      "package": "com.bearylearns.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFF9F0"
      },
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET"
      ]
    }
  }
}
```

Changes from the original:
- `icon`: `./assets/images/mascot/beary-happy.png` → `./assets/images/icon.png`
- `web.favicon`: same old path → `./assets/images/icon.png`
- `android.adaptiveIcon.foregroundImage`: same old path → `./assets/images/adaptive-icon.png`
- Added `splash.backgroundColor: "#FFF9F0"`

- [ ] **Step 2: Validate the JSON**

```bash
node -e "const j = require('./app.json'); console.log('name:', j.expo.name); console.log('icon:', j.expo.icon); console.log('adaptiveIcon:', j.expo.android.adaptiveIcon.foregroundImage); console.log('splash:', j.expo.splash); console.log('✅ Valid JSON');"
```

Expected:
```
name: Beary Learns
icon: ./assets/images/icon.png
adaptiveIcon: ./assets/images/adaptive-icon.png
splash: { backgroundColor: '#FFF9F0' }
✅ Valid JSON
```

- [ ] **Step 3: Commit**

```bash
git add app.json
git commit -m "feat(android): fix icon paths and add splash screen config in app.json"
```

- [ ] **Step 4: Push to GitHub**

```bash
git push origin feature/reading-skills
```

---

## Task 3: EAS Account Setup (Manual — One-Time)

> **This task is done once by you at the terminal. It cannot be automated. Follow the steps exactly in order.**

**Files:**
- Modify: `app.json` (EAS adds `extra.eas.projectId` automatically)

- [ ] **Step 1: Create your free Expo account**

Go to [https://expo.dev/signup](https://expo.dev/signup) in your browser. Choose a username and create the account.

- [ ] **Step 2: Install EAS CLI globally**

```bash
npm install -g eas-cli
```

Verify:
```bash
eas --version
```

Expected: prints a version number like `eas-cli/10.x.x`.

- [ ] **Step 3: Log in**

```bash
eas login
```

Enter your Expo username and password when prompted.

Verify you're logged in:
```bash
eas whoami
```

Expected: prints your Expo username.

- [ ] **Step 4: Link the project to your Expo account**

Run inside `learning-app/`:

```bash
eas init
```

When prompted:
- "Which account should own this project?" → select your account
- "What would you like to name your project?" → `beary-learns` (or press Enter to accept default)

EAS will write a `projectId` into `app.json` under `expo.extra.eas`. 

- [ ] **Step 5: Commit the projectId**

```bash
git add app.json
git commit -m "chore: link project to EAS account (projectId added by eas init)"
git push origin feature/reading-skills
```

---

## Task 4: Trigger Build and Install (Manual)

> **This task triggers the cloud build and installs the APK on the device. No code changes — all commands.**

- [ ] **Step 1: Trigger the Android preview build**

Run inside `learning-app/`:

```bash
eas build -p android --profile preview
```

When prompted "Do you want to log in to your Apple account?" — this is for iOS, type **n** and press Enter.

When prompted "Generate a new Android Keystore?" → **Yes** (first time only). EAS manages the keystore for you.

The terminal will print a build URL like:
```
Build details: https://expo.dev/accounts/<username>/projects/beary-learns/builds/<build-id>
```

The build takes **15–25 minutes** in the cloud. You can close the terminal — EAS will email you when it's done.

- [ ] **Step 2: Download the APK**

When the build finishes, open the build URL in your browser (or go to [expo.dev](https://expo.dev) → your project → Builds). Click **Download** to get the `.apk` file.

**To install directly from the device** (easier): open the build URL in Chrome on the Android device itself, then tap Download.

- [ ] **Step 3: Enable installation from unknown sources on the device**

This setting location varies by manufacturer:

| Device type | Path |
|-------------|------|
| Samsung | Settings → Biometrics & Security → Install Unknown Apps → Chrome → Allow |
| Pixel / stock Android | Settings → Apps → Special App Access → Install Unknown Apps → Chrome → Allow |
| Amazon Fire | Settings → Security → Apps from Unknown Sources → ON |

- [ ] **Step 4: Install the APK**

On the device:
1. Open the Downloads app (or Files app) and tap the downloaded `.apk` file
2. Tap **Install** when prompted
3. Tap **Open** when installation completes

- [ ] **Step 5: Verify on device**

Check each of the following on both the phone and the tablet:

- [ ] App icon (Beary bear face) appears on the home screen
- [ ] Tapping the icon opens the app with cream splash background, then home screen
- [ ] "Beary Learns" title and all 5 subject cards visible
- [ ] Tap **Counting** → difficulty select → Easy → counting question appears
- [ ] Tap **Reading** → Reading Journey map → all 7 units visible, Unit 1 unlocked
- [ ] On the **tablet**: Reading Journey map shows Unit 1 as a hero card with units 2–7 in 2-column grid below
- [ ] On the **phone**: all units appear in a vertical list
- [ ] Tap **GO →** on Unit 1 → lesson screen → "Can you find the picture for the word: ___?" with 3 emoji choices
- [ ] Tap the correct emoji → star burst animation → next question
- [ ] Tap **Pronunciation** or **Read Aloud** exercise → microphone permission dialog appears

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Section 1 (icons) → Tasks 1 & 2
- ✅ Section 2 (eas.json correct, no changes) → noted in Task 4 intro
- ✅ Section 3 (tablet layout, no code needed) → verified in Task 4 Step 5
- ✅ Section 4 (account setup) → Task 3
- ✅ Section 5 (build & install) → Task 4
- ✅ All file map entries covered

**No placeholders, no TBDs, all commands are exact.**
