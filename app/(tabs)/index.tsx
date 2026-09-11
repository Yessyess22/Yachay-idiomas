import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { CategoriaCard } from '@/components/yachay/categoria-card';
import { MainContainer } from '@/components/yachay/main-container';
import { YachayHeader } from '@/components/yachay/yachay-header';
import { Illustrations } from '@/constants/illustrations';
import { Theme } from '@/constants/yachay-theme';
import { useAuth } from '@/src/context/AuthContext';
import { categoryService } from '@/src/services/categoryService';
import { Category } from '@/src/types';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type CategoryVisual = {
  icon: MaterialIconName;
  color: string;
  illustration?: ImageSourcePropType;
  glyph?: string;
  cornerLlama?: ImageSourcePropType;
};

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  abecedario: { icon: 'sort-by-alpha', color: Theme.colors.accentGreen, glyph: 'A', cornerLlama: Illustrations.avatarLlama },
  numeros: { icon: 'format-list-numbered', color: Theme.colors.accentOrange, glyph: '1,2,3', cornerLlama: Illustrations.avatarLlama },
  palabras: { icon: 'chat-bubble-outline', color: Theme.colors.primaryDark, illustration: Illustrations.iconoPalabras },
};
const DEFAULT_VISUAL: CategoryVisual = { icon: 'menu-book', color: Theme.colors.accentBlue };

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { profile } = useAuth();
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
      <MainContainer style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.accentGreen} />
      </MainContainer>
    );
  }

  if (error) {
    return (
      <MainContainer style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <YachayHeader
        subtitle={profile ? `¡Allinllachu, ${profile.username}!` : 'Aprende quechua paso a paso'}
        xp={profile?.total_xp}
        logoSource={Illustrations.logoYachayConLlama}
        onSettingsPress={() => router.push('/(tabs)/profile' as any)}
      />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Categorías de Aprendizaje</Text>}
        renderItem={({ item, index }) => {
          const visual = CATEGORY_VISUALS[item.slug] ?? DEFAULT_VISUAL;
          return (
            <CategoriaCard
              index={index}
              titulo={item.name}
              imagenSource={visual.illustration}
              fallbackIcon={visual.icon}
              fallbackColor={visual.color}
              glyph={visual.glyph}
              cornerLlama={visual.cornerLlama}
              onPress={() => router.push({ pathname: '/category/[slug]' as any, params: { slug: item.slug } })}
            />
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no hay categorías disponibles.</Text>}
      />
    </MainContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Theme.fonts.titleSmall,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textTitleGray,
    marginBottom: Theme.spacing.md,
  },
  list: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  errorText: {
    color: Theme.colors.danger,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  retryButton: {
    marginTop: Theme.spacing.sm,
    backgroundColor: Theme.colors.accentGreen,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
  },
  retryText: {
    color: Theme.colors.white,
    fontWeight: Theme.fontWeight.bold,
  },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textSubtitleGray,
    marginTop: Theme.spacing.xl,
  },
});
