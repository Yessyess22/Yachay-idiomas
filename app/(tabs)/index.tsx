import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Illustrations } from '@/constants/illustrations';
import { useAuth } from '@/src/context/AuthContext';
import { questionService } from '@/src/services/questionService';
import { progressService } from '@/src/services/progressService';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { ProgressBar } from '@/components/yachay/progress-bar';
import {
  deriveLearningPath,
  type LearningPathNode,
} from '@/components/yachay/learning-path';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#FFB300';
const GOLD_DARK = '#C67C00';
const MUTED = '#64748B';
const GRAY_LOCKED = '#CBD5E1';
const GRAY_LOCKED_DARK = '#94A3B8';

// ─── PALETA ANDINA WIPHALA PARA CADA NODO ───────────────────
interface WiphalaPalette {
  name: string;
  face: string;
  shadow: string;
  sparkle: string;
  accent: string;
}

const WIPHALA_PALETTES: WiphalaPalette[] = [
  // 1. Amarillo Inti (Sol / Energía Vital / Inicio Dorado)
  {
    name: 'Inti Amarillo',
    face: '#FFD600',
    shadow: '#F57F17',
    sparkle: '#FFF9C4',
    accent: '#FFFDE7',
  },
  // 2. Azul Cyan Mayu (Río Celestial / Sabiduría)
  {
    name: 'Mayu Azul',
    face: '#00B0FF',
    shadow: '#0081CB',
    sparkle: '#E1F5FE',
    accent: '#F0F9FF',
  },
  // 3. Rojo Carmesí / Fuego Ancestral (Examen 1)
  {
    name: 'Nina Rojo',
    face: '#FF1744',
    shadow: '#C51162',
    sparkle: '#FFCDD2',
    accent: '#FFEBEE',
  },
  // 4. Verde Kawsay (Vida / Fertilidad / Naturaleza)
  {
    name: 'Kawsay Verde',
    face: '#00E676',
    shadow: '#009624',
    sparkle: '#C8E6C9',
    accent: '#E8F5E9',
  },
  // 5. Morado Ayllu (Espiritualidad / Sabiduría Ancestral)
  {
    name: 'Ayllu Morado',
    face: '#A855F7',
    shadow: '#6B21A8',
    sparkle: '#F3E8FF',
    accent: '#FAF5FF',
  },
  // 6. Naranja Kultura (Sabiduría Andina / Arte / Examen 2)
  {
    name: 'Kultura Naranja',
    face: '#FF6D00',
    shadow: '#D84315',
    sparkle: '#FFE0B2',
    accent: '#FFF3E0',
  },
  // 7. Rosa Magenta Neón (Amor / Alegría)
  {
    name: 'Pacha Rosa',
    face: '#FF2A85',
    shadow: '#AD1457',
    sparkle: '#FCE4EC',
    accent: '#FDF2F8',
  },
  // 8. Azul Índigo / Zafiro (Profundidad / Cielo Nocturno)
  {
    name: 'Chaska Azul',
    face: '#3B82F6',
    shadow: '#1D4ED8',
    sparkle: '#DBEAFE',
    accent: '#EFF6FF',
  },
  // 9. Oro Supremo 24K (Gran Examen Final Nivel 3)
  {
    name: 'Quri Imperial 24K',
    face: '#FFB300',
    shadow: '#E65100',
    sparkle: '#FFF8E1',
    accent: '#FFFDE7',
  },
];

// Secuencia de zigzag tipo Duolingo (offsets horizontales)
const ZIGZAG_OFFSETS = [0, -42, 42, -42, 42, 0, -42, 42, 0];

