/**
 * app/duel/index.tsx
 * TINKUY: Duelo de Saberes 1 vs 1 en Quechua (Runasimi).
 * Permite desafiar a un amigo mediante Código de Sala (Supabase Realtime)
 * o jugar un Duelo Rápido contra un Sabio Amawt'a en tiempo real con carrera de llamitas.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function renderDuelAvatar(avatar: string | undefined, size: number, textStyle?: any) {
  if (avatar && (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.startsWith('file:'))) {
    return (
      <Image
        source={{ uri: avatar }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  }
  return <Text style={textStyle}>{avatar || '🦙'}</Text>;
}
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import {
  duelService,
  DuelPlayer,
  DuelQuestion,
  BOT_RIVALS,
} from '@/src/services/duelService';
import {
  playCompleteSound,
  playCorrectSound,
  playIncorrectSound,
  playTapSound,
} from '@/src/services/soundService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Paleta temática Tinkuy / Andina
const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#FFB300';
const GOLD_DARK = '#C67C00';
const ORANGE = '#FF6D00';
const RED = '#EF4444';
const BLUE = '#00B0FF';
const DARK_BG = '#FAF7F0';
const CARD_BG = '#FFFFFF';
const CREAM = '#FAF7F2';
const TEXT_MUTED = '#6B7280';

type DuelPhase = 'lobby' | 'waiting_guest' | 'battle' | 'results';

const TOTAL_QUESTIONS = 10;
const QUESTION_SECONDS = 12;

export default function DuelScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { addXp, addGems } = useGame();

  const myName = profile?.username || user?.displayName || 'Tú (Estudiante)';
  const myAvatar = profile?.avatar_url || '🦙';

  // Estados de Sala y Partida
  const [phase, setPhase] = useState<DuelPhase>('lobby');
  const [roomCode, setRoomCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  // Jugadores
  const [playerMe, setPlayerMe] = useState<DuelPlayer>({
    id: user?.uid || 'player_me',
    name: myName,
    avatar: myAvatar,
    score: 0,
    correctCount: 0,
    finished: false,
  });

  const [playerRival, setPlayerRival] = useState<DuelPlayer>({
    id: 'rival_bot',
    name: 'Amawt\'a Tupaq',
    avatar: '👨‍🏫',
    score: 0,
    correctCount: 0,
    finished: false,
    isBot: true,
  });

  // Preguntas del Duelo
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_SECONDS);

  // Animaciones de Llamitas en la pista
  const llamaMeProgress = useSharedValue(0);
  const llamaRivalProgress = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  // Canal Realtime
  const realtimeRef = useRef<{
    send: (event: string, payload: any) => void;
    unsubscribe: () => void;
  } | null>(null);

  const timerRef = useRef<any>(null);
  const botTimerRef = useRef<any>(null);

  // Animación de pulso
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true
    );
  }, [pulseAnim]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      if (realtimeRef.current) realtimeRef.current.unsubscribe();
    };
  }, []);

  // ── INICIAR DUELO RÁPIDO CONTRA RIVAL AMAWT'A ────────────────────
  const startQuickDuel = useCallback(() => {
    playTapSound().catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const bot = duelService.getRandomBotRival();
    const qs = duelService.getRandomDuelQuestions(TOTAL_QUESTIONS);

    setPlayerRival({
      id: `bot_${Date.now()}`,
      name: bot.name,
      avatar: bot.avatar,
      score: 0,
      correctCount: 0,
      finished: false,
      isBot: true,
    });

    setPlayerMe((prev) => ({
      ...prev,
      name: myName,
      score: 0,
      correctCount: 0,
      finished: false,
    }));

    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnsweredState('idle');
    setTimeLeft(QUESTION_SECONDS);
    llamaMeProgress.value = withTiming(0);
    llamaRivalProgress.value = withTiming(0);

    setPhase('battle');
  }, [myName, llamaMeProgress, llamaRivalProgress]);

  // ── CREAR SALA PRIVADA ──────────────────────────────────────────
  const createPrivateRoom = useCallback(() => {
    playTapSound().catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const code = duelService.generateRoomCode();
    const qs = duelService.getRandomDuelQuestions(TOTAL_QUESTIONS);
    setRoomCode(code);
    setQuestions(qs);

    // Conectar a Supabase Realtime
    const subscription = duelService.subscribeToDuelChannel(code, (event, payload) => {
      if (event === 'GUEST_JOINED') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setPlayerRival({
          id: payload.player.id,
          name: payload.player.name,
          avatar: payload.player.avatar || '🦙',
          score: 0,
          correctCount: 0,
          finished: false,
          isBot: false,
        });

        // Enviar preguntas al invitado y empezar
        subscription.send('START_MATCH', {
          questions: qs,
          host: {
            id: user?.uid || 'host_me',
            name: myName,
            avatar: myAvatar,
          },
        });

        setTimeout(() => {
          setPhase('battle');
          setCurrentIdx(0);
          setTimeLeft(QUESTION_SECONDS);
        }, 1200);
      } else if (event === 'RIVAL_ANSWER') {
        setPlayerRival((prev) => {
          const newScore = prev.score + (payload.pointsGained || 0);
          const newCount = prev.correctCount + (payload.isCorrect ? 1 : 0);
          llamaRivalProgress.value = withSpring(Math.min(1, newCount / TOTAL_QUESTIONS));
          return {
            ...prev,
            score: newScore,
            correctCount: newCount,
          };
        });
      }
    });

    realtimeRef.current = subscription;
    setPhase('waiting_guest');
  }, [myName, myAvatar, user?.uid, llamaRivalProgress]);

  // ── UNIRSE CON CÓDIGO DE SALA ───────────────────────────────────
  const joinPrivateRoom = useCallback(() => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Código requerido', 'Ingresa el código de sala que te compartió tu amigo (ej. INTI-72).');
      return;
    }

    playTapSound().catch(() => {});
    setIsJoining(true);

    const subscription = duelService.subscribeToDuelChannel(cleanCode, (event, payload) => {
      if (event === 'START_MATCH') {
        setIsJoining(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        setQuestions(payload.questions);
        setPlayerRival({
          id: payload.host.id,
          name: payload.host.name,
          avatar: payload.host.avatar,
          score: 0,
          correctCount: 0,
          finished: false,
          isBot: false,
        });

        setPlayerMe((prev) => ({
          ...prev,
          name: myName,
          score: 0,
          correctCount: 0,
          finished: false,
        }));

        setRoomCode(cleanCode);
        setPhase('battle');
        setCurrentIdx(0);
        setTimeLeft(QUESTION_SECONDS);
      } else if (event === 'RIVAL_ANSWER') {
        setPlayerRival((prev) => {
          const newScore = prev.score + (payload.pointsGained || 0);
          const newCount = prev.correctCount + (payload.isCorrect ? 1 : 0);
          llamaRivalProgress.value = withSpring(Math.min(1, newCount / TOTAL_QUESTIONS));
          return {
            ...prev,
            score: newScore,
            correctCount: newCount,
          };
        });
      }
    });

    realtimeRef.current = subscription;

    // Avisar al host que nos unimos
    setTimeout(() => {
      subscription.send('GUEST_JOINED', {
        player: {
          id: user?.uid || 'guest_me',
          name: myName,
          avatar: myAvatar,
        },
      });
    }, 800);
  }, [inputCode, myName, myAvatar, user?.uid, llamaRivalProgress]);

  // ── COMPORTAMIENTO DEL BOT RIVAL (RESPONDE EN TIEMPO REAL) ───────
  const triggerBotAnswerForQuestion = useCallback(
    (qIndex: number) => {
      if (!playerRival.isBot) return;

      // Tiempo de respuesta aleatorio entre 2.5s y 6s
      const delay = 2500 + Math.random() * 3500;

      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      botTimerRef.current = setTimeout(() => {
        const isCorrect = Math.random() < 0.8; // 80% de probabilidad de acierto del bot
        const points = isCorrect ? 100 + Math.floor(Math.random() * 40) : 0;

        setPlayerRival((prev) => {
          const nextScore = prev.score + points;
          const nextCorrect = prev.correctCount + (isCorrect ? 1 : 0);
          llamaRivalProgress.value = withSpring(Math.min(1, nextCorrect / TOTAL_QUESTIONS));
          return {
            ...prev,
            score: nextScore,
            correctCount: nextCorrect,
          };
        });
      }, delay);
    },
    [playerRival.isBot, llamaRivalProgress]
  );

  // ── TEMPORIZADOR DE PREGUNTA ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'battle') return;

    setTimeLeft(QUESTION_SECONDS);
    setSelectedOption(null);
    setAnsweredState('idle');

    // Bot rival inicia su pensamiento
    triggerBotAnswerForQuestion(currentIdx);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Tiempo agotado -> cuenta como respuesta incorrecta
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [phase, currentIdx]);

  // ── CUANDO EL TIEMPO SE AGOTA ───────────────────────────────────
  const handleTimeExpired = useCallback(() => {
    if (answeredState !== 'idle') return;
    setAnsweredState('wrong');
    playIncorrectSound().catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

    setTimeout(() => {
      advanceNextQuestion();
    }, 1500);
  }, [answeredState]);

  // ── CUANDO EL USUARIO SELECCIONA UNA OPCIÓN ─────────────────────
  const handleSelectOption = useCallback(
    (index: number) => {
      if (answeredState !== 'idle' || !questions[currentIdx]) return;

      setSelectedOption(index);
      const isCorrect = index === questions[currentIdx].correctIndex;

      if (timerRef.current) clearInterval(timerRef.current);

      if (isCorrect) {
        setAnsweredState('correct');
        playCorrectSound().catch(() => {});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        // Puntos: 100 base + bono por velocidad (hasta +50 pts)
        const speedBonus = Math.floor((timeLeft / QUESTION_SECONDS) * 50);
        const earned = 100 + speedBonus;

        setPlayerMe((prev) => {
          const nextScore = prev.score + earned;
          const nextCount = prev.correctCount + 1;
          llamaMeProgress.value = withSpring(Math.min(1, nextCount / TOTAL_QUESTIONS));
          return {
            ...prev,
            score: nextScore,
            correctCount: nextCount,
          };
        });

        // Enviar respuesta en tiempo real al rival
        if (realtimeRef.current) {
          realtimeRef.current.send('RIVAL_ANSWER', {
            isCorrect: true,
            pointsGained: earned,
          });
        }
      } else {
        setAnsweredState('wrong');
        playIncorrectSound().catch(() => {});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});

        if (realtimeRef.current) {
          realtimeRef.current.send('RIVAL_ANSWER', {
            isCorrect: false,
            pointsGained: 0,
          });
        }
      }

      setTimeout(() => {
        advanceNextQuestion();
      }, 1500);
    },
    [answeredState, questions, currentIdx, timeLeft, llamaMeProgress]
  );

  // ── AVANZAR A LA SIGUIENTE PREGUNTA O FINALIZAR ─────────────────
  const advanceNextQuestion = useCallback(() => {
    if (currentIdx + 1 < TOTAL_QUESTIONS && currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Fin del Duelo
      playCompleteSound().catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      // Premiar al usuario con XP y Gemas
      addXp(50);
      addGems(10);

      setPhase('results');
    }
  }, [currentIdx, questions.length, addXp, addGems]);

  // ── ESTILOS ANIMADOS DE LAS LLAMITAS ────────────────────────────
  const llamaMeTrackStyle = useAnimatedStyle(() => ({
    left: `${Math.min(88, Math.max(2, llamaMeProgress.value * 88))}%`,
  }));

  const llamaRivalTrackStyle = useAnimatedStyle(() => ({
    left: `${Math.min(88, Math.max(2, llamaRivalProgress.value * 88))}%`,
  }));

  const pulseBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  // Copiar código al portapapeles
  const handleCopyCode = () => {
    Clipboard.setString(roomCode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert('¡Código Copiado! 📋', `El código ${roomCode} está listo para enviárselo a tu amigo por WhatsApp o mensaje.`);
  };

  // Pregunta actual
  const currentQ = questions[currentIdx];

  // ────────────────────────────────────────────────────────────────
  // RENDER: PANTALLA PRINCIPAL POR FASES
  // ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeRoot}>
      {/* ── CABECERA SUPERIOR ── */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            playTapSound().catch(() => {});
            router.back();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTag}>ENCUENTRO DE SABERES</Text>
          <Text style={styles.headerTitle}>⚔️ TINKUY 1 VS 1</Text>
        </View>

        <View style={styles.headerPointsPill}>
          <Text style={styles.headerPointsText}>🏆 {playerMe.score} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* ══════════════════════════════════════════════════════════
            FASE 1: LOBBY DE ENTRADA
           ══════════════════════════════════════════════════════════ */}
        {phase === 'lobby' && (
          <View style={styles.lobbyWrap}>
            {/* Banner épico de bienvenida al Tinkuy */}
            <View style={styles.tinkuyHeroCard}>
              <Image source={require('@/assets/images/llama_guerra.jpeg')} style={styles.tinkuyHeroImage} resizeMode="contain" />
              <Text style={styles.tinkuyHeroBadge}>MODO COMPETITIVO ANDINO</Text>
              <Text style={styles.tinkuyHeroTitle}>Duelo de Saberes 1 vs 1</Text>
              <Text style={styles.tinkuyHeroDesc}>
                Pon a prueba tu agilidad mental y dominio del Quechua en tiempo real. 10 preguntas épicas para ver quién es el verdadero Amawt'a.
              </Text>
            </View>

            {/* Opción 1: Duelo Rápido (Matchmaking) */}
            <TouchableOpacity
              style={styles.quickDuelCard}
              onPress={startQuickDuel}
              activeOpacity={0.88}
            >
              <Animated.View style={[styles.quickDuelPill, pulseBtnStyle]}>
                <Text style={styles.quickDuelPillText}>⚡ POPULAR</Text>
              </Animated.View>
              <View style={styles.quickDuelRow}>
                <View style={styles.quickDuelIconWrap}>
                  <Text style={styles.quickDuelIcon}>⚡</Text>
                </View>
                <View style={styles.quickDuelTextWrap}>
                  <Text style={styles.quickDuelTitle}>Duelo Rápido Instantáneo</Text>
                  <Text style={styles.quickDuelSub}>
                    Enfréntate a un Sabio Amawt'a andino sin esperar salas.
                  </Text>
                </View>
                <Text style={styles.quickDuelArrow}>›</Text>
              </View>
            </TouchableOpacity>

            {/* Separador Andino */}
            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>O JUEGA CON UN AMIGO</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Opción 2: Crear Sala */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={createPrivateRoom}
              activeOpacity={0.88}
            >
              <View style={styles.actionIconWrap}>
                <Text style={styles.actionIcon}>👑</Text>
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Crear Sala de Duelo</Text>
                <Text style={styles.actionSub}>Genera un código andino y compártelo con tu compañero.</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            {/* Opción 3: Unirse con Código */}
            <View style={styles.joinBox}>
              <Text style={styles.joinBoxLabel}>¿Tienes el código de tu amigo?</Text>
              <View style={styles.joinInputRow}>
                <TextInput
                  style={styles.joinInput}
                  placeholder="Ej. INTI-42"
                  placeholderTextColor={TEXT_MUTED}
                  value={inputCode}
                  onChangeText={setInputCode}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.joinSubmitBtn}
                  onPress={joinPrivateRoom}
                  disabled={isJoining}
                  activeOpacity={0.85}
                >
                  {isJoining ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.joinSubmitBtnText}>Unirme</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════
            FASE 2: SALA DE ESPERA (CREADOR)
           ══════════════════════════════════════════════════════════ */}
        {phase === 'waiting_guest' && (
          <View style={styles.waitingWrap}>
            <View style={styles.waitingCard}>
              <ActivityIndicator size="large" color={GOLD} style={{ marginBottom: 16 }} />
              <Text style={styles.waitingBadge}>SALA ABIERTA</Text>
              <Text style={styles.waitingTitle}>Esperando a tu rival...</Text>
              <Text style={styles.waitingSub}>
                Comparte este código con tu amigo para que ingrese desde su app:
              </Text>

              {/* Caja de Código */}
              <View style={styles.roomCodeBox}>
                <Text style={styles.roomCodeText}>{roomCode}</Text>
              </View>

              <TouchableOpacity
                style={styles.copyCodeBtn}
                onPress={handleCopyCode}
                activeOpacity={0.85}
              >
                <Text style={styles.copyCodeBtnText}>📋 Copiar Código</Text>
              </TouchableOpacity>

              <Text style={styles.waitingTip}>
                💡 En cuanto tu compañero ingrese el código, la partida comenzará automáticamente.
              </Text>

              {/* Botón jugar contra bot si el amigo tarda */}
              <TouchableOpacity
                style={styles.fallbackBotBtn}
                onPress={startQuickDuel}
                activeOpacity={0.85}
              >
                <Text style={styles.fallbackBotBtnText}>⚡ ¿Tarda mucho? Jugar Duelo Rápido ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════
            FASE 3: ARENA DE BATALLA (EN VIVO)
           ══════════════════════════════════════════════════════════ */}
        {phase === 'battle' && currentQ && (
          <View style={styles.battleWrap}>
            {/* ── PISTA DE CARRERA DE LLAMITAS ── */}
            <View style={styles.raceTrackContainer}>
              <View style={styles.raceTrackHeader}>
                <Text style={styles.raceTrackTag}>CARRERA TINKUY</Text>
                <Text style={styles.raceTrackCounter}>
                  Pregunta {currentIdx + 1} de {TOTAL_QUESTIONS}
                </Text>
              </View>

              {/* Carril 1: Tu Llamita */}
              <View style={styles.laneRow}>
                <View style={styles.laneUserBadge}>
                  {renderDuelAvatar(playerMe.avatar, 20, styles.laneAvatar)}
                  <Text style={styles.laneName} numberOfLines={1}>
                    {playerMe.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.laneScore}>{playerMe.score}p</Text>
                </View>
                <View style={styles.laneTrack}>
                  <Animated.View style={[styles.llamaRunner, llamaMeTrackStyle]}>
                    <Image source={require('@/assets/images/llama_guerra.jpeg')} style={styles.llamaRunnerImage} resizeMode="contain" />
                  </Animated.View>
                  <View style={styles.finishLine}>
                    <Text style={styles.finishFlag}>🏁</Text>
                  </View>
                </View>
              </View>

              {/* Carril 2: Rival */}
              <View style={styles.laneRow}>
                <View style={styles.laneUserBadge}>
                  {renderDuelAvatar(playerRival.avatar, 20, styles.laneAvatar)}
                  <Text style={styles.laneName} numberOfLines={1}>
                    {playerRival.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.laneScore}>{playerRival.score}p</Text>
                </View>
                <View style={styles.laneTrack}>
                  <Animated.View style={[styles.llamaRunner, llamaRivalTrackStyle]}>
                    <Image source={require('@/assets/images/llama_guerra.jpeg')} style={styles.llamaRunnerImage} resizeMode="contain" />
                  </Animated.View>
                  <View style={styles.finishLine}>
                    <Text style={styles.finishFlag}>🏁</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── BARRA DEL TEMPORIZADOR ── */}
            <View style={styles.timerWrap}>
              <View style={styles.timerHeader}>
                <Text style={styles.timerIcon}>⏱️</Text>
                <Text style={[styles.timerSecs, timeLeft <= 4 && styles.timerSecsDanger]}>
                  {timeLeft}s restantes
                </Text>
              </View>
              <View style={styles.timerBarTrack}>
                <View
                  style={[
                    styles.timerBarFill,
                    {
                      width: `${(timeLeft / QUESTION_SECONDS) * 100}%`,
                      backgroundColor: timeLeft <= 4 ? RED : timeLeft <= 7 ? GOLD : TEAL,
                    },
                  ]}
                />
              </View>
            </View>

            {/* ── TARJETA DE PREGUNTA ── */}
            <View style={styles.questionCard}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {currentQ.category.toUpperCase()}
                </Text>
              </View>

              {!!currentQ.quechuaTerm && (
                <Text style={styles.quechuaHighlight}>
                  "{currentQ.quechuaTerm}"
                </Text>
              )}

              <Text style={styles.questionPrompt}>{currentQ.prompt}</Text>
            </View>

            {/* ── OPCIONES DE RESPUESTA ── */}
            <View style={styles.optionsWrap}>
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const showSuccess = answeredState !== 'idle' && isCorrect;
                const showFailure = isSelected && answeredState === 'wrong';

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionBtn,
                      showSuccess && styles.optionBtnSuccess,
                      showFailure && styles.optionBtnFailure,
                    ]}
                    onPress={() => handleSelectOption(idx)}
                    disabled={answeredState !== 'idle'}
                    activeOpacity={0.82}
                  >
                    <View style={styles.optionLetterBadge}>
                      <Text style={styles.optionLetterText}>
                        {['A', 'B', 'C', 'D'][idx]}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        showSuccess && styles.optionTextSuccess,
                        showFailure && styles.optionTextFailure,
                      ]}
                    >
                      {option}
                    </Text>
                    {showSuccess && <Text style={styles.resultIcon}>✓</Text>}
                    {showFailure && <Text style={styles.resultIcon}>✕</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explicación rápida al responder */}
            {answeredState !== 'idle' && (
              <View
                style={[
                  styles.feedbackBanner,
                  answeredState === 'correct' ? styles.feedbackSuccess : styles.feedbackFailure,
                ]}
              >
                <Text style={styles.feedbackTitle}>
                  {answeredState === 'correct' ? '¡Allillanmi! +Puntos por velocidad' : '¡Pantay! (Incorrecto)'}
                </Text>
                <Text style={styles.feedbackDesc}>{currentQ.explanation}</Text>
              </View>
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════
            FASE 4: PODIO DE RESULTADOS
           ══════════════════════════════════════════════════════════ */}
        {phase === 'results' && (
          <View style={styles.resultsWrap}>
            {/* Cabecera del Ganador */}
            <View style={styles.victoryCard}>
              <Text style={styles.victoryEmoji}>
                {playerMe.score > playerRival.score ? '👑🎉' : playerMe.score === playerRival.score ? '🤝✨' : '🌟💪'}
              </Text>
              <Text style={styles.victoryBadge}>TINKUY FINALIZADO</Text>
              <Text style={styles.victoryTitle}>
                {playerMe.score > playerRival.score
                  ? '¡Victoria Amawt\'a!'
                  : playerMe.score === playerRival.score
                  ? '¡Empate Fraterno (Ayni)!'
                  : '¡Buen Intento, Hermano!'}
              </Text>
              <Text style={styles.victorySub}>
                {playerMe.score > playerRival.score
                  ? 'Has demostrado ser el más veloz y conocedor del Runa Simi en este Tinkuy.'
                  : 'Cada duelo fortalece tu sabiduría ancestral. ¡Sigue adelante!'}
              </Text>

              {/* Comparación directa de puntajes */}
              <View style={styles.scoreComparisonRow}>
                {/* Tú */}
                <View
                  style={[
                    styles.playerScoreCard,
                    playerMe.score >= playerRival.score && styles.playerScoreCardWinner,
                  ]}
                >
                  {renderDuelAvatar(playerMe.avatar, 42, styles.playerCardAvatar)}
                  <Text style={styles.playerCardName}>Tú</Text>
                  <Text style={styles.playerCardScore}>{playerMe.score}</Text>
                  <Text style={styles.playerCardStats}>
                    {playerMe.correctCount}/{TOTAL_QUESTIONS} aciertos
                  </Text>
                </View>

                <Text style={styles.vsText}>VS</Text>

                {/* Rival */}
                <View
                  style={[
                    styles.playerScoreCard,
                    playerRival.score > playerMe.score && styles.playerScoreCardWinner,
                  ]}
                >
                  {renderDuelAvatar(playerRival.avatar, 42, styles.playerCardAvatar)}
                  <Text style={styles.playerCardName} numberOfLines={1}>
                    {playerRival.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.playerCardScore}>{playerRival.score}</Text>
                  <Text style={styles.playerCardStats}>
                    {playerRival.correctCount}/{TOTAL_QUESTIONS} aciertos
                  </Text>
                </View>
              </View>

              {/* Recompensas otorgadas */}
              <View style={styles.rewardBox}>
                <Text style={styles.rewardBoxTitle}>🎁 RECOMPENSAS GANADAS</Text>
                <View style={styles.rewardRow}>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardBadgeIcon}>⚡</Text>
                    <Text style={styles.rewardBadgeText}>+50 XP</Text>
                  </View>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardBadgeIcon}>🪙</Text>
                    <Text style={styles.rewardBadgeText}>+10 Inticoins</Text>
                  </View>
                </View>
              </View>

              {/* Botones de acción */}
              <TouchableOpacity
                style={styles.rematchBtn}
                onPress={startQuickDuel}
                activeOpacity={0.88}
              >
                <Text style={styles.rematchBtnText}>⚔️ Jugar Otra Partida</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeBtn}
                onPress={() => router.back()}
                activeOpacity={0.85}
              >
                <Text style={styles.homeBtnText}>🏠 Volver al Caminito</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    fontSize: 26,
    color: '#1F2937',
    fontWeight: '700',
    marginTop: -3,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
  },
  headerPointsPill: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerPointsText: {
    fontSize: 12,
    fontWeight: '800',
    color: GOLD,
  },
  scrollBody: {
    padding: 18,
    paddingBottom: 40,
  },

  // ── LOBBY ──
  lobbyWrap: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  tinkuyHeroCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  tinkuyHeroImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  tinkuyHeroBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tinkuyHeroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  tinkuyHeroDesc: {
    fontSize: 13.5,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },

  quickDuelCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 16,
    position: 'relative',
  },
  quickDuelPill: {
    position: 'absolute',
    top: -10,
    right: 18,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  quickDuelPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  quickDuelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickDuelIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickDuelIcon: {
    fontSize: 26,
  },
  quickDuelTextWrap: {
    flex: 1,
  },
  quickDuelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 3,
  },
  quickDuelSub: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  quickDuelArrow: {
    fontSize: 26,
    color: GOLD,
    fontWeight: '700',
  },

  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: TEXT_MUTED,
    marginHorizontal: 12,
    letterSpacing: 0.8,
  },

  actionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  actionArrow: {
    fontSize: 24,
    color: TEAL,
    fontWeight: '700',
  },

  joinBox: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  joinBoxLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  joinSubmitBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },

  // ── SALA DE ESPERA ──
  waitingWrap: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 30,
  },
  waitingCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  waitingBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: 1,
    marginBottom: 4,
  },
  waitingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
  },
  waitingSub: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 20,
  },
  roomCodeBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 18,
  },
  roomCodeText: {
    fontSize: 32,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 3,
  },
  copyCodeBtn: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginBottom: 20,
  },
  copyCodeBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
  waitingTip: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  fallbackBotBtn: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  fallbackBotBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEAL,
  },

  // ── ARENA DE BATALLA ──
  battleWrap: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  raceTrackContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  raceTrackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  raceTrackTag: {
    fontSize: 11,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 1,
  },
  raceTrackCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  laneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  laneUserBadge: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  laneAvatar: {
    fontSize: 16,
  },
  laneName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    maxWidth: 45,
  },
  laneScore: {
    fontSize: 11,
    fontWeight: '800',
    color: GOLD,
    marginLeft: 'auto',
  },
  laneTrack: {
    flex: 1,
    height: 28,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    position: 'relative',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  llamaRunner: {
    position: 'absolute',
    top: 2,
    zIndex: 2,
  },
  llamaRunnerImage: {
    width: 24,
    height: 24,
  },
  finishLine: {
    position: 'absolute',
    right: 6,
    top: 4,
  },
  finishFlag: {
    fontSize: 14,
  },

  // Temporizador
  timerWrap: {
    marginBottom: 16,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timerIcon: {
    fontSize: 14,
  },
  timerSecs: {
    fontSize: 12,
    fontWeight: '800',
    color: TEAL,
  },
  timerSecsDanger: {
    color: RED,
  },
  timerBarTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Pregunta
  questionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  categoryPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: BLUE,
    letterSpacing: 0.8,
  },
  quechuaHighlight: {
    fontSize: 28,
    fontWeight: '900',
    color: GOLD,
    marginBottom: 8,
    textAlign: 'center',
  },
  questionPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Opciones
  optionsWrap: {
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionBtnSuccess: {
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
    borderColor: TEAL,
  },
  optionBtnFailure: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: RED,
  },
  optionLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_MUTED,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  optionTextSuccess: {
    color: '#86EFAC',
  },
  optionTextFailure: {
    color: '#FCA5A5',
  },
  resultIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
  },

  feedbackBanner: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    borderColor: TEAL,
  },
  feedbackFailure: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: RED,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  feedbackDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  // ── RESULTADOS ──
  resultsWrap: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  victoryCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  victoryEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  victoryBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 1,
    marginBottom: 4,
  },
  victoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  victorySub: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  scoreComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  playerScoreCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  playerScoreCardWinner: {
    borderColor: GOLD,
    backgroundColor: 'rgba(255, 179, 0, 0.08)',
  },
  playerCardAvatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  playerCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  playerCardScore: {
    fontSize: 28,
    fontWeight: '900',
    color: GOLD,
    marginBottom: 2,
  },
  playerCardStats: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT_MUTED,
  },
  rewardBox: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  rewardBoxTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  rewardBadgeIcon: {
    fontSize: 16,
  },
  rewardBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  rematchBtn: {
    width: '100%',
    backgroundColor: GOLD,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  rematchBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
  },
  homeBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
});
