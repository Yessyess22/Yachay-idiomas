import { Image } from 'expo-image';
import { useEffect } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type LlamaMarkProps = {
  source?: ImageSourcePropType;
  size?: number;
  waving?: boolean;
};

/** The waving llama mark used in the header/logo. Falls back to an emoji until the real artwork is dropped into assets/images/. */
export function LlamaMark({ source, size = 56, waving = true }: LlamaMarkProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!waving) return;
    rotation.value = withDelay(
      1200,
      withRepeat(withSequence(withTiming(-14, { duration: 325 }), withTiming(0, { duration: 325 })), 3, false)
    );
  }, [waving, rotation]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (source) {
    return (
      <Animated.View style={[{ width: size, height: size }, waveStyle]}>
        <Image source={source} style={styles.image} contentFit="contain" />
      </Animated.View>
    );
  }

  return (
    <Animated.Text style={[{ fontSize: size * 0.8, lineHeight: size }, waveStyle]}>
      🦙
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
