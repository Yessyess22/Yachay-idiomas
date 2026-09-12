import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { useGame } from '@/src/context/GameContext';
import { BrandColors } from '@/src/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function YachayTopBar() {
  const { lives, gems, streakDays, restoreLives } = useGame();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Racha 🔥 */}
      <View style={styles.badge}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={[styles.badgeText, { color: '#FF9600' }]}>{streakDays}</Text>
      </View>

      {/* Gemas 💎 */}
      <View style={styles.badge}>
        <Text style={styles.emoji}>💎</Text>
        <Text style={[styles.badgeText, { color: '#1CB0F6' }]}>{gems}</Text>
      </View>

      {/* Vidas ❤️ */}
      <TouchableOpacity
        style={styles.badge}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.emoji}>❤️</Text>
        <Text style={[styles.badgeText, { color: '#FF4B4B' }]}>{lives}</Text>
      </TouchableOpacity>

      {/* Modal de información de vidas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>❤️</Text>
            <Text style={styles.modalTitle}>Tus Vidas ({lives}/5)</Text>
            <Text style={styles.modalDescription}>
              {lives < 5
                ? 'Las vidas se recargan con el tiempo o puedes completarlas en la Tienda.'
                : '¡Tienes tus vidas al máximo! Sigue practicando Quechua.'}
            </Text>

            {lives < 5 && (
              <TouchableOpacity
                style={styles.refillButton}
                onPress={() => {
                  restoreLives();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.refillButtonText}>Recargar Vidas Gratis</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  emoji: {
    fontSize: 18,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  refillButton: {
    backgroundColor: '#58CC02',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 4,
    borderBottomColor: '#46A302',
  },
  refillButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  closeButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#AFB5C0',
    fontSize: 16,
    fontWeight: '700',
  },
});
