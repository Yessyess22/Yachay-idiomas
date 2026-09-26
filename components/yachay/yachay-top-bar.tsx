import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Illustrations } from '@/constants/illustrations';
import { useGame } from '@/src/context/GameContext';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

const TEAL = '#00C853';

export function YachayTopBar() {
  const {
    lives,
    streakDays,
    xp,
    gems,
    restoreLives,
    addLives,
    consumeGems,
    hasDoubleXp,
    doubleXpMinutesLeft,
    streakFreezeCount,
  } = useGame();
  const { profile } = useAuth();
  const router = useRouter();
  const [livesModal, setLivesModal] = useState(false);
  const [streakModal, setStreakModal] = useState(false);
  const [gemsModal, setGemsModal] = useState(false);

  const currentXp = xp ?? profile?.total_xp ?? 0;
  const currentGems = gems ?? profile?.gems ?? 100;
  const streak = streakDays ?? profile?.streak_count ?? 0;

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.safeTopBar}>
      <View style={styles.bar}>
        {/* Adorno textil andino esquina izquierda */}
        <Text style={styles.cornerPatternLeft}>◇◆◇</Text>

        {/* LOGO izquierda unificado con icono oficial de Yachay */}
        <TouchableOpacity
          style={styles.logoWrap}
          onPress={() => router.push('/modal' as any)}
          activeOpacity={0.8}
        >
          <Image
            source={Illustrations.appIconCircularMontana}
            style={styles.topLogoIcon}
            resizeMode="contain"
          />
          <View style={styles.logoTextWrap}>
            <Text style={styles.logoText}>Yachay</Text>
          </View>
        </TouchableOpacity>

        {/* STATS en la derecha con los colores exactos del diseño */}
        <View style={styles.statsRow}>
          {/* XP Dinámico (Dorado suave) */}
          <View style={[styles.pill, styles.pillXp]}>
            <Text style={styles.pillEmojiCoin}>🪙</Text>
            <Text style={[styles.pillText, styles.pillTextXp]}>{currentXp} XP</Text>
          </View>

          {/* Badge Doble XP si está activo */}
          {hasDoubleXp && (
            <View style={[styles.pill, styles.pillDoubleXp]}>
              <Text style={styles.pillEmojiZap}>⚡</Text>
              <Text style={styles.pillTextDoubleXp}>2X</Text>
            </View>
          )}

          {/* Gemas (Azul diamante suave) */}
          <TouchableOpacity
            style={[styles.pill, styles.pillGems]}
            onPress={() => setGemsModal(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pillEmojiGem}>💎</Text>
            <Text style={[styles.pillText, styles.pillTextGems]}>{currentGems}</Text>
          </TouchableOpacity>

          {/* Vidas (Rojo suave) */}
          <TouchableOpacity
            style={[styles.pill, styles.pillLives]}
            onPress={() => setLivesModal(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pillEmojiHeart}>❤️</Text>
            <Text style={[styles.pillText, styles.pillTextLives]}>{lives}</Text>
          </TouchableOpacity>

          {/* Racha (Melocotón / Naranja suave) */}
          <TouchableOpacity
            style={[styles.pill, styles.pillStreak]}
            onPress={() => setStreakModal(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pillEmojiFire}>🔥</Text>
            <Text style={[styles.pillText, styles.pillTextStreak]}>
              {streak} {streak === 1 ? 'día' : 'días'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Adorno textil andino esquina derecha */}
        <Text style={styles.cornerPatternRight}>◇◆◇</Text>
      </View>
      </SafeAreaView>

      {/* Modal Vidas */}
      <Modal animationType="slide" transparent visible={livesModal} onRequestClose={() => setLivesModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>❤️</Text>
            <Text style={styles.modalTitle}>Vidas ({lives} / 5)</Text>
            <Text style={styles.modalDesc}>
              {lives < 5
                ? `Te quedan ${lives} de 5 vidas. Pierdes 1 vida cuando fallas una pregunta en los exámenes sumativos.`
                : '¡Tus vidas están al máximo (5/5)! Se usan exclusivamente en los exámenes de nivel.'}
            </Text>
            {lives < 5 && (
              <View style={styles.livesActionGroup}>
                {currentGems >= 5 && (
                  <TouchableOpacity
                    style={[styles.refillBtn, styles.refillBtnGreen]}
                    onPress={() => {
                      consumeGems(5);
                      addLives(1);
                      setLivesModal(false);
                    }}
                  >
                    <Text style={styles.refillText}>Recargar +1 Vida (5 💎)</Text>
                  </TouchableOpacity>
                )}
                {currentGems >= 25 && (
                  <TouchableOpacity
                    style={[styles.refillBtn, styles.refillBtnGold]}
                    onPress={() => {
                      consumeGems(25);
                      restoreLives();
                      setLivesModal(false);
                    }}
                  >
                    <Text style={styles.refillText}>Recargar 5 Vidas (25 💎)</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.refillBtn, styles.refillBtnBlue]}
                  onPress={() => {
                    setLivesModal(false);
                    router.push('/(tabs)/shop' as any);
                  }}
                >
                  <Text style={styles.refillText}>Ir a la Tienda 🛒</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setLivesModal(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Gemas */}
      <Modal animationType="slide" transparent visible={gemsModal} onRequestClose={() => setGemsModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>💎</Text>
            <Text style={styles.modalTitle}>Gemas ({currentGems})</Text>
            <Text style={styles.modalDesc}>
              Tienes {currentGems} {currentGems === 1 ? 'gema sagrada' : 'gemas sagradas'}.{'\n\n'}
              • Ganas +15 gemas por completar lecciones y +30 en exámenes.{'\n'}
              • En las lecciones no pierdes gemas; fallar reduce la experiencia ganada.{'\n'}
              • Úsalas para recargar vidas o comprar potenciadores en la tienda.
            </Text>
            <TouchableOpacity
              style={styles.refillBtn}
              onPress={() => {
                setGemsModal(false);
                router.push('/(tabs)/shop' as any);
              }}
            >
              <Text style={styles.refillText}>Ir a la Tienda Yachay 🛒</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setGemsModal(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Racha */}
      <Modal animationType="slide" transparent visible={streakModal} onRequestClose={() => setStreakModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>🔥</Text>
            <Text style={styles.modalTitle}>¡Racha de {streak} {streak === 1 ? 'día' : 'días'}!</Text>
            <Text style={styles.modalDesc}>
              {streak === 1
                ? '¡Comenzaste tu primer día de práctica! Vuelve mañana para que tu llama del saber no se apague.'
                : `¡Increíble disciplina! Llevas ${streak} días consecutivos aprendiendo Quechua.`}
              {streakFreezeCount > 0
                ? `\n\n❄️ Tienes ${streakFreezeCount} Amuleto(s) de Hielo protegiendo tu racha si un día no puedes practicar.`
                : ''}
            </Text>
            <TouchableOpacity style={styles.refillBtn} onPress={() => setStreakModal(false)}>
              <Text style={styles.refillText}>¡A seguir aprendiendo! 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setStreakModal(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeTopBar: {
    backgroundColor: '#F9F6F0',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F6F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE3D6',
    position: 'relative',
  },
  livesActionGroup: {
    width: '100%',
    gap: 8,
    marginBottom: 8,
  },
  refillBtnGreen: {
    backgroundColor: '#00C853',
    borderBottomColor: '#009624',
  },
  refillBtnGold: {
    backgroundColor: '#D97706',
    borderBottomColor: '#B45309',
  },
  refillBtnBlue: {
    backgroundColor: '#0284C7',
    borderBottomColor: '#0369A1',
  },
  cornerPatternLeft: {
    position: 'absolute',
    left: 3,
    top: 2,
    fontSize: 8,
    color: '#D2C3AA',
    letterSpacing: 1,
  },
  cornerPatternRight: {
    position: 'absolute',
    right: 3,
    top: 2,
    fontSize: 8,
    color: '#D2C3AA',
    letterSpacing: 1,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  topLogoIcon: {
    width: 25,
    height: 25,
  },
  logoTextWrap: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#00701A',
    letterSpacing: -0.3,
  },
  logoTextAccent: {
    color: '#F59E0B',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 4.5,
    paddingHorizontal: 7,
    gap: 3.5,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  pillXp: {
    backgroundColor: '#FFF9E6',
    borderColor: '#EBD89F',
  },
  pillDoubleXp: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    paddingHorizontal: 6,
  },
  pillEmojiZap: {
    fontSize: 12,
  },
  pillGems: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  pillNivel: {
    backgroundColor: '#E0F2F1',
    borderColor: '#80CBC4',
  },
  pillStreak: {
    backgroundColor: '#FFF1E8',
    borderColor: '#F6CAB0',
  },
  pillLives: {
    backgroundColor: '#FDECEC',
    borderColor: '#F9C6C6',
  },
  pillTranslator: {
    backgroundColor: '#E0F2F1',
    borderColor: '#80CBC4',
  },
  pillEmojiCoin: {
    fontSize: 12.5,
  },
  pillEmojiGem: {
    fontSize: 12.5,
  },
  pillEmojiHeart: {
    fontSize: 12.5,
  },
  pillEmojiMountain: {
    fontSize: 13,
  },
  pillEmojiFire: {
    fontSize: 12.5,
  },
  pillEmojiMic: {
    fontSize: 12.5,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  pillTextXp: {
    color: '#5C4314',
  },
  pillTextDoubleXp: {
    color: '#B45309',
    fontWeight: '900',
  },
  pillTextGems: {
    color: '#1D4ED8',
  },
  pillTextNivel: {
    color: '#00701A',
  },
  pillTextStreak: {
    color: '#D97706',
  },
  pillTextLives: {
    color: '#FF3366',
  },
  pillTextTranslator: {
    color: '#00701A',
  },
  /* Modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalEmoji: { fontSize: 50, marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#3C3C3C', marginBottom: 8 },
  modalDesc: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  refillBtn: {
    backgroundColor: TEAL,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 4,
    borderBottomColor: '#136566',
  },
  refillText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  closeBtn: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  closeBtnText: { color: '#AFB5C0', fontSize: 16, fontWeight: '700' },
});
