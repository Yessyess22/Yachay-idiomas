import React, { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';

import { Illustrations } from '@/constants/illustrations';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { AudioPronounceButton } from '@/components/yachay/audio-pronounce-button';
import { Language } from '@/src/types';
import {
  speakText,
  startVoiceRecognition,
  translateText,
} from '@/src/services/voiceService';
import { useYachiBounce } from '@/hooks/use-yachi-bounce';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const TEAL_LIGHT = '#E8F8F0';
const GOLD = '#FFB300';
const GOLD_LIGHT = '#FFF8E1';
const GOLD_DARK = '#C67C00';
const CREAM = '#FAF7F2';
const CARD_BG = '#FFFFFF';
const BORDER = '#E2E8F0';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';

const QUICK_PHRASES = [
  { qu: 'Allillanchu?', es: '¿Cómo estás?' },
  { qu: "Allin p'unchaw", es: 'Buenos días' },
  { qu: 'Añay', es: 'Muchas gracias' },
  { qu: 'Tupananchiskama', es: 'Hasta volver a vernos' },
  { qu: 'Munakuyki', es: 'Te quiero' },
  { qu: 'Ama suwa, ama llulla, ama qilla', es: 'No robes, no mientas, no seas ocioso' },
];

export default function TranslatorTabScreen() {
  const params = useLocalSearchParams<{ text?: string; lang?: string }>();

  const [sourceLang, setSourceLang] = useState<Language>(
    params.lang === 'qu' || params.lang === 'es' ? params.lang : 'es'
  );
  const [sourceText, setSourceText] = useState(params.text || '');
  const [prevParamText, setPrevParamText] = useState(params.text);
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');

  // Ajuste en render si cambian los parámetros de ruta (deep-linking desde Biblioteca)
  if (params.text && params.text !== prevParamText) {
    setPrevParamText(params.text);
    setSourceText(params.text);
    if (params.lang === 'qu' || params.lang === 'es') {
      setSourceLang(params.lang as Language);
    }
  }

  const targetLang: Language = sourceLang === 'es' ? 'qu' : 'es';
  const { style: yachiStyle, bounce: bounceYachi } = useYachiBounce();

  function swapLanguages() {
    setSourceLang(targetLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setError('');
  }

  async function handleTranslate(textToTranslate?: string) {
    const text = (textToTranslate ?? sourceText).trim();
    if (!text) return;
    setLoading(true);
    setError('');
    const { translatedText: result, error: err } = await translateText({
      source_lang: sourceLang,
      target_lang: targetLang,
      source_text: text,
    });
    if (err) {
      setError(err);
    } else {
      setTranslatedText(result);
      bounceYachi();
    }
    setLoading(false);
  }

  async function handleVoiceInput() {
    setError('');
    setRecording(true);
    try {
      const { transcript } = await startVoiceRecognition(sourceLang);
      setSourceText(transcript);
      setRecording(false);
      // Traducción automática tras el reconocimiento de voz
      handleTranslate(transcript);
    } catch (e) {
      setRecording(false);
      setError(e instanceof Error ? e.message : 'Error en el reconocimiento de voz');
    }
  }

  function handleQuickPhrase(phrase: { qu: string; es: string }) {
    if (sourceLang === 'qu') {
      setSourceText(phrase.qu);
      handleTranslate(phrase.qu);
    } else {
      setSourceText(phrase.es);
      handleTranslate(phrase.es);
    }
  }

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Hero: Traductor Yachay (Mismo diseño de La Biblioteca Andina e Inicio) */}
        <View style={styles.heroBannerWrap}>
          <ImageBackground
            source={require('@/assets/images/cards/tarjeta_montana.png')}
            style={styles.heroBannerBg}
            imageStyle={styles.heroBannerImg}
          >
            <View style={styles.heroBannerOverlay}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>SIMI T&apos;IKRAQ • DICCIONARIO DE BOLSILLO</Text>
                </View>
                <Text style={styles.heroSymbol}>❖ 🗣️ ❖</Text>
              </View>

              <View style={styles.heroContentRow}>
                <View style={styles.heroTitlesWrap}>
                  <Text style={styles.heroTitle}>Traductor Yachay</Text>
                  <Text style={styles.heroSubtitle}>
                    Traduce al instante entre Español y Quechua con pronunciación fonética nativa asistida por IA.
                  </Text>
                </View>

                <Animated.View style={[styles.llamaWrap, yachiStyle]}>
                  <Image
                    source={Illustrations.llamaSaludando}
                    style={styles.llamaImage}
                    contentFit="contain"
                  />
                </Animated.View>
              </View>

              <View style={styles.textileRibbon}>
                <Text style={styles.textileRibbonText}>▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Selector de Idiomas */}
        <View style={styles.langSelectorRow}>
          <TouchableOpacity
            style={[styles.langChip, sourceLang === 'es' && styles.langChipActive]}
            onPress={() => {
              if (sourceLang !== 'es') swapLanguages();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.langFlag}>🇧🇴</Text>
            <Text style={[styles.langText, sourceLang === 'es' && styles.langTextActive]}>
              Español
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.swapButton}
            onPress={swapLanguages}
            activeOpacity={0.7}
            accessibilityLabel="Invertir idiomas"
          >
            <Text style={styles.swapButtonText}>⇌</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langChip, sourceLang === 'qu' && styles.langChipActive]}
            onPress={() => {
              if (sourceLang !== 'qu') swapLanguages();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.langFlag}>🏔️</Text>
            <Text style={[styles.langText, sourceLang === 'qu' && styles.langTextActive]}>
              Quechua
            </Text>
          </TouchableOpacity>
        </View>

        {/* Caja de Entrada de Texto */}
        <View style={styles.cardInput}>
          <View style={styles.cardInputHeader}>
            <Text style={styles.cardInputLangLabel}>
              {sourceLang === 'es' ? 'Texto en Español' : 'Texto en Quechua'}
            </Text>
            {sourceText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSourceText('');
                  setTranslatedText('');
                  setError('');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearBtnText}>Borrar</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.textInput}
            multiline
            placeholder={
              sourceLang === 'es'
                ? 'Escribe una palabra o frase en español...'
                : 'Qillqay ima rimaytapas runasimipi...'
            }
            placeholderTextColor="#9B8B7A"
            value={sourceText}
            onChangeText={setSourceText}
            textAlignVertical="top"
          />

          <View style={styles.inputActionsRow}>
            {/* Botón de Voz / Micrófono */}
            <TouchableOpacity
              style={[styles.voiceBtn, recording && styles.voiceBtnRecording]}
              onPress={handleVoiceInput}
              disabled={recording || loading}
              activeOpacity={0.8}
            >
              <Text style={styles.voiceBtnText}>
                {recording ? '🔴 Escuchando...' : '🎙️ Dictar por voz'}
              </Text>
            </TouchableOpacity>

            {/* Botón Traducir */}
            <TouchableOpacity
              style={[
                styles.translateActionBtn,
                (!sourceText.trim() || loading) && styles.translateActionBtnDisabled,
              ]}
              onPress={() => handleTranslate()}
              disabled={!sourceText.trim() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.translateActionBtnText}>Traducir ⚡</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Mensaje de Error si ocurre */}
        {error.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Tarjeta de Traducción Resultante */}
        {translatedText.length > 0 && (
          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <View style={styles.resultHeaderLeft}>
                <Text style={styles.resultBadgeTag}>
                  {targetLang === 'qu' ? 'TRADUCCIÓN AL QUECHUA' : 'TRADUCCIÓN AL ESPAÑOL'}
                </Text>
                <Text style={styles.resultLangText}>
                  {targetLang === 'qu' ? '🏔️ Runasimi' : '🇧🇴 Castellano'}
                </Text>
              </View>
              <View style={styles.resultActions}>
                {targetLang === 'qu' ? (
                  <AudioPronounceButton text={translatedText} size="small" />
                ) : (
                  <TouchableOpacity
                    style={styles.speakButton}
                    onPress={() => speakText(translatedText, 'es')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.speakButtonText}>🔊</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={styles.resultText}>{translatedText}</Text>

            <View style={styles.resultTipBox}>
              <Text style={styles.resultTipText}>
                💡 Puedes tocar el altavoz para escuchar la dicción fonética auténtica.
              </Text>
            </View>
          </View>
        )}

        {/* Frases Rápidas Sugeridas */}
        <View style={styles.quickSection}>
          <Text style={styles.quickSectionTitle}>💬 Expresiones Andinas Frecuentes</Text>
          <Text style={styles.quickSectionSub}>
            Toca cualquiera de estas frases para escucharla y traducirla:
          </Text>
          <View style={styles.quickPillsWrap}>
            {QUICK_PHRASES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickPill}
                onPress={() => handleQuickPhrase(item)}
                activeOpacity={0.75}
              >
                <Text style={styles.quickPillQuechua}>{item.qu}</Text>
                <Text style={styles.quickPillSpanish}>({item.es})</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consejo Cultural */}
        <View style={styles.cultureNoteCard}>
          <Text style={styles.cultureNoteIcon}>🌿</Text>
          <View style={styles.cultureNoteBody}>
            <Text style={styles.cultureNoteTitle}>¿Sabías qué?</Text>
            <Text style={styles.cultureNoteDesc}>
              El quechua es un idioma aglutinante: añade sufijos a la raíz para expresar cortesía, certeza o lugar.
              Por eso una sola palabra puede equivaler a una oración entera en español.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* Hero Banner */
  heroBannerWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  heroBannerBg: {
    width: '100%',
  },
  heroBannerImg: {
    borderRadius: 20,
  },
  heroBannerOverlay: {
    backgroundColor: 'rgba(14, 77, 85, 0.88)',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroBadge: {
    backgroundColor: 'rgba(212, 139, 10, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE29A',
    letterSpacing: 0.8,
  },
  heroSymbol: {
    color: '#FFE29A',
    fontSize: 14,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitlesWrap: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#E0F2F1',
    lineHeight: 18,
    marginBottom: 10,
  },
  llamaWrap: {
    width: 68,
    height: 72,
  },
  llamaImage: {
    width: '100%',
    height: '100%',
  },
  textileRibbon: {
    marginTop: 4,
    alignItems: 'center',
  },
  textileRibbonText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },

  /* Selector de Idiomas */
  langSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 6,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginBottom: 14,
  },
  langChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  langChipActive: {
    backgroundColor: TEAL_LIGHT,
    borderWidth: 1,
    borderColor: '#BFE7DF',
  },
  langFlag: {
    fontSize: 16,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  langTextActive: {
    color: TEAL_DARK,
    fontWeight: '900',
  },
  swapButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 4,
  },
  swapButtonText: {
    fontSize: 18,
    color: TEAL,
    fontWeight: '900',
  },

  /* Caja de Entrada */
  cardInput: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 14,
  },
  cardInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInputLangLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: TEAL,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearBtnText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  textInput: {
    minHeight: 90,
    fontSize: 16,
    color: TEXT_DARK,
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 8,
  },
  inputActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  voiceBtnRecording: {
    backgroundColor: '#FEE2E2',
  },
  voiceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  translateActionBtn: {
    backgroundColor: TEAL,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  translateActionBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  translateActionBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* Error */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorEmoji: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
  },

  /* Resultado */
  resultCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 16,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  resultHeaderLeft: {
    flex: 1,
  },
  resultBadgeTag: {
    fontSize: 10,
    fontWeight: '900',
    color: GOLD_DARK,
    letterSpacing: 0.8,
  },
  resultLangText: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
    marginTop: 2,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TEAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakButtonText: {
    fontSize: 16,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '900',
    color: TEXT_DARK,
    lineHeight: 28,
    marginBottom: 12,
  },
  resultTipBox: {
    backgroundColor: GOLD_LIGHT,
    borderRadius: 10,
    padding: 8,
  },
  resultTipText: {
    fontSize: 11,
    color: GOLD_DARK,
    fontWeight: '700',
  },

  /* Frases Rápidas */
  quickSection: {
    marginBottom: 16,
  },
  quickSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  quickSectionSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 10,
  },
  quickPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  quickPillQuechua: {
    fontSize: 13,
    fontWeight: '800',
    color: TEAL_DARK,
  },
  quickPillSpanish: {
    fontSize: 11,
    color: TEXT_MUTED,
  },

  /* Nota Cultural */
  cultureNoteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'flex-start',
    gap: 10,
  },
  cultureNoteIcon: {
    fontSize: 22,
  },
  cultureNoteBody: {
    flex: 1,
  },
  cultureNoteTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: TEAL_DARK,
    marginBottom: 2,
  },
  cultureNoteDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
});
