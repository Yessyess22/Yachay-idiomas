import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Illustrations } from '@/constants/illustrations';
import { AudioPronounceButton } from '@/components/yachay/audio-pronounce-button';
import { SparkleBurst } from '@/components/yachay/sparkle-burst';
import { playQuechuaAudio } from '@/src/services/voiceService';
import { playCorrectSound, playIncorrectSound, playTapSound } from '@/src/services/soundService';
import { STORIES } from '@/src/content/stories';
import { useYachiBounce } from '@/hooks/use-yachi-bounce';

const TEAL = '#1B8B8C';
const CREAM = '#FAF7F2';
const GREEN = '#27AE60';
const GREEN_DARK = '#1E8449';
const RED = '#EA5455';

/**
 * Modo Historia: diálogo interactivo corto con Yachi. No usa GameContext —
 * es solo práctica narrativa, no afecta vidas ni progreso de lecciones.
 */
export default function StoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const story = STORIES[slug as string];
  const router = useRouter();

  const [turnIndex, setTurnIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const { style: yachiAnimStyle, bounce: bounceYachi, celebrate: celebrateYachi } = useYachiBounce();

  const turn = story?.turns[turnIndex];

  useEffect(() => {
    if (turn?.speaker === 'yachi') {
      playQuechuaAudio(turn.quechua).catch(() => {});
    }
  }, [turnIndex]);

  if (!story) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Esta historia todavía no está disponible.</Text>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function goNext() {
    setSelectedIdx(null);
    setIsAnswered(false);
    if (turnIndex + 1 < story!.turns.length) {
      setTurnIndex((i) => i + 1);
    } else {
      setFinished(true);
      celebrateYachi();
      setSparkleKey((k) => k + 1);
    }
  }

  function handleSelectOption(idx: number, correct: boolean) {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    playTapSound();
    if (correct) {
      celebrateYachi();
      setSparkleKey((k) => k + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playCorrectSound();
    } else {
      bounceYachi();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      playIncorrectSound();
    }
  }

  if (finished) {
    return (
      <View style={styles.centered}>
        <View style={styles.finishLlamaWrap}>
          <SparkleBurst key={sparkleKey} />
          <Animated.View style={yachiAnimStyle}>
            <Image source={Illustrations.llamaSigueAsi} style={styles.finishLlama} contentFit="contain" />
          </Animated.View>
        </View>
        <Text style={styles.finishTitle}>¡Historia completada! 🎉</Text>
        <Text style={styles.finishSub}>Practicaste un saludo completo en Quechua.</Text>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Volver →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.storyTitle}>{story.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {turn?.speaker === 'yachi' && (
          <View style={styles.yachiRow}>
            <Animated.View style={yachiAnimStyle}>
              <Image source={Illustrations.avatarLlama} style={styles.avatar} contentFit="contain" />
            </Animated.View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleQuechua}>{turn.quechua}</Text>
              <Text style={styles.bubbleSpanish}>{turn.spanish}</Text>
              <AudioPronounceButton text={turn.quechua} size="small" showLabel />
            </View>
          </View>
        )}

        {turn?.speaker === 'user' && (
          <View style={styles.userTurn}>
            <Text style={styles.userPrompt}>{turn.prompt}</Text>
            {turn.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              const showCorrect = isAnswered && opt.correct;
              const showWrong = isAnswered && isSelected && !opt.correct;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionBase,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                  ]}
                  onPress={() => handleSelectOption(idx, opt.correct)}
                  disabled={isAnswered}
                  activeOpacity={0.85}
                >
                  <Text style={styles.optionText}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.buttonPrimary, turn?.speaker === 'user' && !isAnswered && styles.buttonDisabled]}
          onPress={goNext}
          disabled={turn?.speaker === 'user' && !isAnswered}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM, paddingTop: 46 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: CREAM,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 22, color: '#7A6A5A', fontWeight: '900' },
  storyTitle: { fontSize: 16, fontWeight: '900', color: '#2A1A0A' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  yachiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: { width: 56, height: 56 },
  bubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    gap: 8,
  },
  bubbleQuechua: { fontSize: 20, fontWeight: '900', color: TEAL },
  bubbleSpanish: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
  userTurn: { gap: 12 },
  userPrompt: { fontSize: 16, fontWeight: '800', color: '#2A1A0A', marginBottom: 4 },
  optionBase: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 4,
  },
  optionCorrect: { borderColor: GREEN, backgroundColor: '#E8F8F0', borderBottomColor: GREEN_DARK },
  optionWrong: { borderColor: RED, backgroundColor: '#FDEDEC' },
  optionText: { fontSize: 16, fontWeight: '700', color: '#2A1A0A' },
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
  },
  buttonPrimary: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: GREEN_DARK,
  },
  buttonDisabled: { backgroundColor: '#D8D8D8', borderBottomColor: '#B0B0B0' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  finishLlamaWrap: { marginBottom: 16 },
  finishLlama: { width: 140, height: 145 },
  finishTitle: { fontSize: 24, fontWeight: '900', color: '#2A1A0A', marginBottom: 8, textAlign: 'center' },
  finishSub: { fontSize: 15, color: '#7A6A5A', marginBottom: 24, textAlign: 'center' },
  errorText: { color: RED, fontSize: 16, textAlign: 'center', marginBottom: 20, fontWeight: '700' },
});
