import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const PIECES = ['🎊', '⭐', '🌟', '💫', '🎉', '✨', '🎈'];
const NUM_CONFETTI = 20;

interface ConfettiPiece {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  rotate: number;
}

function generatePieces(): ConfettiPiece[] {
  return Array.from({ length: NUM_CONFETTI }, (_, i) => ({
    id: i,
    emoji: PIECES[i % PIECES.length],
    x: Math.random() * width,
    delay: Math.random() * 600,
    duration: 1200 + Math.random() * 800,
    rotate: Math.random() * 360,
  }));
}

interface ConfettiProps {
  visible: boolean;
  onDone?: () => void;
}

function ConfettiPieceComponent({ piece, onDone }: { piece: ConfettiPiece; onDone?: () => void }) {
  const y = useSharedValue(-50);
  const opacity = useSharedValue(1);

  useEffect(() => {
    y.value = withDelay(
      piece.delay,
      withTiming(height + 50, { duration: piece.duration, easing: Easing.linear }, (done) => {
        if (done && onDone) runOnJS(onDone)();
      })
    );
    opacity.value = withDelay(piece.delay + piece.duration - 200, withTiming(0, { duration: 200 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${piece.rotate}deg` }],
    opacity: opacity.value,
    left: piece.x,
  }));

  return (
    <Animated.View style={[styles.piece, style]}>
      <Text style={styles.emoji}>{piece.emoji}</Text>
    </Animated.View>
  );
}

export function Confetti({ visible, onDone }: ConfettiProps) {
  const [pieces] = React.useState(() => generatePieces());
  const doneCount = React.useRef(0);

  if (!visible) return null;

  const handlePieceDone = () => {
    doneCount.current += 1;
    if (doneCount.current >= NUM_CONFETTI) onDone?.();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p) => (
        <ConfettiPieceComponent key={p.id} piece={p} onDone={handlePieceDone} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
  },
  emoji: {
    fontSize: 24,
  },
});
