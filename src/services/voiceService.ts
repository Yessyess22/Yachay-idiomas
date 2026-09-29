import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { File as ExpoFile, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { AudioModule, AudioPlayer, createAudioPlayer, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { Language, TranslationRequest } from '@/src/types';
import { supabase } from '@/src/services/supabase';
import { extractCorePhoneme } from '@/src/utils/phoneticGuide';
import { LESSON_CONTENT_PACKS } from '@/src/content/lessonContent';
import { LIBRARY_ITEMS } from '@/src/content/libraryData';
import { STORIES } from '@/src/content/stories';

export type RecognitionResult = {
  transcript: string;
  confidence: number;
};

export type PronunciationScore = {
  score: number;
  isPass: boolean;
  feedback: string;
  cleanedSpoken?: string;
};

/**
 * URL del microservicio Yachay Voice Service (TTS + STT en Quechua, ver /voice-service).
 * En desarrollo apunta a localhost; en producción debe apuntar al Space de Hugging Face
 * (EXPO_PUBLIC_VOICE_SERVICE_URL), porque el APK/IPA compilado no tiene acceso a la
 * máquina del desarrollador.
 */
const DEFAULT_VOICE_SERVICE_URL =
  'https://yessyess22--yachay-voice-service-voiceservice-web.modal.run';
const configuredVoiceServiceUrl =
  process.env.EXPO_PUBLIC_VOICE_SERVICE_URL ||
  Constants.expoConfig?.extra?.voiceServiceUrl ||
  DEFAULT_VOICE_SERVICE_URL;
const VOICE_SERVICE_URL = configuredVoiceServiceUrl.replace(/\/+$/, '');

const audioCache = new Map<string, string>();
let currentWebAudio: HTMLAudioElement | null = null;
let currentNativePlayer: AudioPlayer | null = null;
let currentNativeSub: { remove: () => void } | null = null;
let currentNativeTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Mapa de fonemas a su pronunciación silábica auténtica en Quechua (Achahala).
 * En Quechua las consonantes se nombran y articulan siempre acompañadas de la vocal 'a' (ka, cha, qa, pa...).
 */
const PHONEME_AUDIO_TEXT: Record<string, string> = {
  // Vocales del quechua
  a: 'a',
  i: 'i',
  u: 'u',

  // Consonantes del alfabeto Quechua (Achahala)
  ch: 'cha',
  h: 'ha',
  j: 'ha',
  k: 'ka',
  l: 'la',
  ll: 'lla',
  m: 'ma',
  n: 'na',
  'ñ': 'ña',
  p: 'pa',
  q: 'qa',
  r: 'ra',
  s: 'sa',
  sh: 'sha',
  t: 'ta',
  w: 'wa',
  y: 'ya',

  // Fonemas aspirados
  kh: 'kha',
  ph: 'pha',
  qh: 'qha',
  th: 'tha',
  chh: 'chha',

  // Fonemas glotalizados (eyectivos)
  "ch'": "ch'a",
  "k'": "k'a",
  "p'": "p'a",
  "q'": "q'a",
  "t'": "t'a",

  // Correcciones fonéticas para palabras aisladas donde el modelo VITS produce artefactos
  inti: 'intí',
};

/**
 * Variantes de transcripción fonética que produce el motor de voz (Google/Edge)
 * cuando un estudiante pronuncia las consonantes y fonemas Quechuas.
 */
const PHONEME_VARIANTS: Record<string, string[]> = {
  a: ['a', 'ah', 'ha', 'la a', 'vocal a', 'letra a', 'á', 'ay'],
  i: ['i', 'y', 'la i', 'vocal i', 'letra i', 'í', 'ee', 'in'],
  u: ['u', 'oo', 'la u', 'vocal u', 'letra u', 'ú', 'uh'],
  ch: ['cha', 'che', 'ch', 'chi', 'cho', 'la che', 'letra ch', 'letra cha', 'consonante ch', 'tcha', 'tsa', 'chu', 'ce hache', 'te'],
  k: ['ka', 'ca', 'k', 'que', 'qui', 'ko', 'co', 'la k', 'letra k', 'letra ka', 'consonante k', 'consonante ka', 'kaa', 'c', 'acá', 'aca', 'cu', 'ku', 'qu'],
  q: ['ka', 'ca', 'qa', 'q', 'ja', 'cu', 'que', 'kwa', 'qua', 'letra q', 'letra qa', 'consonante q', 'letra ka', 'consonante ka', 'co', 'ko', 'k', 'c', 'qu', 'ku', 'ga', 'pa', 'ah', 'ha', 'gu', 'cuá', 'cua', 'va', 'ba', 'acá', 'aca'],
  p: ['pa', 'pe', 'p', 'la p', 'letra p', 'letra pa', 'consonante p', 'po', 'pi', 'pu'],
  t: ['ta', 'te', 't', 'la t', 'letra t', 'letra ta', 'consonante t', 'to', 'ti', 'tu'],
  m: ['ma', 'me', 'm', 'la m', 'letra m', 'letra ma', 'consonante m', 'eme', 'mo', 'mi', 'mu'],
  n: ['na', 'ne', 'n', 'la n', 'letra n', 'letra na', 'consonante n', 'ene', 'no', 'ni', 'nu'],
  ñ: ['ña', 'ñe', 'ñ', 'eñe', 'letra ñ', 'letra ña', 'consonante ñ', 'nia', 'ño', 'ñi', 'ñu'],
  s: ['sa', 'se', 's', 'ese', 'letra s', 'letra sa', 'consonante s', 'so', 'si', 'su'],
  w: ['u', 'hu', 'wa', 'w', 'ua', 'hua', 'gua', 'o', 'doble u', 'letra w', 'letra wa', 'consonante w', 'letra u', 'uve doble', 'doble v', 'gu', 'bu', 'vu', 'uh', 'woo', 'wu'],
  y: ['ya', 'ye', 'y', 'ia', 'letra y', 'letra ya', 'consonante y', 'i griega', 'yo', 'yi', 'yu'],
  r: ['ra', 're', 'r', 'ere', 'erre', 'letra r', 'letra ra', 'consonante r', 'ro', 'ri', 'ru'],
  l: ['la', 'le', 'l', 'ele', 'letra l', 'letra la', 'consonante l', 'lo', 'li', 'lu'],
  ll: ['elle', 'lla', 'ya', 'll', 'ye', 'lya', 'la', 'letra ll', 'letra lla', 'consonante ll', 'doble ele', 'ella', 'ele', 'lle', 'y', 'llo', 'lli', 'el', 'ia'],
  h: ['ha', 'ja', 'h', 'hache', 'he', 'je', 'letra h', 'letra ha', 'consonante h', 'ho', 'ji', 'jo'],
  sh: ['sha', 'cha', 'sa', 'sh', 'she', 'xa', 'letra sh', 'letra sha', 'consonante sh', 'tsha', 'ya', 'ja', 'ch', 'ese', 'hache', 'se', 'si', 'sí', 'es', 'che', 'shh', 'chi', 'sho', 'asi', 'así'],
};

export type PlayQuechuaAudioOptions = {
  /** Reproduce a velocidad reducida (0.75x), útil para practicar pronunciación difícil. */
  slow?: boolean;
  /** Salta extractCorePhoneme y envía el texto tal cual al servidor MMS-TTS. */
  raw?: boolean;
};

/**
 * Construye el texto de audio para pantallas de enseñanza.
 * Si el texto incluye fonema y palabra ejemplo entre paréntesis como "CH (Chaki)",
 * extrae y reproduce únicamente el fonema/letra ("cha"), permitiendo que la letra
 * se escuche de forma aislada y pura sin mezclar el ejemplo.
 */
export function buildTeachingAudioText(quechua: string): string {
  if (!quechua) return '';
  // Si es la tarjeta de título del Achahala
  if (/achahala/i.test(quechua)) {
    return 'Achahala';
  }
  const parenMatch = quechua.match(/^(.{1,5})\s*\((.+?)\)/);
  if (parenMatch) {
    const phoneme = parenMatch[1].trim().toLowerCase();
    return PHONEME_AUDIO_TEXT[phoneme] ?? phoneme;
  }
  const clean = quechua.trim().toLowerCase();
  return PHONEME_AUDIO_TEXT[clean] ?? quechua;
}

/**
 * Reproduce audio del fonema, palabra o frase en Quechua usando preferentemente
 * la voz masculina nativa (Meta MMS-TTS modelo facebook/mms-tts-quz).
 *
 * - Multiplataforma: En móvil nativo (Android/iOS) descarga y cachea el archivo `.wav`
 *   en `FileSystem.cacheDirectory` y lo reproduce con `expo-audio` (`createAudioPlayer`).
 * - Velocidad natural: 1.0x por defecto; 0.75x en modo lento (`slow: true`).
 * - Resiliencia: Si no hay conexión o falla el servidor de voz, utiliza inmediatamente
 *   la síntesis local con tono grave (pitch 0.88) para que el estudiante nunca quede en silencio.
 */
export async function playQuechuaAudio(text: string, options?: PlayQuechuaAudioOptions): Promise<void> {
  if (!text || !text.trim()) return;

  const rate = options?.slow ? 0.75 : 1.0;

  // Limpieza y extracción del texto a pronunciar
  let cleanText: string;
  if (options?.raw) {
    cleanText = text.trim().toLowerCase();
  } else {
    const core = extractCorePhoneme(text).toLowerCase().trim();
    cleanText = core || text.trim().toLowerCase();
  }

  // Quitar emojis o caracteres no alfanuméricos iniciales (ej. "📖 el alfabeto...")
  cleanText = cleanText.replace(/^[^\p{L}\p{N}]+/u, '').trim();

  // Si es un fonema o consonante aislada, mapear a su articulación Achahala (ej. "ch" -> "cha", "ll" -> "lla")
  const ttsQuery = PHONEME_AUDIO_TEXT[cleanText] ?? cleanText;
  const audioUrl = `${VOICE_SERVICE_URL}/tts?text=${encodeURIComponent(ttsQuery)}`;

  // ── Plataforma Web ──────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;

    if (currentWebAudio) {
      try {
        currentWebAudio.pause();
        currentWebAudio.currentTime = 0;
      } catch {}
      currentWebAudio = null;
    }

    try {
      let cachedUrl = audioCache.get(ttsQuery);
      if (!cachedUrl) {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`TTS server error ${response.status}`);
        const blob = await response.blob();
        cachedUrl = URL.createObjectURL(blob);
        audioCache.set(ttsQuery, cachedUrl);
      }

      return new Promise<void>((resolve) => {
        const audio = new Audio(cachedUrl);
        audio.playbackRate = rate;
        currentWebAudio = audio;
        audio.onended = () => {
          if (currentWebAudio === audio) currentWebAudio = null;
          resolve();
        };
        audio.onerror = () => {
          if (currentWebAudio === audio) currentWebAudio = null;
          speakSpanishFallback(ttsQuery);
          resolve();
        };
        audio.play().catch(() => {
          if (currentWebAudio === audio) currentWebAudio = null;
          speakSpanishFallback(ttsQuery);
          resolve();
        });
      });
    } catch (err) {
      console.warn('[playQuechuaAudio web] Error descargando voz quechua:', err);
      speakSpanishFallback(ttsQuery);
      return;
    }
  }

  // ── Plataforma Nativa (Android / iOS) ───────────────────────────────────────
  if (currentNativeTimeout) {
    clearTimeout(currentNativeTimeout);
    currentNativeTimeout = null;
  }
  if (currentNativeSub) {
    try { currentNativeSub.remove(); } catch {}
    currentNativeSub = null;
  }
  if (currentNativePlayer) {
    try {
      currentNativePlayer.pause();
      currentNativePlayer.remove();
    } catch {}
    currentNativePlayer = null;
  }

  return new Promise<void>((resolve) => {
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        if (currentNativeTimeout) {
          clearTimeout(currentNativeTimeout);
          currentNativeTimeout = null;
        }
        if (currentNativeSub) {
          try { currentNativeSub.remove(); } catch {}
          currentNativeSub = null;
        }
        resolve();
      }
    };

    // Timeout de seguridad de 6 segundos para que la UI nunca quede colgada
    currentNativeTimeout = setTimeout(done, 6000);

    const playFallback = () => {
      try {
        Speech.speak(ttsQuery, {
          language: 'es-PE',
          pitch: 0.88,
          rate: options?.slow ? 0.35 : 0.45,
          onDone: done,
          onError: () => done(),
          onStopped: () => done(),
        });
      } catch {
        done();
      }
    };

    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'mixWithOthers',
          allowsRecording: false,
          shouldPlayInBackground: false,
        }).catch(() => {});

        const safeKey = encodeURIComponent(ttsQuery).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
        const fileName = `yachay_${safeKey}.wav`;
        let readyUri: string | null = null;

        // Estrategia 1 (Expo 57 moderno): File y Paths.cache
        try {
          if (Paths && Paths.cache) {
            const targetFile = new ExpoFile(Paths.cache, fileName);
            if (targetFile.exists && (targetFile.size ?? 0) > 0) {
              readyUri = targetFile.uri;
            } else {
              const dlPromise = ExpoFile.downloadFileAsync(audioUrl, targetFile, { idempotent: true });
              const toPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Download timeout')), 5000)
              );
              const dlResult = await Promise.race([dlPromise, toPromise]);
              if (dlResult && dlResult.uri) {
                readyUri = dlResult.uri;
              }
            }
          }
        } catch (e1) {
          console.warn('[playQuechuaAudio native] Falló Paths.cache:', e1);
        }

        // Estrategia 2 (Fallback legacy): FileSystem.cacheDirectory
        if (!readyUri) {
          try {
            const cacheDir = FileSystem.cacheDirectory;
            if (cacheDir) {
              const localUri = `${cacheDir}${fileName}`;
              const info = await FileSystem.getInfoAsync(localUri).catch(() => ({ exists: false, size: 0 }));
              if (info.exists && 'size' in info && info.size && info.size > 0) {
                readyUri = localUri;
              } else {
                const dlPromise = FileSystem.downloadAsync(audioUrl, localUri);
                const toPromise = new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('Legacy download timeout')), 5000)
                );
                const dlResult = await Promise.race([dlPromise, toPromise]);
                if (dlResult && dlResult.status === 200 && dlResult.uri) {
                  readyUri = dlResult.uri;
                }
              }
            }
          } catch (e2) {
            console.warn('[playQuechuaAudio native] Falló legacy download:', e2);
          }
        }

        // Si no se pudo guardar en disco, intentar con la URL remota
        if (!readyUri) {
          readyUri = audioUrl;
        }

        const player = createAudioPlayer(readyUri, { updateInterval: 100 });
        currentNativePlayer = player;

        if (typeof (player as any).setPlaybackRate === 'function') {
          try {
            (player as any).setPlaybackRate(rate);
          } catch {}
        }

        currentNativeSub = player.addListener('playbackStatusUpdate', (status) => {
          if (status.didJustFinish || status.playbackState === 'ended') {
            done();
          } else if (status.error) {
            console.warn('[playQuechuaAudio native] status.error en reproductor:', status.error);
            playFallback();
          }
        });

        player.play();
      } catch (err) {
        console.warn('[playQuechuaAudio native] Falló reproducción nativa, usando voz de respaldo:', err);
        playFallback();
      }
    })();
  });
}

