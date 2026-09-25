import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Illustrations } from '@/constants/illustrations';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#FFB300';
const TEXT_DARK = '#1E293B';
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
          {/* Header con Logo Oficial */}
          <View style={styles.header}>
            <Image
              source={Illustrations.logoYachayOficial}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Yachay Simi</Text>
            <Text style={styles.subtitle}>Aprende Quechua con Inteligencia Artificial</Text>
          </View>

          {/* Misión y Propósito Cultural */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🌾</Text>
              <Text style={styles.sectionTitle}>Misión & Propósito</Text>
            </View>
            <Text style={styles.missionText}>
              Yachay Simi nace de la profunda necesidad de rescatar, revalorizar y no perder nuestros valores, identidad y riqueza cultural andina, transmitiendo el Runasimi (Quechua) a las nuevas generaciones a través de la tecnología e innovación.
            </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 390,
    maxHeight: '88%',
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
  logo: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00701A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: GOLD,
    marginTop: 2,
    textAlign: 'center',
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
    fontSize: 16,
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
