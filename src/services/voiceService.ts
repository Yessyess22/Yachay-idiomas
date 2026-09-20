import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { AudioModule, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { Language, TranslationRequest } from '@/src/types';
import { supabase } from '@/src/services/supabase';
import { extractCorePhoneme } from '@/src/utils/phoneticGuide';

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
const VOICE_SERVICE_URL = process.env.EXPO_PUBLIC_VOICE_SERVICE_URL || 'http://localhost:8000';

const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

/**
 * Mapa de fonemas a su pronunciación silábica auténtica en Quechua (Achahala).
 * En Quechua las consonantes siempre se nombran y articulan con 'a' (ka, cha, qa, pa...).
 */
const PHONEME_AUDIO_TEXT: Record<string, string> = {
  a: 'a', i: 'i', u: 'u',
  k: 'ka', q: 'ka', p: 'pa', t: 'ta',
  m: 'ma', n: 'na', 'ñ': 'ña', s: 'sa',
  w: 'u', y: 'ya', r: 'ra', l: 'la',
  ll: 'elle', ch: 'cha', sh: 'sha', h: 'ja', j: 'ja',
  kh: 'kha', ph: 'pha', qh: 'qha', th: 'tha',
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

/**
 * Reproduce audio del fonema o palabra quechua.
 * - En plataformas nativas (Android/iOS): usa expo-speech.
 * - En web: usa window.speechSynthesis con fallback al servidor MMS-TTS local.
 * - Fonemas (≤4 chars): pronuncia la sílaba fonética quechua exacta.
 * - Palabras completas en web: intenta servidor MMS-TTS, luego fallback nativo.
 */
export async function playQuechuaAudio(text: string): Promise<void> {
  if (!text.trim()) return;

  // Extraer el fonema/palabra pura (evita leer 'Consonante k' o 'Letra ch')
  const core = extractCorePhoneme(text).toLowerCase().trim();
  const cleanText = core || text.trim().toLowerCase();

  // ── Plataforma nativa: expo-speech ──────────────────────────────────────────
  if (Platform.OS !== 'web') {
    const audioWord = cleanText.length <= 4
      ? (PHONEME_AUDIO_TEXT[cleanText] ?? cleanText)
      : cleanText;
    return new Promise<void>((resolve) => {
      Speech.speak(audioWord, {
        language: cleanText === 'sh' ? 'en-US' : 'es-PE',
        rate: 0.6,
        pitch: 1.0,
        onDone: resolve,
        onError: () => resolve(),
        onStopped: () => resolve(),
      });
    });
  }

  // ── Web: window.speechSynthesis ─────────────────────────────────────────────
  if (typeof window === 'undefined') return;

  if (cleanText.length <= 4) {
    // Caso especial 'sh': en-US pronuncia [ʃa] auténtico
    const lang = cleanText === 'sh' ? 'en-US' : 'es-PE';
    const audioWord = PHONEME_AUDIO_TEXT[cleanText] ?? cleanText;
    return new Promise<void>((resolve) => {
      const synth = (window as any).speechSynthesis;
      const Utterance = (window as any).SpeechSynthesisUtterance;
      if (!synth || !Utterance) { resolve(); return; }
      synth.cancel();
      const utter = new Utterance(cleanText === 'sh' ? 'sha' : audioWord);
      utter.lang = lang;
      utter.rate = 0.60;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      synth.speak(utter);
    });
  }

  // Palabras largas en web: servidor MMS-TTS Quechua → fallback
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch { /* ignore */ }
  }

  try {
    let audioUrl = audioCache.get(cleanText);
    if (!audioUrl) {
      const response = await fetch(
        `${VOICE_SERVICE_URL}/tts?text=${encodeURIComponent(cleanText)}`
      );
      if (!response.ok) throw new Error(`TTS server error ${response.status}`);
      const blob = await response.blob();
      audioUrl = URL.createObjectURL(blob);
      audioCache.set(cleanText, audioUrl);
    }
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.onended = () => resolve();
      audio.onerror = () => { speakSpanishFallback(cleanText); resolve(); };
      audio.play().catch(() => { speakSpanishFallback(cleanText); resolve(); });
    });
  } catch (err) {
    console.warn('Fallo TTS local MMS, usando fallback nativo:', err);
    speakSpanishFallback(cleanText);
  }
}

export function clearAudioCache(): void {
  audioCache.clear();
}

/**
 * Evalúa fonéticamente la similitud entre la voz transcrita y el texto Quechua esperado.
 * Utiliza normalización lingüística, variantes fonéticas y distancia Levenshtein.
 */