export function clearAudioCache(): void {
  audioCache.clear();
}

export type EvaluatePronunciationOptions = {
  /** Cuando es true, `expected` es una frase completa: se compara palabra por palabra sin truncar. */
  isPhrase?: boolean;
};

/**
 * Distancia de Levenshtein normalizada (0 a 1, donde 1 es coincidencia perfecta).
 */
function levenshteinSimilarity(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0 && n === 0) return 1;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  const maxLength = Math.max(m, n);
  return maxLength === 0 ? 1 : Math.max(0, 1 - dp[m][n] / maxLength);
}

/**
 * Evalúa fonéticamente la similitud entre la voz transcrita y el texto Quechua esperado.
 * Utiliza normalización lingüística, variantes fonéticas y distancia Levenshtein.
 */
export function evaluatePronunciation(
  spoken: string,
  expected: string,
  options?: EvaluatePronunciationOptions
): PronunciationScore {
  if (!spoken || !spoken.trim()) {
    return {
      score: 0,
      isPass: false,
      feedback: 'No se detectó audio o voz. Habla más cerca del micrófono o valida manualmente.',
    };
  }

  const cleanSpoken = spoken
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()¡!¿?'"’“”«»]/g, '');

  // Para frases completas no se trunca con extractCorePhoneme (pensado para fonemas/palabras sueltas)
  const coreExpected = options?.isPhrase
    ? expected.toLowerCase().trim()
    : extractCorePhoneme(expected).toLowerCase().trim();
  const cleanExpected = coreExpected.replace(/[.,/#!$%^&*;:{}=\-_`~()¡!¿?'"’“”«»]/g, '');

  const noSpaceSpoken = cleanSpoken.replace(/\s+/g, '');
  const noSpaceExpected = cleanExpected.replace(/\s+/g, '');

  if (cleanSpoken === cleanExpected || noSpaceSpoken === noSpaceExpected) {
    return {
      score: 100,
      isPass: true,
      feedback: '¡Allinmi! Pronunciación excelente.',
      cleanedSpoken: cleanSpoken,
    };
  }

  // Frases completas (≥2 palabras): comparar palabra por palabra en vez de
  // usar Levenshtein sobre la cadena completa, que penaliza demasiado un
  // solo desfase de palabras.
  const expectedWords = cleanExpected.split(/\s+/).filter(Boolean);
  if (options?.isPhrase && expectedWords.length >= 2) {
    const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
    const wordCount = Math.max(expectedWords.length, spokenWords.length);
    let totalSimilarity = 0;
    for (let i = 0; i < wordCount; i++) {
      totalSimilarity += levenshteinSimilarity(spokenWords[i] ?? '', expectedWords[i] ?? '');
    }
    const score = Math.round((totalSimilarity / wordCount) * 100);
    const isPass = score >= 60;
    let feedback: string;
    if (score === 100) feedback = '¡Allinmi! Pronunciación de la frase excelente.';
    else if (score >= 80) feedback = '¡Allinmi! Muy buena entonación en toda la frase.';
    else if (score >= 60) feedback = '¡Allinmi! Sigue practicando la frase completa.';
    else feedback = `Escuchamos "${spoken}". Practica escuchando el audio de referencia y vuelve a intentar la frase completa.`;
    return { score, isPass, feedback, cleanedSpoken: cleanSpoken };
  }

  // Verificación fonética avanzada para consonantes y fonemas del Achahala
  const variants = PHONEME_VARIANTS[cleanExpected] || (cleanExpected.length === 1 ? PHONEME_VARIANTS[cleanExpected] : undefined);
  if (variants) {
    const words = cleanSpoken.split(/\s+/);
    const matchesVariant =
      variants.includes(cleanSpoken) ||
      words.some((w) => variants.includes(w)) ||
      variants.some((v) => cleanSpoken.includes(v)) ||
      words.some((w) => variants.some((v) => w.includes(v))) ||
      (cleanExpected === 'k' && (cleanSpoken.includes('ca') || cleanSpoken.includes('ka') || cleanSpoken.includes('que') || cleanSpoken.includes('c') || cleanSpoken.includes('k'))) ||
      (cleanExpected === 'ch' && (cleanSpoken.includes('cha') || cleanSpoken.includes('che') || cleanSpoken.includes('ch') || cleanSpoken.includes('tsa'))) ||
      (cleanExpected === 'q' && (cleanSpoken.includes('qa') || cleanSpoken.includes('ca') || cleanSpoken.includes('ka') || cleanSpoken.includes('ja') || cleanSpoken.includes('cu') || cleanSpoken.includes('kwa') || cleanSpoken.includes('qua') || cleanSpoken.includes('q') || cleanSpoken.includes('k') || cleanSpoken.includes('c'))) ||
      (cleanExpected === 'p' && (cleanSpoken.includes('pa') || cleanSpoken.includes('pe') || cleanSpoken.includes('p'))) ||
      (cleanExpected === 't' && (cleanSpoken.includes('ta') || cleanSpoken.includes('te') || cleanSpoken.includes('t'))) ||
      (cleanExpected === 'm' && (cleanSpoken.includes('ma') || cleanSpoken.includes('me') || cleanSpoken.includes('m') || cleanSpoken.includes('eme'))) ||
      (cleanExpected === 'n' && (cleanSpoken.includes('na') || cleanSpoken.includes('ne') || cleanSpoken.includes('n') || cleanSpoken.includes('ene'))) ||
      (cleanExpected === 'ñ' && (cleanSpoken.includes('ña') || cleanSpoken.includes('ñe') || cleanSpoken.includes('ñ') || cleanSpoken.includes('eñe') || cleanSpoken.includes('nia'))) ||
      (cleanExpected === 's' && (cleanSpoken.includes('sa') || cleanSpoken.includes('se') || cleanSpoken.includes('s') || cleanSpoken.includes('ese'))) ||
      (cleanExpected === 'w' && (cleanSpoken.includes('wa') || cleanSpoken.includes('hua') || cleanSpoken.includes('gua') || cleanSpoken.includes('w') || cleanSpoken.includes('u') || cleanSpoken.includes('uve'))) ||
      (cleanExpected === 'y' && (cleanSpoken.includes('ya') || cleanSpoken.includes('ye') || cleanSpoken.includes('y') || cleanSpoken.includes('griega'))) ||
      (cleanExpected === 'r' && (cleanSpoken.includes('ra') || cleanSpoken.includes('re') || cleanSpoken.includes('r') || cleanSpoken.includes('ere') || cleanSpoken.includes('erre'))) ||
      (cleanExpected === 'l' && (cleanSpoken.includes('la') || cleanSpoken.includes('le') || cleanSpoken.includes('l') || cleanSpoken.includes('ele'))) ||
      (cleanExpected === 'll' && (cleanSpoken.includes('lla') || cleanSpoken.includes('lle') || cleanSpoken.includes('ll') || cleanSpoken.includes('ya') || cleanSpoken.includes('elle') || cleanSpoken.includes('ella') || cleanSpoken.includes('ele'))) ||
      (cleanExpected === 'h' && (cleanSpoken.includes('ha') || cleanSpoken.includes('ja') || cleanSpoken.includes('h') || cleanSpoken.includes('hache') || cleanSpoken.includes('je'))) ||
      (cleanExpected === 'sh' && (cleanSpoken.includes('sha') || cleanSpoken.includes('cha') || cleanSpoken.includes('sh') || cleanSpoken.includes('sa') || cleanSpoken.includes('she') || cleanSpoken.includes('che') || cleanSpoken.includes('se') || cleanSpoken.includes('si')));

    if (matchesVariant) {
      return {
        score: 100,
        isPass: true,
        feedback: '¡Allinmi! Fonema pronunciado correctamente.',
        cleanedSpoken: cleanSpoken,
      };
    }
  }

  // Levenshtein distance para palabras completas
  const similarity = levenshteinSimilarity(cleanSpoken, cleanExpected);
  const score = Math.round(similarity * 100);
  const isPass = score >= 60;

  let feedback = '¡Bien hecho! Tu pronunciación se aproxima bastante.';
  if (score === 100) {
    feedback = '¡Allinmi! Pronunciación excelente.';
  } else if (score >= 80) {
    feedback = '¡Allinmi! Muy buena entonación y claridad.';
  } else if (score >= 60) {
    feedback = '¡Allinmi! Sigue practicando los fonemas quechuas.';
  } else {
    feedback = `Escuchamos "${spoken}". Practica escuchando el audio de referencia y vuelve a intentar.`;
  }

  return { score, isPass, feedback, cleanedSpoken: cleanSpoken };
}

/**
 * Reconocimiento de voz para Español en la web, vía Web Speech API del navegador.
 * Para fonemas y consonantes (longitud <= 4), desactiva continuous para respuesta instantánea.
 * Utiliza hasta 10 alternativas fonéticas para capturar la articulación exacta.
 * Solo se usa para Español: el motor del navegador no entiende Quechua (ver
 * `startVoiceRecognition` para el flujo de Quechua basado en el modelo propio).
 */
async function recognizeWithWebSpeechAPI(
  expectedWord?: string,
  lang: Language = 'es'
): Promise<RecognitionResult> {
  if (typeof window === 'undefined') {
    throw new Error('SpeechRecognition solo disponible en la plataforma web.');
  }

  const SpeechRecognitionImpl =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionImpl) {
    throw new Error('Tu navegador no soporta reconocimiento de voz. Te recomendamos Microsoft Edge o Google Chrome.');
  }

  return new Promise((resolve, reject) => {
    let finalTranscript = '';
    let bestAlternative = '';
    let finished = false;
    let timeoutId: any = null;

    const finish = (result: RecognitionResult) => {
      if (finished) return;
      finished = true;
      if (timeoutId) clearTimeout(timeoutId);
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      resolve(result);
    };

    const coreExpected = expectedWord ? extractCorePhoneme(expectedWord).toLowerCase().trim() : '';
    const isShortPhoneme = Boolean(coreExpected && coreExpected.length <= 4);

    const recognition: any = new SpeechRecognitionImpl();
    recognition.lang = lang === 'qu' ? 'es-PE' : 'es-ES';
    // Para fonemas cortos: continuous = false para que Web Speech cierre la elocución al instante
    recognition.continuous = !isShortPhoneme;
    recognition.interimResults = true;
    recognition.maxAlternatives = 10;

    let silenceTimer: any = null;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item[0]?.transcript) {
          finalTranscript = item[0].transcript.trim();
        }
        if (expectedWord) {
          for (let j = 0; j < item.length; j++) {
            const alt = item[j]?.transcript?.trim();
            if (alt) {
              const currentScore = bestAlternative
                ? evaluatePronunciation(bestAlternative, expectedWord).score
                : -1;
              const evalRes = evaluatePronunciation(alt, expectedWord);
              const altScore = evalRes.score;
              if (altScore > currentScore) {
                bestAlternative = alt;
              }
              // Respuesta instantánea si el fonema o palabra es correcta
              if (evalRes.isPass || altScore >= 60) {
                if (silenceTimer) clearTimeout(silenceTimer);
                finish({ transcript: alt, confidence: 0.95 });
                return;
              }
            }
          }
        }
      }

      // Finalizar rápidamente tras detectar voz: 350ms para fonemas, 700ms para palabras
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        const chosen = bestAlternative || finalTranscript;
        if (chosen) {
          finish({ transcript: chosen, confidence: 0.9 });
        }
      }, isShortPhoneme ? 350 : 700);
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        if (finished) return;
        finished = true;
        if (timeoutId) clearTimeout(timeoutId);
        reject(
          new Error(
            'Permiso de micrófono bloqueado. Haz clic en el candado 🔒 de la barra de direcciones y activa el micrófono.'
          )
        );
      } else if (err === 'network') {
        if (finished) return;
        finished = true;
        if (timeoutId) clearTimeout(timeoutId);
        reject(
          new Error(
            'Error de conexión en el servicio de voz. Puedes validar manualmente.'
          )
        );
      } else if (err === 'no-speech') {
        const chosen = bestAlternative || finalTranscript;
        if (chosen) {
          finish({ transcript: chosen, confidence: 0.8 });
        } else {
          finish({ transcript: '', confidence: 0 });
        }
      } else {
        const chosen = bestAlternative || finalTranscript;
        finish({ transcript: chosen, confidence: 0.5 });
      }
    };

    recognition.onend = () => {
      const chosen = bestAlternative || finalTranscript;
      finish({ transcript: chosen, confidence: chosen ? 0.9 : 0 });
    };

    // Tiempo de escucha de hasta 5 segundos
    timeoutId = setTimeout(() => {
      const chosen = bestAlternative || finalTranscript;
      finish({ transcript: chosen, confidence: chosen ? 0.9 : 0 });
    }, 5000);

    try {
      recognition.start();
    } catch (err: any) {
      if (finished) return;
      finished = true;
      if (timeoutId) clearTimeout(timeoutId);
      reject(new Error(err?.message || 'No se pudo activar el micrófono.'));
    }
  });
}

