import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from '@/src/context/GameContext';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

const TEAL = '#1B8B8C';
const GOLD = '#D48B0A';

function getLevelName(xp: number) {
  if (xp < 200) return 'Nivel 1';
  if (xp < 500) return 'Nivel 2';
  if (xp < 1000) return 'Nivel 3';
  if (xp < 2000) return 'Nivel 4';
  return 'Nivel 5';
}

export function YachayTopBar() {
  const { lives, gems, streakDays, xp, restoreLives } = useGame();
  const { profile } = useAuth();
  const router = useRouter();
  const [livesModal, setLivesModal] = useState(false);

  const totalXp = profile?.total_xp ?? xp ?? 0;
  const levelName = getLevelName(totalXp);
  const coins = totalXp + gems * 5;
  const username = profile?.username || 'Tú';
  const initial = username.charAt(0).toUpperCase();

  return (
    <>
      <View style={styles.bar}>
        {/* LOGO izquierda */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>Yachay</Text>
        </View>

        {/* STATS en el centro */}
        <View style={styles.statsRow}>
          {/* Coins */}
          <View style={styles.pill}>
            <Image
              source={require('@/assets/images/logros/moneda_yachay_coin.png')}
              style={styles.pillIcon}
            />
            <Text style={styles.pillText}>{coins.toLocaleString()}</Text>
          </View>

          {/* Nivel */}
          <View style={styles.pill}>
            <Image
              source={require('@/assets/images/logros/logro_principiante_chullo.png')}
              style={styles.pillIcon}
            />
            <Text style={styles.pillText}>{levelName}</Text>
          </View>

          {/* Racha + vidas (toca para ver vidas) */}
          <TouchableOpacity style={styles.pill} onPress={() => setLivesModal(true)} activeOpacity={0.75}>
            <Text style={styles.pillEmoji}>🔥</Text>
            <Text style={styles.pillText}>{streakDays} días</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar derecha */}
        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={() => router.push('/(tabs)/profile' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarInitial}>{initial}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal vidas */}
      <Modal animationType="slide" transparent visible={livesModal} onRequestClose={() => setLivesModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>❤️</Text>
            <Text style={styles.modalTitle}>Vidas ({lives} / 5)</Text>
            <Text style={styles.modalDesc}>
              {lives < 5
                ? 'Las vidas se recargan con el tiempo o puedes completarlas en la Tienda.'
                : '¡Tus vidas están al máximo! Sigue aprendiendo Quechua.'}
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
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  pillIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  pillEmoji: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A1A0A',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B2DFDB',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
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
