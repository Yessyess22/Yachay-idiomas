import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { shopService } from '@/src/services/shopService';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { Card } from '@/components/yachay/card';

const TEAL = '#00C853';
const PARCHMENT = '#F8F5EE';

interface ShopItem {
  id: string;
  title: string;
  description: string;
  icon?: any;
  cost: number;
  type: 'single_heart' | 'hearts' | 'streak_freeze' | 'double_xp' | 'outfit';
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'single_heart',
    title: 'Recargar 1 Vida (❤️ x1)',
    description: 'Restaura 1 corazón para tus exámenes (5 gemas por cada vida).',
    cost: 5,
    type: 'single_heart',
  },
  {
    id: 'refill_hearts',
    title: 'Recargar Todas las Vidas (❤️ x5)',
    description: 'Restaura tus 5 corazones al máximo al instante (25 gemas por las 5 vidas).',
    cost: 25,
    type: 'hearts',
  },
  {
    id: 'double_xp',
    title: 'Poción de Sabiduría 🧪',
    description: 'Duplica toda la experiencia (XP) que ganes durante los próximos 15 minutos.',
    icon: require('@/assets/images/logros/logro_maestro_sol.png'),
    cost: 20,
    type: 'double_xp',
  },
  {
    id: 'streak_freeze',
    title: 'Amuleto de Hielo ❄️',
    description: 'Protege tu racha de días si no puedes practicar un día.',
    icon: require('@/assets/images/logros/logro_hablante_corona.png'),
    cost: 25,
    type: 'streak_freeze',
  },
];

