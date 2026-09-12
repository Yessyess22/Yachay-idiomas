import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { shopService } from '@/src/services/shopService';
import { ShopItem } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: 1,
    name: 'Protector de Racha',
    description: 'Evita perder tu racha de días consecutivo si un día no practicas Quechua.',
    price_gems: 200,
    item_type: 'streak_freeze',
    icon_name: '🛡️',
  },
  {
    id: 2,
    name: 'Recarga de Vidas',
    description: 'Recupera tus 5 vidas al instante para continuar practicando sin esperar.',
    price_gems: 100,
    item_type: 'refill_lives',
    icon_name: '❤️',
  },
  {
    id: 3,
    name: 'Potenciador de XP (2x)',
    description: 'Duplica el XP ganado en tus próximas 3 lecciones de Quechua.',
    price_gems: 150,
    item_type: 'xp_boost',
    icon_name: '⚡',
  },
];

export default function ShopScreen() {
  const { user } = useAuth();
  const { gems, lives, restoreLives, consumeGems } = useGame();
  const [items, setItems] = useState<ShopItem[]>(DEFAULT_SHOP_ITEMS);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadShop();
  }, []);

  async function loadShop() {
    setLoading(true);
    const { data } = await shopService.fetchShopItems();
    if (data && data.length > 0) {
      setItems(data);
    }
    setLoading(false);
  }

  async function handleBuy(item: ShopItem) {
    if (gems < item.price_gems) {
      setMessage('💎 Gemas insuficientes. ¡Completa lecciones para ganar más!');
      return;
    }

    setBuyingId(item.id);
    setMessage('');

    const success = consumeGems(item.price_gems);
    if (success) {
      if (item.item_type === 'refill_lives') {
        restoreLives();
      }
      if (user) {
        await shopService.buyItem(user.id, item, gems);
      }
      setMessage(`¡Has adquirido ${item.name}! 🎉`);
    } else {
      setMessage('Error al procesar la compra.');
    }
    setBuyingId(null);
  }

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tienda de Yachay 🛒</Text>
        <Text style={styles.subtitle}>
          Usa tus gemas ganadas aprendiendo Quechua para obtener ventajas.
        </Text>

        {message ? (
          <View style={styles.messageBanner}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#58CC02" style={{ marginTop: 20 }} />
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemIcon}>{item.icon_name}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.buyButton,
                  gems < item.price_gems && styles.buyButtonDisabled,
                ]}
                onPress={() => handleBuy(item)}
                disabled={buyingId === item.id || gems < item.price_gems}
              >
                {buyingId === item.id ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.buyButtonText}>💎 {item.price_gems}</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#777777',
    marginBottom: 20,
    lineHeight: 20,
  },
  messageBanner: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  messageText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    elevation: 2,
  },
  itemIcon: {
    fontSize: 38,
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 18,
  },
  buyButton: {
    backgroundColor: '#1CB0F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#1899D6',
  },
  buyButtonDisabled: {
    backgroundColor: '#E5E5E5',
    borderBottomColor: '#CCCCCC',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
