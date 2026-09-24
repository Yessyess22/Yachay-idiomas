import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AudioPronounceButton } from '../audio-pronounce-button';
import { extractCorePhoneme, getQuechuaPhoneticGuide } from '@/src/utils/phoneticGuide';
import {
  evaluatePronunciation,
  PronunciationScore,
  startVoiceRecognition,
} from '@/src/services/voiceService';

interface PronunciationExerciseProps {
  expectedText: string;
  translation?: string;
  /** Cuando es true, expectedText es una frase completa: no se trunca con extractCorePhoneme. */
  isPhrase?: boolean;
  onSuccess: (score: number) => void;
  onFail?: () => void;
}

const TEAL = '#1B8B8C';
const GREEN = '#1B8B8C';
const RED = '#EA5455';
const GOLD = '#E5A00D';

type Phase = 'idle' | 'recording' | 'evaluating' | 'result' | 'done';

/**
 * Ejercicio de pronunciación con captura e interactividad en tiempo real vía micrófono.
 * El estudiante escucha el audio de referencia, graba su voz con el botón de micrófono,
 * la app evalúa la coincidencia fonética y valida la respuesta automáticamente.
 */
export function PronunciationExercise({
  expectedText,
  translation,
  isPhrase = false,
  onSuccess,
  onFail,
}: PronunciationExerciseProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  const coreWord = isPhrase ? expectedText.trim() : extractCorePhoneme(expectedText);
  const phonetic = getQuechuaPhoneticGuide(coreWord);

  async function handleStartRecording() {
    setError(null);
    setPhase('recording');
    setResult(null);

    try {
      // Iniciar reconocimiento de voz (usando el canal de voz adaptado para fonemas/palabras/frases)
      const recResult = await startVoiceRecognition('qu', coreWord, { isPhrase });
      setPhase('evaluating');

      if (!recResult.transcript) {
        setError('No logramos escuchar tu voz con claridad. Presiona el micrófono para intentar de nuevo.');
        setPhase('result');
        setAttempts((a) => a + 1);
        return;
      }

      // Evaluar coincidencia fonética
      const evalRes = evaluatePronunciation(recResult.transcript, coreWord, { isPhrase });
      setResult(evalRes);

      if (evalRes.isPass || evalRes.score >= 60) {
        setPhase('done');
        onSuccess(evalRes.score);
      } else {
        setPhase('result');
        setAttempts((a) => a + 1);
      }
    } catch (e) {
      setPhase('result');
      setAttempts((a) => a + 1);
      setError(
        e instanceof Error
          ? e.message
          : 'Ocurrió un inconveniente al activar el micrófono. Puedes continuar o intentar nuevamente.'
      );
    }
  }

  function handleSkip() {
    setPhase('done');
    onSuccess(70);
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
        {translation && <Text style={styles.translationWord}>&quot;{translation}&quot;</Text>}

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

      {/* Fase 1: Reposo / Instrucciones para grabar */}
      {phase === 'idle' && (
        <View style={styles.actionSection}>
          <Text style={styles.instructionsText}>
            🎧 Escucha el audio, luego toca el micrófono y di {isPhrase ? 'la frase' : 'la palabra'} en voz alta.
          </Text>
          <TouchableOpacity
            style={styles.micBtn}
            onPress={handleStartRecording}
            activeOpacity={0.85}
          >
            <Text style={styles.micIcon}>🎙️</Text>
            <Text style={styles.micBtnText}>Toca para hablar y evaluar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Fase 2: Grabando audio */}
      {phase === 'recording' && (
        <View style={styles.actionSection}>
          <Text style={styles.instructionsText}>
            🔴 Habla ahora: pronuncia <Text style={styles.highlightWord}>&quot;{coreWord}&quot;</Text>...
          </Text>
          <View style={[styles.micBtn, styles.micBtnRecording]}>
            <ActivityIndicator color="#FFFFFF" size="small" style={styles.spinner} />
            <Text style={styles.micBtnText}>⏹ Escuchando tu voz...</Text>
          </View>
        </View>
      )}

      {/* Fase 3: Evaluando la voz */}
      {phase === 'evaluating' && (
        <View style={styles.actionSection}>
          <Text style={styles.instructionsText}>Procesando tu voz...</Text>
          <View style={[styles.micBtn, styles.micBtnEvaluating]}>
            <ActivityIndicator color="#FFFFFF" size="small" style={styles.spinner} />
            <Text style={styles.micBtnText}>🔍 Analizando pronunciación...</Text>
          </View>
        </View>
      )}

      {/* Fase 4: Resultado no satisfactorio / Error -> Permitir reintento o continuar */}
      {phase === 'result' && (
        <View style={styles.actionSection}>
          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : result ? (
            <View style={styles.resultCardFail}>
              <Text style={styles.resultTitleFail}>
                {result.cleanedSpoken
                  ? `Escuchamos: "${result.cleanedSpoken}"`
                  : 'Pronunciación no detectada'}
              </Text>
              <Text style={styles.resultFeedbackText}>{result.feedback}</Text>
            </View>
          ) : null}

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.micBtn, styles.retryBtn]}
              onPress={handleStartRecording}
              activeOpacity={0.85}
            >
              <Text style={styles.micIcon}>🎙️</Text>
              <Text style={styles.micBtnText}>Volver a intentar</Text>
            </TouchableOpacity>

            {(attempts >= 1 || Boolean(error)) && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={handleSkip}
                activeOpacity={0.85}
              >
                <Text style={styles.skipBtnText}>⏭️ Continuar de todos modos</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Fase 5: Completado con éxito */}
      {phase === 'done' && (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>¡Allinmi! 🌟 ({result?.score ?? 100}%)</Text>
          <Text style={styles.doneText}>
            {result?.cleanedSpoken ? `Escuchamos "${result.cleanedSpoken}". ` : ''}
            {result?.feedback || `¡Excelente pronunciación de "${coreWord}"!`}
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
    color: TEAL,
    lineHeight: 22,
    marginBottom: 2,
  },
  listenRow: {
    marginTop: 6,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
  highlightWord: {
    fontWeight: '800',
    color: TEAL,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: TEAL,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    minWidth: 240,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  micBtnRecording: {
    backgroundColor: RED,
    shadowColor: RED,
  },
  micBtnEvaluating: {
    backgroundColor: GOLD,
    shadowColor: GOLD,
  },
  retryBtn: {
    backgroundColor: TEAL,
  },
  micIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  micBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  spinner: {
    marginRight: 4,
  },
  buttonsRow: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  resultCardFail: {
    width: '100%',
    backgroundColor: '#FDF2F2',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: RED,
  },
  resultTitleFail: {
    fontSize: 15,
    fontWeight: '800',
    color: RED,
    marginBottom: 4,
  },
  resultFeedbackText: {
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },
  errorText: {
    fontSize: 13,
    color: '#8A6D3B',
    textAlign: 'center',
    lineHeight: 18,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
  },
  doneCard: {
    width: '100%',
    backgroundColor: '#E0F2F1',
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
