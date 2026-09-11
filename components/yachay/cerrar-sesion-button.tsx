import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Theme } from '@/constants/yachay-theme';

type CerrarSesionButtonProps = {
  onPress: () => void;
  loading?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CerrarSesionButton({ onPress, loading }: CerrarSesionButtonProps) {
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 0.97 : 1, { duration: 100 }) }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        pressed.value = 1;
      }}
      onPressOut={() => {
        pressed.value = 0;
      }}
      onPress={onPress}
      style={[styles.button, pressStyle]}>
      {loading ? <ActivityIndicator color={Theme.colors.white} /> : <Text style={styles.text}>Cerrar Sesión</Text>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Theme.colors.danger,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
  },
  text: {
    ...Theme.fonts.bodyLarge,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.white,
  },
});