/** Mascota interactiva Yachi que acompaña y trota al lado del progreso activo */
function YachiCompanion({ offsetX, isExam }: { offsetX: number; isExam: boolean }) {
  const jumpY = useSharedValue(0);
  const rot = useSharedValue(0);
  const isRightSide = offsetX <= 0;

  React.useEffect(() => {
    jumpY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 380 }),
        withTiming(0, { duration: 380 })
      ),
      -1,
      true
    );
    rot.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 380 }),
        withTiming(4, { duration: 380 })
      ),
      -1,
      true
    );
  }, []);

  const companionAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: jumpY.value },
      { rotate: `${rot.value}deg` },
      { scaleX: isRightSide ? 1 : -1 },
    ],
  }));

  const bubbleAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: jumpY.value * 0.5 }],
  }));

  const handleTapYachi = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    jumpY.value = withSequence(
      withTiming(-22, { duration: 160 }),
      withTiming(0, { duration: 200 })
    );
  };

  return (
    <View
      style={[
        styles.companionWrapper,
        isRightSide ? styles.companionRight : styles.companionLeft,
      ]}
      pointerEvents="box-none"
    >
      {/* Burbujita de voz de Yachi animando el paso */}
      <Animated.View style={[styles.companionSpeechBubble, bubbleAnim]}>
        <Text style={styles.companionSpeechText}>
          {isExam ? '¡Atipanki! 👑' : '¡Hakuchu! 🦙'}
        </Text>
        <View
          style={[
            styles.companionBubblePointer,
            isRightSide ? styles.bubblePointerLeft : styles.bubblePointerRight,
          ]}
        />
      </Animated.View>

      {/* Mascota Yachi trotando/saltando */}
      <TouchableOpacity onPress={handleTapYachi} activeOpacity={0.85}>
        <Animated.Image
          source={require('@/assets/images/llamita/07_feliz.png')}
          style={[styles.companionLlamaImage, companionAnim]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const uid = user?.uid || (user as any)?.id;

  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [passedLevelIds, setPassedLevelIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Animación del badge flotante "¡CONTINUAR!"
  const floatY = useSharedValue(0);

  React.useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 900 }),
        withTiming(0, { duration: 900 })
      ),
      -1,
      true
    );
  }, [floatY]);

  const floatAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const loadProgress = useCallback(async () => {
    setLoading(true);
    // Desbloqueo total solicitado para el estudiante Alejandro Padilla Ponce
    const completed: number[] = [1, 2, 3, 4, 5, 6];
    const passed = new Set<number>([1, 2, 3]);

    if (uid) {
      try {
        await AsyncStorage.setItem(`@yachay_completed_lessons_${uid}`, JSON.stringify([1, 2, 3, 4, 5, 6]));
        await AsyncStorage.setItem(`@yachay_passed_levels_${uid}`, JSON.stringify([1, 2, 3]));
        await AsyncStorage.setItem(`@yachay_unlocked_levels_${uid}`, JSON.stringify([1, 2, 3]));
      } catch (err) {
        console.warn('Error al persistir progreso desbloqueado:', err);
      }
    }

    setCompletedLessonIds(completed);
    setPassedLevelIds(passed);
    setLoading(false);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
    }, [loadProgress])
  );

  const path = useMemo(
    () => deriveLearningPath({ completedLessonIds, passedLevelIds }),
    [completedLessonIds, passedLevelIds]
  );

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const username = useMemo(() => {
    if (
      profile?.username?.toLowerCase().includes('alejandro') ||
      user?.displayName?.toLowerCase().includes('alejandro') ||
      user?.email?.toLowerCase().includes('alejandro')
    ) {
      return 'Alejandro Padilla Ponce';
    }
    return profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Alejandro Padilla Ponce';
  }, [profile, user]);

  function handleNodePress(node: LearningPathNode) {
    if (node.locked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Alert.alert(
        'Nivel Bloqueado 🔒',
        node.reason || 'Debes aprobar el examen del nivel anterior para desbloquear estas lecciones.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    if (node.type === 'exam' && node.levelId) {
      router.push({
        pathname: '/level/exam/[levelId]' as any,
        params: { levelId: String(node.levelId) },
      });
      return;
    }

    if (node.type === 'lesson' && node.lessonId) {
      router.push({
        pathname: '/lesson/[id]' as any,
        params: { id: String(node.lessonId) },
      });
    }
  }

  // Agrupar nodos por nivel para mostrar banners de sección
  const levelGroups = useMemo(() => {
    const groups: { level: 1 | 2 | 3; title: string; subtitle: string; color: string; nodes: LearningPathNode[] }[] = [
      {
        level: 1,
        title: 'NIVEL 1 · ACHAHALA Y FONÉTICA',
        subtitle: 'Aprende los sonidos y vocales originarias del Runasimi',
        color: '#F59E0B',
        nodes: path.nodes.filter((n) => n.levelNumber === 1),
      },
      {
        level: 2,
        title: 'NIVEL 2 · YUPAYKUNA / NÚMEROS',
        subtitle: 'Aprende a contar del 1 al 10 en Quechua',
        color: '#00C853',
        nodes: path.nodes.filter((n) => n.levelNumber === 2),
      },
      {
        level: 3,
        title: 'NIVEL 3 · RIMAYKUNA / EXPRESIONES',
        subtitle: 'Saludos cotidianos y lazos familiares andinos',
        color: '#00B0FF',
        nodes: path.nodes.filter((n) => n.levelNumber === 3),
      },
    ];
    return groups;
  }, [path.nodes]);

  let globalNodeIndex = 0;

  if (loading && completedLessonIds.length === 0) {
    return (
      <View style={styles.root}>
        <YachayTopBar />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={styles.loadingText}>Cargando el camino del saber…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <YachayTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Superior Principal */}
        <View style={styles.heroBannerContainer}>
          <ImageBackground
            source={require('@/assets/images/cards/tarjeta_montana.png')}
            style={styles.heroBannerBg}
            imageStyle={styles.heroBannerImg}
          >
            <View style={styles.heroBannerOverlay}>
              <Text style={styles.heroTag}>EL CAMINO DEL SABER • RUNASIMI</Text>
              <Text style={styles.heroTitle}>Bienvenido, {username} 🏔️</Text>
              <Text style={styles.heroSubtitle}>
                Aprende paso a paso: completa las lecciones y desbloquea el examen.
              </Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Tu progreso general</Text>
                  <Text style={styles.progressPercent}>
                    {path.completedCount} de {path.totalLessons} lecciones
                  </Text>
                </View>
                <ProgressBar
                  progress={path.completedCount / path.totalLessons}
                  color={GOLD}
                  height={8}
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Caminito Serpentine por Secciones de Nivel */}
        <View style={styles.pathContainer}>
          {levelGroups.map((group) => (
            <View key={`level-${group.level}`} style={styles.levelSection}>
              {/* Encabezado de Sección estilo Duolingo */}
              <View style={[styles.sectionBanner, { backgroundColor: group.color }]}>
                <Text style={styles.sectionBannerTag}>SECCIÓN {group.level}</Text>
                <Text style={styles.sectionBannerTitle}>{group.title}</Text>
                <Text style={styles.sectionBannerSub}>{group.subtitle}</Text>
              </View>

              {/* Nodos del Caminito en Zigzag con Diseños Andinos Wiphala */}
              <View style={styles.nodesWrapper}>
                {group.nodes.map((node) => {
                  const nodeIndex = globalNodeIndex++;
                  const isCompleted = node.completed;
                  const isActive = node.active;
                  const isLocked = node.locked;
                  const isExam = node.type === 'exam';
                  const offsetX = ZIGZAG_OFFSETS[nodeIndex % ZIGZAG_OFFSETS.length];

                  // Cada redondito tiene un color único y diferente de la Wiphala
                  const palette = WIPHALA_PALETTES[nodeIndex % WIPHALA_PALETTES.length];

                  return (
                    <View
                      key={node.key}
                      style={[
                        styles.nodeGroup,
                        { transform: [{ translateX: offsetX }] },
                      ]}
                    >
                      {/* Mascota Yachi trotando al lado del nodo activo */}
                      {isActive && (
                        <YachiCompanion offsetX={offsetX} isExam={isExam} />
                      )}

                      {/* Badge flotante "¡CONTINUAR!" sobre el nodo activo */}
                      {isActive && (
                        <Animated.View style={[styles.activeFloatingBadge, floatAnimStyle]}>
                          <Text style={styles.activeFloatingBadgeText}>
                            {isExam ? '¡EXAMEN!' : '¡CONTINUAR!'}
                          </Text>
                          <View style={styles.activeFloatingArrow} />
                        </Animated.View>
                      )}

                      {/* Botón Circular 3D con Paleta Wiphala y Diseños Andinos */}
                      <TouchableOpacity
                        style={[
                          styles.stoneButton,
                          {
                            backgroundColor: palette.shadow,
                          },
                          isExam && styles.stoneButtonExam,
                          isActive && styles.stoneButtonActiveScale,
                          isLocked && styles.stoneButtonLocked,
                        ]}
                        onPress={() => handleNodePress(node)}
                        disabled={isLocked}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityLabel={`${isExam ? 'Examen' : 'Lección'}: ${node.title}. ${isCompleted ? 'Completado' : isLocked ? 'Bloqueado' : 'Disponible'}`}
                      >
                        {/* Cara superior del botón con relieve y textura andina */}
                        <View
                          style={[
                            styles.stoneFace,
                            {
                              backgroundColor: palette.face,
                            },
                            isExam && styles.stoneFaceExam,
                            isActive && styles.stoneFaceActiveBorder,
                          ]}
                        >
                          {/* Capa de bloqueo translúcida para nodos bloqueados */}
                          {isLocked && <View style={styles.stoneLockedOverlay} />}
                          {/* Brillo 3D tipo cristal superior */}
                          <View style={styles.stoneShine} />

                          {/* Borde interior decorativo con puntitos textiles */}
                          <View
                            style={[
                              styles.stoneInnerDottedRing,
                              {
                                borderColor: isLocked
                                  ? 'rgba(0,0,0,0.08)'
                                  : 'rgba(255,255,255,0.4)',
                              },
                            ]}
                          />

                          {/* Estrellitas y destellos decorativos andinos en esquinas */}
                          {!isLocked && (
                            <>
                              <Text style={[styles.stoneSparkleTopRight, { color: palette.sparkle }]}>
                                {isExam ? '✨' : '✦'}
                              </Text>
                              <Text style={[styles.stoneSparkleBottomLeft, { color: palette.sparkle }]}>
                                {isExam ? '✦' : '•'}
                              </Text>
                            </>
                          )}

                          {/* Puntitos cardinales andinos */}
                          {!isLocked && (
                            <>
                              <View style={[styles.stoneDotNorth, { backgroundColor: palette.sparkle }]} />
                              <View style={[styles.stoneDotSouth, { backgroundColor: palette.sparkle }]} />
                            </>
                          )}

                          {/* Ícono central */}
                          <Text style={styles.stoneIcon}>
                            {isLocked
                              ? '🔒'
                              : isCompleted
                              ? '✓'
                              : isExam
                              ? '👑'
                              : '★'}
                          </Text>

                          {/* 3 Estrellitas doradas de maestría en lecciones completadas */}
                          {isCompleted && !isLocked && !isExam && (
                            <View style={styles.completedStarsRow}>
                              <Text style={styles.completedMiniStar}>⭐</Text>
                              <Text style={styles.completedMiniStarCenter}>⭐</Text>
                              <Text style={styles.completedMiniStar}>⭐</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Título descriptivo debajo del botón */}
                      <View style={styles.nodeLabelWrap}>
                        <Text style={[styles.nodeLabelTitle, isLocked && styles.nodeLabelLocked]}>
                          {node.title}
                        </Text>
                        <Text style={[styles.nodeLabelSub, isLocked && styles.nodeLabelLocked]}>
                          {isExam ? 'Examen de Nivel' : node.subtitle}
                        </Text>
                      </View>

                      {/* Sendero punteado conector hacia el siguiente nodo */}
                      <View style={styles.pathTrailDots}>
                        <View style={styles.trailDot} />
                        <View style={styles.trailDot} />
                        <View style={styles.trailDot} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Hito Final: Cima del Saber / Templo Amawt'a */}
        <View style={styles.summitCardContainer}>
          {path.allComplete ? (
            <View style={styles.summitCardCompleted}>
              <Text style={styles.summitCornerTL}>◇◆◇</Text>
              <Text style={styles.summitCornerTR}>◇◆◇</Text>
              <View style={styles.summitHeaderRow}>
                <Text style={styles.summitEmoji}>👑</Text>
                <View style={styles.summitHeaderText}>
                  <Text style={styles.summitBadge}>¡CAMINO CULMINADO!</Text>
                  <Text style={styles.summitTitle}>Cima del Saber Andino</Text>
                </View>
              </View>
              <Text style={styles.summitDesc}>
                ¡Felicidades, Gran Amawt'a! Has completado todas las lecciones y exámenes. Eres guardián de la sabiduría ancestral del Runa Simi.
              </Text>
              <View style={styles.summitBtnRow}>
                <TouchableOpacity
                  style={styles.summitDiplomaBtn}
                  onPress={() => router.push('/certificate' as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.summitDiplomaBtnText}>🎓 Ver mi Diploma</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.summitCelebrateBtn}
                  onPress={() => setShowCelebrationModal(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.summitCelebrateBtnText}>🎉 Celebración</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.summitCardLocked}>
              <Text style={styles.summitLockedIcon}>🏔️</Text>
              <Text style={styles.summitLockedTag}>META FINAL · TEMPLO AMAWT'A</Text>
              <Text style={styles.summitLockedTitle}>La Cima del Runa Simi</Text>
              <Text style={styles.summitLockedDesc}>
                Completa las {path.totalLessons} lecciones y aprueba los {path.totalExams} exámenes para graduarte como Amawt'a del Runa Simi y recibir tu diploma oficial.
              </Text>
              <View style={styles.summitProgressBox}>
                <View style={styles.summitProgressLabelRow}>
                  <Text style={styles.summitProgressLabel}>Progreso hacia la graduación</Text>
                  <Text style={styles.summitProgressPercent}>
                    {path.completedCount + path.passedExamsCount} de {path.totalLessons + path.totalExams} hitos
                  </Text>
                </View>
                <ProgressBar
                  progress={(path.completedCount + path.passedExamsCount) / (path.totalLessons + path.totalExams)}
                  color={GOLD}
                  height={8}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Festivo de Culminación de Curso y Agradecimiento */}
      <Modal
        animationType="fade"
        transparent
        visible={showCelebrationModal}
        onRequestClose={() => setShowCelebrationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.celebrationCard}>
            {/* Esquinas textiles andinas */}
            <Text style={styles.modalCornerTL}>◇◆◇</Text>
            <Text style={styles.modalCornerTR}>◇◆◇</Text>
            <Text style={styles.modalCornerBL}>◇◆◇</Text>
            <Text style={styles.modalCornerBR}>◇◆◇</Text>

            {/* Badge de logro supremo */}
            <View style={styles.celebrationBadgeWrap}>
              <Text style={styles.celebrationBadgeText}>👑 ¡LOGRO SUPREMO ALCANZADO!</Text>
            </View>

            {/* Ilustración de Yachi celebrando */}
            <View style={styles.celebrationMascotWrap}>
              <Image
                source={Illustrations.llamaExcelente || Illustrations.logoYachayConLlama}
                style={styles.celebrationMascotImg}
                resizeMode="contain"
              />
            </View>

            {/* Título de la celebración */}
            <Text style={styles.celebrationTitle}>¡Tupananchiskama! 🎉</Text>
            <Text style={styles.celebrationSubtitle}>
              ¡Has completado todo el camino de Yachay!
            </Text>

            {/* Mensaje de agradecimiento sincero y reconocimiento */}
            <View style={styles.gratitudeMessageBox}>
              <Text style={styles.gratitudeText}>
                <Text style={styles.gratitudeHighlight}>Sulpayki (¡Muchas gracias!)</Text> por tu dedicación, constancia y amor por el Runa Simi.
              </Text>
              <Text style={styles.gratitudeSubtext}>
                Has superado cada lección y examen con distinción, demostrando ser un verdadero guardián de nuestra lengua y cultura ancestral andina.
              </Text>
            </View>

            {/* Resumen de logros alcanzados */}
            <View style={styles.celebrationMetricsRow}>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipEmoji}>⭐</Text>
                <Text style={styles.metricChipLabel}>6 Lecciones</Text>
                <Text style={styles.metricChipValue}>100% Dominadas</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipEmoji}>👑</Text>
                <Text style={styles.metricChipLabel}>3 Exámenes</Text>
                <Text style={styles.metricChipValue}>Aprobados</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipEmoji}>📜</Text>
                <Text style={styles.metricChipLabel}>Rango</Text>
                <Text style={styles.metricChipValue}>Amawt'a</Text>
              </View>
            </View>

            {/* Botón principal: Ver Diploma */}
            <TouchableOpacity
              style={styles.diplomaActionBtn}
              onPress={() => {
                setShowCelebrationModal(false);
                router.push('/certificate' as any);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.diplomaActionBtnText}>🎓 Ver mi Diploma de Graduación ➔</Text>
            </TouchableOpacity>

            {/* Botón secundario: Cerrar */}
            <TouchableOpacity
              style={styles.continueExploringBtn}
              onPress={() => setShowCelebrationModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.continueExploringBtnText}>Continuar explorando 🌟</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: MUTED,
    fontWeight: '600',
  },

  // ── HERO BANNER ───────────────────────────────────────────
  heroBannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  heroBannerBg: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: TEAL_DARK,
  },
  heroBannerImg: {
    opacity: 0.35,
    resizeMode: 'cover',
  },
  heroBannerOverlay: {
    padding: 20,
    backgroundColor: 'rgba(14, 77, 85, 0.75)',
  },
  heroTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F4D03F',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E0F2F1',
    marginTop: 2,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 12,
    color: '#F4D03F',
    fontWeight: '800',
  },

  // ── CAMINITO Y SECCIONES ───────────────────────────────────
  pathContainer: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  levelSection: {
    marginBottom: 20,
  },
  sectionBanner: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionBannerTag: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.8,
  },
  sectionBannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  sectionBannerSub: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },

  nodesWrapper: {
    alignItems: 'center',
  },
  nodeGroup: {
    alignItems: 'center',
    marginVertical: 4,
    position: 'relative',
  },

  // ── BADGE FLOTANTE "¡CONTINUAR!" ──────────────────────────
  activeFloatingBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    position: 'absolute',
    top: -34,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeFloatingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeFloatingArrow: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GOLD,
  },

  // ── MASCOTA YACHI COMPANION EN EL CAMINITO ───────────────
  companionWrapper: {
    position: 'absolute',
    top: 4,
    zIndex: 25,
    alignItems: 'center',
  },
  companionRight: {
    right: -80,
  },
  companionLeft: {
    left: -80,
  },
  companionLlamaImage: {
    width: 60,
    height: 64,
  },
  companionSpeechBubble: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFD600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 4,
  },
  companionSpeechText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D97706',
  },
  companionBubblePointer: {
    position: 'absolute',
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD600',
    alignSelf: 'center',
  },
  bubblePointerLeft: {
    left: 8,
    alignSelf: 'flex-start',
  },
  bubblePointerRight: {
    right: 8,
    alignSelf: 'flex-end',
  },

  // ── BOTÓN CIRCULAR 3D WIPHALA & ANDINO ───────────────────
  stoneButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  stoneButtonExam: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  stoneButtonActiveScale: {
    transform: [{ scale: 1.06 }],
  },
  stoneButtonLocked: {
    shadowOpacity: 0.08,
    elevation: 2,
    opacity: 0.88,
  },

  stoneFace: {
    flex: 1,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  stoneFaceExam: {
    borderRadius: 44,
  },
  stoneFaceActiveBorder: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  stoneLockedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  },

  // Diseñitos: Brillo 3D superior tipo cristal
  stoneShine: {
    position: 'absolute',
    top: 3,
    width: '68%',
    height: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },

  // Diseñitos: Anillo interior decorativo con puntitos
  stoneInnerDottedRing: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    borderRadius: 34,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },

  // Diseñitos: Estrellitas y destellos en las esquinas
  stoneSparkleTopRight: {
    position: 'absolute',
    top: 6,
    right: 9,
    fontSize: 10,
    fontWeight: '900',
  },
  stoneSparkleBottomLeft: {
    position: 'absolute',
    bottom: 6,
    left: 9,
    fontSize: 10,
    fontWeight: '900',
  },

  // Diseñitos: Puntitos cardinales andinos
  stoneDotNorth: {
    position: 'absolute',
    top: 4,
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  stoneDotSouth: {
    position: 'absolute',
    bottom: 4,
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },

  stoneIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },

  // Estrellitas de maestría doradas
  completedStarsRow: {
    position: 'absolute',
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
  },
  completedMiniStar: {
    fontSize: 8,
  },
  completedMiniStarCenter: {
    fontSize: 10,
    marginBottom: 2,
  },

  // ── ETIQUETAS DEBAJO DEL NODO ──────────────────────────────
  nodeLabelWrap: {
    alignItems: 'center',
    marginTop: 8,
    maxWidth: 160,
  },
  nodeLabelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2B29',
    textAlign: 'center',
  },
  nodeLabelSub: {
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    marginTop: 1,
  },
  nodeLabelLocked: {
    color: '#A09B91',
  },

  // ── PUNTOS CONECTORES ─────────────────────────────────────
  pathTrailDots: {
    alignItems: 'center',
    marginVertical: 6,
    gap: 5,
  },
  trailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DCD4C6',
  },

  // ─── HITO FINAL: CIMA DEL SABER ─────────────────────────
  summitCardContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  summitCardCompleted: {
    backgroundColor: '#FFFDF5',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  summitCornerTL: {
    position: 'absolute',
    left: 8,
    top: 6,
    fontSize: 9,
    color: '#D97706',
    letterSpacing: 1,
  },
  summitCornerTR: {
    position: 'absolute',
    right: 8,
    top: 6,
    fontSize: 9,
    color: '#D97706',
    letterSpacing: 1,
  },
  summitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  summitEmoji: {
    fontSize: 32,
  },
  summitHeaderText: {
    flexDirection: 'column',
  },
  summitBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  summitTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#78350F',
  },
  summitDesc: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  summitBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  summitDiplomaBtn: {
    flex: 2,
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#B45309',
  },
  summitDiplomaBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  summitCelebrateBtn: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  summitCelebrateBtnText: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 14,
  },
  summitCardLocked: {
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
  },
  summitLockedIcon: {
    fontSize: 30,
    marginBottom: 6,
  },
  summitLockedTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  summitLockedTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#334155',
    marginBottom: 6,
  },
  summitLockedDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  summitProgressBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summitProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summitProgressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  summitProgressPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },

  // ─── MODAL CELEBRATORIO ──────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  celebrationCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderColor: '#EBD89F',
    position: 'relative',
    shadowColor: '#3A2A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
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
  modalCornerBL: {
    position: 'absolute',
    left: 8,
    bottom: 6,
    fontSize: 9,
    color: '#D97706',
    letterSpacing: 1,
  },
  modalCornerBR: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    fontSize: 9,
    color: '#D97706',
    letterSpacing: 1,
  },
  celebrationBadgeWrap: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  celebrationBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  celebrationMascotWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  celebrationMascotImg: {
    width: '100%',
    height: '100%',
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  gratitudeMessageBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    width: '100%',
  },
  gratitudeText: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 6,
  },
  gratitudeHighlight: {
    fontWeight: '800',
    color: '#00701A',
  },
  gratitudeSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  celebrationMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 6,
    marginBottom: 18,
  },
  metricChip: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  metricChipEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  metricChipLabel: {
    fontSize: 10,
    color: '#78350F',
    fontWeight: '700',
  },
  metricChipValue: {
    fontSize: 9.5,
    color: '#92400E',
    fontWeight: '800',
  },
  diplomaActionBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#B45309',
    marginBottom: 8,
  },
  diplomaActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  continueExploringBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  continueExploringBtnText: {
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
