import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomePortadaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Zona Superior: Mascota Llama Yachi */}
      <View style={styles.heroContainer}>
        <Image
          source={require('@/assets/images/yachi/yachi_principal.png')}
          style={styles.llamaImage}
          resizeMode="contain"
        />
      </View>

      {/* Zona Central: Marca Yachay y Eslogan */}
      <View style={styles.brandContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>Yachay</Text>
          {/* Chispas de colores encima de la 'y' final */}
          <View style={styles.sparksContainer}>
            <View style={[styles.spark, { backgroundColor: '#28B473', transform: [{ rotate: '-25deg' }] }]} />
            <View style={[styles.spark, { backgroundColor: '#FF9600', transform: [{ rotate: '0deg' }] }]} />
            <View style={[styles.spark, { backgroundColor: '#E91E63', transform: [{ rotate: '25deg' }] }]} />
          </View>
        </View>

        <Text style={styles.subtitleGreen}>Aprende quechua,</Text>
        <Text style={styles.subtitleNavy}>habla con confianza.</Text>
      </View>

      {/* Zona Inferior: Botones de Acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>EMPEZAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>YA TENGO CUENTA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 340,
  },
  llamaImage: {
    width: 260,
    height: 280,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#152536',
    letterSpacing: -1,
  },
  sparksContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 4,
    right: -24,
    gap: 3,
  },
  spark: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  subtitleGreen: {
    fontSize: 22,
    fontWeight: '800',
    color: '#28B473',
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitleNavy: {
    fontSize: 22,
    fontWeight: '800',
    color: '#152536',
    textAlign: 'center',
    lineHeight: 28,
  },
  actionsContainer: {
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#28B473',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#20965F',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderBottomWidth: 4,
    borderBottomColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#28B473',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
