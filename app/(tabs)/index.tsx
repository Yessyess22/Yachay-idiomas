import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { categoryService } from '@/src/services/categoryService';
import { Category } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';

interface LessonNode {
  id: number;
  title: string;
  categorySlug: string;
  completed: boolean;
  active: boolean;
  locked: boolean;
  stars: number;
}

// Genera una serie de nodos en forma de serpiente (Skill Tree)
const SERPENTINE_NODES: LessonNode[] = [
  { id: 1, title: 'Achahala 1', categorySlug: 'abecedario', completed: true, active: false, locked: false, stars: 3 },
  { id: 2, title: 'Achahala 2', categorySlug: 'abecedario', completed: true, active: false, locked: false, stars: 3 },
  { id: 3, title: 'Consonantes', categorySlug: 'abecedario', completed: false, active: true, locked: false, stars: 0 },
  { id: 4, title: 'Cofre de Gemas 🎁', categorySlug: 'abecedario', completed: false, active: false, locked: true, stars: 0 },
  { id: 5, title: 'Yupaykuna 1', categorySlug: 'numeros', completed: false, active: false, locked: true, stars: 0 },
  { id: 6, title: 'Yupaykuna 2', categorySlug: 'numeros', completed: false, active: false, locked: true, stars: 0 },
  { id: 7, title: 'Examen de Nivel 🏆', categorySlug: 'numeros', completed: false, active: false, locked: true, stars: 0 },
  { id: 8, title: 'Saludos en Quechua', categorySlug: 'palabras', completed: false, active: false, locked: true, stars: 0 },
  { id: 9, title: 'La Familia', categorySlug: 'palabras', completed: false, active: false, locked: true, stars: 0 },
  { id: 10, title: 'Colores y Objetos', categorySlug: 'palabras', completed: false, active: false, locked: true, stars: 0 },
];

const OFFSETS = [0, 50, 90, 50, 0, -50, -90, -50];

export default function HomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await categoryService.fetchCategories();
    if (data) setCategories(data);
    setLoading(false);
  }

  function handleNodePress(node: LessonNode) {
    if (node.locked) return;
    router.push({
      pathname: '/category/[slug]' as any,
      params: { slug: node.categorySlug },
    });
  }

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner de Sección 1 */}
        <View style={styles.unitBanner}>
          <View style={styles.unitInfo}>
            <Text style={styles.unitTag}>SECCIÓN 1, UNIDAD 1</Text>
            <Text style={styles.unitTitle}>Abecedario y Primeras Palabras</Text>
            <Text style={styles.unitDesc}>Aprende la fonética Achahala y saludos cotidianos en Runasimi.</Text>
          </View>
          <TouchableOpacity
            style={styles.guidebookBtn}
            onPress={() => router.push('/guidebook/1' as any)}
          >
            <Text style={styles.guidebookBtnText}>📖 GUÍA</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#58CC02" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.pathContainer}>
            {SERPENTINE_NODES.map((node, index) => {
              const xOffset = OFFSETS[index % OFFSETS.length];
              const isChest = node.title.includes('🎁');
              const isExam = node.title.includes('🏆');

              return (
                <View
                  key={node.id}
                  style={[styles.nodeWrapper, { transform: [{ translateX: xOffset }] }]}
                >
                  <TouchableOpacity
                    style={[
                      styles.nodeButton,
                      node.completed && styles.nodeCompleted,
                      node.active && styles.nodeActive,
                      node.locked && styles.nodeLocked,
                      isChest && styles.nodeChest,
                      isExam && styles.nodeExam,
                    ]}
                    onPress={() => handleNodePress(node)}
                    disabled={node.locked}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nodeIcon}>
                      {node.completed ? '⭐' : node.active ? '🦙' : node.locked ? '🔒' : '⭐'}
                    </Text>
                  </TouchableOpacity>

                  {node.active && (
                    <View style={styles.activeTooltip}>
                      <Text style={styles.activeTooltipText}>¡EMPEZAR!</Text>
                    </View>
                  )}

                  <Text style={styles.nodeTitle}>{node.title}</Text>
                </View>
              );
            })}
          </View>
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
  scrollContent: {
    paddingBottom: 40,
  },
  unitBanner: {
    backgroundColor: '#58CC02',
    margin: 16,
    padding: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  unitInfo: {
    flex: 1,
    paddingRight: 10,
  },
  unitTag: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  unitTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  unitDesc: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    lineHeight: 18,
  },
  guidebookBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  guidebookBtnText: {
    color: '#58CC02',
    fontSize: 14,
    fontWeight: '900',
  },
  pathContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 32,
  },
  nodeWrapper: {
    alignItems: 'center',
  },
  nodeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#58CC02',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: '#46A302',
    elevation: 4,
  },
  nodeCompleted: {
    backgroundColor: '#FFC800',
    borderBottomColor: '#E5A900',
  },
  nodeActive: {
    backgroundColor: '#58CC02',
    borderBottomColor: '#46A302',
    transform: [{ scale: 1.15 }],
  },
  nodeLocked: {
    backgroundColor: '#E5E5E5',
    borderBottomColor: '#CCCCCC',
  },
  nodeChest: {
    backgroundColor: '#FF9600',
    borderBottomColor: '#E08400',
  },
  nodeExam: {
    backgroundColor: '#1CB0F6',
    borderBottomColor: '#1899D6',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nodeIcon: {
    fontSize: 30,
  },
  activeTooltip: {
    position: 'absolute',
    top: -26,
    backgroundColor: '#3C3C3C',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  activeTooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  nodeTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#3C3C3C',
  },
});
