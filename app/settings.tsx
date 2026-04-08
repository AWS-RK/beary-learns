import React, { useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/store/settingsStore';
import { BigButton } from '../src/components/ui/BigButton';
import { colors, fonts, fontSize, spacing, radius } from '../src/constants/theme';

export default function Settings() {
  const store = useSettingsStore();
  const [name, setName] = useState(store.childName);

  const handleSaveName = () => {
    store.setChildName(name.trim());
    store.setOnboardingDone();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>⚙️ Parent Settings</Text>

        {/* Child's Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Child's Name</Text>
          <Text style={styles.hint}>Used to personalize Beary's greetings</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name..."
            autoCapitalize="words"
          />
          <BigButton label="Save Name" onPress={handleSaveName} color={colors.primary} />
        </View>

        {/* Voice Speed */}
        <View style={styles.section}>
          <Text style={styles.label}>Voice Speed</Text>
          <Text style={styles.hint}>Current: {store.voiceSpeed === 0.7 ? 'Slow' : store.voiceSpeed === 0.85 ? 'Normal' : 'Fast'}</Text>
          <View style={styles.speedRow}>
            {[
              { label: '🐢 Slow', value: 0.7 },
              { label: '🐻 Normal', value: 0.85 },
              { label: '🐇 Fast', value: 1.1 },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.speedBtn, store.voiceSpeed === opt.value && styles.speedBtnActive]}
                onPress={() => store.setVoiceSpeed(opt.value)}
              >
                <Text style={styles.speedBtnText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Animations */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.label}>Animations</Text>
              <Text style={styles.hint}>Turn off if child is easily overstimulated</Text>
            </View>
            <Switch
              value={store.animationsEnabled}
              onValueChange={store.setAnimationsEnabled}
              trackColor={{ true: colors.success }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        {/* High Contrast */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.label}>High Contrast</Text>
              <Text style={styles.hint}>Increases text size and border weight</Text>
            </View>
            <Switch
              value={store.highContrast}
              onValueChange={store.setHighContrast}
              trackColor={{ true: colors.success }}
              thumbColor={colors.card}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  back: { alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.textLight },
  title: { fontFamily: fonts.extraBold, fontSize: fontSize.xxl, color: colors.text },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  label: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textLight },
  input: {
    height: 56,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
  },
  speedRow: { flexDirection: 'row', gap: spacing.sm },
  speedBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  speedBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  speedBtnText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleInfo: { flex: 1, gap: 4 },
});
