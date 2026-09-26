import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { Card } from '@/components/yachay/card';
import { AudioPronounceButton } from '@/components/yachay/audio-pronounce-button';
import { getQuechuaPhoneticGuide } from '@/src/utils/phoneticGuide';

const TEAL = '#00C853';
const PARCHMENT = '#F8F5EE';
const GOLD = '#FFB300';

const PHONEMES = ['a', 'i', 'u', 'ch', 'h', 'k', 'l', 'll', 'm', 'n', 'ñ', 'p', 'q', 'r', 's', 't', 'w', 'y', 'sh'];

const GRAMMAR_RULES = [
  {
    title: 'Sistema Trivocálico (a, i, u)',
    desc: 'El Quechua estándar oficial utiliza únicamente 3 vocales: A, I, U. Las letras "e" y "o" son alófonos que suenan al abrirse naturalmente cerca de la consonante posvelar "q".',
  },
  {
    title: 'Estructura SOV (Sujeto - Objeto - Verbo)',
    desc: 'A diferencia del español (SVO: "Juan come pan"), en Quechua el verbo siempre va al final de la oración: "Juan tantata mikun" (Juan pan come).',
  },
  {
    title: 'Idioma Aglutinante y Sufijante',
    desc: 'El Quechua no usa prefijos. Se añaden sufijos a una raíz para expresar posesión, tiempo, caso y persona. Ej: Wasi (casa) → Wasinchik (nuestra casa).',
  },
  {
    title: 'Sin Género Gramatical',
    desc: 'En Quechua no existe distinción de "el" o "la". Se usa "urqu" (macho) y "china" (hembra) solo cuando es necesario especificar sexo biológico.',
  },
];

export default function GuidebookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerBadge}>
            {id ? `GUÍA NIVEL ${id} • FONÉTICA & GRAMÁTICA` : 'GUÍA GRAMATICAL Y FONÉTICA'}
          </Text>
          <Text style={styles.title}>Achahala: El Alfabeto Quechua</Text>
          <Text style={styles.subtitle}>
            Aprende la pronunciación auténtica de los fonemas andinos y las reglas estructurales del Runasimi.
          </Text>
        </View>

        {/* Sección 1: Achahala Fonético */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔊 Fonemas y Articulación</Text>
        </View>

        <View style={styles.phonemesGrid}>
          {PHONEMES.map((ph) => {
            const guide = getQuechuaPhoneticGuide(ph);
            return (
              <Card key={ph} padding={12} style={styles.phonemeCard}>
                <View style={styles.phonemeTop}>
                  <Text style={styles.phonemeLetter}>{ph.toUpperCase()}</Text>
                  <Text style={styles.phonemeIpa}>{guide.ipa}</Text>
                  <AudioPronounceButton text={guide.audioText || ph} size="small" />
                </View>
                <Text style={styles.phonemeSpelling}>{guide.phoneticSpelling}</Text>
                <Text style={styles.phonemeTip}>{guide.articulatoryTip}</Text>
              </Card>
            );
          })}
        </View>

        {/* Sección 2: Reglas Gramaticales */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📜 Fundamentos Gramaticales</Text>
        </View>

        {GRAMMAR_RULES.map((rule, idx) => (
          <Card key={idx} padding={16} style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <View style={styles.ruleNumber}>
                <Text style={styles.ruleNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
            </View>
            <Text style={styles.ruleDesc}>{rule.desc}</Text>
          </Card>
        ))}

        <View style={styles.spacerBottom} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PARCHMENT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EAE3D6',
    marginBottom: 10,
  },
  backBtnText: {
    fontSize: 14,
    color: '#4A3E31',
    fontWeight: '600',
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: TEAL,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C2318',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B5E4F',
    lineHeight: 20,
  },
  sectionHeader: {
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2318',
  },
  phonemesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  phonemeCard: {
    width: '48%',
    marginBottom: 4,
  },
  phonemeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  phonemeLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: TEAL,
  },
  phonemeIpa: {
    fontSize: 12,
    color: GOLD,
    fontStyle: 'italic',
  },
  phonemeSpelling: {
    fontSize: 12,
    color: '#2C2318',
    fontWeight: '600',
    marginBottom: 4,
  },
  phonemeTip: {
    fontSize: 11,
    color: '#7D7060',
    lineHeight: 15,
  },
  ruleCard: {
    marginBottom: 12,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  ruleNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2318',
    flex: 1,
  },
  ruleDesc: {
    fontSize: 13,
    color: '#55493B',
    lineHeight: 19,
  },
  spacerBottom: {
    height: 40,
  },
});
