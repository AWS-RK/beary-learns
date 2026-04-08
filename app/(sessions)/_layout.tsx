import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../src/store/sessionStore';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { StarCounter } from '../../src/components/ui/StarCounter';
import { colors, fonts, fontSize, spacing } from '../../src/constants/theme';

function SessionHeader() {
  const { currentIndex, questions, starsEarned, subject } = useSessionStore();

  const handleExit = () => {
    Alert.alert('Leave?', 'Are you sure you want to stop?', [
      { text: 'Keep going!', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  };

  const SUBJECT_EMOJI: Record<string, string> = {
    counting: '🔢', addition: '➕', subtraction: '➖', pronunciation: '🗣️',
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleExit} accessibilityLabel="Exit session">
        <Text style={styles.exitBtn}>✕</Text>
      </TouchableOpacity>
      <View style={styles.progressContainer}>
        <ProgressBar current={currentIndex} total={questions.length} />
        <Text style={styles.progressText}>{currentIndex}/{questions.length}</Text>
      </View>
      <StarCounter count={starsEarned} />
    </View>
  );
}

export default function SessionLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <SessionHeader />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  exitBtn: { fontSize: 24, color: colors.textLight },
  progressContainer: { flex: 1, gap: 4 },
  progressText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textLight, textAlign: 'right' },
});
