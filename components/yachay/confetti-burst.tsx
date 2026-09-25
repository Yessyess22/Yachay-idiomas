import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type Particle = {
  id: number;
  left: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  drift: number;
};

const COLORS = ['#00C853', '#FFB300', '#FF3366', '#00B0FF', '#7C3AED', '#FF6D00'];
const PARTICLE_COUNT = 26;
const FALL_DISTANCE = 420;

/** Hash determinístico (sin Math.random) para variar cada partícula de forma estable. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  left: pseudoRandom(i * 1.7) * 100,
  color: COLORS[i % COLORS.length],
  size: 8 + pseudoRandom(i * 2.3) * 6,
  delay: pseudoRandom(i * 3.1) * 200,
  duration: 900 + pseudoRandom(i * 4.9) * 600,
  rotation: (pseudoRandom(i * 5.7) - 0.5) * 720,
  drift: (pseudoRandom(i * 6.3) - 0.5) * 120,
}));

function ConfettiPiece({ particle }: { particle: Particle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: particle.duration, easing: Easing.out(Easing.quad) })
    );
  }, [particle.delay, particle.duration, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: progress.value * FALL_DISTANCE },
      { translateX: progress.value * particle.drift },
      { rotate: `${progress.value * particle.rotation}deg` },
    ],
    opacity: 1 - progress.value * 0.85,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: `${particle.left}%`,
          width: particle.size,
          height: particle.size * 0.4,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
}

/** Ráfaga de confeti de una sola vez, superpuesta al contenedor padre (posición absoluta). */
export function ConfettiBurst() {
  return (
    <View style={styles.container} pointerEvents="none">
      {PARTICLES.map((p) => (
        <ConfettiPiece key={p.id} particle={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: -20,
    borderRadius: 2,
  },
});
