import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function GuidebookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guía Gramatical Quechua 📖</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionBadge}>1. FONÉTICA ACHAHALA</Text>
          <Text style={styles.sectionTitle}>Las Vocales del Quechua (Trivocal)</Text>
          <Text style={styles.bodyText}>
            El Quechua Chanca y Cusco-Collao es un idioma **trivocálico**. Solo utiliza 3 vocales básicas:
          </Text>

          <View style={styles.vowelRow}>
            <View style={styles.vowelCard}>
              <Text style={styles.vowelLetter}>A</Text>
              <Text style={styles.vowelExample}>Allin (Bueno)</Text>
            </View>
            <View style={styles.vowelCard}>
              <Text style={styles.vowelLetter}>I</Text>
              <Text style={styles.vowelExample}>Inti (Sol)</Text>
            </View>
            <View style={styles.vowelCard}>
              <Text style={styles.vowelLetter}>U</Text>
              <Text style={styles.vowelExample}>Urpi (Paloma)</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionBadge}>2. GRAMÁTICA Y SUFIJOS</Text>
          <Text style={styles.sectionTitle}>El Idioma Aglutinante</Text>
          <Text style={styles.bodyText}>
            En Quechua, las oraciones y significados complejos se forman añadiendo **sufijos** a la raíz de la palabra.
          </Text>

          <View style={styles.suffixTable}>
            <View style={styles.suffixRow}>
              <Text style={styles.suffixCode}>-kuna</Text>
              <Text style={styles.suffixMeaning}>Pluralizador (Las / Los)</Text>
              <Text style={styles.suffixExample}>Wasi (Casa) → Wasikuna (Casas)</Text>
            </View>

            <View style={styles.suffixRow}>
              <Text style={styles.suffixCode}>-manta</Text>
              <Text style={styles.suffixMeaning}>Procedencia (De / Desde)</Text>
              <Text style={styles.suffixExample}>Qosqo (Cusco) → Qosqomanta (De Cusco)</Text>
            </View>

            <View style={styles.suffixRow}>
              <Text style={styles.suffixCode}>-pak / -paq</Text>
              <Text style={styles.suffixMeaning}>Propósito (Para)</Text>
              <Text style={styles.suffixExample}>Ñoqa (Yo) → Ñoqapaq (Para mí)</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionBadge}>3. SALUDOS COTIDIANOS</Text>
          <Text style={styles.sectionTitle}>¿Cómo saludar en Quechua?</Text>
          <Text style={styles.bodyText}>
            - **¡Allinllachu!**: ¿Estás bien? (Saludo general){'\n'}
            - **¡Allinmi!**: ¡Estoy bien! (Respuesta){'\n'}
            - **Añay / Sulpayki**: Gracias{'\n'}
            - **Tupananchiskama**: Hasta que nos volvamos a encontrar (Adiós)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#58CC02',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginRight: 16,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    padding: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#58CC02',
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
  },
  vowelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  vowelCard: {
    backgroundColor: '#F1F8E9',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
  vowelLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2E7D32',
  },
  vowelExample: {
    fontSize: 12,
    color: '#555555',
    marginTop: 4,
    textAlign: 'center',
  },
  suffixTable: {
    marginTop: 14,
    gap: 12,
  },
  suffixRow: {
    backgroundColor: '#F7F9FA',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1CB0F6',
  },
  suffixCode: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1899D6',
  },
  suffixMeaning: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3C3C3C',
    marginTop: 2,
  },
  suffixExample: {
    fontSize: 13,
    color: '#777777',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
