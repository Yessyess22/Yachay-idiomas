import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { categoryService } from '@/src/services/categoryService';
import { questionService } from '@/src/services/questionService';
import { Category } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { Card } from '@/components/yachay/card';
import { ProgressBar } from '@/components/yachay/progress-bar';
import { supabase } from '@/src/services/supabase';

const TEAL = '#1B8B8C';
const TEAL_DARK = '#0E4D55';
const CREAM = '#F7F4EB';
const GREEN = '#27AE60';
const GREEN_DARK = '#1E8449';
const BLUE = '#2980B9';
const ORANGE = '#E67E22';
const PURPLE = '#8E44AD';

interface LessonNode {
  id: number;
  title: string;
  subtitle: string;
  categorySlug: string;
  levelNumber: 1 | 2 | 3;
  levelColor: string;
  levelLabel: string;
  completed: boolean;
  active: boolean;
  locked: boolean;
  type: 'lesson' | 'exam';
  /** Solo para nodos type='exam': level_id que consume examService.fetchExamByLevel */
  levelId?: number;
}

const INITIAL_SERPENTINE_NODES: LessonNode[] = [
  // Nivel 1 — Achahala y Fonética (Verde Esmeralda)
  {
    id: 1,
    title: 'Achahala',
    subtitle: 'Vocales y Consonantes',
    categorySlug: 'abecedario',
    levelNumber: 1,
    levelColor: GREEN,
    levelLabel: 'NIVEL 1',
    completed: false,
    active: true,
    locked: false,
    type: 'lesson',
  },
  {
    id: 100,
    title: 'Examen de Abecedario',
    subtitle: 'Evaluación de Vocales y Consonantes',
    categorySlug: 'abecedario',
    levelNumber: 1,
    levelColor: PURPLE,
    levelLabel: 'EXAMEN',
    completed: false,
    active: false,
    locked: true,
    type: 'exam',
    levelId: 1,
  },

  // Nivel 2 — Yupaykuna / Números (Azul Lago Titicaca)
  {
    id: 2,
    title: 'Yupaykuna',
    subtitle: 'Números del 1 al 10',
    categorySlug: 'numeros',
    levelNumber: 2,
    levelColor: BLUE,
    levelLabel: 'NIVEL 2',
    completed: false,
    active: false,
    locked: true,
    type: 'lesson',
  },
  {
    id: 200,
    title: 'Examen de Números',
    subtitle: 'Evaluación de Números',
    categorySlug: 'numeros',
    levelNumber: 2,
    levelColor: PURPLE,
    levelLabel: 'EXAMEN',
    completed: false,
    active: false,
    locked: true,
    type: 'exam',
    levelId: 2,
  },

  // Nivel 3 — Palabras y Vocabulario (Terracota Andino)
  {
    id: 3,
    title: 'Rimaykuna',
    subtitle: 'Saludos y Familia',
    categorySlug: 'palabras',
    levelNumber: 3,
    levelColor: ORANGE,
    levelLabel: 'NIVEL 3',
    completed: false,
    active: false,
    locked: true,
    type: 'lesson',
  },
  {
    id: 300,
    title: 'Examen de Palabras',
    subtitle: 'Evaluación de Saludos y Familia',
    categorySlug: 'palabras',
    levelNumber: 3,
    levelColor: PURPLE,
    levelLabel: 'EXAMEN',
    completed: false,
    active: false,
    locked: true,
    type: 'exam',
    levelId: 3,
  },
];

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { streakDays, xp, gems } = useGame();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Adaptación de anchos para pantallas móviles vs desktop
  const isDesktop = width >= 720;
  const sideCardWidth = isDesktop ? 135 : Math.max(98, Math.min(115, (width - 150) / 2));

  const [nodes, setNodes] = useState<LessonNode[]>(INITIAL_SERPENTINE_NODES);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, xp]);

  async function loadData() {
    setLoading(true);
    const { data } = await categoryService.fetchCategories();
    if (data) setCategories(data);

    // Consulta de lecciones aprobadas (tanto en AsyncStorage local como en Supabase)
    const uid = user?.uid || (user as any)?.id;
    let completedLessonIds = new Set<number>();

    if (uid) {
      try {
        const ids = await questionService.getCompletedLessonIds(uid);
        completedLessonIds = new Set(ids);
      } catch (e) {
        console.warn('Error fetching completed lessons:', e);
      }
    }

    // Progresión estricta por niveles:
    // Nivel 1 (Abecedario): Lecciones 1 (Vocales) o 2 (Consonantes)
    const doneL1 = completedLessonIds.has(1) || completedLessonIds.has(2);
    // Nivel 2 (Números): Lecciones 3 (1-5) o 4 (6-10)
    const doneL2 = completedLessonIds.has(3) || completedLessonIds.has(4);
    // Nivel 3 (Palabras): Lecciones 5 (Saludos) o 6 (Familia)
    const doneL3 = completedLessonIds.has(5) || completedLessonIds.has(6);

    const updatedNodes = INITIAL_SERPENTINE_NODES.map((node) => {
      // Nivel 1: Achahala
      if (node.id === 1) {
        return {
          ...node,
          completed: doneL1,
          active: !doneL1,
          locked: false,
        };
      }
      // Examen Nivel 1
      if (node.id === 100) {
        return {
          ...node,
          completed: doneL1,
          active: false,
          locked: !doneL1,
        };
      }

      // Nivel 2: Yupaykuna (Solo se desbloquea al aprobar el Nivel 1)
      if (node.id === 2) {
        return {
          ...node,
          completed: doneL2,
          active: doneL1 && !doneL2,
          locked: !doneL1,
        };
      }
      // Examen Nivel 2
      if (node.id === 200) {
        return {
          ...node,
          completed: doneL2,
          active: false,
          locked: !doneL2,
        };
      }

      // Nivel 3: Rimaykuna (Solo se desbloquea al aprobar el Nivel 2)
      if (node.id === 3) {
        return {
          ...node,
          completed: doneL3,
          active: doneL2 && !doneL3,
          locked: !doneL2,
        };
      }
      // Examen Nivel 3
      if (node.id === 300) {
        return {
          ...node,
          completed: doneL3,
          active: false,
          locked: !doneL3,
        };
      }

      return node;
    });

    setNodes(updatedNodes);
    setLoading(false);
  }

  function handleNodePress(node: LessonNode) {
    if (node.locked) return;
    if (node.type === 'exam') {
      router.push({
        pathname: '/level/exam/[levelId]' as any,
        params: { levelId: String(node.levelId) },
      });
      return;
    }
    router.push({
      pathname: '/category/[slug]' as any,
      params: { slug: node.categorySlug },
    });
  }

  const username = profile?.username || user?.email?.split('@')[0] || 'Yachachiq';
  const currentCompleted = nodes.filter((n) => n.completed).length;

  /**
   * CÁLCULO DE OFFSET EN ZIGZAG:
   * - Los dos primeros nodos (index 0 y index 1) están a los lados de las tarjetas:
   *   tienen offset estrictamente 0 (alineados al centro vertical), con 40px+ de separación
   *   respecto a los bordes de las tarjetas laterales para NUNCA superponerse.
   * - A partir del nodo 2 (index >= 2), las tarjetas laterales ya terminaron arriba,
   *   por lo que el camino fluye libremente en zigzag suave (+/- 28px).
   */
  function getNodeOffset(index: number): number {
    if (index === 0 || index === 1) return 0; // Entre tarjetas: 100% centrado y despejado
    const curveSequence = [-26, 0, 26, -26, 0, 26, 0];
    return curveSequence[(index - 2) % curveSequence.length];
  }

  const completedRatio = Math.min(1, Math.max(0, currentCompleted / nodes.length));
  const progPct = Math.round(completedRatio * 100);

  return (
    <View style={styles.root}>
      <YachayTopBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Superior de Sección estilo Mockup */}
        <View style={styles.sectionBannerContainer}>
          <ImageBackground
            source={require('@/assets/images/cards/tarjeta_montana.png')}
            style={styles.sectionBannerBg}
            imageStyle={styles.sectionBannerImg}
          >
            <View style={styles.sectionBannerOverlay}>
              <View style={styles.bannerContentRow}>
                <View style={styles.bannerLeft}>
                  <Text style={styles.bannerTag}>SECCIÓN 1 • RUNASIMI BÁSICO</Text>
                  <Text style={styles.bannerTitle}>El Camino del Saber</Text>
                  <Text style={styles.bannerDesc}>
                    Aprende fonemas, números y expresiones tradicionales.
                  </Text>
                </View>
              </View>

              {/* Cenefa textil andina geométrica inferior */}
              <View style={styles.bannerTextileRibbon}>
                <Text style={styles.textileRibbonText}>
                  ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* ─── CONTENEDOR PRINCIPAL DE 3 COLUMNAS EXACTO AL MOCKUP ─── */}
        <View style={styles.columnsWrapper}>
          {/* ── COLUMNA IZQUIERDA: Meta Diaria ── */}
          <View style={[styles.sideColLeft, { width: sideCardWidth }]}>
            <Card radius={20} padding={12} style={styles.metaCard}>
              <Text style={styles.metaTitle}>Meta Diaria</Text>
              <Text style={styles.metaSub}>
                {currentCompleted} de {nodes.length} lecciones hoy
              </Text>

              {/* Barra de progreso con punto indicador al extremo */}
              <ProgressBar
                progress={Math.max(6, progPct)}
                height={6}
                color={GREEN}
                trackColor="#EAE3D6"
                showDot
                style={styles.metaProgTrack}
              />

              {/* Stats con iconos claros */}
              <View style={styles.metaStatLine}>
                <Text style={styles.metaStatIcon}>⚡</Text>
                <Text style={styles.metaStatText}>XP: +{xp || 0}</Text>
              </View>
              <View style={styles.metaStatLine}>
                <Text style={styles.metaStatIcon}>🪙</Text>
                <Text style={styles.metaStatText}>Coins: +{(xp || 0) + (gems || 0)}</Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/explore' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.metaLinkText}>Ver Desafíos →</Text>
              </TouchableOpacity>

              {/* Silueta de montaña al pie de la tarjeta */}
              <View style={styles.metaMountainFooter}>
                <Text style={styles.metaMountainDeco}>🏔️ ⛰️ 🏔️</Text>
              </View>
            </Card>
          </View>

          {/* ── COLUMNA CENTRAL: Camino del Saber ── */}
          <View style={styles.pathCenterCol}>
            {nodes.map((node, index) => {
              const isCompleted = node.completed;
              const isActive = node.active;
              const isLocked = node.locked;
              const isExam = node.type === 'exam';
              const showEmpezarAbove = isActive;
              const offsetX = getNodeOffset(index);

              return (
                <View
                  key={node.id}
                  style={[styles.nodeGroup, { transform: [{ translateX: offsetX }] }]}
                >
                  {/* Conector o sendero entre nodos con adorno de pasto andino (ichu) */}
                  {index > 0 && (
                    <View style={styles.connectorWrap}>
                      {/* Pastito andino decorativo al lado del sendero */}
                      {index % 2 === 1 ? (
                        <Text style={styles.ichuLeft}>🌾</Text>
                      ) : (
                        <Text style={styles.ichuRight}>🌾</Text>
                      )}
                      <View
                        style={[
                          styles.trailConnector,
                          isLocked ? styles.trailConnectorLocked : styles.trailConnectorActive,
                        ]}
                      />
                    </View>
                  )}

                  {/* Globo interactivo ¡EMPEZAR! en el nodo activo */}
                  {showEmpezarAbove && (
                    <TouchableOpacity
                      style={styles.empezarBtn}
                      onPress={() => handleNodePress(node)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.empezarText}>¡EMPEZAR!</Text>
                      <View style={styles.empezarArrow} />
                    </TouchableOpacity>
                  )}

                  {/* Botón Circular del Nodo */}
                  <TouchableOpacity
                    style={[
                      styles.nodeBtn,
                      isActive && styles.nodeBtnActive,
                      isLocked && styles.nodeBtnLocked,
                      isCompleted && styles.nodeBtnCompleted,
                    ]}
                    onPress={() => handleNodePress(node)}
                    disabled={isLocked}
                    activeOpacity={0.8}
                  >
                    {isLocked ? (
                      <Text style={styles.lockEmoji}>🔒</Text>
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

                    {/* Badge de completado con check */}
                    {isCompleted && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Tag de color de Nivel */}
                  <View
                    style={[
                      styles.levelTag,
                      isLocked ? styles.levelTagLocked : styles.levelTagActive,
                    ]}
                  >
                    <Text style={styles.levelTagText}>{node.levelLabel}</Text>
                  </View>

                  {/* Título y subtítulo del nodo */}
                  <Text style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]}>
                    {node.title}
                  </Text>
                  <Text style={[styles.nodeSub, isLocked && styles.nodeSubLocked]}>
                    {node.subtitle}
                  </Text>
                </View>
              );
            })}
            <View style={{ height: 80 }} />
          </View>

          {/* ── COLUMNA DERECHA: Llamita Motivacional (Yachi) ── */}
          <View style={[styles.sideColRight, { width: sideCardWidth }]}>
            <Card radius={20} padding={10} style={styles.llamitaCard}>
              <Image
                source={require('@/assets/images/llamita/06_emocionado.png')}
                style={styles.llamitaImg}
                resizeMode="contain"
              />
              <Text style={styles.llamitaMood}>¡Emocionado!</Text>
              <Text style={styles.llamitaGreet}>¡Sigue así, {username}!</Text>
              <Text style={styles.llamitaDays}>
                {Math.max(1, streakDays || 1)} {Math.max(1, streakDays || 1) === 1 ? 'día' : 'días'} aprendiendo
              </Text>
              <Text style={styles.llamitaMsg}>¡Estás en racha de oro! 🔥</Text>

              {/* Decoración textil andina en base de la tarjeta */}
              <Text style={styles.llamitaDecoBottom}>◇ ◆ ◇ ◆ ◇</Text>
            </Card>

            {/* Acceso Directo al Traductor de Voz */}
            <TouchableOpacity
              style={styles.translatorShortcutCard}
              onPress={() => router.push('/translator' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.translatorHeaderRow}>
                <Text style={styles.translatorMicIcon}>🎙️</Text>
                <Text style={styles.translatorTag}>TRADUCTOR IA</Text>
              </View>
              <Text style={styles.translatorCardTitle}>Español ↔ Quechua</Text>
              <Text style={styles.translatorCardSub}>Traduce texto y voz</Text>
              <Text style={styles.translatorActionText}>Abrir →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F5EE',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  /* Banner de sección con fondo de montaña y cenefa textil */
  sectionBannerContainer: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0F5B62',
    elevation: 3,
    shadowColor: '#1A332E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  sectionBannerBg: {
    width: '100%',
  },
  sectionBannerImg: {
    opacity: 0.45,
    resizeMode: 'cover',
  },
  sectionBannerOverlay: {
    backgroundColor: 'rgba(11, 75, 82, 0.82)',
  },
  bannerContentRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTag: {
    color: '#FBD46D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  bannerDesc: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 12,
    lineHeight: 16,
  },
  bannerTextileRibbon: {
    backgroundColor: '#0A3F45',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  textileRibbonText: {
    fontSize: 9,
    color: '#E8B966',
    letterSpacing: 3,
    fontWeight: '700',
  },

  /* Contenedor de 3 columnas */
  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    paddingTop: 16,
  },

  /* Tarjeta Meta Diaria (Izquierda) */
  sideColLeft: {
    position: 'sticky' as any,
    top: 12,
  },
  metaCard: {
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  metaTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 2,
  },
  metaSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 14,
  },
  metaProgTrack: {
    marginBottom: 10,
  },
  metaStatLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  metaStatIcon: {
    fontSize: 12,
  },
  metaStatText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2A1A0A',
  },
  metaLinkText: {
    fontSize: 10,
    fontWeight: '800',
    color: TEAL,
    textDecorationLine: 'underline',
    marginTop: 6,
  },
  metaMountainFooter: {
    alignItems: 'center',
    marginTop: 8,
    opacity: 0.45,
  },
  metaMountainDeco: {
    fontSize: 10,
    letterSpacing: 2,
  },

  /* Columna Central del Camino */
  pathCenterCol: {
    flex: 1,
    minWidth: 120,
    maxWidth: 155,
    alignItems: 'center',
  },
  nodeGroup: {
    alignItems: 'center',
    marginVertical: 8,
    width: 130,
  },
  connectorWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 32,
    marginBottom: 4,
  },
  trailConnector: {
    width: 6,
    height: '100%',
    borderRadius: 3,
  },
  trailConnectorActive: {
    backgroundColor: '#C5DEC8',
  },
  trailConnectorLocked: {
    backgroundColor: '#E2DAD0',
  },
  ichuLeft: {
    position: 'absolute',
    left: 8,
    top: 4,
    fontSize: 16,
    opacity: 0.75,
  },
  ichuRight: {
    position: 'absolute',
    right: 8,
    top: 4,
    fontSize: 16,
    opacity: 0.75,
  },

  /* Globo ¡EMPEZAR! */
  empezarBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 6,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1A6635',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  empezarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  empezarArrow: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GREEN,
  },

  /* Botón Circular del Nodo */
  nodeBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  nodeBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4.5,
    borderColor: GREEN,
  },
  nodeBtnLocked: {
    backgroundColor: '#EAE4DA',
    borderWidth: 3.5,
    borderColor: '#C8BEB2',
  },
  nodeBtnCompleted: {
    backgroundColor: GREEN,
    borderWidth: 4.5,
    borderColor: '#1E8449',
  },
  nodeImg: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  lockEmoji: {
    fontSize: 26,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GREEN,
  },
  checkMark: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
  },

  /* Tag de Nivel */
  levelTag: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelTagActive: {
    backgroundColor: GREEN,
  },
  levelTagLocked: {
    backgroundColor: '#9E9589',
  },
  levelTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* Títulos de nodos */
  nodeTitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  nodeTitleLocked: {
    color: '#2B2621',
  },
  nodeSub: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    marginTop: 1,
  },
  nodeSubLocked: {
    color: '#6E665E',
  },

  /* Tarjeta Llamita (Derecha) */
  sideColRight: {
    position: 'sticky' as any,
    top: 12,
  },
  llamitaCard: {
    alignItems: 'center',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  llamitaImg: {
    width: 64,
    height: 64,
    marginBottom: 4,
  },
  llamitaMood: {
    fontSize: 9,
    color: '#757575',
    fontWeight: '700',
    marginBottom: 2,
  },
  llamitaGreet: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 3,
  },
  llamitaDays: {
    fontSize: 11,
    fontWeight: '800',
    color: TEAL,
    textAlign: 'center',
    marginBottom: 3,
  },
  llamitaMsg: {
    fontSize: 10,
    color: '#D35400',
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 13,
  },
  llamitaDecoBottom: {
    marginTop: 6,
    fontSize: 8,
    color: '#D4A373',
    letterSpacing: 2,
    fontWeight: '700',
  },
  translatorShortcutCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#B2DFDB',
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  translatorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  translatorMicIcon: {
    fontSize: 14,
  },
  translatorTag: {
    fontSize: 9,
    fontWeight: '800',
    color: TEAL,
    letterSpacing: 0.5,
  },
  translatorCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0E4D55',
    textAlign: 'center',
    marginBottom: 2,
  },
  translatorCardSub: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  translatorActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: TEAL,
  },
});
