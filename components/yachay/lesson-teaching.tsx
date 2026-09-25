import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { playQuechuaAudio } from '@/src/services/voiceService';
import { playTapSound } from '@/src/services/soundService';
import { LessonVocabularyEntry } from '@/src/content/lessonContent';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#FFB300';
const MUTED = '#6B665E';

interface LessonTeachingProps {
  title: string;
  focus: string;
  vocabulary: LessonVocabularyEntry[];
  onComplete: () => void;
  onBack?: () => void;
}

export function LessonTeaching({
  title,
  focus,
  vocabulary,
  onComplete,
  onBack,
}: LessonTeachingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentEntry = vocabulary[stepIndex];
  const isLast = stepIndex >= vocabulary.length - 1;

  // Reproducir automáticamente el audio al cambiar de vocablo
  useEffect(() => {
    let active = true;
    if (currentEntry?.quechua) {
      playQuechuaAudio(currentEntry.quechua)
        .catch(() => {})
        .finally(() => {
          if (active) setIsPlaying(false);
        });
    }
    return () => {
      active = false;
    };
  }, [stepIndex, currentEntry]);

  function playNormal() {
    if (!currentEntry?.quechua || isPlaying) return;
    playTapSound();
    setIsPlaying(true);
    playQuechuaAudio(currentEntry.quechua)
      .catch(() => {})
      .finally(() => setIsPlaying(false));
  }

  function playSlow() {
    if (!currentEntry?.quechua || isPlaying) return;
    playTapSound();
    setIsPlaying(true);
    playQuechuaAudio(currentEntry.quechua, { slow: true })
      .catch(() => {})
      .finally(() => setIsPlaying(false));
  }

  function handleNext() {
    playTapSound();
    if (isLast) {
      onComplete();
    } else {
      setStepIndex((idx) => idx + 1);
    }
  }

  function handlePrev() {
    playTapSound();
    if (stepIndex > 0) {
      setStepIndex((idx) => idx - 1);
    }
  }

  if (!currentEntry) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Barra superior de progreso de enseñanza */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={stepIndex > 0 ? handlePrev : onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{stepIndex > 0 ? '← Anterior' : '✕ Salir'}</Text>
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Paso {stepIndex + 1} de {vocabulary.length}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado didáctico */}
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrowTag}>📖 FASE 1: ENSEÑANZA PREVIA</Text>
          <Text style={styles.lessonTitle}>{title}</Text>
          <Text style={styles.lessonFocus}>{focus}</Text>
        </View>

        {/* Tarjeta Principal de Vocabulario / Fonética */}
        <Animated.View
          key={`step-${stepIndex}`}
          entering={FadeInRight.duration(350)}
          style={styles.card}
        >
          {/* Palabra en Grande */}
          <View style={styles.wordHero}>
            <Text style={styles.quechuaText}>{currentEntry.quechua}</Text>
            <View style={styles.spanishBadge}>
              <Text style={styles.spanishBadgeText}>
                {currentEntry.spanish.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Botones de Audio: Normal y Lento (Tortuga) */}
          <View style={styles.audioControlsRow}>
            <TouchableOpacity
              style={[styles.audioBtn, isPlaying && styles.audioBtnPlaying]}
              onPress={playNormal}
              activeOpacity={0.82}
            >
              <Text style={styles.audioBtnIcon}>🔊</Text>
              <Text style={styles.audioBtnLabel}>Escuchar normal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.audioBtnSlow, isPlaying && styles.audioBtnPlaying]}
              onPress={playSlow}
              activeOpacity={0.82}
            >
              <Text style={styles.audioBtnIcon}>🐢</Text>
              <Text style={styles.audioBtnLabel}>Escuchar lento</Text>
            </TouchableOpacity>
          </View>

          {/* Guía Fonética y Articulatoria */}
          {currentEntry.note && (
            <View style={styles.infoBox}>
              <View style={styles.infoBoxHeader}>
                <Text style={styles.infoBoxIcon}>🗣️</Text>
                <Text style={styles.infoBoxTitle}>Cómo se pronuncia y articula:</Text>
              </View>
              <Text style={styles.infoBoxText}>{currentEntry.note}</Text>
            </View>
          )}

          {/* Ejemplo de uso en frase */}
          {currentEntry.usage && (
            <View style={styles.exampleBox}>
              <View style={styles.infoBoxHeader}>
                <Text style={styles.infoBoxIcon}>🏔️</Text>
                <Text style={styles.infoBoxTitle}>Ejemplo en frase o palabra:</Text>
              </View>
              <Text style={styles.exampleQuechua}>{currentEntry.usage}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Barra Inferior de Acción */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryButton, isLast && styles.finishButton]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>
            {isLast ? '¡Comenzar Práctica Guiada! ➔' : 'Siguiente Vocablo ➔'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E1D5',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '700',
  },
  stepBadge: {
    backgroundColor: '#E8DFD3',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: TEAL_DARK,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
  },
  headerBlock: {
    marginBottom: 16,
  },
  eyebrowTag: {
    fontSize: 11,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2A241E',
  },
  lessonFocus: {
    fontSize: 14,
    color: MUTED,
    marginTop: 3,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 2,
    borderColor: '#E7DFD3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: 16,
  },
  wordHero: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0EBE1',
  },
  quechuaText: {
    fontSize: 42,
    fontWeight: '900',
    color: TEAL_DARK,
    letterSpacing: -0.5,
  },
  spanishBadge: {
    backgroundColor: '#FEF9E7',
    borderWidth: 1.5,
    borderColor: '#F9E79F',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  spanishBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B7791F',
    letterSpacing: 0.5,
  },
  audioControlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  audioBtn: {
    flex: 1,
    backgroundColor: '#E8F5F5',
    borderWidth: 1.5,
    borderColor: '#BFE5E5',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  audioBtnSlow: {
    flex: 1,
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: '#FCE7A6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  audioBtnPlaying: {
    opacity: 0.6,
  },
  audioBtnIcon: {
    fontSize: 18,
  },
  audioBtnLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2B29',
  },
  infoBox: {
    backgroundColor: '#F8F6F0',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: TEAL,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoBoxIcon: {
    fontSize: 16,
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TEAL_DARK,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#4A463F',
    lineHeight: 20,
  },
  exampleBox: {
    backgroundColor: '#FDFBF7',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
  },
  exampleQuechua: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2B29',
    fontStyle: 'italic',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E1D5',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  finishButton: {
    backgroundColor: GOLD,
    shadowColor: GOLD,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
