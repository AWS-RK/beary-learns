import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/store/settingsStore';
import { useProgressStore } from '../src/store/progressStore';
import { useSessionStore } from '../src/store/sessionStore';
import { useSpeechOutput } from '../src/hooks/useSpeechOutput';
import { GREETINGS, pickRandom } from '../src/constants/mascotPhrases';
import { colors, fonts, fontSize, spacing, radius } from '../src/constants/theme';
import { StarCounter } from '../src/components/ui/StarCounter';
import type { Subject } from '../src/types/exercises';

const SUBJECTS: { id: Subject; label: string; emoji: string; color: string; desc: string }[] = [
  { id: 'counting', label: 'Counting', emoji: '🔢', color: colors.counting, desc: 'Count objects!' },
  { id: 'addition', label: 'Addition', emoji: '➕', color: colors.addition, desc: 'Add numbers!' },
  { id: 'subtraction', label: 'Subtraction', emoji: '➖', color: colors.subtraction, desc: 'Take away!' },
  { id: 'pronunciation', label: 'Pronunciation', emoji: '🗣️', color: colors.pronunciation, desc: 'Say words!' },
  { id: 'reading', label: 'Reading', emoji: '📖', color: colors.reading, desc: 'Read and learn!' },
];

export default function HomeScreen() {
  const childName = useSettingsStore((s) => s.childName);
  const totalStars = useProgressStore((s) => s.totalStars);
  const setSubject = useSessionStore((s) => s.setSubject);
  const { speak } = useSpeechOutput();

  useEffect(() => {
    const greeting = pickRandom(GREETINGS(childName || undefined));
    const timer = setTimeout(() => speak(greeting, 0.85), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubject = (subject: Subject) => {
    if (subject === 'reading') {
      router.push('/reading-journey');
      return;
    }
    setSubject(subject);
    router.push('/difficulty-select');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Beary Learns</Text>
            <Text style={styles.greeting}>
              {childName ? `Hi, ${childName}! 👋` : 'Hello, Superstar! 👋'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <StarCounter count={totalStars} />
            <TouchableOpacity onPress={() => router.push('/profile')} accessibilityLabel="My Badges">
              <Text style={styles.profileBtn}>🏆</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mascot */}
        <View style={styles.mascotRow}>
          <Text style={styles.mascotEmoji}>🐻</Text>
          <View style={styles.mascotBubble}>
            <Text style={styles.mascotText}>
              {pickRandom(GREETINGS(childName || undefined))}
            </Text>
          </View>
        </View>

        {/* Subject Grid */}
        <Text style={styles.sectionTitle}>What do you want to learn?</Text>
        <View style={styles.grid}>
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.subjectCard, { backgroundColor: s.color }]}
              onPress={() => handleSubject(s.id)}
              accessibilityLabel={`${s.label}: ${s.desc}`}
            >
              <Text style={styles.subjectEmoji}>{s.emoji}</Text>
              <Text style={styles.subjectLabel}>{s.label}</Text>
              <Text style={styles.subjectDesc}>{s.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings link */}
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsLink}>
          <Text style={styles.settingsText}>⚙️ Parent Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appName: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: colors.primary },
  greeting: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  profileBtn: { fontSize: 32 },
  mascotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  mascotEmoji: { fontSize: 56 },
  mascotBubble: {
    flex: 1,
    backgroundColor: colors.accentYellow,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  mascotText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  subjectCard: {
    width: '47%',
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  subjectEmoji: { fontSize: 44 },
  subjectLabel: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: '#fff' },
  subjectDesc: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: '#ffffffcc', textAlign: 'center' },
  settingsLink: { alignItems: 'center', paddingVertical: spacing.md },
  settingsText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
});
