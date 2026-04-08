import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../src/store/sessionStore';
import { useProgressStore } from '../src/store/progressStore';
import { useSpeechOutput } from '../src/hooks/useSpeechOutput';
import { useSettingsStore } from '../src/store/settingsStore';
import { BigButton } from '../src/components/ui/BigButton';
import { Confetti } from '../src/components/rewards/Confetti';
import { BadgeUnlock } from '../src/components/rewards/BadgeUnlock';
import { BADGES } from '../src/constants/badges';
import { SESSION_COMPLETE } from '../src/constants/mascotPhrases';
import { colors, fonts, fontSize, spacing, radius } from '../src/constants/theme';

export default function Results() {
  const { starsEarned, newBadges, subject, questions, resetSession } = useSessionStore();
  const { totalStars } = useProgressStore();
  const { speak } = useSpeechOutput();
  const { voiceSpeed } = useSettingsStore();
  const [showConfetti, setShowConfetti] = React.useState(starsEarned >= questions.length * 2);
  const [badgeQueue, setBadgeQueue] = React.useState([...newBadges]);
  const [currentBadge, setCurrentBadge] = React.useState<string | null>(newBadges[0] ?? null);

  useEffect(() => {
    const msg = SESSION_COMPLETE(starsEarned);
    speak(msg, voiceSpeed);
  }, []);

  const starEmoji = starsEarned >= questions.length * 2 ? '🌟🌟🌟' : starsEarned >= questions.length ? '⭐⭐' : '⭐';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.mascot}>🐻</Text>
        <Text style={styles.title}>Session Complete!</Text>
        <Text style={styles.stars}>{starEmoji}</Text>
        <Text style={styles.starsCount}>You earned {starsEarned} stars!</Text>
        <Text style={styles.totalStars}>Total stars: ⭐ {totalStars}</Text>

        {newBadges.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.badgesTitle}>New Badges!</Text>
            <View style={styles.badgesRow}>
              {newBadges.map((id) => {
                const b = BADGES[id];
                return b ? (
                  <View key={id} style={[styles.badgeChip, { backgroundColor: b.color + '33', borderColor: b.color }]}>
                    <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                    <Text style={styles.badgeName}>{b.name}</Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}

        <View style={styles.buttons}>
          <BigButton
            label="Play Again!"
            emoji="🔄"
            onPress={() => {
              resetSession();
              router.replace('/');
            }}
            color={colors.primary}
          />
          <BigButton
            label="My Badges"
            emoji="🏆"
            onPress={() => router.replace('/profile')}
            color={colors.accentPurple}
          />
          <BigButton
            label="Go Home"
            emoji="🏠"
            onPress={() => { resetSession(); router.replace('/'); }}
            color={colors.secondary}
          />
        </View>
      </ScrollView>

      <Confetti visible={showConfetti} onDone={() => setShowConfetti(false)} />
      <BadgeUnlock
        badgeId={currentBadge}
        onClose={() => {
          const r = badgeQueue.slice(1);
          setBadgeQueue(r);
          setCurrentBadge(r[0] ?? null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, alignItems: 'center', gap: spacing.lg },
  mascot: { fontSize: 80 },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xxl, color: colors.text },
  stars: { fontSize: 56 },
  starsCount: { fontFamily: fonts.extraBold, fontSize: fontSize.xl, color: colors.text },
  totalStars: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  badgesSection: { width: '100%', alignItems: 'center', gap: spacing.sm },
  badgesTitle: { fontFamily: fonts.extraBold, fontSize: fontSize.lg, color: colors.text },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  badgeChip: {
    borderRadius: radius.full,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeEmoji: { fontSize: 20 },
  badgeName: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text },
  buttons: { width: '100%', gap: spacing.md },
});
