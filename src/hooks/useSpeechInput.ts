import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface SpeechInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  available: boolean;
}

interface SpeechInputActions {
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

export function useSpeechInput(): SpeechInputState & SpeechInputActions {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);

  // Web recognition ref
  const webRecognitionRef = useRef<any>(null);
  // Native subscriptions
  const nativeSubsRef = useRef<any[]>([]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setAvailable(true);
        const r = new SpeechRecognition();
        r.continuous = false;
        r.interimResults = false;
        r.lang = 'en-US';
        r.maxAlternatives = 3;
        r.onresult = (e: any) => { setTranscript(e.results[0][0].transcript); setIsListening(false); };
        r.onerror = (e: any) => { setError(e.error); setIsListening(false); };
        r.onend = () => setIsListening(false);
        webRecognitionRef.current = r;
      }
    } else {
      // Set up expo-speech-recognition event listeners
      import('expo-speech-recognition').then(({ ExpoSpeechRecognitionModule }) => {
        setAvailable(true);

        const resultSub = ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
          const text = event.results?.[0]?.transcript ?? '';
          if (text) { setTranscript(text); setIsListening(false); }
        });

        const errorSub = ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
          setError(event.message ?? 'Speech error');
          setIsListening(false);
        });

        const endSub = ExpoSpeechRecognitionModule.addListener('end', () => {
          setIsListening(false);
        });

        nativeSubsRef.current = [resultSub, errorSub, endSub];
      }).catch(() => setAvailable(false));
    }

    return () => {
      webRecognitionRef.current?.abort?.();
      nativeSubsRef.current.forEach((s) => s?.remove?.());
    };
  }, []);

  const startListening = useCallback(async () => {
    setTranscript('');
    setError(null);
    setIsListening(true);

    if (Platform.OS === 'web') {
      try { webRecognitionRef.current?.start(); }
      catch { setIsListening(false); }
    } else {
      try {
        const { ExpoSpeechRecognitionModule } = await import('expo-speech-recognition');
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!perm.granted) {
          setError('Microphone permission denied');
          setIsListening(false);
          return;
        }
        ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: false, maxAlternatives: 3 });
      } catch {
        setError('Speech recognition unavailable');
        setIsListening(false);
      }
    }
  }, []);

  const stopListening = useCallback(async () => {
    setIsListening(false);
    if (Platform.OS === 'web') {
      webRecognitionRef.current?.stop();
    } else {
      try {
        const { ExpoSpeechRecognitionModule } = await import('expo-speech-recognition');
        ExpoSpeechRecognitionModule.stop();
      } catch {}
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, available, startListening, stopListening, reset };
}
