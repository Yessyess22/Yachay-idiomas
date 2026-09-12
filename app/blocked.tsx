import { Illustrations } from '@/constants/illustrations';
import { BrandColors } from '@/src/constants/theme';
import { useGame } from '@/src/context/GameContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export default function BlockedScreen() {
  const { restoreLives } = useGame();
  const router = useRouter();

  // Animación de sacudida para generar urgencia
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    shakeX.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(0, { duration: 60 })
      ),
      3
    );
  }, []);

  function handleRestore() {
    restoreLives();
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <Animated.View style={shakeStyle}>
        <Image
          source={Illustrations.llamaPiensa}
          style={styles.yachi}
          contentFit="contain"
        />
      </Animated.View>

      <Text style={styles.title}>¡Sin vidas!</Text>
      <Text style={styles.subtitle}>
        Has agotado tus 5 vidas.{'\n'}Descansa un poco y vuelve más tarde.
      </Text>

      <View style={styles.heartsRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Text key={i} style={styles.emptyHeart}>🖤</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
        <Text style={styles.restoreBtnText}>Restaurar vidas (continuar)</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        En producción, las vidas se restauran con tiempo o con gemas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: BrandColors.bgLight,
  },
  yachi: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: BrandColors.brandNavy,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  emptyHeart: { fontSize: 28 },
  restoreBtn: {
    backgroundColor: BrandColors.streakFire,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 20,
  },
  restoreBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
});
