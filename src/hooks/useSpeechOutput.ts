import { useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';

export function useSpeechOutput() {
  const speakingRef = useRef(false);

  const speak = useCallback((text: string, rate = 0.8, onDone?: () => void) => {
    Speech.stop();
    speakingRef.current = true;
    Speech.speak(text, {
      rate,
      pitch: 1.1,
      onDone: () => {
        speakingRef.current = false;
        onDone?.();
      },
      onError: () => {
        speakingRef.current = false;
        onDone?.();
      },
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    speakingRef.current = false;
  }, []);

  return { speak, stop, isSpeaking: () => speakingRef.current };
}
