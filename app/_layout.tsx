import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useProgress } from '../src/hooks/useProgress';
import { colors } from '../src/constants/theme';
import { useReadingJourneyStore } from '../src/store/readingJourneyStore';

function AppBootstrap() {
  useProgress();
  const loadJourney = useReadingJourneyStore((s) => s.load);
  React.useEffect(() => { loadJourney(); }, []);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <AppBootstrap />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
