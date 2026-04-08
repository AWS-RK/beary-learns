import { useEffect } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';

export function useProgress() {
  const loadProgress = useProgressStore((s) => s.load);
  const loadSettings = useSettingsStore((s) => s.load);

  useEffect(() => {
    loadProgress();
    loadSettings();
  }, [loadProgress, loadSettings]);
}
