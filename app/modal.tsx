import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Illustrations } from '@/constants/illustrations';

const TEAL = '#1B8B8C';
const CREAM = '#FAF7F2';
const GOLD = '#D48B0A';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={Illustrations.logoYachayOficial}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Yachay Simi</Text>
        <Text style={styles.subtitle}>Aprende Quechua con Inteligencia Artificial</Text>

        <View style={styles.divider} />

        <Text style={styles.description}>
          Plataforma educativa interactiva dedicada a la preservación y difusión de las lenguas originarias de los Andes. Incorpora síntesis de voz fonética con Meta MMS-TTS para Quechua Chanca y Cusco-Collao.
        </Text>

        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>Versión 1.0.0 • Tawantinsuyu</Text>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.closeBtnText}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderColor: '#E8E2D9',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: TEAL,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: GOLD,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E8E2D9',
    marginVertical: 16,
  },
  description: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  versionBadge: {
    backgroundColor: '#E0F2F1',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '800',
    color: TEAL,
  },
  closeBtn: {
    backgroundColor: TEAL,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
