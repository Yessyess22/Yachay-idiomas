import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Illustrations } from '@/constants/illustrations';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#F59E0B';
const GOLD_DARK = '#D97706';

export default function VerifyEmailScreen() {
  const { user, checkEmailVerified, sendVerificationEmail, dismissEmailVerification, signOut } = useAuth();
  const router = useRouter();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cuenta regresiva para reenviar
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Si el usuario ya está verificado al entrar
  useEffect(() => {
    if (user?.emailVerified) {
      router.replace('/(tabs)');
    }
  }, [user]);

  async function handleCheckStatus() {
    setChecking(true);
    setFeedback(null);
    try {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        setFeedback({ message: '¡Correo verificado con éxito! Ingresando a Yachay...', isError: false });
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 800);
      } else {
        setFeedback({
          message:
            'Tu correo aún no figura como verificado. Si ya hiciste clic en el enlace, espera unos segundos y vuelve a presionar este botón.',
          isError: true,
        });
      }
    } catch {
      setFeedback({
        message: 'No pudimos comprobar el estado. Verifica tu conexión e inténtalo de nuevo.',
        isError: true,
      });
    } finally {
      setChecking(false);
    }
  }

  async function handleResendEmail() {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setFeedback(null);
    try {
      const res = await sendVerificationEmail();
      if (res.error) {
        setFeedback({ message: res.error, isError: true });
        // Si hay error de rate limit, activar cooldown para evitar frustración
        if (res.error.toLowerCase().includes('demasiadas') || res.error.toLowerCase().includes('seguridad')) {
          setResendCooldown(60);
        }
      } else {
        setFeedback({
          message: '¡Correo de confirmación enviado! Revisa tu bandeja principal, Spam o Promociones.',
          isError: false,
        });
        setResendCooldown(45); // 45 segundos de espera
      }
    } catch {
      setFeedback({
        message: 'Error al enviar el correo. Por favor espera unos momentos.',
        isError: true,
      });
      setResendCooldown(30);
    } finally {
      setResending(false);
    }
  }

  async function handleContinueAnyway() {
    await dismissEmailVerification();
    router.replace('/(tabs)');
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentCard}>
        <Image
          source={Illustrations.appIconCircularMontana}
          style={styles.brandImage}
          contentFit="contain"
        />

        <View style={styles.iconCircle}>
          <Text style={styles.envelopeEmoji}>✉️</Text>
        </View>

        <Text style={styles.title}>Confirma tu correo</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un enlace de confirmación para activar tu cuenta de Yachay a:
        </Text>

        <View style={styles.emailBadge}>
          <Text style={styles.emailText}>{user?.email || 'tu correo'}</Text>
        </View>

        <Text style={styles.hintText}>
          Haz clic en el enlace dentro del correo para verificar tu cuenta.
        </Text>

        {feedback && (
          <View style={[styles.feedbackBox, feedback.isError ? styles.feedbackError : styles.feedbackSuccess]}>
            <Text style={[styles.feedbackText, feedback.isError ? styles.feedbackTextError : styles.feedbackTextSuccess]}>
              {feedback.message}
            </Text>
          </View>
        )}

        {/* Botón Principal: Ya lo confirmé */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCheckStatus}
          disabled={checking}
          activeOpacity={0.85}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>✓ Ya confirmé mi correo</Text>
          )}
        </TouchableOpacity>

        {/* Botón Omitir / Continuar a Yachay por ahora */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleContinueAnyway}
          activeOpacity={0.85}
        >
          <Text style={styles.skipButtonText}>🚀 Entrar a Yachay por ahora (Verificar después)</Text>
        </TouchableOpacity>

        {/* Botón Secundario: Reenviar correo */}
        <TouchableOpacity
          style={[styles.secondaryButton, (resendCooldown > 0 || resending) && styles.disabledButton]}
          onPress={handleResendEmail}
          disabled={resendCooldown > 0 || resending}
          activeOpacity={0.85}
        >
          {resending ? (
            <ActivityIndicator color="#1F2937" size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {resendCooldown > 0
                ? `⏳ Reenviar disponible en ${resendCooldown}s`
                : '🔄 Reenviar correo de confirmación'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Guía de entrega y Spam */}
        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceHeader}>💡 ¿Por qué no me llega el correo?</Text>
          <Text style={styles.guidanceItem}>
            • <Text style={{ fontWeight: '700' }}>Revisa Spam / No deseado:</Text> Firebase envía desde <Text style={{ fontStyle: 'italic' }}>noreply@yachay-idiomas.firebaseapp.com</Text> y los proveedores suelen clasificarlo como Spam o Promociones.
          </Text>
          <Text style={styles.guidanceItem}>
            • <Text style={{ fontWeight: '700' }}>Espera 1 a 3 minutos:</Text> En ocasiones la entrega puede demorar unos instantes.
          </Text>
          <Text style={styles.guidanceItem}>
            • <Text style={{ fontWeight: '700' }}>Demasiadas peticiones:</Text> Firebase limita los reenvíos rápidos por seguridad. Si te salió ese aviso, espera el temporizador.
          </Text>
          <Text style={styles.guidanceItem}>
            • <Text style={{ fontWeight: '700' }}>Acceso libre:</Text> ¡No te preocupes! Puedes presionar <Text style={{ fontWeight: '700', color: '#B45309' }}>"Entrar a Yachay por ahora"</Text> arriba y continuar aprendiendo mientras esperas el correo.
          </Text>
        </View>

        {/* Cambiar de cuenta / Salir */}
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Cerrar sesión / Registrar otro correo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5EE',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 36,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  brandImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F8F0',
    borderWidth: 2,
    borderColor: '#B9E8D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  envelopeEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  emailBadge: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 12,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  hintText: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  feedbackBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#E8F8F0',
    borderColor: '#86EFAC',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  feedbackText: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  feedbackTextSuccess: {
    color: '#15803D',
  },
  feedbackTextError: {
    color: '#B91C1C',
  },
  primaryButton: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: TEAL_DARK,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  skipButton: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#F59E0B',
    marginBottom: 10,
  },
  skipButtonText: {
    color: '#B45309',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
    marginBottom: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 13.5,
    fontWeight: '700',
  },
  guidanceCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 16,
  },
  guidanceHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  guidanceItem: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 6,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
