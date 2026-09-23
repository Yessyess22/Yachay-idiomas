import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGame } from '@/src/context/GameContext';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { Card } from '@/components/yachay/card';

const TEAL = '#1B8B8C';
const TEAL_DARK = '#0E4D55';
const GOLD = '#E5A00D';
const PARCHMENT = '#F8F5EE';

interface ShopItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  cost: number;
  type: 'hearts' | 'streak_freeze' | 'double_xp' | 'outfit';
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'refill_hearts',
    title: 'Recargar Vidas (❤️ x5)',
    description: 'Restaura todos tus corazones al instante para seguir aprendiendo sin pausa.',
    icon: require('@/assets/images/logros/moneda_yachay_coin.png'),
    cost: 350,
    type: 'hearts',
  },
  {
    id: 'streak_freeze',
    title: 'Amuleto de Hielo ❄️',
    description: 'Protege tu racha de días si no puedes practicar un día.',
    icon: require('@/assets/images/logros/logro_hablante_corona.png'),
    cost: 400,
    type: 'streak_freeze',
  },
  {
    id: 'double_xp',
    title: 'Poción de Sabiduría 🧪',
    description: 'Duplica toda la experiencia (XP) que ganes durante los próximos 15 minutos.',
    icon: require('@/assets/images/logros/logro_maestro_sol.png'),
    cost: 250,
    type: 'double_xp',
  },
  {
    id: 'chullo_item',
    title: 'Chullo Sagrado de Lana 🧶',
    description: 'Prenda tradicional andina para personalizar tu perfil de estudiante.',
    icon: require('@/assets/images/logros/item_chullo_coleccionable.png'),
    cost: 600,
    type: 'outfit',
  },
];

export default function ShopScreen() {
  const { gems, consumeGems, restoreLives, equipOutfit } = useGame();
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleBuy = (item: ShopItem) => {
    if (gems < item.cost) {
      Alert.alert(
        'Gemas Insuficientes 💎',
        `Necesitas ${item.cost} gemas para adquirir "${item.title}". ¡Sigue completando lecciones para ganar más!`
      );
      return;
    }

    Alert.alert(
      'Confirmar Compra',
      `¿Deseas canjear ${item.cost} gemas por "${item.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () => {
            setBuyingId(item.id);
            const purchased = consumeGems(item.cost);
            if (!purchased) {
              Alert.alert('Error', 'No tienes suficientes gemas.');
              setBuyingId(null);
              return;
            }
            if (item.type === 'hearts') {
              restoreLives();
            }
            if (item.type === 'outfit') {
              // Equipar el accesorio cosmético en el perfil de Yachi
              equipOutfit(item.id);
            }
            setTimeout(() => {
              setBuyingId(null);
              Alert.alert(
                '¡Adquirido con Éxito! 🎉',
                item.type === 'outfit'
                  ? `Has equipado "${item.title}" en tu perfil. ¡Visita tu perfil para verlo! 🦙`
                  : `Has obtenido "${item.title}".`
              );
            }, 400);
          },
        },
      ]
    );
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
          <Text style={styles.bannerSub}>Canjea tus gemas sagradas por potenciadores y atuendos.</Text>
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
          return (
            <Card key={item.id} padding={14} style={styles.shopCard}>
              <View style={styles.itemIconBox}>
                <Image
                  source={item.icon}
                  style={styles.itemIcon}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>

                <View style={styles.priceRow}>
                  <View style={styles.costBadge}>
                    <Text style={styles.costEmoji}>💎</Text>
                    <Text style={styles.costValue}>{item.cost}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                    onPress={() => handleBuy(item)}
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

        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: '#0E4D55',
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
    borderColor: '#1B8B8C',
    position: 'relative',
    shadowColor: '#0E4D55',
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
});
