import { ConfettiBurst } from '@/components/yachay/confetti-burst';
import { Illustrations } from '@/constants/illustrations';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const GOLD = '#D97706';
const GOLD_LIGHT = '#FEF3C7';
const TEAL = '#059669';
const TEAL_DARK = '#065F46';
const NAVY = '#0F172A';

export default function CertificateScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { xp, streakDays } = useGame();

  const studentName = useMemo(() => {
    if (
      profile?.username?.toLowerCase().includes('alejandro') ||
      user?.displayName?.toLowerCase().includes('alejandro') ||
      user?.email?.toLowerCase().includes('alejandro')
    ) {
      return 'Alejandro Padilla Ponce';
    }
    return (
      profile?.username ||
      user?.displayName ||
      user?.email?.split('@')[0] ||
      'Alejandro Padilla Ponce'
    );
  }, [profile, user]);

  const certificateCode = useMemo(() => {
    const rawId = (user?.uid || 'YACHAY').slice(0, 6).toUpperCase();
    return `YACHAY-AMAWTA-${rawId}-2026`;
  }, [user]);

  const issueDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  async function handleShare() {
    try {
      const message = `🎓 ¡Me gradué como Amawt'a en Yachay! He culminado con éxito el aprendizaje del idioma Quechua (Runa Simi). Código de certificado: ${certificateCode} 🦙✨`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: 'Certificado Yachay', text: message });
        } else {
          Alert.alert('¡Certificado Listo!', 'Copia y comparte tu logro:\n\n' + message);
        }
      } else {
        await Share.share({ message });
      }
    } catch {}
  }

  return (
    <View style={styles.container}>
      <ConfettiBurst />

      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>✕ Cerrar</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Certificado de Graduación</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
          <Text style={styles.shareBtnText}>📤 Compartir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner de Felicitación */}
        <View style={styles.celebrationBanner}>
          <Text style={styles.celebrationEmoji}>👑</Text>
          <Text style={styles.celebrationTitle}>¡Felicidades, Gran Amawt'a!</Text>
          <Text style={styles.celebrationSub}>
            Has completado la carrera del Runa Simi. Eres guardián de la sabiduría ancestral andina.
          </Text>
        </View>

        {/* MARCO DEL DIPLOMA */}
        <View style={styles.diplomaOuterFrame}>
          <View style={styles.diplomaInnerFrame}>
            {/* Esquinas decorativas andinas */}
            <Text style={styles.cornerTL}>◇◆◇</Text>
            <Text style={styles.cornerTR}>◇◆◇</Text>
            <Text style={styles.cornerBL}>◇◆◇</Text>
            <Text style={styles.cornerBR}>◇◆◇</Text>

            {/* Encabezado del Certificado */}
            <View style={styles.diplomaHeader}>
              <Image
                source={Illustrations.logoYachayConLlama}
                style={styles.diplomaMascot}
                contentFit="contain"
              />
              <Text style={styles.institutionName}>YACHAY · RUNA SIMI KAWSAY</Text>
              <Text style={styles.diplomaMainTitle}>CERTIFICADO DE ACREDITACIÓN</Text>
              <View style={styles.titleDivider} />
            </View>

            {/* Cuerpo del Diploma */}
            <Text style={styles.conferralText}>
              Por cuanto el estudiante ha demostrado dedicación, constancia y profundo respeto por la lengua y cultura andina, se otorga el presente reconocimiento a:
            </Text>

            <View style={styles.studentNameBox}>
              <Text style={styles.studentNameText}>{studentName}</Text>
            </View>

            <Text style={styles.bodyText}>
              Por haber aprobado con distinción los módulos del idioma Quechua (Achahala y Fonética, Yupaykuna y Expresiones del Ayllu), confiriéndosele el título honorífico de:
            </Text>

            <View style={styles.honorTitleBadge}>
              <Text style={styles.honorTitleText}>AMAWTA DEL RUNA SIMI</Text>
              <Text style={styles.honorSubtitle}>Maestro de la Sabiduría Andina</Text>
            </View>

            {/* Métricas del Estudiante */}
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>SABIDURÍA ACUMULADA</Text>
                <Text style={styles.statValue}>⚡ {xp} XP</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>CONSTANCIA</Text>
                <Text style={styles.statValue}>🔥 {Math.max(1, streakDays)} Días</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>CALIFICACIÓN</Text>
                <Text style={styles.statValue}>✓ Aprobado</Text>
              </View>
            </View>

            {/* Firmas ceremoniales */}
            <View style={styles.signaturesRow}>
              <View style={styles.signatureBox}>
                <Text style={styles.signDoodle}>Yachi</Text>
                <View style={styles.signLine} />
                <Text style={styles.signName}>Yachi la Llamita</Text>
                <Text style={styles.signRole}>Guardián del Saber Andino</Text>
              </View>
              <View style={styles.sealBox}>
                <View style={styles.goldenSeal}>
                  <Text style={styles.sealStar}>★</Text>
                  <Text style={styles.sealText}>OFICIAL</Text>
                  <Text style={styles.sealSub}>YACHAY</Text>
                </View>
              </View>
              <View style={styles.signatureBox}>
                <Text style={styles.signDoodle}>Consejo Amawt'a</Text>
                <View style={styles.signLine} />
                <Text style={styles.signName}>Comité Pedagógico</Text>
                <Text style={styles.signRole}>Yachay / UPDS</Text>
              </View>
            </View>

            {/* Footer con fecha y código de verificación */}
            <View style={styles.diplomaFooter}>
              <Text style={styles.footerDate}>Emitido el: {issueDate}</Text>
              <Text style={styles.footerCode}>Código de Registro: {certificateCode}</Text>
            </View>
          </View>
        </View>

        {/* Acciones Finales del Endgame */}
        <View style={styles.endgameActions}>
          <TouchableOpacity style={styles.continuePracticeBtn} onPress={handleShare}>
            <Text style={styles.continuePracticeText}>📲 Compartir Diploma en Redes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.returnPathBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.returnPathText}>Volver al Camino del Saber (Modo Maestría) ➔</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  backBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: GOLD,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  celebrationBanner: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FBBF24',
    textAlign: 'center',
    marginBottom: 6,
  },
  celebrationSub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 340,
  },

  /* Marco del Diploma */
  diplomaOuterFrame: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 10,
    borderWidth: 4,
    borderColor: '#D97706',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  diplomaInnerFrame: {
    borderWidth: 1.5,
    borderColor: '#B45309',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFDF9',
  },
  cornerTL: { position: 'absolute', top: 6, left: 6, fontSize: 10, color: '#D97706' },
  cornerTR: { position: 'absolute', top: 6, right: 6, fontSize: 10, color: '#D97706' },
  cornerBL: { position: 'absolute', bottom: 6, left: 6, fontSize: 10, color: '#D97706' },
  cornerBR: { position: 'absolute', bottom: 6, right: 6, fontSize: 10, color: '#D97706' },

  diplomaHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  diplomaMascot: {
    width: 60,
    height: 60,
    marginBottom: 6,
  },
  institutionName: {
    fontSize: 10,
    fontWeight: '900',
    color: TEAL_DARK,
    letterSpacing: 2,
    marginBottom: 4,
  },
  diplomaMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleDivider: {
    width: 80,
    height: 3,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    marginTop: 6,
  },

  conferralText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  studentNameBox: {
    borderBottomWidth: 2,
    borderBottomColor: '#D97706',
    paddingBottom: 4,
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  studentNameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bodyText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  honorTitleBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  honorTitleText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 1,
  },
  honorSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statChip: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },

  signaturesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  signatureBox: {
    alignItems: 'center',
    flex: 1,
  },
  signDoodle: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#1E293B',
    marginBottom: 2,
  },
  signLine: {
    width: '80%',
    height: 1,
    backgroundColor: '#94A3B8',
    marginBottom: 4,
  },
  signName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E293B',
  },
  signRole: {
    fontSize: 8,
    color: '#64748B',
  },
  sealBox: {
    paddingHorizontal: 6,
  },
  goldenSeal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  sealStar: { fontSize: 10, color: '#FFF' },
  sealText: { fontSize: 7, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  sealSub: { fontSize: 6, fontWeight: '800', color: '#FFF' },

  diplomaFooter: {
    marginTop: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    width: '100%',
  },
  footerDate: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  footerCode: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: 2,
  },

  /* Acciones */
  endgameActions: {
    width: '100%',
    maxWidth: 420,
    marginTop: 20,
    gap: 10,
  },
  continuePracticeBtn: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continuePracticeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  returnPathBtn: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  returnPathText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
});
