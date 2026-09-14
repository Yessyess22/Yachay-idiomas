import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { categoryService } from '@/src/services/categoryService';
import { Category } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';

const TEAL = '#1B8B8C';
const CREAM = '#F8F8F5';

interface LessonNode {
  id: number;
  title: string;
  subtitle: string;
  categorySlug: string;
  completed: boolean;
  active: boolean;
  locked: boolean;
  type: 'lesson' | 'chest' | 'exam';
}

const SERPENTINE_NODES: LessonNode[] = [
  { id: 1, title: 'Achahala 1',     subtitle: 'Vocales básicas',      categorySlug: 'abecedario', completed: true,  active: false, locked: false, type: 'lesson' },
  { id: 2, title: 'Achahala 2',     subtitle: 'Fonemas simples',      categorySlug: 'abecedario', completed: true,  active: false, locked: false, type: 'lesson' },
  { id: 3, title: 'Consonantes',    subtitle: 'Sonidos andinos',      categorySlug: 'abecedario', completed: false, active: true,  locked: false, type: 'lesson' },
  { id: 4, title: 'Cofre de Gemas', subtitle: 'Recompensa sorpresa',  categorySlug: 'abecedario', completed: false, active: false, locked: true,  type: 'chest' },
  { id: 5, title: 'Yupaykuna 1',    subtitle: 'Números del 1 al 10',  categorySlug: 'numeros',    completed: false, active: false, locked: true,  type: 'lesson' },
  { id: 6, title: 'Yupaykuna 2',    subtitle: 'Conteo y decenas',     categorySlug: 'numeros',    completed: false, active: false, locked: true,  type: 'lesson' },
  { id: 7, title: 'Examen Nivel',   subtitle: 'Pon a prueba tu nivel',categorySlug: 'numeros',    completed: false, active: false, locked: true,  type: 'exam' },
  { id: 8, title: 'Saludos',        subtitle: 'Expresiones cotidianas',categorySlug: 'palabras',  completed: false, active: false, locked: true,  type: 'lesson' },
  { id: 9, title: 'La Familia',     subtitle: 'Parentesco en Quechua',categorySlug: 'palabras',   completed: false, active: false, locked: true,  type: 'lesson' },
  { id: 10, title: 'Colores',       subtitle: 'Mundo de colores',     categorySlug: 'palabras',   completed: false, active: false, locked: true,  type: 'lesson' },
];

const NODE_SIZE = 66;