export function evaluatePronunciation(spoken: string, expected: string): PronunciationScore {
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

  // Extraer el fonema o palabra central para evitar que frases como "Consonante K" penalicen la evaluación
  const coreExpected = extractCorePhoneme(expected).toLowerCase().trim();
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
  const m = cleanSpoken.length;
  const n = cleanExpected.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (cleanSpoken[i - 1] === cleanExpected[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  const maxLength = Math.max(m, n);
  const similarity = Math.max(0, 1 - distance / maxLength);
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
  expectedWord?: string
): Promise<RecognitionResult> {
  if (typeof window === 'undefined') {
    throw new Error('SpeechRecognition solo disponible en la plataforma web.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionImpl =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionImpl) {
    throw new Error('Tu navegador no soporta reconocimiento de voz. Te recomendamos Microsoft Edge o Google Chrome.');
  }

  return new Promise((resolve, reject) => {
    let finalTranscript = '';
    let bestAlternative = '';
    let finished = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionImpl();
    recognition.lang = 'es-PE';
    // Para fonemas cortos: continuous = false para que Web Speech cierre la elocución al instante
    recognition.continuous = !isShortPhoneme;
    recognition.interimResults = true;
    recognition.maxAlternatives = 10;

    let silenceTimer: any = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    form.append('file', blob, 'clip.webm');
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.append('file', { uri, name: 'clip.m4a', type: 'audio/mp4' } as any);
  }

  let response: Response;
  try {
    response = await fetch(`${VOICE_SERVICE_URL}/stt`, { method: 'POST', body: form });
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor de voz. Verifica tu conexión o valida manualmente.'
    );
  }

  if (!response.ok) {
    throw new Error(
      `El servidor de voz no respondió correctamente (${response.status}). Intenta de nuevo o valida manualmente.`
    );
  }

  const data = await response.json();
  return {
    transcript: typeof data.transcript === 'string' ? data.transcript.trim() : '',
    confidence: typeof data.confidence === 'number' ? data.confidence : 0.7,
  };
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
  expectedWord?: string
): Promise<RecognitionResult> {
  if (Platform.OS === 'web' && lang === 'es') {
    return recognizeWithWebSpeechAPI(expectedWord);
  }

  if (lang === 'es') {
    throw new Error(
      'El reconocimiento de voz en Español en la app nativa todavía no está disponible. Usa el modo texto.'
    );
  }

  const coreExpected = expectedWord ? extractCorePhoneme(expectedWord).toLowerCase().trim() : '';
  const isShortPhoneme = Boolean(coreExpected && coreExpected.length <= 4);
  const durationMs = isShortPhoneme ? 2200 : 4000;

  const uri = await recordAudioClip(durationMs);
  return transcribeAudioClip(uri);
}

// ─── Síntesis de voz — Web Speech + expo-speech nativo ─────────────────────────

/**
 * Síntesis de voz multiplataforma.
 * En nativo usa expo-speech; en web usa window.speechSynthesis.
 */
export function speakText(text: string, _lang: Language): void {
  if (Platform.OS !== 'web') {
    Speech.speak(text, { language: 'es-ES', rate: 0.7 });
    return;
  }
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synth = (window as any).speechSynthesis;
  if (!synth) return;
  synth.cancel();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechSynthesisUtteranceImpl = (window as any).SpeechSynthesisUtterance;
  if (!SpeechSynthesisUtteranceImpl) return;
  const utter = new SpeechSynthesisUtteranceImpl(text);
  utter.lang = 'es-ES';
  utter.rate = 0.7;
  synth.speak(utter);
}

/**
 * Fallback de síntesis cuando falla el servidor MMS-TTS.
 * En nativo usa expo-speech; en web usa window.speechSynthesis.
 */
export function speakSpanishFallback(text: string): void {
  if (Platform.OS !== 'web') {
    Speech.speak(text, { language: 'es-PE', rate: 0.6, pitch: 1.0 });
    return;
  }
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synth = (window as any).speechSynthesis;
  if (!synth) return;
  synth.cancel();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Utterance = (window as any).SpeechSynthesisUtterance;
  if (!Utterance) return;
  const utter = new Utterance(text);
  utter.lang = 'es-ES';
  utter.rate = 0.6;
  utter.pitch = 1.0;
  synth.speak(utter);
}

// ─── Traducción IA via Supabase Edge Function ─────────────────────────────────

export type TranslationResponse = {
  translatedText: string;
  error: string | null;
};

export async function translateText(req: TranslationRequest): Promise<TranslationResponse> {
  try {
    const { data, error } = await supabase.functions.invoke<{ translated_text: string }>(
      'translate',
      { body: req }
    );

    if (error) return { translatedText: '', error: error.message };
    return { translatedText: data?.translated_text ?? '', error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return { translatedText: '', error: msg };
  }
}