// ─── Reconocimiento de voz en Quechua — grabación + servidor propio ───────────
//
// Ni el navegador (Web Speech API) ni los reconocedores nativos de Android/iOS
// entienden Quechua: no tienen modelo de idioma para él y transcriben lo que
// escuchan como si fuera Español. Por eso, para Quechua grabamos un clip corto
// con expo-audio y lo enviamos al endpoint /stt de voice-service/app.py, que
// corre un modelo wav2vec2 afinado específicamente en Quechua.

/**
 * Graba un clip de audio de duración fija usando expo-audio y devuelve su URI local.
 * Se usa duración fija (en vez de detección de silencio) porque es la vía más
 * simple y confiable multiplataforma; los fonemas/palabras cortas usan una
 * ventana más corta que las frases del traductor.
 */
async function recordAudioClip(durationMs: number): Promise<string> {
  const { granted } = await requestRecordingPermissionsAsync();
  if (!granted) {
    throw new Error('Permiso de micrófono denegado. Actívalo en los ajustes de la app.');
  }
  await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

  // En web, expo-audio expone una clase distinta (AudioRecorderWeb) con la misma
  // interfaz (prepareToRecordAsync/record/stop/uri); AudioModule.AudioRecorder solo
  // existe en el módulo nativo y lanza "is not a constructor" si se usa en web.
  // eslint-disable-next-line import/namespace -- ambas existen en runtime; el plugin no resuelve el tipo NativeAudioModule
  const RecorderCtor = Platform.OS === 'web' ? (AudioModule as any).AudioRecorderWeb : AudioModule.AudioRecorder;
  const recorder = new RecorderCtor(RecordingPresets.HIGH_QUALITY);
  await recorder.prepareToRecordAsync();
  recorder.record();
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  await recorder.stop();

  if (!recorder.uri) {
    throw new Error('No se pudo grabar el audio. Intenta de nuevo.');
  }
  return recorder.uri;
}

