import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'beary_settings';

interface Settings {
  childName: string;
  voiceSpeed: number;
  animationsEnabled: boolean;
  highContrast: boolean;
  onboardingDone: boolean;
}

interface SettingsStore extends Settings {
  setChildName: (name: string) => void;
  setVoiceSpeed: (speed: number) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setOnboardingDone: () => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

const defaults: Settings = {
  childName: '',
  voiceSpeed: 0.8,
  animationsEnabled: true,
  highContrast: false,
  onboardingDone: false,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaults,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) set(JSON.parse(raw));
    } catch {}
  },

  save: async () => {
    try {
      const { load, save, setChildName, setVoiceSpeed, setAnimationsEnabled, setHighContrast, setOnboardingDone, ...data } = get();
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    } catch {}
  },

  setChildName: (childName) => { set({ childName }); get().save(); },
  setVoiceSpeed: (voiceSpeed) => { set({ voiceSpeed }); get().save(); },
  setAnimationsEnabled: (animationsEnabled) => { set({ animationsEnabled }); get().save(); },
  setHighContrast: (highContrast) => { set({ highContrast }); get().save(); },
  setOnboardingDone: () => { set({ onboardingDone: true }); get().save(); },
}));
