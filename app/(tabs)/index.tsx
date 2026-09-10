import { useAuth } from '@/src/context/AuthContext';
import { categoryService } from '@/src/services/categoryService';
import { Category } from '@/src/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError('');
    const { data, error } = await categoryService.fetchCategories();
    if (error) {
      setError(error);
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con bienvenida e XP */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Yachay</Text>
          <Text style={styles.subheader}>
            {profile ? `¡Allinllachu, ${profile.username}!` : 'Aprende quechua paso a paso'}
          </Text>
        </View>
        {profile ? (
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>⚡ {profile.total_xp} XP</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Categorías de Aprendizaje</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/category/[slug]' as any, params: { slug: item.slug } })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{item.icon_url || '📚'}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>Toca para comenzar las lecciones</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aún no hay categorías disponibles.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#58cc02',
  },
  subheader: {
    fontSize: 15,
    color: '#666666',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: '#fff3c4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  xpText: {
    fontWeight: 'bold',
    color: '#b58100',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },
  cardSub: {
    fontSize: 13,
    color: '#777777',
    marginTop: 2,
  },
  errorText: {
    color: '#e53935',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#58cc02',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 40,
  },
});