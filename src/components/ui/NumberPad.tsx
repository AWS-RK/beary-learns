import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, radius, minTapSize, spacing } from '../../constants/theme';

interface NumberPadProps {
  onSubmit: (value: number) => void;
  maxDigits?: number;
  disabled?: boolean;
}

export function NumberPad({ onSubmit, maxDigits = 2, disabled = false }: NumberPadProps) {
  const [input, setInput] = useState('');

  const press = (digit: string) => {
    if (disabled) return;
    if (input.length < maxDigits) setInput((p) => p + digit);
  };

  const backspace = () => {
    if (disabled) return;
    setInput((p) => p.slice(0, -1));
  };

  const submit = () => {
    if (disabled || !input) return;
    onSubmit(parseInt(input, 10));
    setInput('');
  };

  const KEYS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['⌫', '0', '✓']];

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.displayText}>{input || '?'}</Text>
      </View>
      <View style={styles.pad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key) => {
              const isBack = key === '⌫';
              const isSubmit = key === '✓';
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => (isBack ? backspace() : isSubmit ? submit() : press(key))}
                  disabled={disabled}
                  style={[
                    styles.key,
                    isSubmit && styles.submitKey,
                    isBack && styles.backKey,
                    disabled && styles.disabledKey,
                  ]}
                  accessibilityLabel={isBack ? 'Delete' : isSubmit ? 'Submit answer' : key}
                >
                  <Text style={[styles.keyText, isSubmit && styles.submitKeyText]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md },
  display: {
    width: 120,
    height: 72,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  displayText: {
    fontFamily: fonts.extraBold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  pad: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  key: {
    width: minTapSize + 8,
    height: minTapSize + 8,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  submitKey: { backgroundColor: colors.success },
  backKey: { backgroundColor: '#FFE0E0' },
  disabledKey: { opacity: 0.4 },
  keyText: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  submitKeyText: { color: '#fff' },
});
