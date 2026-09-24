import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from '@/src/context/GameContext';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

const TEAL = '#1B8B8C';

export function YachayTopBar() {
  const { lives, streakDays, xp, restoreLives } = useGame();
  const { profile } = useAuth();
  const router = useRouter();
  const [livesModal, setLivesModal] = useState(false);
  const [streakModal, setStreakModal] = useState(false);

  const currentXp = xp ?? profile?.total_xp ?? 0;
  const streak = streakDays ?? profile?.streak_count ?? 0;

  return (
    <>
      <View style={styles.bar}>
        {/* Adorno textil andino esquina izquierda */}
        <Text style={styles.cornerPatternLeft}>◇◆◇</Text>

        {/* LOGO izquierda con montañas */}
        <View style={styles.logoWrap}>
          <View style={styles.mountainIconWrap}>
            <Text style={styles.mountainIcon}>⛰️</Text>
          </View>
          <Text style={styles.logoText}>Yachay</Text>
        </View>

        {/* STATS en la derecha con los colores exactos del diseño */}
        <View style={styles.statsRow}>
          {/* XP Dinámico (Dorado suave) */}
          <View style={[styles.pill, styles.pillXp]}>
            <Text style={styles.pillEmojiCoin}>🪙</Text>
            <Text style={[styles.pillText, styles.pillTextXp]}>{currentXp} XP</Text>
          </View>

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

          {/* Traductor de Voz (Verde mar suave) */}
          <TouchableOpacity
            style={[styles.pill, styles.pillTranslator]}
            onPress={() => router.push('/translator' as any)}
            activeOpacity={0.75}
          >
            <Text style={styles.pillEmojiMic}>🎙️</Text>
            <Text style={[styles.pillText, styles.pillTextTranslator]}>Traductor</Text>
          </TouchableOpacity>
        </View>

        {/* Adorno textil andino esquina derecha */}
        <Text style={styles.cornerPatternRight}>◇◆◇</Text>
      </View>

      {/* Modal Vidas */}
      <Modal animationType="slide" transparent visible={livesModal} onRequestClose={() => setLivesModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>❤️</Text>
            <Text style={styles.modalTitle}>Vidas ({lives} / 5)</Text>
            <Text style={styles.modalDesc}>
              {lives < 5
                ? `Te quedan ${lives} de 5 vidas. Pierdes 1 vida cuando fallas una pregunta en las lecciones.`
                : '¡Tus vidas están al máximo (5/5)! Sigue aprendiendo Quechua con energía.'}
            </Text>
            {lives < 5 && (
              <TouchableOpacity
                style={styles.refillBtn}
                onPress={() => { restoreLives(); setLivesModal(false); }}
              >
                <Text style={styles.refillText}>Recargar Vidas Gratis ❤️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setLivesModal(false)}>
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
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F6F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE3D6',
    position: 'relative',
  },
  cornerPatternLeft: {
    position: 'absolute',
    left: 4,
    top: 2,
    fontSize: 10,
    color: '#D2C3AA',
    letterSpacing: 1,
  },
  cornerPatternRight: {
    position: 'absolute',
    right: 4,
    top: 2,
    fontSize: 10,
    color: '#D2C3AA',
    letterSpacing: 1,
  },
  logoWrap: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mountainIconWrap: {
    marginBottom: -4,
  },
  mountainIcon: {
    fontSize: 14,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0E4D55',
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 11,
    gap: 5,
    borderWidth: 1.5,
  },
  pillXp: {
    backgroundColor: '#FFF9E6',
    borderColor: '#EBD89F',
  },
  pillNivel: {
    backgroundColor: '#EAF7EE',
    borderColor: '#BFDEC6',
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
    fontSize: 14,
  },
  pillEmojiHeart: {
    fontSize: 14,
  },
  pillEmojiMountain: {
    fontSize: 14,
  },
  pillEmojiFire: {
    fontSize: 14,
  },
  pillEmojiMic: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pillTextXp: {
    color: '#5C4314',
  },
  pillTextNivel: {
    color: '#166231',
  },
  pillTextStreak: {
    color: '#9E3C0E',
  },
  pillTextLives: {
    color: '#B82828',
  },
  pillTextTranslator: {
    color: '#00695C',
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
