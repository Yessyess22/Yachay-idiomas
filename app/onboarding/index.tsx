import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { yachiPrincipal, yachiPiensa } from '@/src/assets/images';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const CREAM = '#FAF7F2';
const GREEN = '#00C853';
const GREEN_DARK = '#009624';

type DailyGoal = 'casual' | 'regular' | 'intenso';

const DAILY_GOALS: { id: DailyGoal; label: string; minutes: number; emoji: string }[] = [
  { id: 'casual', label: 'Casual', minutes: 5, emoji: '🌱' },
  { id: 'regular', label: 'Regular', minutes: 10, emoji: '⚡' },
  { id: 'intenso', label: 'Intenso', minutes: 15, emoji: '🔥' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>('regular');

  async function completeOnboarding() {
    await AsyncStorage.setItem('dailyGoal', dailyGoal);
    router.replace('/(auth)' as any);
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 5));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <View style={styles.root}>
      {/* Indicadores de progreso */}
      <View style={styles.header}>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>
        {step < 5 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn}>
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido del paso actual */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepLinguistic />}
        {step === 2 && <StepCurriculum />}
        {step === 3 && <StepMechanics />}
        {step === 4 && <StepGoal dailyGoal={dailyGoal} onSelect={setDailyGoal} />}
        {step === 5 && <StepAccess onAuth={completeOnboarding} />}
      </ScrollView>

      {/* Navegación inferior */}
      {step < 5 && (
        <View style={styles.footer}>
          {step > 0 ? (
            <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
              <Text style={styles.backText}>← Atrás</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <TouchableOpacity onPress={nextStep} style={styles.nextBtn}>
            <Text style={styles.nextText}>Siguiente →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Step 0: Bienvenida Cultural con Etimología de "Yachay" ─────────────────

function StepWelcome() {
  return (
    <View style={styles.stepWrap}>
      {/* Yachi con globo de diálogo pedagógico */}
      <View style={styles.welcomeMascotRow}>
        <Image source={yachiPrincipal} style={styles.mascotWelcome} resizeMode="contain" />
        <View style={styles.welcomeSpeechBubble}>
          <Text style={styles.welcomeSpeechText}>¡Allillanchu!{'\n'}¡Bienvenido! 🏔️</Text>
          <View style={styles.welcomeSpeechTail} />
        </View>
      </View>

      <Text style={styles.stepTag}>YACHAY · ETIMOLOGÍA Y SIGNIFICADO</Text>
      <Text style={styles.stepTitle}>Descubre el poder{'\n'}del Runasimi</Text>

      {/* Tarjeta de análisis morfológico-etimológico */}
      <View style={styles.etymologyCard}>
        <Text style={styles.etymologyCardLabel}>✦ ANÁLISIS ETIMOLÓGICO ✦</Text>
        <View style={styles.etymologyMorphRow}>
          <View style={styles.etymologyMorpheme}>
            <Text style={styles.morphRoot}>YACHA-</Text>
            <Text style={styles.morphGloss}>raíz verbal</Text>
            <Text style={styles.morphMeaning}>"saber, conocer"</Text>
          </View>
          <Text style={styles.etymologyPlus}>+</Text>
          <View style={styles.etymologyMorpheme}>
            <Text style={styles.morphRoot}>-Y</Text>
            <Text style={styles.morphGloss}>infinitivo</Text>
            <Text style={styles.morphMeaning}>"el acto de"</Text>
          </View>
          <Text style={styles.etymologyArrow}>→</Text>
          <View style={styles.etymologyResult}>
            <Text style={styles.resultWord}>YACHAY</Text>
            <Text style={styles.resultMeaning}>"aprender · sabiduría"</Text>
          </View>
        </View>
        <Text style={styles.etymologyExample}>
          Ej: "Ima yachayta munanki?" · "¿Qué quieres aprender?"
        </Text>
      </View>

      {/* Los 3 pilares de la filosofía andina */}
      <Text style={styles.pillarsTitle}>Los 3 pilares de la filosofía andina:</Text>
      <View style={styles.pillarsRow}>
        <View style={[styles.pillarItem, styles.pillarTeal]}>
          <Text style={styles.pillarEmoji}>💡</Text>
          <Text style={styles.pillarWord}>YACHAY</Text>
          <Text style={styles.pillarGloss}>Saber · Mente</Text>
        </View>
        <View style={[styles.pillarItem, styles.pillarRed]}>
          <Text style={styles.pillarEmoji}>❤️</Text>
          <Text style={styles.pillarWord}>MUNAY</Text>
          <Text style={styles.pillarGloss}>Amor · Corazón</Text>
        </View>
        <View style={[styles.pillarItem, styles.pillarGold]}>
          <Text style={styles.pillarEmoji}>💪</Text>
          <Text style={styles.pillarWord}>LLANK'AY</Text>
          <Text style={styles.pillarGloss}>Trabajo · Acción</Text>
        </View>
      </View>

      <Text style={styles.stepDesc}>
        El quechua es la lengua viva originaria más hablada de los Andes, con más de{' '}
        <Text style={styles.stepDescBold}>8 millones de hablantes</Text> en Bolivia, Perú,
        Ecuador, Argentina, Colombia y Chile.
      </Text>
    </View>
  );
}

// ─── Step 1: Contexto Lingüístico del Runasimi ──────────────────────────────

const LINGUISTIC_ITEMS = [
  {
    emoji: '🗣️',
    title: '"Runa Simi" significa...',
    desc: '"Runa" (persona) + "Simi" (boca/lengua) → "La Lengua del Pueblo Andino"',
  },
  {
    emoji: '🌎',
    title: 'Variantes regionales',
    desc: 'El Runasimi posee múltiples variantes en 7 países: Perú, Bolivia, Ecuador, Colombia, Argentina, Chile y Brasil. Cada región preserva su pronunciación y léxico propios.',
  },
  {
    emoji: '📚',
    title: 'Norma oficial adoptada en Yachay',
    desc: 'Esta app enseña las variedades de mayor difusión: Quechua Chanka (Ayacucho-Chanka) y Cusco-Collao, habladas por millones en los Andes centrales.',
  },
];

function StepLinguistic() {
  return (
    <View style={styles.stepWrap}>
      {/* Yachi pensando — con las 3 vocales del sistema trivocálico */}
      <View style={styles.vowelThinkRow}>
        <Image source={yachiPiensa} style={styles.mascotMedium} resizeMode="contain" />
        <View style={styles.vowelBubblesWrap}>
          <Text style={styles.vowelBubblesLabel}>Sistema oficial:</Text>
          <View style={styles.vowelBubblesRow}>
            <View style={styles.vowelBubble}>
              <Text style={styles.vowelLetter}>A</Text>
            </View>
            <View style={[styles.vowelBubble, styles.vowelBubbleMid]}>
              <Text style={styles.vowelLetter}>I</Text>
            </View>
            <View style={styles.vowelBubble}>
              <Text style={styles.vowelLetter}>U</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.stepTag}>EL IDIOMA · CONTEXTO LINGÜÍSTICO</Text>
      <Text style={styles.stepTitle}>El Runasimi{'\n'}y sus Variantes</Text>

      {LINGUISTIC_ITEMS.map((item) => (
        <View key={item.title} style={styles.lingCard}>
          <Text style={styles.lingEmoji}>{item.emoji}</Text>
          <View style={styles.lingInfo}>
            <Text style={styles.lingTitle}>{item.title}</Text>
            <Text style={styles.lingDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}

      {/* Banner del sistema trivocálico */}
      <View style={styles.trivocalBanner}>
        <Text style={styles.trivocalBannerTitle}>🔤 Sistema Trivocálico · Solo 3 Vocales</Text>
        <View style={styles.trivocalRow}>
          <View style={styles.trivocalVowel}>
            <Text style={styles.trivocalVowelLetter}>A</Text>
            <Text style={styles.trivocalVowelEx}>"mama"</Text>
          </View>
          <View style={styles.trivocalVowel}>
            <Text style={styles.trivocalVowelLetter}>I</Text>
            <Text style={styles.trivocalVowelEx}>"inti"</Text>
          </View>
          <View style={styles.trivocalVowel}>
            <Text style={styles.trivocalVowelLetter}>U</Text>
            <Text style={styles.trivocalVowelEx}>"urqu"</Text>
          </View>
        </View>
        <Text style={styles.trivocalNote}>
          Las variantes "e" y "o" aparecen por influencia del español, pero no forman parte de la norma académica oficial.
        </Text>
      </View>
    </View>
  );
}

// ─── Step 2: Tu Ruta de Aprendizaje (Malla Curricular) ──────────────────────

function StepCurriculum() {
  const MODULES = [
    {
      level: 'NIVEL 1',
      title: 'Achahala & Fonética',
      desc: 'Sistema trivocálico (A, I, U) y consonantes originarias (Q, K, LL, CH).',
      emoji: '🗣️',
      color: '#F59E0B',
      badge: 'Básico',
    },
    {
      level: 'NIVEL 2',
      title: 'Yupaykuna / Números',
      desc: 'Aprende a contar del 1 al 10 en Quechua para comercio y vida cotidiana.',
      emoji: '🔢',
      color: '#00C853',
      badge: 'Contabilidad',
    },
    {
      level: 'NIVEL 3',
      title: 'Rimaykuna / Expresiones',
      desc: 'Saludos diarios (Allillanchu), cortesía y lazos familiares (Ayllu).',
      emoji: '💬',
      color: '#00B0FF',
      badge: 'Conversación',
    },
    {
      level: 'EVALUACIÓN',
      title: 'Exámenes de Nivel',
      desc: 'Pruebas sumativas con micrófono, pares y bancos de palabras para certificar tu avance.',
      emoji: '👑',
      color: '#7C3AED',
      badge: 'Certificación',
    },
  ];

  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepTag}>TU RUTA DE APRENDIZAJE</Text>
      <Text style={styles.stepTitle}>¿Qué aprenderás{'\n'}en Yachay?</Text>
      <Text style={styles.stepDesc}>
        Un método estructurado donde primero escuchas y aprendes, luego practicas y finalmente demuestras tu sabiduría.
      </Text>

      {MODULES.map((m) => (
        <View key={m.title} style={[styles.currCard, { borderLeftColor: m.color }]}>
          <View style={[styles.currEmojiWrap, { backgroundColor: m.color + '1A' }]}>
            <Text style={styles.currEmoji}>{m.emoji}</Text>
          </View>
          <View style={styles.currInfo}>
            <View style={styles.currTagRow}>
              <Text style={[styles.currLevel, { color: m.color }]}>{m.level}</Text>
              <View style={styles.currBadge}>
                <Text style={styles.currBadgeText}>{m.badge}</Text>
              </View>
            </View>
            <Text style={styles.currTitle}>{m.title}</Text>
            <Text style={styles.currDesc}>{m.desc}</Text>
          </View>
        </View>
      ))}

      {/* 3 Habilidades Clave */}
      <View style={styles.skillsBanner}>
        <Text style={styles.skillsBannerTitle}>🎯 3 Habilidades que desarrollarás:</Text>
        <View style={styles.skillsRow}>
          <View style={styles.skillItem}>
            <Text style={styles.skillIcon}>🎧</Text>
            <Text style={styles.skillLabel}>Escuchar</Text>
          </View>
          <View style={styles.skillItem}>
            <Text style={styles.skillIcon}>🎙️</Text>
            <Text style={styles.skillLabel}>Pronunciar</Text>
          </View>
          <View style={styles.skillItem}>
            <Text style={styles.skillIcon}>✍️</Text>
            <Text style={styles.skillLabel}>Escribir</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Step 3: Dinámica de Juego ───────────────────────────────────────────────

function StepMechanics() {
  const ITEMS = [
    { emoji: '❤️', title: '5 Vidas', desc: 'Pierdes una por cada error. ¡Protégelas respondiendo bien!' },
    { emoji: '🔥', title: 'Racha diaria', desc: 'Practica cada día para mantener tu racha viva.' },
    { emoji: '⏱️', title: 'Lecciones de 5 min', desc: 'Sesiones cortas y efectivas que caben en tu día.' },
    { emoji: '💎', title: 'Gemas por estudio', desc: 'Completa lecciones y gana gemas — ¡sin compras reales!' },
  ];
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepTag}>ASÍ FUNCIONA</Text>
      <Text style={styles.stepTitle}>Aprende jugando,{'\n'}sin presión</Text>
      {ITEMS.map((item) => (
        <View key={item.title} style={styles.mechCard}>
          <Text style={styles.mechEmoji}>{item.emoji}</Text>
          <View style={styles.mechText}>
            <Text style={styles.mechTitle}>{item.title}</Text>
            <Text style={styles.mechDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Step 4: Meta Diaria ─────────────────────────────────────────────────────

function StepGoal({
  dailyGoal,
  onSelect,
}: {
  dailyGoal: DailyGoal;
  onSelect: (g: DailyGoal) => void;
}) {
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepTag}>TU COMPROMISO</Text>
      <Text style={styles.stepTitle}>¿Cuánto tiempo al{'\n'}día quieres estudiar?</Text>
      <Text style={styles.stepDesc}>Puedes cambiar esto cuando quieras desde tu perfil.</Text>
      {DAILY_GOALS.map((g) => (
        <TouchableOpacity
          key={g.id}
          style={[styles.goalCard, dailyGoal === g.id && styles.goalCardActive]}
          onPress={() => onSelect(g.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.goalEmoji}>{g.emoji}</Text>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalLabel, dailyGoal === g.id && styles.goalLabelActive]}>
              {g.label}
            </Text>
            <Text style={styles.goalMinutes}>{g.minutes} minutos por día</Text>
          </View>
          {dailyGoal === g.id && <Text style={styles.goalCheck}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Step 5: Acceso ──────────────────────────────────────────────────────────

function StepAccess({
  onAuth,
}: {
  onAuth: () => void;
}) {
  return (
    <View style={styles.stepWrap}>
      <Image
        source={yachiPrincipal}
        style={styles.mascotMedium}
        resizeMode="contain"
      />
      <Text style={styles.stepTag}>¡LISTO PARA EMPEZAR!</Text>
      <Text style={styles.stepTitle}>Yachi te espera{'\n'}en el camino del saber</Text>
      <Text style={styles.stepDesc}>
        Crea tu cuenta gratuita para guardar tu progreso y competir en las Ligas de Constancia.
      </Text>
      <TouchableOpacity style={styles.authBtn} onPress={onAuth} activeOpacity={0.88}>
        <Text style={styles.authBtnText}>Iniciar Sesión / Registrarse</Text>
      </TouchableOpacity>
      <Text style={styles.legalNote}>
        Al continuar aceptas que Yachay Quechua es un proyecto educativo sin fines de lucro.
        Sin publicidad · Sin ventas · Sin datos comercializados.
      </Text>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D5D5D5',
  },
  dotActive: {
    backgroundColor: TEAL,
    width: 20,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E2D9',
    backgroundColor: CREAM,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
  },
  backText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '700',
  },
  nextBtn: {
    backgroundColor: TEAL,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderBottomWidth: 3,
    borderBottomColor: TEAL_DARK,
    elevation: 3,
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },

  // ── Wrapper de paso ────────────────────────────────────────────────────────
  stepWrap: {
    paddingTop: 16,
    alignItems: 'center',
  },
  stepTag: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: TEAL,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  stepDesc: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepDescBold: {
    fontWeight: 'bold',
    color: TEAL_DARK,
  },

  // ── Mascotas ───────────────────────────────────────────────────────────────
  mascotWelcome: {
    width: 110,
    height: 110,
  },
  mascotLarge: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  mascotMedium: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },

  // ── Step 0: Welcome — globo de bienvenida ──────────────────────────────────
  welcomeMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
    width: '100%',
  },
  welcomeSpeechBubble: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 12,
    position: 'relative',
  },
  welcomeSpeechText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 20,
  },
  welcomeSpeechTail: {
    position: 'absolute',
    left: -9,
    top: 14,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#F59E0B',
  },

  // ── Step 0: Welcome — card etimológica ────────────────────────────────────
  etymologyCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  etymologyCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  etymologyMorphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  etymologyMorpheme: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
    minWidth: 58,
  },
  morphRoot: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },
  morphGloss: {
    fontSize: 9,
    fontWeight: '700',
    color: '#78350F',
    marginTop: 1,
  },
  morphMeaning: {
    fontSize: 10,
    color: '#B45309',
    fontStyle: 'italic',
    marginTop: 1,
    textAlign: 'center',
  },
  etymologyPlus: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D97706',
  },
  etymologyArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  etymologyResult: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    minWidth: 58,
  },
  resultWord: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00701A',
  },
  resultMeaning: {
    fontSize: 9,
    color: '#065F46',
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
  },
  etymologyExample: {
    fontSize: 11,
    color: '#78350F',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 15,
  },

  // ── Step 0: Welcome — pilares andinos ─────────────────────────────────────
  pillarsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    width: '100%',
  },
  pillarItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
  },
  pillarTeal: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  pillarRed: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  pillarGold: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  pillarEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  pillarWord: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  pillarGloss: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
  },

  // ── Step 1: Lingüístico — Yachi piensa + vocales ───────────────────────────
  vowelThinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
    width: '100%',
  },
  vowelBubblesWrap: {
    flex: 1,
    alignItems: 'center',
  },
  vowelBubblesLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
  },
  vowelBubblesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vowelBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vowelBubbleMid: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  vowelLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3A8A',
  },

  // ── Step 1: Lingüístico — tarjetas de info ─────────────────────────────────
  lingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    borderLeftWidth: 4,
    borderLeftColor: TEAL,
    elevation: 1,
  },
  lingEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  lingInfo: {
    flex: 1,
  },
  lingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 3,
  },
  lingDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  // ── Step 1: Lingüístico — banner trivocálico ───────────────────────────────
  trivocalBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  trivocalBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },
  trivocalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  trivocalVowel: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    minWidth: 70,
  },
  trivocalVowelLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  trivocalVowelEx: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  trivocalNote: {
    fontSize: 11,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 15,
  },

  // ── Step 2: Curriculum ─────────────────────────────────────────────────────
  currCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  currEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currEmoji: {
    fontSize: 22,
  },
  currInfo: {
    flex: 1,
  },
  currTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  currLevel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  currBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  currTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  currDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  skillsBanner: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  skillsBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  skillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  skillItem: {
    alignItems: 'center',
  },
  skillIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  skillLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00701A',
  },

  // ── Step 3: Mecánicas ──────────────────────────────────────────────────────
  mechCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    elevation: 1,
  },
  mechEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  mechText: {
    flex: 1,
  },
  mechTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  mechDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // ── Step 4: Meta Diaria ────────────────────────────────────────────────────
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    width: '100%',
    borderWidth: 2,
    borderColor: '#E8E2D9',
    elevation: 1,
  },
  goalCardActive: {
    borderColor: TEAL,
    backgroundColor: '#F0FAFA',
  },
  goalEmoji: {
    fontSize: 30,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  goalLabelActive: {
    color: TEAL,
  },
  goalMinutes: {
    fontSize: 13,
    color: '#888',
  },
  goalCheck: {
    fontSize: 20,
    color: TEAL,
    fontWeight: '900',
  },

  // ── Step 5: Acceso ─────────────────────────────────────────────────────────
  authBtn: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: GREEN_DARK,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  authBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
  },
  legalNote: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Badge genérico ─────────────────────────────────────────────────────────
  badge: {
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00701A',
    textAlign: 'center',
  },
});
