import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AudioPronounceButton } from '../audio-pronounce-button';
import { extractCorePhoneme, getQuechuaPhoneticGuide } from '@/src/utils/phoneticGuide';

interface PronunciationExerciseProps {
  expectedText: string;
  translation?: string;
  onSuccess: (score: number) => void;
  onFail?: () => void;
}

const TEAL = '#1B8B8C';
const GREEN = '#27AE60';
const RED = '#EA5455';
const GOLD = '#E5A00D';

/**
 * Ejercicio de pronunciación basado en auto-evaluación del estudiante.
 * El usuario escucha el audio auténtico, practica en voz alta, y reporta
 * si lo logró o no. Este flujo es confiable en todos los navegadores.
 */
export function PronunciationExercise({
  expectedText,
  translation,
  onSuccess,
  onFail,
}: PronunciationExerciseProps) {
  const [phase, setPhase] = useState<'practice' | 'selfeval' | 'done'>('practice');
  const [attempts, setAttempts] = useState(0);

  const coreWord = extractCorePhoneme(expectedText);
  const phonetic = getQuechuaPhoneticGuide(coreWord);

  function handleYes() {
    setPhase('done');
    onSuccess(100);
  }

  function handleNo() {
    setAttempts((a) => a + 1);
    if (attempts >= 1) {
      // Después de 2 intentos fallidos, validar para no bloquear al usuario
      setPhase('done');
      onSuccess(70);
    } else {
      setPhase('practice');
    }
    onFail?.();
  }

  return (
    <View style={styles.container}>
      {/* Tarjeta de la palabra con Guía Fonética */}
      <View style={styles.card}>
        <Text style={styles.label}>Practica en voz alta:</Text>
        <View style={styles.wordBadgeRow}>
          <Text style={styles.quechuaWord}>{coreWord}</Text>
          <View style={styles.ipaBadge}>
            <Text style={styles.ipaText}>{phonetic.ipa}</Text>
          </View>
        </View>
        {translation && <Text style={styles.translationWord}>"{translation}"</Text>}

        <View style={styles.articulatoryBox}>
          <View style={styles.articulatoryHeader}>
            <Text style={styles.articulatoryIcon}>👄</Text>
            <Text style={styles.articulatoryTitle}>Cómo pronunciar</Text>
          </View>
          <Text style={styles.phoneticSpelling}>{phonetic.phoneticSpelling}</Text>
          {phonetic.articulatoryTip && phonetic.articulatoryTip !== phonetic.phoneticSpelling && (
            <Text style={styles.articulatoryTip}>{phonetic.articulatoryTip}</Text>
          )}
        </View>

        {/* Botón para escuchar la pronunciación auténtica */}
        <View style={styles.listenRow}>
          <AudioPronounceButton text={coreWord} size="large" showLabel />
        </View>
      </View>

      {/* Fase práctica */}
      {phase === 'practice' && (
        <View style={styles.practiceSection}>
          <Text style={styles.practiceInstructions}>
            🎧 Escucha el audio, luego di la palabra en voz alta.
            {attempts > 0 ? '\n¡Inténtalo una vez más!' : ''}
          </Text>
          <TouchableOpacity
            style={styles.triedBtn}
            onPress={() => setPhase('selfeval')}
            activeOpacity={0.85}
          >
            <Text style={styles.triedBtnText}>🎙️ Ya lo intenté →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Fase de autoevaluación */}
      {phase === 'selfeval' && (
        <View style={styles.selfevalSection}>
          <Text style={styles.selfevalQuestion}>
            ¿Pudiste pronunciar "{coreWord}" correctamente?
          </Text>
          <View style={styles.selfevalButtons}>
            <TouchableOpacity
              style={[styles.selfevalBtn, styles.selfevalYes]}
              onPress={handleYes}
              activeOpacity={0.85}
            >
              <Text style={styles.selfevalBtnText}>✅ ¡Sí lo dije!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selfevalBtn, styles.selfevalNo]}
              onPress={handleNo}
              activeOpacity={0.85}
            >
              <Text style={styles.selfevalBtnText}>
                {attempts >= 1 ? '⏭️ Continuar' : '🔄 Practicar más'}
              </Text>
            </TouchableOpacity>
          </View>
          {attempts >= 1 && (
            <Text style={styles.skipHint}>
              Puedes continuar y practicar más adelante.
            </Text>
          )}
        </View>
      )}

      {/* Fase completada */}
      {phase === 'done' && (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>¡Allinmi! 🌟</Text>
          <Text style={styles.doneText}>
            Pronunciación de "{coreWord}" registrada.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8D7B68',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  wordBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  quechuaWord: {
    fontSize: 28,
    fontWeight: '900',
    color: TEAL,
  },
  ipaBadge: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  ipaText: {
    fontSize: 14,
    fontWeight: '800',
    color: TEAL,
  },
  translationWord: {
    fontSize: 16,
    color: '#555555',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  articulatoryBox: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8DFD5',
    marginVertical: 10,
  },
  articulatoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  articulatoryIcon: {
    fontSize: 16,
  },
  articulatoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6A5545',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articulatoryTip: {
    fontSize: 13,
    color: '#4A3B32',
    lineHeight: 18,
    marginTop: 4,
  },
  phoneticSpelling: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B8B8C',
    lineHeight: 22,
    marginBottom: 2,
  },
  articulatoryExample: {
    fontSize: 12,
    color: '#6A5545',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EFEAE3',
  },
  listenRow: {
    marginTop: 6,
  },
  practiceSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  practiceInstructions: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
  triedBtn: {
    backgroundColor: TEAL,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  triedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  selfevalSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  selfevalQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },
  selfevalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  selfevalBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 180,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  selfevalYes: {
    backgroundColor: GREEN,
    shadowColor: GREEN,
    borderBottomWidth: 3,
    borderBottomColor: '#1E8449',
  },
  selfevalNo: {
    backgroundColor: GOLD,
    shadowColor: GOLD,
    borderBottomWidth: 3,
    borderBottomColor: '#B7860A',
  },
  selfevalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  skipHint: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  doneCard: {
    width: '100%',
    backgroundColor: '#E8F8F0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GREEN,
    marginTop: 8,
  },
  doneTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: GREEN,
    marginBottom: 4,
  },
  doneText: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
  },
});