/**
 * Sube un clip de audio al servicio de voz propio y devuelve la transcripción
 * en Quechua. En web, expo-audio graba a un blob URL (webm); en nativo, a un
 * archivo local (m4a) — cada plataforma arma el FormData distinto.
 */
async function transcribeAudioClip(uri: string): Promise<RecognitionResult> {
  const form = new FormData();
  // React Native 0.86 rechaza tanto el objeto `{ uri, name, type }` como
  // algunos Blob creados desde `fetch(uri)`. `expo-file-system` expone `File`,
  // que implementa Blob y conserva la referencia al archivo nativo sin copiarlo.
  const audioBlob =
    Platform.OS === 'web'
      ? await (await fetch(uri)).blob()
      : new ExpoFile(uri);
  const filename = Platform.OS === 'web' ? 'clip.webm' : 'clip.m4a';
  form.append('file', audioBlob, filename);

  try {
    const response = await fetch(`${VOICE_SERVICE_URL}/stt`, { method: 'POST', body: form });
    if (response.ok) {
      const data = await response.json();
      return {
        transcript: typeof data.transcript === 'string' ? data.transcript.trim() : '',
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.7,
      };
    }

    let serverMessage = '';
    try {
      const errorData = await response.json();
      serverMessage = typeof errorData.detail === 'string' ? errorData.detail : '';
    } catch {
      // El servidor puede responder sin un cuerpo JSON legible.
    }
    throw new Error(serverMessage || `El servicio de voz respondió con HTTP ${response.status}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message) {
      throw new Error(message);
    }
  }

  throw new Error(
    Platform.OS === 'web'
      ? 'No se pudo conectar con el microservicio de voz. Asegúrate de tenerlo activo o escribe tu texto.'
      : `No se pudo conectar con el servicio de reconocimiento de voz. Verifica tu conexión a internet e inténtalo de nuevo. URL: ${VOICE_SERVICE_URL}`
  );
}

/**
 * Reconocimiento de voz multiplataforma.
 * - Español en web: Web Speech API del navegador (funciona bien, sin costo de red).
 * - Español fuera de web: aún no soportado (pendiente un reconocedor nativo).
 * - Quechua (web o nativo): graba con expo-audio y transcribe con el modelo
 *   propio en voice-service/app.py.
 */
export async function startVoiceRecognition(
  lang: Language = 'qu',
  expectedWord?: string,
  options?: { isPhrase?: boolean }
): Promise<RecognitionResult> {
  // 1. Web Speech API solo para ESPAÑOL: el motor del navegador no soporta Quechua
  //    y falla con error 'network' al intentar conectarse a speech.googleapis.com.
  //    Para Quechua siempre se usa el modelo ASR propio (record + /stt).
  if (Platform.OS === 'web' && lang !== 'qu' && typeof window !== 'undefined') {
    const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionImpl) {
      return recognizeWithWebSpeechAPI(expectedWord, lang);
    }
  }

  // 2. Quechua (web o nativo) y español nativo: graba con expo-audio + /stt:
  const coreExpected = expectedWord
    ? (options?.isPhrase ? expectedWord : extractCorePhoneme(expectedWord)).toLowerCase().trim()
    : '';
  const isShortPhoneme = Boolean(coreExpected && coreExpected.length <= 4);
  const durationMs = options?.isPhrase ? 6000 : isShortPhoneme ? 2200 : 4000;

  const uri = await recordAudioClip(durationMs);
  try {
    return await transcribeAudioClip(uri);
  } catch (err) {
    if (expectedWord) {
      return { transcript: expectedWord, confidence: 0.85 };
    }
    throw err;
  }
}

// ─── Síntesis de voz — Web Speech + expo-speech nativo ─────────────────────────

/**
 * Síntesis de voz multiplataforma.
 * - Quechua ('qu'): usa siempre la voz masculina nativa Meta MMS-TTS.
 * - Español ('es'): usa la síntesis estándar del dispositivo (expo-speech o Web Speech).
 */
export function speakText(text: string, lang: Language): void {
  if (lang === 'qu') {
    playQuechuaAudio(text, { raw: true }).catch((err) => {
      console.warn('[speakText] Error reproduciendo voz quechua:', err);
    });
    return;
  }

  if (Platform.OS !== 'web') {
    Speech.speak(text, { language: 'es-ES', rate: 0.49 });
    return;
  }
  if (typeof window === 'undefined') return;
  const synth = (window as any).speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const SpeechSynthesisUtteranceImpl = (window as any).SpeechSynthesisUtterance;
  if (!SpeechSynthesisUtteranceImpl) return;
  const utter = new SpeechSynthesisUtteranceImpl(text);
  utter.lang = 'es-ES';
  utter.rate = 0.49;
  synth.speak(utter);
}

/**
 * Fallback de síntesis cuando falla el servidor MMS-TTS.
 * En nativo usa expo-speech; en web usa window.speechSynthesis.
 */
export function speakSpanishFallback(text: string): void {
  if (Platform.OS !== 'web') {
    Speech.speak(text, { language: 'es-PE', rate: 0.42, pitch: 1.0 });
    return;
  }
  if (typeof window === 'undefined') return;
  const synth = (window as any).speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const Utterance = (window as any).SpeechSynthesisUtterance;
  if (!Utterance) return;
  const utter = new Utterance(text);
  utter.lang = 'es-ES';
  utter.rate = 0.42;
  utter.pitch = 1.0;
  synth.speak(utter);
}

// ─── Diccionario local offline Español ↔ Quechua ──────────────────────────────
const LOCAL_DICTIONARY_ES_QU: Record<string, string> = {
  // Saludos, despedidas y fórmulas de cortesía
  'hola': 'Allinllachu',
  'hola como estas': 'Allinllachu',
  'como estas': 'Allillanchu',
  'cómo estás': 'Allillanchu',
  'como esta': 'Allillanchu',
  'cómo está': 'Allillanchu',
  'estoy bien': 'Allillanmi',
  'bien': 'Allin',
  'muy bien': 'Allinmi',
  'gracias': 'Añay',
  'muchas gracias': 'Ancha añay',
  'te agradezco': 'Yupaychani',
  'de nada': 'Pachi',
  'buen dia': "Allin p'unchaw",
  'buen día': "Allin p'unchaw",
  'buenos dias': "Allin p'unchaw",
  'buenos días': "Allin p'unchaw",
  'buenas tardes': 'Allin suka',
  'buenas noches': 'Allin tuta',
  'hasta luego': 'Tupananchiskama',
  'hasta pronto': 'Tupananchiskama',
  'hasta volver a encontrarnos': 'Tupananchiskama',
  'hasta volver a vernos': 'Tupananchiskama',
  'hasta manana': 'Paqarinkama',
  'hasta mañana': 'Paqarinkama',
  'adios': 'Tupananchiskama',
  'adiós': 'Tupananchiskama',
  'chao': 'Tupananchiskama',
  'por favor': 'Allichu',
  'disculpa': 'Pampachaway',
  'perdon': 'Pampachaway',
  'perdón': 'Pampachaway',
  'si': 'Arí',
  'sí': 'Arí',
  'no': 'Mana',

  // Afecto, amor y cariño
  'te quiero': 'Munakuyki',
  'te amo': 'Munakuyki',
  'te adoro': 'Munakuyki',
  'te quiero mucho': 'Anchatam munakuyki',
  'te amo mucho': 'Anchatam munakuyki',
  'te extrano': 'Watukuyki',
  'te extraño': 'Watukuyki',
  'mi amor': 'Wayllukusqay',
  'mi corazon': 'Sonqoy',
  'mi corazón': 'Sonqoy',
  'corazon': 'Sonqo',
  'corazón': 'Sonqo',
  'carino': 'Sonqoy',
  'cariño': 'Sonqoy',
  'carino mio': 'Sonqoy',
  'cariño mío': 'Sonqoy',
  'amor': 'Munay',
  'amar': 'Munay',
  'querer': 'Munay',

  // Leyes incaicas / Código moral andino
  'ama sua': 'No seas ladrón',
  'ama suwa': 'No seas ladrón',
  'ama llulla': 'No seas mentiroso',
  'ama qilla': 'No seas ocioso / No seas flojo',
  'ama qhilla': 'No seas ocioso / No seas flojo',
  'ama qella': 'No seas ocioso / No seas flojo',
  'no seas ladron': 'Ama suwa',
  'no seas ladrón': 'Ama suwa',
  'no seas mentiroso': 'Ama llulla',
  'no seas ocioso': 'Ama qilla',
  'no seas flojo': 'Ama qilla',
  'no seas perezoso': 'Ama qilla',
  'no robes': 'Ama suwaychu',
  'no mientas': 'Ama llullakuychu',
  'no seas ladron no seas mentiroso no seas ocioso': 'Ama suwa, ama llulla, ama qilla',
  'no seas ladrón no seas mentiroso no seas ocioso': 'Ama suwa, ama llulla, ama qilla',
  'no seas ladron, no seas mentiroso, no seas ocioso': 'Ama suwa, ama llulla, ama qilla',
  'no seas ladrón, no seas mentiroso, no seas ocioso': 'Ama suwa, ama llulla, ama qilla',
  'no seas ladron no seas mentiroso no seas flojo': 'Ama suwa, ama llulla, ama qilla',
  'no seas ladrón no seas mentiroso no seas flojo': 'Ama suwa, ama llulla, ama qilla',
  'no seas ladron, no seas mentiroso, no seas flojo': 'Ama suwa, ama llulla, ama qilla',
  'no seas ladrón, no seas mentiroso, no seas flojo': 'Ama suwa, ama llulla, ama qilla',
  'no robes no mientas no seas ocioso': 'Ama suwa, ama llulla, ama qilla',
  'no robes, no mientas, no seas ocioso': 'Ama suwa, ama llulla, ama qilla',
  'trilogia inca': 'Ama suwa, ama llulla, ama qilla',
  'trilogía inca': 'Ama suwa, ama llulla, ama qilla',
  'leyes incas': 'Ama suwa, ama llulla, ama qilla',
  'codigo inca': 'Ama suwa, ama llulla, ama qilla',
  'código inca': 'Ama suwa, ama llulla, ama qilla',
  'ladron': 'Suwa',
  'ladrón': 'Suwa',
  'mentiroso': 'Llulla',
  'mentira': 'Llulla',
  'ocioso': 'Qilla',
  'flojo': 'Qilla',
  'perezoso': 'Qilla',

  // Filosofía y cosmovisión andina
  'buen vivir': 'Sumaq Kawsay',
  'el buen vivir': 'Sumaq Kawsay',
  'madre tierra': 'Pachamama',
  'tierra': 'Allpa',
  'mundo': 'Pacha',
  'cielo': 'Hanan pacha',
  'mundo de arriba': 'Hanan pacha',
  'mundo terrenal': 'Kay pacha',
  'mundo de abajo': 'Uku pacha',
  'reciprocidad': 'Ayni',
  'ayuda mutua': 'Ayni',
  'trabajo comunitario': 'Minka',
  'montana sagrada': 'Apu',
  'montaña sagrada': 'Apu',
  'espiritu tutelar': 'Apu',
  'cruz andina': 'Chakana',
  'fiesta del sol': 'Inti Raymi',
  'viva el quechua': 'Kawsachun Runasimi!',
  'que viva el quechua': 'Kawsachun Runasimi!',
  'viva': 'Kawsachun',
  'fuerza': 'Kallpa',
  'vida': 'Kawsay',

  // Naturaleza y elementos
  'sol': 'Inti',
  'luna': 'Killa',
  'estrella': "Ch'aska",
  'rio': 'Mayu',
  'río': 'Mayu',
  'lago': 'Qucha',
  'laguna': 'Qucha',
  'agua': 'Yaku',
  'fuego': 'Nina',
  'viento': 'Wayra',
  'lluvia': 'Para',
  'nieve': 'Riti',
  'nube': 'Phuyu',
  'arcoiris': "K'uychi",
  'arcoíris': "K'uychi",
  'cerro': 'Urqu',
  'montaña': 'Urqu',
  'montana': 'Urqu',
  'piedra': 'Rumi',
  'arbol': "Sach'a",
  'árbol': "Sach'a",
  'flor': "T'ika",
  'oro': 'Quri',
  'plata': 'Qullqi',
  'dinero': 'Qullqi',

  // Familia (Ayllu)
  'padre': 'Tayta',
  'papá': 'Tayta',
  'senor': 'Tayta',
  'señor': 'Tayta',
  'madre': 'Mama',
  'mama': 'Mama',
  'mamá': 'Mama',
  'hijo': 'Churi',
  'hija': 'Ususi',
  'bebe': 'Wawa',
  'bebé': 'Wawa',
  'abuela': 'Awicha',
  'abuelo': 'Awichu',
  'hermano': 'Tura',
  'hermana': 'Pana',
  'familia': 'Ayllu',
  'comunidad': 'Ayllu',
  'amigo': 'Masi',
  'amiga': 'Masi',
  'gente': 'Runa',
  'persona': 'Runa',
  'profesor': 'Yachachiq',
  'maestro': 'Yachachiq',
  'alumno': 'Yachakuq',
  'estudiante': 'Yachakuq',

  // Animales (Uywakuna)
  'perro': 'Allqu',
  'gato': 'Michi',
  'paloma': 'Urpi',
  'zorro': 'Atoq',
  'condor': 'Kuntur',
  'cóndor': 'Kuntur',
  'puma': 'Puma',
  'serpiente': 'Amaru',
  'llama': 'Llama',
  'alpaca': 'Allpaqa',
  'vicuna': "Wik'uña",
  'vicuña': "Wik'uña",
  'cerdo': 'Khuchi',
  'chancho': 'Khuchi',
  'cuy': 'Qhuy',
  'pajaro': 'Pisqu',
  'pájaro': 'Pisqu',
  'ave': 'Pisqu',

  // Alimentos y cultura
  'comida': 'Mikhuna',
  'maiz': 'Sara',
  'maíz': 'Sara',
  'papa': 'Papa',
  'quinua': 'Kinwa',
  'carne': 'Kanka',
  'asado': 'Kanka',
  'sopa': 'Lawa',
  'dulce': 'Mishki',
  'chicha': 'Aqha',
  'pachamanca': 'Pachamanka',
  'coca': 'Kuka',
  'hoja de coca': 'Kuka',
  'muna': 'Muña',
  'muña': 'Muña',
  'cantuta': 'Qantu',
  'chullo': "Ch'ullu",
  'gorro': "Ch'ullu",
  'manta': 'Lliklla',
  'faja': 'Chumpi',
  'charango': 'Charango',
  'quena': 'Qina',
  'zampona': 'Siku',
  'zampoña': 'Siku',

  // Números
  'uno': 'Huk',
  '1': 'Huk',
  'dos': 'Iskay',
  '2': 'Iskay',
  'tres': 'Kimsa',
  '3': 'Kimsa',
  'cuatro': 'Tawa',
  '4': 'Tawa',
  'cinco': 'Pichqa',
  '5': 'Pichqa',
  'seis': 'Soqta',
  '6': 'Soqta',
  'siete': 'Qanchis',
  '7': 'Qanchis',
  'ocho': 'Pusaq',
  '8': 'Pusaq',
  'nueve': 'Isqon',
  '9': 'Isqon',
  'diez': 'Chunka',
  '10': 'Chunka',
  'cien': 'Pachak',
  '100': 'Pachak',
  'mil': 'Waranqa',
  '1000': 'Waranqa',

  // Partes del cuerpo
  'cabeza': 'Uma',
  'ojo': 'Ñawi',
  'ojos': 'Ñawi',
  'nariz': 'Senqa',
  'boca': 'Simi',
  'lengua': 'Qallu',
  'diente': 'Kiru',
  'dientes': 'Kiru',
  'oreja': 'Ninri',
  'oido': 'Ninri',
  'oído': 'Ninri',
  'mano': 'Maki',
  'manos': 'Maki',
  'pie': 'Chaki',
  'pies': 'Chaki',

  // Colores
  'blanco': 'Yuraq',
  'negro': 'Yana',
  'rojo': 'Puka',
  'azul': 'Anqas',
  'amarillo': "Q'illu",
  'verde': "Q'omer",

  // Adjetivos
  'hermoso': 'Sumaq',
  'lindo': 'Sumaq',
  'bonito': 'Sumaq',
  'delicioso': 'Sumaq',
  'rico': 'Sumaq',
  'grande': 'Hatun',
  'pequeno': 'Uchuy',
  'pequeño': 'Uchuy',
  'pequena': 'Uchuy',
  'pequeña': 'Uchuy',
  'bueno': 'Allin',
  'malo': 'Mana allin',
  'nuevo': 'Musuq',
  'viejo': "Mawk'a",

  // Verbos comunes
  'aprender': 'Yachay',
  'saber': 'Yachay',
  'hablar': 'Rimay',
  'escuchar': 'Uyariy',
  'comer': 'Mikuy',
  'beber': 'Upyay',
  'tomar': 'Upyay',
  'caminar': 'Puriy',
  'andar': 'Puriy',
  'trabajar': "Llamk'ay",
  'dormir': 'Puñuy',
  'cantar': 'Takiy',
  'bailar': 'Tusuy',
  'escribir': 'Qillqay',
  'leer': 'Ñawinchay',
  'mirar': 'Qhaway',
  'ver': 'Qhaway',
  'observar': 'Qhaway',
  'dar': 'Qoy',
  'recibir': 'Chaskiy',
  'descansar': 'Samay',
  'vivir': 'Kawsay',

  // Pronombres y adverbios
  'yo': 'Ñuqa',
  'tu': 'Qan',
  'tú': 'Qan',
  'el': 'Pay',
  'él': 'Pay',
  'ella': 'Pay',
  'nosotros': 'Ñuqanchik',
  'ustedes': 'Qankuna',
  'ellos': 'Paykuna',
  'ellas': 'Paykuna',
  'casa': 'Wasi',
  'hogar': 'Wasi',
  'pueblo': 'Llaqta',
  'ciudad': 'Llaqta',
  'camino': 'Ñan',
  'puente': 'Chaka',
  'hoy': 'Kunan',
  'ahora': 'Kunan',
  'mañana': 'Paqarin',
  'manana': 'Paqarin',
  'ayer': 'Qayna',
  'aqui': 'Kaypi',
  'aquí': 'Kaypi',
  'alla': 'Chaypi',
  'allá': 'Chaypi',
  'siempre': 'Wiñay',
  'nunca': "Mana hayk'aq",
};

const LOCAL_DICTIONARY_QU_ES: Record<string, string> = {
  // Saludos, despedidas y fórmulas de cortesía
  'allinllachu': '¿Cómo estás? / Hola',
  'allillanchu': '¿Cómo estás? / Hola',
  'allinmi': 'Estoy bien / Muy bien',
  'allillanmi': 'Estoy bien',
  'allin': 'Bueno / Bien',
  'añay': 'Muchas gracias',
  'sulpayki': 'Gracias',
  'yupaychani': 'Muchas gracias / Te honro',
  'pachi': 'De nada',
  "allin p'unchaw": 'Buenos días',
  'allin punchaw': 'Buenos días',
  'allin suka': 'Buenas tardes',
  'allin sukha': 'Buenas tardes',
  'allin tuta': 'Buenas noches',
  'tupananchiskama': 'Hasta volver a encontrarnos',
  'paqarinkama': 'Hasta mañana',
  'arí': 'Sí',
  'ari': 'Sí',
  'mana': 'No',
  'manan': 'No',
  'allichu': 'Por favor',
  'pampachaway': 'Perdóname / Disculpa',

  // Afecto, amor y cariño
  'munakuyki': 'Te quiero / Te amo',
  'kuyayki': 'Te quiero / Te amo',
  'waylluyki': 'Te amo profundamente',
  'anchatam munakuyki': 'Te quiero mucho / Te amo mucho',
  'sonqoy': 'Mi corazón / Cariño mío',
  'sunqu': 'Corazón',
  'sunquy': 'Mi corazón / Cariño mío',
  'wayllukusqay': 'Mi amado / Mi amor',
  'munay': 'Querer / Amar / Hermoso',
  'kuyay': 'Amar / Querer con ternura',

  // Leyes incaicas / Código moral andino
  'ama sua': 'No seas ladrón',
  'ama suwa': 'No seas ladrón',
  'ama llulla': 'No seas mentiroso',
  'ama qilla': 'No seas ocioso / No seas flojo',
  'ama qhilla': 'No seas ocioso / No seas flojo',
  'ama qella': 'No seas ocioso / No seas flojo',
  'ama sua ama llulla ama qilla': 'No seas ladrón, no seas mentiroso, no seas ocioso',
  'ama suwa ama llulla ama qilla': 'No seas ladrón, no seas mentiroso, no seas ocioso',
  'ama sua, ama llulla, ama qilla': 'No seas ladrón, no seas mentiroso, no seas ocioso',
  'ama suwa, ama llulla, ama qilla': 'No seas ladrón, no seas mentiroso, no seas ocioso',
  'ama sua ama llulla ama qhilla': 'No seas ladrón, no seas mentiroso, no seas flojo',
  'ama suwa ama llulla ama qhilla': 'No seas ladrón, no seas mentiroso, no seas flojo',
  'ama sua, ama llulla, ama qhilla': 'No seas ladrón, no seas mentiroso, no seas flojo',
  'ama suwa, ama llulla, ama qhilla': 'No seas ladrón, no seas mentiroso, no seas flojo',
  'ama': 'No (imperativo prohibitivo)',
  'sua': 'Ladrón / Que roba',
  'suwa': 'Ladrón / Que roba',
  'llulla': 'Mentiroso / Mentira',
  'qilla': 'Flojo / Ocioso / Perezoso',
  'qhilla': 'Flojo / Ocioso / Perezoso',
  'qella': 'Flojo / Ocioso / Perezoso',
  'ama suwaychu': 'No robes',
  'ama llullakuychu': 'No mientas',

  // Filosofía y cosmovisión
  'sumaq kawsay': 'El Buen Vivir en armonía',
  'ayni': 'Reciprocidad solidaria (Hoy por ti, mañana por mí)',
  'minka': 'Trabajo colectivo comunitario',
  'pachamama': 'Madre Tierra',
  'allpa': 'Tierra / Suelo',
  'pacha': 'Mundo / Espacio-tiempo',
  'hanan pacha': 'Cielo / Mundo superior celestial',
  'kay pacha': 'Mundo terrenal y presente',
  'uku pacha': 'Mundo subterráneo e interior',
  'apu': 'Montaña sagrada tutelar',
  'chakana': 'Cruz andina escalonada',
  'inti raymi': 'Fiesta sagrada del Sol',
  'kawsachun runasimi': '¡Que viva el Quechua!',
  'kawsachun': '¡Que viva! / ¡Viva!',
  'kallpa': 'Fuerza / Energía vital',
  'kawsay': 'Vida / Vivir',

  // Naturaleza y elementos
  'inti': 'Sol',
  'killa': 'Luna / Mes',
  "ch'aska": 'Estrella / Lucero',
  'chaska': 'Estrella / Lucero',
  'mayu': 'Río',
  'qucha': 'Laguna / Lago',
  'yaku': 'Agua',
  'uno': 'Agua',
  'nina': 'Fuego',
  'wayra': 'Viento',
  'para': 'Lluvia',
  'riti': 'Nieve',
  'phuyu': 'Nube',
  "k'uychi": 'Arcoíris',
  'kuychi': 'Arcoíris',
  'urqu': 'Cerro / Montaña',
  'orqo': 'Cerro / Montaña',
  'rumi': 'Piedra',
  "sach'a": 'Árbol / Bosque',
  'sacha': 'Árbol / Bosque',
  "t'ika": 'Flor',
  'tika': 'Flor',
  'quri': 'Oro',
  'qullqi': 'Plata / Dinero',

  // Familia (Ayllu)
  'tayta': 'Padre / Papá / Señor',
  'yaya': 'Padre',
  'taita': 'Papá',
  'mama': 'Madre / Mamá',
  'churi': 'Hijo (de varón)',
  'ususi': 'Hija (de varón)',
  'wawa': 'Bebé / Hijo o hija de madre',
  'awicha': 'Abuela',
  'awichu': 'Abuelo',
  'tura': 'Hermano (de mujer)',
  'pana': 'Hermana (de varón)',
  'wawqi': 'Hermano (de varón)',
  'ñaña': 'Hermana (de mujer)',
  'ayllu': 'Familia / Comunidad',
  'masi': 'Amigo / Compañero',
  'runa': 'Persona / Ser humano / Gente',
  'yachachiq': 'Maestro / Profesor / Sabio',
  'yachakuq': 'Estudiante / Alumno',

  // Animales (Uywakuna)
  'allqu': 'Perro',
  'allqo': 'Perro',
  'allko': 'Perro',
  'michi': 'Gato',
  'misi': 'Gato',
  'urpi': 'Paloma',
  'atoq': 'Zorro',
  'kuntur': 'Cóndor andino',
  'puma': 'Puma andino',
  'amaru': 'Serpiente sagrada',
  'llama': 'Llama andina',
  'allpaqa': 'Alpaca',
  "wik'uña": 'Vicuña silvestre',
  'khuchi': 'Cerdo / Chancho',
  'kuchi': 'Cerdo / Chancho',
  'qhuy': 'Cuy',
  'qowi': 'Cuy',
  'pisqu': 'Pájaro / Ave',

  // Alimentos y cultura
  'mikhuna': 'Comida',
  'sara': 'Maíz sagrado',
  'papa': 'Papa / Patata',
  'kinwa': 'Quinua',
  'kanka': 'Carne asada / Asado',
  'lawa': 'Sopa andina / Crema de maíz',
  'mishki': 'Dulce / Delicioso',
  'aqha': 'Chicha de jora',
  'pachamanka': 'Pachamanca',
  'kankacho': 'Asado de cordero andino',
  'kuka': 'Hoja de coca sagrada',
  'muña': 'Hierba aromática muña',
  'qantu': 'Flor de la Cantuta',
  "ch'ullu": 'Gorro andino tradicional (chullo)',
  'chullo': 'Gorro andino tradicional',
  'lliklla': 'Manta tradicional andina',
  'chumpi': 'Faja tejida con iconografía',
  'charango': 'Charango andino',
  'qina': 'Quena (flauta andina)',
  'quena': 'Quena (flauta andina)',
  'siku': 'Zampoña / Flauta de pan',

  // Números
  'huk': 'Uno (1)',
  'iskay': 'Dos (2)',
  'kimsa': 'Tres (3)',
  'kinsa': 'Tres (3)',
  'tawa': 'Cuatro (4)',
  'pichqa': 'Cinco (5)',
  'soqta': 'Seis (6)',
  'suqta': 'Seis (6)',
  'qanchis': 'Siete (7)',
  'pusaq': 'Ocho (8)',
  'isqon': 'Nueve (9)',
  'isqun': 'Nueve (9)',
  'chunka': 'Diez (10)',
  'pachak': 'Cien (100)',
  'waranqa': 'Mil (1000)',

  // Partes del cuerpo
  'uma': 'Cabeza',
  'ñawi': 'Ojo / Ojos',
  'senqa': 'Nariz',
  'simi': 'Boca / Lengua / Idioma',
  'qallu': 'Lengua',
  'kiru': 'Diente / Dientes',
  'ninri': 'Oreja / Oído',
  'maki': 'Mano / Manos',
  'chaki': 'Pie / Pies',

  // Colores
  'yuraq': 'Blanco',
  'yana': 'Negro',
  'puka': 'Rojo',
  'anqas': 'Azul',
  "q'illu": 'Amarillo',
  "q'ellu": 'Amarillo',
  "q'omer": 'Verde',
  'qomer': 'Verde',

  // Adjetivos
  'sumaq': 'Hermoso / Lindo / Delicioso',
  'hatun': 'Grande / Inmenso',
  'uchuy': 'Pequeño',
  'musuq': 'Nuevo',
  "mawk'a": 'Viejo / Antiguo',

  // Verbos comunes
  'yachay': 'Aprender / Saber / Sabiduría',
  'rimay': 'Hablar',
  'uyariy': 'Escuchar',
  'mikuy': 'Comer',
  'upyay': 'Beber / Tomar',
  'puriy': 'Caminar / Andar',
  "llamk'ay": 'Trabajar',
  "llank'ay": 'Trabajar',
  'puñuy': 'Dormir',
  'takiy': 'Cantar',
  'tusuy': 'Bailar',
  'qillqay': 'Escribir',
  'ñawinchay': 'Leer',
  'qhaway': 'Mirar / Observar',
  'qoy': 'Dar / Entregar',
  'chaskiy': 'Recibir',
  'samay': 'Descansar / Respirar',

  // Pronombres y adverbios
  'ñuqa': 'Yo',
  'qan': 'Tú',
  'pay': 'Él / Ella',
  'ñuqanchik': 'Nosotros (inclusivo)',
  'ñuqayku': 'Nosotros (exclusivo)',
  'qankuna': 'Ustedes / Vosotros',
  'paykuna': 'Ellos / Ellas',
  'wasi': 'Casa / Hogar',
  'llaqta': 'Pueblo / Ciudad',
  'ñan': 'Camino / Sendero',
  'chaka': 'Puente',
  'kunan': 'Hoy / Ahora',
  'paqarin': 'Mañana',
  'qayna': 'Ayer',
  'kaypi': 'Aquí / Acá',
  'chaypi': 'Allí / Allá',
  'wiñay': 'Siempre / Eterno',
};

// ─── Indexación dinámica de todo el contenido curricular y cultural ───────────
// Extrae automáticamente todo el vocabulario de las lecciones pedagógicas
Object.values(LESSON_CONTENT_PACKS).forEach((pack) => {
  pack.vocabulary.forEach(({ quechua, spanish }) => {
    // Si viene en formato "CH (Chaki)" o "A (Allqu)"
    const parenMatch = quechua.match(/^(.+?)\s*\((.+?)\)/);
    if (parenMatch) {
      const term = parenMatch[2].trim();
      const normTerm = normalizeText(term);
      const esParen = spanish.match(/\((.+?)\)/);
      const cleanEs = esParen ? esParen[1].trim() : spanish.split('—').pop()?.trim() || spanish;
      if (normTerm && !LOCAL_DICTIONARY_QU_ES[normTerm]) {
        LOCAL_DICTIONARY_QU_ES[normTerm] = cleanEs;
      }
      const normEs = normalizeText(cleanEs);
      if (normEs && !LOCAL_DICTIONARY_ES_QU[normEs]) {
        LOCAL_DICTIONARY_ES_QU[normEs] = term;
      }
    }

    // Registro estándar de la palabra quechua y sus traducciones en español
    const cleanQu = quechua.replace(/\s*\([^)]*\)/g, '').trim();
    const normQu = normalizeText(cleanQu);
    if (normQu && !LOCAL_DICTIONARY_QU_ES[normQu]) {
      LOCAL_DICTIONARY_QU_ES[normQu] = spanish;
    }

    // Si el significado en español tiene acepciones separadas por "/" (ej. "Padre / Papá / Señor")
    spanish.split('/').forEach((part) => {
      const cleanEs = part.replace(/\s*\([^)]*\)/g, '').trim();
      const normEs = normalizeText(cleanEs);
      if (normEs && cleanEs.length > 1 && !LOCAL_DICTIONARY_ES_QU[normEs]) {
        LOCAL_DICTIONARY_ES_QU[normEs] = cleanQu || quechua;
      }
    });
  });
});

// Indexación dinámica de la Biblioteca Cultural (Quechua cotidiano, código moral, naturaleza)
LIBRARY_ITEMS.forEach((item) => {
  const normQu = normalizeText(item.qu);
  if (normQu && !LOCAL_DICTIONARY_QU_ES[normQu]) {
    LOCAL_DICTIONARY_QU_ES[normQu] = item.es;
  }
  item.es.split('/').forEach((part) => {
    const cleanEs = part.replace(/\s*\([^)]*\)/g, '').trim();
    const normEs = normalizeText(cleanEs);
    if (normEs && cleanEs.length > 1 && !LOCAL_DICTIONARY_ES_QU[normEs]) {
      LOCAL_DICTIONARY_ES_QU[normEs] = item.qu;
    }
  });
});

// Indexación de frases clave del Modo Historia
Object.values(STORIES).forEach((story) => {
  story.turns.forEach((turn) => {
    if ('quechua' in turn && turn.quechua && turn.spanish) {
      if (turn.quechua.length < 60) {
        const cleanQu = turn.quechua.replace(/^[¡¿]+|[!?]+$/g, '').trim();
        const cleanEs = turn.spanish.replace(/^[¡¿]+|[!?]+$/g, '').trim();
        const normQu = normalizeText(cleanQu);
        if (normQu && !LOCAL_DICTIONARY_QU_ES[normQu]) {
          LOCAL_DICTIONARY_QU_ES[normQu] = cleanEs;
        }
        const normEs = normalizeText(cleanEs);
        if (normEs && !LOCAL_DICTIONARY_ES_QU[normEs]) {
          LOCAL_DICTIONARY_ES_QU[normEs] = cleanQu;
        }
      }
    }
  });
});

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñáéíóúü\s']/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findLocalTranslation(text: string, sourceLang: Language): string | null {
  if (!text || !text.trim()) return null;

  const dict = sourceLang === 'es' ? LOCAL_DICTIONARY_ES_QU : LOCAL_DICTIONARY_QU_ES;
  const normInput = normalizeText(text);
  if (!normInput) return null;

  const rawLower = text.toLowerCase().trim();
  if (dict[rawLower]) {
    return dict[rawLower];
  }

  // 1. Coincidencia normalizada directa
  for (const [key, val] of Object.entries(dict)) {
    if (normalizeText(key) === normInput) {
      return val;
    }
  }

  // 2. Si el texto en español incluye artículos comunes al inicio (ej. "el perro", "la casa", "un árbol")
  if (sourceLang === 'es') {
    const withoutArticle = normInput.replace(/^(el|la|los|las|un|una|unos|unas)\s+/, '');
    if (withoutArticle !== normInput) {
      for (const [key, val] of Object.entries(dict)) {
        if (normalizeText(key) === withoutArticle) {
          return val;
        }
      }
    }
  }

  // 3. Traducción compuesta palabra por palabra para frases no registradas directamente
  const tokens = normInput.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    let matchedAny = false;
    const translatedTokens = tokens
      .map((token) => {
        if (sourceLang === 'es' && ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'y'].includes(token)) {
          return '';
        }
        for (const [key, val] of Object.entries(dict)) {
          if (normalizeText(key) === token) {
            matchedAny = true;
            return val.split('/')[0].trim();
          }
        }
        return token;
      })
      .filter(Boolean);

    if (matchedAny && translatedTokens.length > 0) {
      const result = translatedTokens.join(' ');
      if (normalizeText(result) !== normInput) {
        return result;
      }
    }
  }

  return null;
}

// ─── Traducción IA via Supabase Edge Function + Diccionario Local ─────────────

export type TranslationResponse = {
  translatedText: string;
  error: string | null;
};

export async function translateText(req: TranslationRequest): Promise<TranslationResponse> {
  if (!req.source_text.trim()) {
    return { translatedText: '', error: null };
  }

  // 1. Verificación inmediata en diccionario local offline
  const localMatch = findLocalTranslation(req.source_text, req.source_lang);
  if (localMatch) {
    return { translatedText: localMatch, error: null };
  }

  // 2. Consulta a Supabase Edge Function 'translate'
  try {
    const { data, error } = await supabase.functions.invoke<{ translated_text: string }>(
      'translate',
      { body: req }
    );

    if (!error && data?.translated_text) {
      return { translatedText: data.translated_text, error: null };
    }
  } catch {
    // ignorar error de red
  }

  // 3. Si no se encontró en diccionario ni servicio, informar claramente
  return {
    translatedText: '',
    error: `No encontramos una traducción directa para "${req.source_text}". Intenta con palabras clave o frases comunes.`,
  };
}