export default function HomeScreen() {
  const { profile } = useAuth();
  const { streakDays, xp, gems } = useGame();
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

  const username = profile?.username || 'Tú';
  const dailyXp = xp || 40;       // XP del día
  const dailyCoins = gems * 5 + 25; // Coins del día (estimado)

  // Desplazamiento ZigZag para los nodos de lección (Duolingo Style)
  const ZIGZAG_OFFSETS = [0, -45, -80, -45, 0, 45, 80, 45, 0, -45];

  return (
    <View style={styles.root}>
      <YachayTopBar />

      {/* Banner de sección */}
      <View style={styles.sectionBanner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerTag}>SECCIÓN 1 • QUECHUA BÁSICO</Text>
          <Text style={styles.bannerTitle}>Saludos y Cortesía</Text>
          <Text style={styles.bannerDesc}>Domina las frases esenciales y el alfabeto tradicional</Text>
        </View>
        <TouchableOpacity
          style={styles.guidebookBtn}
          onPress={() => router.push('/guidebook/1' as any)}
        >
          <Text style={styles.guidebookText}>📖 GUÍA</Text>
        </TouchableOpacity>
      </View>

      {/* Área principal: tarjetas laterales + path central en ZigZag */}
      <ScrollView contentContainerStyle={styles.mainArea} showsVerticalScrollIndicator={false}>
        <View style={styles.columns}>
          {/* ─── COLUMNA IZQUIERDA: Meta Diaria ─── */}
          <View style={styles.sideLeft}>
            <View style={styles.metaCard}>
              <Text style={styles.metaCardTitle}>Meta Diaria</Text>
              <Text style={styles.metaCardSub}>2 de 3 lecciones hoy</Text>
              {/* Barra de progreso */}
              <View style={styles.metaProgBg}>
                <View style={[styles.metaProgFill, { width: '66%' }]} />
              </View>
              <View style={styles.metaStats}>
                <Text style={styles.metaStatLine}>⚡ XP de Hoy: +{dailyXp} XP</Text>
                <Text style={styles.metaStatLine}>🪙 Yachay Coins: +{dailyCoins}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/leaderboard' as any)}>
                <Text style={styles.metaLink}>Ver Desafíos Semanales →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── COLUMNA CENTRAL: Path de nodos en ZigZag ─── */}
          <View style={styles.pathCol}>
            {SERPENTINE_NODES.map((node, index) => {
              const isCompleted = node.completed;
              const isActive = node.active;
              const isLocked = node.locked;
              const isChest = node.type === 'chest';
              const isExam = node.type === 'exam';
              const showEmpezarAbove = isActive;

              // Offset horizontal en ZigZag
              const offsetX = ZIGZAG_OFFSETS[index % ZIGZAG_OFFSETS.length];

              return (
                <View
                  key={node.id}
                  style={[styles.nodeGroup, { transform: [{ translateX: offsetX }] }]}
                >
                  {/* Conector */}
                  {index > 0 && (
                    <View style={[styles.connector, isLocked && styles.connectorLocked]} />
                  )}

                  {/* ¡EMPEZAR! aparece encima del nodo activo */}
                  {showEmpezarAbove && (
                    <TouchableOpacity
                      style={styles.empezarBtn}
                      onPress={() => handleNodePress(node)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.empezarText}>¡EMPEZAR!</Text>
                    </TouchableOpacity>
                  )}

                  {/* Nodo */}
                  <TouchableOpacity
                    style={[
                      styles.nodeBtn,
                      isCompleted && styles.nodeCompleted,
                      isActive && styles.nodeActive,
                      isLocked && styles.nodeLocked,
                      isChest && styles.nodeChest,
                      isExam && styles.nodeExam,
                    ]}
                    onPress={() => handleNodePress(node)}
                    disabled={isLocked}
                    activeOpacity={0.82}
                  >
                    {isLocked ? (
                      <Text style={styles.lockEmoji}>🔒</Text>
                    ) : isChest ? (
                      <Image
                        source={require('@/assets/images/logros/moneda_yachay_coin.png')}
                        style={styles.nodeImg}
                      />
                    ) : isExam ? (
                      <Image
                        source={require('@/assets/images/logros/logro_hablante_corona.png')}
                        style={styles.nodeImg}
                      />
                    ) : (
                      <Image
                        source={require('@/assets/images/logros/logro_principiante_chullo.png')}
                        style={styles.nodeImg}
                      />
                    )}

                    {/* Check completado */}
                    {isCompleted && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Título + Subtítulo del nodo */}
                  <Text style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]}>
                    {node.title}
                  </Text>
                  <Text style={[styles.nodeSub, isLocked && styles.nodeSubLocked]}>
                    {node.subtitle}
                  </Text>
                </View>
              );
            })}
            <View style={styles.listFooterSpacer} />
          </View>

          {/* ─── COLUMNA DERECHA: Llamita motivacional ─── */}
          <View style={styles.sideRight}>
            <View style={styles.llamitaCard}>
              <Image
                source={require('@/assets/images/llamita/06_emocionado.png')}
                style={styles.llamitaCardImg}
              />
              <Text style={styles.llamitaGreet}>¡Sigue así, {username}!</Text>
              <Text style={styles.llamitaDays}>{streakDays} días aprendiendo</Text>
              <Text style={styles.llamitaMsg}>¡Estás en racha de oro! 🔥</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },
  listFooterSpacer: {
    height: 40,
  },

  /* Banner de sección */
  sectionBanner: {
    backgroundColor: TEAL,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: { flex: 1, paddingRight: 12 },
  bannerTag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  bannerDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
  },
  guidebookBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    flexShrink: 0,
  },
  guidebookText: {
    color: TEAL,
    fontSize: 13,
    fontWeight: '900',
  },

  /* Layout de 3 columnas */
  mainArea: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },

  /* Columna izquierda */
  sideLeft: {
    width: 140,
    position: 'sticky' as any,
    top: 16,
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  metaCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2A1A0A',
    marginBottom: 3,
  },
  metaCardSub: {
    fontSize: 11,
    color: '#7A6A5A',
    marginBottom: 8,
  },
  metaProgBg: {
    height: 8,
    backgroundColor: '#E8E2D9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  metaProgFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  metaStats: { gap: 4, marginBottom: 10 },
  metaStatLine: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2A1A0A',
  },
  metaLink: {
    fontSize: 11,
    fontWeight: '800',
    color: TEAL,
    textDecorationLine: 'underline',
  },

  /* Columna central — path */
  pathCol: {
    flex: 1,
    maxWidth: 220,
    alignItems: 'center',
  },

  nodeGroup: {
    alignItems: 'center',
  },

  connector: {
    width: 3,
    height: 28,
    backgroundColor: '#C8DDD9',
    borderRadius: 2,
  },
  connectorLocked: {
    backgroundColor: '#D8D8D8',
  },

  /* Botón EMPEZAR */
  empezarBtn: {
    backgroundColor: '#27AE60',
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#1E8449',
    marginBottom: 6,
    elevation: 3,
  },
  empezarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  /* Nodos */
  nodeBtn: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#136566',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    position: 'relative',
  },
  nodeCompleted: {
    backgroundColor: TEAL,
    borderBottomColor: '#136566',
  },
  nodeActive: {
    backgroundColor: TEAL,
    borderBottomColor: '#136566',
    borderWidth: 3,
    borderColor: '#B2DFDB',
    transform: [{ scale: 1.08 }],
  },
  nodeLocked: {
    backgroundColor: '#D5D5D5',
    borderBottomColor: '#B0B0B0',
    elevation: 1,
  },
  nodeChest: {
    backgroundColor: '#E5A00D',
    borderBottomColor: '#B57D0A',
  },
  nodeExam: {
    backgroundColor: '#1CB0F6',
    borderBottomColor: '#1899D6',
    width: NODE_SIZE + 8,
    height: NODE_SIZE + 8,
    borderRadius: (NODE_SIZE + 8) / 2,
  },
  nodeImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  lockEmoji: {
    fontSize: 22,
  },
  /* Badge de check en nodo completado */
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#27AE60',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  nodeTitle: {
    marginTop: 7,
    fontSize: 13,
    fontWeight: '800',
    color: '#2A1A0A',
    textAlign: 'center',
    maxWidth: 120,
  },
  nodeTitleLocked: {
    color: '#9A9A9A',
  },
  nodeSub: {
    fontSize: 11,
    color: '#7A6A5A',
    textAlign: 'center',
    maxWidth: 120,
    marginBottom: 0,
  },
  nodeSubLocked: {
    color: '#BBBBBB',
  },

  /* Columna derecha — Llamita */
  sideRight: {
    width: 130,
    position: 'sticky' as any,
    top: 16,
  },
  llamitaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  llamitaCardImg: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  llamitaGreet: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2A1A0A',
    textAlign: 'center',
    marginBottom: 4,
  },
  llamitaDays: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
    textAlign: 'center',
    marginBottom: 3,
  },
  llamitaMsg: {
    fontSize: 11,
    color: '#7A6A5A',
    textAlign: 'center',
  },
});