export default function ShopScreen() {
  const { user } = useAuth();
  const {
    gems,
    lives,
    hasDoubleXp,
    doubleXpMinutesLeft,
    streakFreezeCount,
    consumeGems,
    restoreLives,
    addLives,
    activateDoubleXp,
    addStreakFreeze,
  } = useGame();
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [modalFeedback, setModalFeedback] = useState<{ title: string; desc: string; emoji: string } | null>(null);

  const handleBuyPress = (item: ShopItem) => {
    if ((item.type === 'single_heart' || item.type === 'hearts') && (lives || 0) >= 5) {
      setModalFeedback({
        emoji: '❤️',
        title: '¡Vidas al Máximo!',
        desc: 'Tus vidas ya están completas (5/5). Solo necesitas recargarlas cuando falles preguntas en exámenes.',
      });
      return;
    }

    if ((gems || 0) < item.cost) {
      setModalFeedback({
        emoji: '💎',
        title: 'Gemas Insuficientes',
        desc: `Necesitas ${item.cost} gemas para adquirir "${item.title}". Actualmente tienes ${gems || 0} gemas. ¡Completa lecciones para ganar más!`,
      });
      return;
    }

    setConfirmItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!confirmItem) return;
    const item = confirmItem;
    setConfirmItem(null);

    const purchased = consumeGems(item.cost);
    if (!purchased) {
      setModalFeedback({
        emoji: '⚠️',
        title: 'No se pudo realizar el canje',
        desc: 'No dispones de suficientes gemas en este momento.',
      });
      return;
    }

    if (item.type === 'single_heart') {
      addLives(1);
    } else if (item.type === 'hearts') {
      restoreLives();
    } else if (item.type === 'double_xp') {
      activateDoubleXp();
    } else if (item.type === 'streak_freeze') {
      addStreakFreeze();
    }

    if (user?.uid) {
      shopService.buyItem(
        user.uid,
        {
          id: item.id === 'single_heart' ? 10 : item.id === 'refill_hearts' ? 1 : item.id === 'streak_freeze' ? 2 : 3,
          name: item.title,
          description: item.description,
          price_gems: item.cost,
          item_type: item.type === 'single_heart' || item.type === 'hearts' ? 'refill_lives' : item.type === 'streak_freeze' ? 'streak_freeze' : 'xp_boost',
          icon_name: item.id,
        },
        gems
      ).catch(() => {});
    }

    let msg = `Has obtenido "${item.title}".`;
    if (item.type === 'single_heart') {
      msg = `¡Recuperaste +1 Vida! ❤️ Ahora tienes ${Math.min(5, (lives || 0) + 1)} de 5 vidas para tus exámenes.`;
    } else if (item.type === 'hearts') {
      msg = '¡Tus 5 Vidas han sido restauradas al máximo! ❤️ (5/5)';
    } else if (item.type === 'double_xp') {
      msg = '¡Poción de Sabiduría activada! 🧪 Ganarás el doble de experiencia (2X XP) en lecciones y exámenes durante los próximos 15 minutos.';
    } else if (item.type === 'streak_freeze') {
      msg = `¡Amuleto de Hielo adquirido! ❄️ Tu racha está protegida. Tienes ${(streakFreezeCount || 0) + 1} amuleto(s) disponible(s).`;
    }

    setModalFeedback({
      emoji: '🎉',
      title: '¡Canje Exitoso!',
      desc: msg,
    });
  };

  return (
    <View style={styles.container}>
      <YachayTopBar />

      {/* Banner de Tesoro Andino */}
      <View style={styles.treasureBanner}>
        <View style={styles.bannerInfo}>
          <View style={styles.bannerTagBadge}>
            <Text style={styles.bannerTagText}>🏛️ MERCADO ANDINO</Text>
          </View>
          <Text style={styles.bannerTitle}>Tienda de Yachay</Text>
          <Text style={styles.bannerSub}>Canjea tus gemas sagradas por potenciadores y vidas.</Text>
        </View>
        <View style={styles.gemCounterBox}>
          <Text style={styles.gemCounterEmoji}>💎</Text>
          <Text style={styles.gemCounterValue}>{gems || 0}</Text>
          <Text style={styles.gemCounterLabel}>Gemas</Text>
        </View>
        {/* Ribete textil andino */}
        <View style={styles.andineRibbon}>
          <Text style={styles.andineRibbonText}>▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeading}>Potenciadores y Vidas</Text>

        {SHOP_ITEMS.map((item) => {
          const canAfford = (gems || 0) >= item.cost;
          const isHeartItem = item.type === 'single_heart' || item.type === 'hearts';
          return (
            <Card key={item.id} padding={14} style={styles.shopCard}>
              <View style={styles.itemIconBox}>
                {item.type === 'single_heart' ? (
                  <View style={styles.heartIconCircle}>
                    <Text style={styles.heartEmojiMain}>❤️</Text>
                    <View style={styles.heartCountBadge}>
                      <Text style={styles.heartCountBadgeText}>+1</Text>
                    </View>
                  </View>
                ) : item.type === 'hearts' ? (
                  <View style={[styles.heartIconCircle, styles.heartIconCircleFull]}>
                    <Text style={styles.heartEmojiMain}>💖</Text>
                    <View style={[styles.heartCountBadge, styles.heartCountBadgeFull]}>
                      <Text style={styles.heartCountBadgeText}>x5</Text>
                    </View>
                  </View>
                ) : (
                  <Image
                    source={item.icon}
                    style={styles.itemIcon}
                    resizeMode="contain"
                  />
                )}
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>

                {item.type === 'double_xp' && hasDoubleXp && (
                  <View style={styles.activeDoubleXpBadge}>
                    <Text style={styles.activeDoubleXpText}>⚡ ACTIVO ({doubleXpMinutesLeft} min restantes)</Text>
                  </View>
                )}

                {item.type === 'streak_freeze' && (
                  <Text style={styles.streakFreezeOwnedText}>
                    Tienes: {streakFreezeCount || 0} amuleto(s) ❄️
                  </Text>
                )}

                {isHeartItem && (
                  <Text style={styles.livesOwnedText}>
                    Vidas actuales: {lives ?? 5}/5 ❤️
                  </Text>
                )}

                <View style={styles.priceRow}>
                  <View style={styles.costBadge}>
                    <Text style={styles.costEmoji}>💎</Text>
                    <Text style={styles.costValue}>{item.cost}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                    onPress={() => handleBuyPress(item)}
                    activeOpacity={0.8}
                    disabled={!canAfford}
                  >
                    <Text style={[styles.buyBtnText, !canAfford && styles.buyBtnTextDisabled]}>
                      {canAfford ? 'Canjear' : 'Faltan Gemas'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        })}

        <View style={styles.spacerBottom} />
      </ScrollView>

      {/* Modal de Confirmación de Canje */}
      <Modal
        animationType="fade"
        transparent
        visible={confirmItem !== null}
        onRequestClose={() => setConfirmItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCornerTL}>◇◆◇</Text>
            <Text style={styles.modalCornerTR}>◇◆◇</Text>

            <View style={styles.modalIconWrap}>
              {confirmItem && (
                confirmItem.type === 'single_heart' ? (
                  <View style={styles.modalHeartCircle}>
                    <Text style={styles.modalHeartEmoji}>❤️</Text>
                  </View>
                ) : confirmItem.type === 'hearts' ? (
                  <View style={[styles.modalHeartCircle, styles.modalHeartCircleFull]}>
                    <Text style={styles.modalHeartEmoji}>💖</Text>
                  </View>
                ) : (
                  <Image
                    source={confirmItem.icon}
                    style={styles.modalItemIcon}
                    resizeMode="contain"
                  />
                )
              )}
            </View>

            <Text style={styles.modalTitle}>{confirmItem?.title}</Text>
            <Text style={styles.modalDesc}>{confirmItem?.description}</Text>

            <View style={styles.modalCostRow}>
              <Text style={styles.modalCostLabel}>Costo del canje:</Text>
              <View style={styles.costBadge}>
                <Text style={styles.costEmoji}>💎</Text>
                <Text style={styles.costValue}>{confirmItem?.cost}</Text>
              </View>
            </View>

            <Text style={styles.modalBalanceText}>
              Gemas disponibles: <Text style={styles.modalGemsHighlight}>{gems} 💎</Text>
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConfirmItem(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmPurchase}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Canjear Ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Feedback (Éxito o Información) */}
      <Modal
        animationType="fade"
        transparent
        visible={modalFeedback !== null}
        onRequestClose={() => setModalFeedback(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalFeedbackEmoji}>{modalFeedback?.emoji}</Text>
            <Text style={styles.modalTitle}>{modalFeedback?.title}</Text>
            <Text style={styles.modalDesc}>{modalFeedback?.desc}</Text>

            <TouchableOpacity
              style={styles.modalOkBtn}
              onPress={() => setModalFeedback(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOkBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PARCHMENT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  /* Banner de Tesoro */
  treasureBanner: {
    backgroundColor: '#009624',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#00C853',
    position: 'relative',
    shadowColor: '#009624',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerInfo: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTagBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  bannerTagText: {
    color: '#FFD768',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  bannerSub: {
    color: '#DDF1ED',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  gemCounterBox: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gemCounterEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  gemCounterValue: {
    color: '#FFD768',
    fontSize: 18,
    fontWeight: '900',
  },
  gemCounterLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  andineRibbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  andineRibbonText: {
    color: '#FFD768',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    marginVertical: 10,
    letterSpacing: -0.2,
  },

  /* Tarjetas de Tienda */
  shopCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F7F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E7DFD1',
  },
  itemIcon: {
    width: 44,
    height: 44,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 11,
    color: '#7A6E65',
    lineHeight: 15,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FBD46D',
  },
  costEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  costValue: {
    color: '#B7791F',
    fontSize: 12,
    fontWeight: '900',
  },
  buyBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buyBtnDisabled: {
    backgroundColor: '#EAE3D6',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  buyBtnTextDisabled: {
    color: '#9C9086',
  },

  /* Modal Canjes */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: '#EBD89F',
    position: 'relative',
    shadowColor: '#3A2A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCornerTL: {
    position: 'absolute',
    left: 8,
    top: 6,
    fontSize: 9,
    color: '#D97706',
    letterSpacing: 1,
  },
  modalCornerTR: {
    position: 'absolute',
    right: 8,
    top: 6,
    fontSize: 9,
    color: '#D97706',
    letterSpacing: 1,
  },
  modalIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#F7F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E7DFD1',
  },
  modalItemIcon: {
    width: 48,
    height: 48,
  },
  modalFeedbackEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalCostLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  modalBalanceText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 18,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: TEAL,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#009624',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOkBtn: {
    backgroundColor: TEAL,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 3,
    borderBottomColor: '#009624',
    marginTop: 4,
  },
  modalOkBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  heartIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE4E6',
    borderWidth: 2,
    borderColor: '#FDA4AF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  heartIconCircleFull: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FB7185',
  },
  heartEmojiMain: {
    fontSize: 28,
  },
  heartCountBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  heartCountBadgeFull: {
    backgroundColor: '#D97706',
  },
  heartCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  modalHeartCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE4E6',
    borderWidth: 3,
    borderColor: '#FDA4AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeartCircleFull: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FB7185',
  },
  modalHeartEmoji: {
    fontSize: 42,
  },
  activeDoubleXpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  activeDoubleXpText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  streakFreezeOwnedText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '700',
    marginTop: 4,
  },
  livesOwnedText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '700',
    marginTop: 4,
  },
  spacerBottom: {
    height: 40,
  },
  modalGemsHighlight: {
    fontWeight: '800',
    color: '#1D4ED8',
  },
});
