import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

/**
 * Animación reutilizable de la mascota Yachi: un "bounce" ligero para
 * respuestas/taps, y un "celebrate" más expresivo (salto + giro) para
 * aciertos importantes o fin de lección/historia.
 */
export function useYachiBounce() {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  function bounce() {
    scale.value = withSequence(
      withTiming(1.25, { duration: 110 }),
      withTiming(1, { duration: 160 })
    );
    rotate.value = withSequence(
      withTiming(-6, { duration: 90 }),
      withTiming(6, { duration: 120 }),
      withTiming(0, { duration: 120 })
    );
  }

  function celebrate() {
    scale.value = withSequence(
      withTiming(1.35, { duration: 130 }),
      withTiming(0.95, { duration: 120 }),
      withTiming(1.15, { duration: 140 }),
      withTiming(1, { duration: 150 })
    );
    rotate.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 150 }),
      withTiming(-6, { duration: 130 }),
      withTiming(0, { duration: 120 })
    );
  }

  return { style, bounce, celebrate };
}
