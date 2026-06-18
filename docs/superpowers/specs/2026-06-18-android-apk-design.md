# Android APK Build Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to implement this spec.

**Goal:** Produce a sideloadable Android APK of Beary Learns using EAS Cloud Build, installable directly on phones and tablets without the Play Store.

**Approach:** EAS Preview build (APK output, internal distribution). No Android Studio or local SDK required. Icons are generated via a Node canvas script. Account setup is a one-time manual step documented here.

---

## 1. App Icon & Splash Screen

### Problem
`app.json` currently references `./assets/images/mascot/beary-happy.png` for both the launcher icon and adaptive icon foreground, but that file does not exist. EAS Build will fail without valid icon files.

### Solution

Generate two PNG assets using a small Node script (`scripts/generate-icons.js`):

| File | Size | Description |
|------|------|-------------|
| `assets/images/icon.png` | 1024×1024 | Cream background (#FFF9F0), large 🐻 emoji centred |
| `assets/images/adaptive-icon.png` | 1024×1024 | Transparent background, 🐻 emoji centred (foreground layer only) |

Script uses the `canvas` npm package (dev dependency, not shipped in the app).

### `app.json` changes

Update icon paths and add splash screen:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "backgroundColor": "#FFF9F0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFF9F0"
      }
    }
  }
}
```

The snippet above shows only the keys being changed — all other existing keys (`web`, `plugins`, `experiments`, `scheme`, etc.) are preserved. All other `app.json` fields are correct:
- Package: `com.bearylearns.app`
- Version code: `1`
- Permissions: `RECORD_AUDIO`, `INTERNET`
- Orientation: `portrait`

---

## 2. EAS Configuration

`eas.json` is already correct. The `preview` profile produces an APK (not AAB), which is required for sideloading:

```json
"preview": {
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```

No changes needed to `eas.json`.

---

## 3. Tablet Layout

The app already handles wide screens via a 600px breakpoint used throughout the codebase (Reading Journey map, subject grid, etc.). On Android, `useWindowDimensions` returns the real screen dimensions at runtime, so tablets (typically 800–1200px wide) automatically get the wider layout — Reading Journey hero card, 2-column unit grid, etc. No additional code is required for tablet support.

---

## 4. One-Time Account Setup (Manual)

These steps are done once by the developer and are not scripted:

1. Create a free Expo account at [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g eas-cli`
3. Log in: `eas login`
4. Link the project (run inside `learning-app/`): `eas init`
   - Select the account created in step 1
   - Accept the auto-generated project ID (written into `app.json` as `"extra.eas.projectId"`)

---

## 5. Build & Install

### Trigger the build

Run inside `learning-app/`:

```bash
eas build -p android --profile preview
```

- Build runs in the cloud (~15–25 minutes)
- EAS sends an email when complete with a download link
- Link is also visible at [expo.dev/accounts/\<username\>/projects/beary-learns/builds](https://expo.dev)

### Install on device

1. On the Android device, go to **Settings → Security** (exact path varies by manufacturer) and enable **"Install unknown apps"** or **"Unknown sources"**
2. Open the EAS download link in Chrome on the device and tap **Download**
3. When download completes, tap the notification → **Install**
4. Works identically on phones and tablets

### Verify

After installation:
- App icon shows Beary on the home screen
- Splash screen shows cream background while fonts load
- All 5 subject cards appear on home screen
- Microphone permission prompt appears on first use of Pronunciation or Read Aloud exercises
- Reading Journey map and all 7 units render correctly on tablet (wide layout) and phone (stacked layout)

---

## 6. File Map

| Action | Path |
|--------|------|
| Create | `scripts/generate-icons.js` |
| Create | `assets/images/icon.png` (generated) |
| Create | `assets/images/adaptive-icon.png` (generated) |
| Modify | `learning-app/app.json` |

---

## 7. Out of Scope

- Google Play Store publication
- iOS build
- Push notifications
- OTA updates (Expo Updates) — recommended as a follow-up once the app is stable on device
- Android emulator setup
