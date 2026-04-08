import { useCallback } from 'react';
import { Audio } from 'expo-av';
import { useSettingsStore } from '../store/settingsStore';

type SoundType = 'correct' | 'wrong' | 'celebrate' | 'badge';

// Sound files are optional. Place correct.mp3, wrong.mp3, celebrate.mp3, badge.mp3
// in assets/sounds/ to enable audio feedback. The app works silently without them.
const SOUND_MAP: Partial<Record<SoundType, any>> = {};

try { SOUND_MAP.correct = require('../../assets/sounds/correct.mp3'); } catch {}
try { SOUND_MAP.wrong = require('../../assets/sounds/wrong.mp3'); } catch {}
try { SOUND_MAP.celebrate = require('../../assets/sounds/celebrate.mp3'); } catch {}
try { SOUND_MAP.badge = require('../../assets/sounds/badge.mp3'); } catch {}

export function useSoundEffects() {
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);

  const play = useCallback(
    async (type: SoundType) => {
      if (!animationsEnabled) return;
      const source = SOUND_MAP[type];
      if (!source) return;
      try {
        const { sound } = await Audio.Sound.createAsync(source);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch {
        // Sound unavailable — silent
      }
    },
    [animationsEnabled]
  );

  return { play };
}
