import { Illustrations } from '@/constants/illustrations';
import { BrandColors } from '@/src/constants/theme';
import { useGame } from '@/src/context/GameContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function BlockedScreen() {
  const { gems, consumeGems, restoreLives, addLives } = useGame();
  const router = useRouter();

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    shakeX.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(0, { duration: 60 })
      ),
      3
    );
  }, [shakeX]);

  function handleBuySingleLife() {
    if (gems < 5) {
      Alert.alert(
        'Gemas insuficientes 💎',
        `Necesitas 5 gemas para recuperar 1 vida y tienes ${gems}. Puedes ganar gemas completando lecciones o repasando en la Biblioteca.`
      );
      return;
    }

    const success = consumeGems(5);
    if (success) {
      addLives(1);
      Alert.alert('¡Vida Restaurada! ❤️', 'Has recuperado 1 vida por 5 gemas sagradas.', [
        { text: '¡Continuar!', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  }

  function handleBuyAllLives() {
    if (gems < 25) {
      Alert.alert(
        'Gemas insuficientes 💎',
        `Necesitas 25 gemas para restaurar todas tus vidas y tienes ${gems}. También puedes canjear 1 vida por 5 gemas.`
      );
      return;
    }

    const success = consumeGems(25);
    if (success) {
      restoreLives();
      Alert.alert('¡Vidas Restauradas! ❤️', 'Has recuperado tus 5 vidas por 25 gemas sagradas.', [
        { text: '¡Continuar!', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  }

  function handleGoPractice() {
    router.replace('/practice/saludos' as any);
  }

  function handleGoExplore() {
    router.replace('/(tabs)/explore');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={shakeStyle}>
          <Image source={Illustrations.llamaPiensa} style={styles.yachi} contentFit="contain" />
        </Animated.View>

        <Text style={styles.title}>¡Te quedaste sin vidas! 💔</Text>
        <Text style={styles.subtitle}>
          En el camino del saber andino los tropiezos son parte del aprendizaje. Elige cómo deseas continuar:
        </Text>

        <View style={styles.heartsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={styles.emptyHeart}>
              🖤
            </Text>
          ))}
        </View>

        {/* Balance actual de gemas */}
        <View style={styles.gemsBadge}>
          <Text style={styles.gemsBadgeText}>💎 Tu saldo: {gems} Gemas</Text>
        </View>

        {/* Opción 1A: Comprar 1 vida con 5 gemas */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.gemBtn, { backgroundColor: '#10B981', borderBottomColor: '#059669', marginBottom: 10 }]}
          onPress={handleBuySingleLife}
          activeOpacity={0.85}
        >
          <Text style={styles.gemBtnTitle}>❤️ Recuperar +1 Vida (5 💎)</Text>
          <Text style={styles.btnSubtext}>Canjea 5 gemas para desbloquearte de inmediato</Text>
        </TouchableOpacity>

        {/* Opción 1B: Recargar las 5 vidas con 25 gemas */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.gemBtn]}
          onPress={handleBuyAllLives}
          activeOpacity={0.85}
        >
          <Text style={styles.gemBtnTitle}>⚡ Recargar 5 Vidas (25 💎)</Text>
          <Text style={styles.btnSubtext}>Restaura tus 5 corazones completos al instante</Text>
        </TouchableOpacity>

        {/* Opción 2: Practicar sin vidas */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.practiceBtn]}
          onPress={handleGoPractice}
          activeOpacity={0.85}
        >
          <Text style={styles.practiceBtnTitle}>📖 Repaso en Modo Práctica</Text>
          <Text style={styles.btnSubtext}>Practica saludos y expresiones para reforzar conocimiento</Text>
        </TouchableOpacity>

        {/* Opción 3: Explorar Biblioteca Andina */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.exploreBtn]}
          onPress={handleGoExplore}
          activeOpacity={0.85}
        >
          <Text style={styles.exploreBtnTitle}>🏔️ Explorar la Biblioteca Andina</Text>
          <Text style={styles.btnSubtext}>Cuentos, gastronomía y cultura sin vidas ni exámenes</Text>
        </TouchableOpacity>

        {/* Volver al inicio */}
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}
        >
          <Text style={styles.backHomeText}>Volver a la Pantalla de Inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  yachi: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 320,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  emptyHeart: {
    fontSize: 26,
  },
  gemsBadge: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  gemsBadgeText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '800',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  gemBtn: {
    backgroundColor: '#E11D48',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  gemBtnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  practiceBtn: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  practiceBtnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  exploreBtn: {
    backgroundColor: '#0284C7',
  },
  exploreBtnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  btnSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    textAlign: 'center',
  },
  backHomeBtn: {
    marginTop: 8,
    paddingVertical: 12,
  },
  backHomeText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
