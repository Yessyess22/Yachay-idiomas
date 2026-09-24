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

const TEAL = '#1B8B8C';
const TEAL_DARK = '#136566';
const CREAM = '#FAF7F2';
const GREEN = '#1B8B8C';
const GREEN_DARK = '#0E4D55';

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

  async function handleGuest() {
    await AsyncStorage.setItem('dailyGoal', dailyGoal);
    router.replace('/(auth)/login' as any);
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 3));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <View style={styles.root}>
      {/* Header: skip button */}
      <View style={styles.header}>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>
        {step < 3 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn}>
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Step content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepMechanics />}
        {step === 2 && <StepGoal dailyGoal={dailyGoal} onSelect={setDailyGoal} />}
        {step === 3 && <StepAccess onGuest={handleGuest} onAuth={completeOnboarding} />}
      </ScrollView>

      {/* Footer nav */}
      {step < 3 && (
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

// ─── Step 0: Bienvenida Cultural ────────────────────────────────────────────

function StepWelcome() {
  return (
    <View style={styles.stepWrap}>
      <Image
        source={require('@/assets/images/mascota_principal_saludo.png')}
        style={styles.mascotLarge}
        resizeMode="contain"
      />
      <Text style={styles.stepTag}>YACHAY QUECHUA</Text>
      <Text style={styles.stepTitle}>Descubre el poder{'\n'}del Runasimi</Text>
      <Text style={styles.stepDesc}>
        El quechua es el idioma más hablado de los pueblos originarios de América del Sur.
        Con Yachay aprenderás de forma divertida, gratuita y a tu ritmo.
      </Text>

    </View>
  );
}

// ─── Step 1: Dinámica de Juego ───────────────────────────────────────────────

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

// ─── Step 2: Meta Diaria ────────────────────────────────────────────────────

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

// ─── Step 3: Acceso ─────────────────────────────────────────────────────────

function StepAccess({
  onGuest,
  onAuth,
}: {
  onGuest: () => void;
  onAuth: () => void;
}) {
  return (
    <View style={styles.stepWrap}>
      <Image
        source={require('@/assets/images/mascota_principal_saludo.png')}
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
      <TouchableOpacity style={styles.guestBtn} onPress={onGuest} activeOpacity={0.88}>
        <Text style={styles.guestBtnText}>Explorar como Invitado</Text>
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
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D5D5D5',
  },
  dotActive: {
    backgroundColor: TEAL,
    width: 24,
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

  // Step wrapper
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

  // Mascots
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

  // Badge
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
    color: '#0E4D55',
    textAlign: 'center',
  },

  // Mechanic cards
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

  // Goal cards
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

  // Access step
  authBtn: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: GREEN_DARK,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 4,
  },
  authBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
  },
  guestBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D5D5D5',
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestBtnText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '700',
  },
  legalNote: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
