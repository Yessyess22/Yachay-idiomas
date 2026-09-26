import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Illustrations } from '@/constants/illustrations';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#F59E0B';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';

export default function ModalScreen() {
  const router = useRouter();

  const DEVELOPERS = [
    { name: 'Yessica Escobar', role: 'Desarrollo & Pedagogía', emoji: '👩‍💻' },
    { name: 'Alejandro Padilla', role: 'Desarrollo & Arquitectura', emoji: '👨‍💻' },
    { name: 'Oscar Segovia', role: 'Desarrollo & UI/UX', emoji: '👨‍💻' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header con la Mascota Yachi (Llamita con Chullo) y Marca */}
          <View style={styles.header}>
            <View style={styles.mascotCircle}>
              <Image
                source={Illustrations.logoYachayConLlama}
                style={styles.llamaLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Yachay</Text>
            <Text style={styles.tagline}>El Sendero de la Sabiduría Andina</Text>
          </View>

          {/* ¿Qué significa el nombre de la app? */}
          <View style={styles.meaningBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🏔️</Text>
              <Text style={styles.sectionTitle}>¿Qué significa "Yachay"?</Text>
            </View>
            <Text style={styles.meaningIntro}>
              El nombre de nuestra aplicación proviene del vocablo quechua ancestral:
            </Text>
            <View style={styles.meaningRow}>
              <View style={styles.meaningPill}>
                <Text style={styles.meaningQuechua}>YACHAY</Text>
                <Text style={styles.meaningTranslation}>Aprender · Sabiduría · Conocimiento</Text>
                <Text style={styles.meaningDetail}>
                  Representa el intelecto y el aprendizaje constante. Es uno de los tres pilares de la filosofía andina junto con el Munay (amor y voluntad) y el Llank&apos;ay (trabajo y acción comunitaria).
                </Text>
              </View>
            </View>
            <View style={styles.meaningConclusion}>
              <Text style={styles.meaningConclusionText}>
                ✨ <Text style={styles.boldText}>Yachay</Text> simboliza{' '}
                <Text style={styles.italicHighlight}>"El camino del saber"</Text> y{' '}
                <Text style={styles.italicHighlight}>"Aprender con sabiduría"</Text>.
              </Text>
            </View>
          </View>

          {/* Misión y Propósito Cultural */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🦙</Text>
              <Text style={styles.sectionTitle}>Nuestra Mascota: Yachi</Text>
            </View>
            <Text style={styles.missionText}>
              Yachi es nuestra tierna llamita yachachiq (maestra). Porta el chullo sagrado con iconografía pallay y te acompaña con alegría en cada lección, recordando que la lengua quechua es motivo de orgullo, cultura viva y fraternidad andina.
            </Text>
          </View>

          {/* Valores Éticos Andinos */}
          <View style={styles.valuesBox}>
            <Text style={styles.valuesTitle}>Trilogía Ética del Tawantinsuyu</Text>
            <View style={styles.valuesGrid}>
              <View style={styles.valueItem}>
                <Text style={styles.valueQuechua}>Ama Suwa</Text>
                <Text style={styles.valueSpanish}>No seas ladrón</Text>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueQuechua}>Ama Llulla</Text>
                <Text style={styles.valueSpanish}>No seas mentiroso</Text>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueQuechua}>Ama Qilla</Text>
                <Text style={styles.valueSpanish}>No seas ocioso</Text>
              </View>
            </View>
          </View>

          {/* Institución Académica */}
          <View style={styles.institutionCard}>
            <Text style={styles.instEmoji}>🏛️</Text>
            <View style={styles.instInfo}>
              <Text style={styles.instName}>Universidad Privada Domingo Savio</Text>
              <Text style={styles.instCareer}>Facultad de Ingeniería · Ingeniería de Sistemas</Text>
            </View>
          </View>

          {/* Equipo de Desarrollo */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>👥</Text>
              <Text style={styles.sectionTitle}>Equipo de Desarrolladores</Text>
            </View>
            <View style={styles.devsList}>
              {DEVELOPERS.map((dev) => (
                <View key={dev.name} style={styles.devRow}>
                  <Text style={styles.devEmoji}>{dev.emoji}</Text>
                  <View style={styles.devInfo}>
                    <Text style={styles.devName}>{dev.name}</Text>
                    <Text style={styles.devRole}>{dev.role}</Text>
                  </View>
                  <View style={styles.updsPill}>
                    <Text style={styles.updsPillText}>UPDS</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Badge de Versión */}
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Versión 1.0.0 • Edición Tawantinsuyu</Text>
          </View>

          {/* Botón de Cierre */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.88}>
            <Text style={styles.closeBtnText}>¡Allinmi! • Entendido</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mascotCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  llamaLogo: {
    width: 76,
    height: 76,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00701A',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '800',
    color: GOLD,
    marginTop: 2,
    textAlign: 'center',
  },

  /* Significado del nombre */
  meaningBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  meaningIntro: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 18,
  },
  meaningRow: {
    marginBottom: 8,
  },
  meaningPill: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  meaningQuechua: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
  },
  meaningTranslation: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 1,
  },
  meaningDetail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  meaningConclusion: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  meaningConclusionText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '900',
  },
  italicHighlight: {
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#00701A',
  },

  /* Sección de Misión */
  sectionBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  missionText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },

  /* Valores */
  valuesBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  valuesTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  valuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  valueItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  valueQuechua: {
    fontSize: 12,
    fontWeight: '900',
    color: '#15803D',
  },
  valueSpanish: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Institución Card */
  institutionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#B9F6CA',
  },
  instEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  instInfo: {
    flex: 1,
  },
  instName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00701A',
  },
  instCareer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 1,
  },

  /* Desarrolladores */
  devsList: {
    gap: 8,
    marginTop: 4,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  devEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  devInfo: {
    flex: 1,
  },
  devName: {
    fontSize: 13,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  devRole: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  updsPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  updsPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1D4ED8',
  },

  /* Versión Badge */
  versionBadge: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },

  /* Botón de Cierre */
  closeBtn: {
    backgroundColor: TEAL,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: TEAL_DARK,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
