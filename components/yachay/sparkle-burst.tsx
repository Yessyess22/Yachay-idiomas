import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type Sparkle = {
  id: number;
  dx: number;
  dy: number;
  delay: number;
  size: number;
};

const SPARKLE_COUNT = 10;

/** Hash determinístico (sin Math.random) para variar cada destello de forma estable. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const SPARKLES: Sparkle[] = Array.from({ length: SPARKLE_COUNT }).map((_, i) => {
  const angle = ((360 / SPARKLE_COUNT) * i + pseudoRandom(i * 3.3) * 24) * (Math.PI / 180);
  const distance = 46 + pseudoRandom(i * 4.1) * 24;
  return {
    id: i,
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
    delay: pseudoRandom(i * 2.7) * 120,
    size: 12 + pseudoRandom(i * 5.5) * 8,
  };
});

function SparklePiece({ sparkle }: { sparkle: Sparkle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      sparkle.delay,
      withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) })
    );
  }, [sparkle.delay, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * sparkle.dx },
      { translateY: progress.value * sparkle.dy },
      { scale: 0.4 + progress.value * 0.8 },
    ],
    opacity: 1 - progress.value,
  }));

  return (
    <Animated.Text
      style={[styles.sparkle, { fontSize: sparkle.size, marginLeft: -sparkle.size / 2, marginTop: -sparkle.size / 2 }, style]}
    >
      ✨
    </Animated.Text>
  );
}

/** Destellos radiales de una sola vez, centrados sobre el elemento padre (ej. Yachi). */
export function SparkleBurst() {
  return (
    <View style={styles.container} pointerEvents="none">
      {SPARKLES.map((s) => (
        <SparklePiece key={s.id} sparkle={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
});
