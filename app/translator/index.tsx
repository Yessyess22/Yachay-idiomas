import { Illustrations } from '@/constants/illustrations';
import { BrandColors } from '@/src/constants/theme';
import { Language } from '@/src/types';
import {
  speakText,
  startVoiceRecognition,
  translateText,
} from '@/src/services/voiceService';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

type Mode = 'text' | 'voice';

export default function TranslatorScreen() {
  const router = useRouter();

  const [sourceLang, setSourceLang] = useState<Language>('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [mode, setMode] = useState<Mode>('text');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');

  const targetLang: Language = sourceLang === 'es' ? 'qu' : 'es';

  const yachiScale = useSharedValue(1);
  const yachiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: yachiScale.value }],
  }));

  function bounceYachi() {
    yachiScale.value = withSequence(
      withSpring(1.2, { damping: 4, stiffness: 280 }),
      withSpring(1, { damping: 6, stiffness: 180 })
    );
  }

  function swapLanguages() {
    setSourceLang(targetLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  }

  async function handleTranslate() {
    if (!sourceText.trim()) return;
    setLoading(true);
    setError('');
    const { translatedText: result, error: err } = await translateText({
      source_lang: sourceLang,
      target_lang: targetLang,
      source_text: sourceText.trim(),
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
    if (Platform.OS !== 'web') {
      setError('El reconocimiento de voz solo está disponible en la versión web.');
      return;
    }
    setError('');
    setRecording(true);
    try {
      const { transcript } = await startVoiceRecognition(sourceLang);
      setSourceText(transcript);
      setRecording(false);
      // Auto-traducir tras reconocer voz
      setLoading(true);
      const { translatedText: result, error: err } = await translateText({
        source_lang: sourceLang,
        target_lang: targetLang,
        source_text: transcript,
      });
      if (err) setError(err);
      else {
        setTranslatedText(result);
        bounceYachi();
      }
      setLoading(false);
    } catch (e) {
      setRecording(false);
      setError(e instanceof Error ? e.message : 'Error de voz');
    }
  }

  function handleSpeak(text: string, lang: Language) {
    speakText(text, lang);
  }

  const LANG_LABELS: Record<Language, string> = {
    es: 'Español',
    qu: 'Quechua',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Traductor Yachay</Text>
        <Animated.View style={yachiStyle}>
          <Image source={Illustrations.avatarLlama} style={styles.headerYachi} contentFit="contain" />
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Selector de idioma */}
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langBtn, sourceLang === 'es' && styles.langBtnActive]}
            onPress={() => { setSourceLang('es'); setTranslatedText(''); }}
          >
            <Text style={[styles.langBtnText, sourceLang === 'es' && styles.langBtnTextActive]}>
              🇧🇴 Español
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.swapBtn} onPress={swapLanguages}>
            <Text style={styles.swapBtnText}>⇌</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, sourceLang === 'qu' && styles.langBtnActive]}
            onPress={() => { setSourceLang('qu'); setTranslatedText(''); }}
          >
            <Text style={[styles.langBtnText, sourceLang === 'qu' && styles.langBtnTextActive]}>
              🏔️ Quechua
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modo */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}
            onPress={() => setMode('text')}
          >
            <Text style={styles.modeBtnText}>✏️ Texto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'voice' && styles.modeBtnActive]}
            onPress={() => setMode('voice')}
          >
            <Text style={styles.modeBtnText}>🎙️ Voz</Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{LANG_LABELS[sourceLang]}</Text>
          {mode === 'text' ? (
            <TextInput
              style={styles.input}
              placeholder={`Escribe en ${LANG_LABELS[sourceLang]}…`}
              placeholderTextColor="#bbb"
              value={sourceText}
              onChangeText={setSourceText}
              multiline
              numberOfLines={4}
            />
          ) : (
            <TouchableOpacity
              style={[styles.micBtn, recording && styles.micBtnRecording]}
              onPress={handleVoiceInput}
              disabled={recording || loading}
            >
              <Text style={styles.micIcon}>{recording ? '⏹' : '🎙️'}</Text>
              <Text style={styles.micText}>
                {recording ? 'Escuchando…' : 'Toca para hablar'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.speakSmall}
            onPress={() => handleSpeak(sourceText, sourceLang)}
            disabled={!sourceText}
          >
            <Text style={styles.speakSmallText}>🔊</Text>
          </TouchableOpacity>
        </View>

        {/* Botón traducir (solo modo texto) */}
        {mode === 'text' && (
          <TouchableOpacity
            style={[styles.translateBtn, (!sourceText.trim() || loading) && styles.translateBtnDisabled]}
            onPress={handleTranslate}
            disabled={!sourceText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.translateBtnText}>Traducir →</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Resultado */}
        {(translatedText || loading) && (
          <View style={[styles.card, styles.resultCard]}>
            <Text style={styles.cardLabel}>{LANG_LABELS[targetLang]}</Text>
            {loading ? (
              <ActivityIndicator color={BrandColors.brandGreen} style={{ marginVertical: 16 }} />
            ) : (
              <>
                <Text style={styles.resultText}>{translatedText}</Text>
                <TouchableOpacity
                  style={styles.speakSmall}
                  onPress={() => handleSpeak(translatedText, targetLang)}
                >
                  <Text style={styles.speakSmallText}>🔊 Escuchar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.bgLight, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: BrandColors.brandDarkGreen,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerYachi: { width: 44, height: 44 },
  content: { padding: 20, gap: 16 },

  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    gap: 8,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  langBtnActive: { backgroundColor: BrandColors.brandGreen },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },
  langBtnTextActive: { color: '#fff' },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.brandNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  modeBtnActive: { backgroundColor: BrandColors.accentOrange },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  resultCard: {
    borderColor: BrandColors.brandGreen + '60',
    backgroundColor: '#F1F8E9',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.brandNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  micBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    gap: 8,
  },
  micBtnRecording: {
    borderColor: BrandColors.streakFire,
    backgroundColor: '#FBE9E7',
  },
  micIcon: { fontSize: 36 },
  micText: { fontSize: 15, color: '#666', fontWeight: '600' },
  speakSmall: { alignSelf: 'flex-end', marginTop: 8 },
  speakSmallText: { fontSize: 14, color: BrandColors.brandNavy, fontWeight: '600' },
  resultText: { fontSize: 20, color: '#2e7d32', fontWeight: '700', lineHeight: 28 },

  translateBtn: {
    backgroundColor: BrandColors.brandGreen,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  translateBtnDisabled: { backgroundColor: '#ccc' },
  translateBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  errorText: {
    color: BrandColors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
