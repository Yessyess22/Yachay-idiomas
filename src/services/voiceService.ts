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
 * - Extrae el fonema real para no pronunciar texto explicativo en español.
 * - Fonemas y letras (≤4 chars): pronuncia la sílaba quechua exacta
 *   con velocidad clara y articulación precisa.
 * - Palabras completas: servidor MMS-TTS Quechua con fallback nativo.
 */
export async function playQuechuaAudio(text: string): Promise<void> {
  if (typeof window === 'undefined' || !text.trim()) return;

  // Extraer el fonema/palabra pura (evita leer 'Consonante k' o 'Letra ch')
  const core = extractCorePhoneme(text).toLowerCase().trim();
  const cleanText = core || text.trim().toLowerCase();

  // Para fonemas y consonantes: pronunciar la sílaba fonética Quechua
  if (cleanText.length <= 4) {
    // Caso especial 'sh': la voz en español dice 'saa', la voz en-US pronuncia 'sha' [ʃa] auténtico
    if (cleanText === 'sh') {
      return new Promise<void>((resolve) => {
        const synth = (window as any).speechSynthesis;
        const Utterance = (window as any).SpeechSynthesisUtterance;
        if (!synth || !Utterance) { resolve(); return; }
        synth.cancel();
        const utter = new Utterance('sha');
        utter.lang = 'en-US';
        utter.rate = 0.65;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        synth.speak(utter);
      });
    }

    const audioWord = PHONEME_AUDIO_TEXT[cleanText] ?? cleanText;
    return new Promise<void>((resolve) => {
      const synth = (window as any).speechSynthesis;
      const Utterance = (window as any).SpeechSynthesisUtterance;
      if (!synth || !Utterance) { resolve(); return; }
      synth.cancel();
      const utter = new Utterance(audioWord);
      utter.lang = 'es-PE'; // Acento andino peruano o es-ES
      utter.rate = 0.60;   // Velocidad ideal para aprendizaje
      utter.pitch = 1.0;
      utter.volume = 1.0;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      synth.speak(utter);
    });
  }

  // Para palabras más largas: intentar servidor MMS-TTS Quechua.
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch { /* ignore */ }
  }

  try {
    let audioUrl = audioCache.get(cleanText);

    if (!audioUrl) {
      const response = await fetch(
        `http://localhost:8000/tts?text=${encodeURIComponent(cleanText)}`
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
 * Inicia la grabación de voz y devuelve el texto real pronunciado por el usuario.
 * Para fonemas y consonantes (longitud <= 4), desactiva continuous para respuesta instantánea.
 * Utiliza hasta 10 alternativas fonéticas para capturar la articulación exacta.
 */
export async function startVoiceRecognition(
  _lang: Language = 'qu',
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

// ─── Síntesis de voz Web Speech Fallback ───────────────────────────────────────

export function speakText(text: string, _lang: Language): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synth = (window as any).speechSynthesis;
  if (!synth) return;
  synth.cancel();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechSynthesisUtteranceImpl = (window as any).SpeechSynthesisUtterance;
  if (!SpeechSynthesisUtteranceImpl) return;
  const utter = new SpeechSynthesisUtteranceImpl(text);
  utter.lang = 'es-ES'; // es-ES funciona en Edge, Chrome y Firefox
  utter.rate = 0.7;
  synth.speak(utter);
}

/**
 * Fallback de síntesis en español para palabras quechuas cuando falla MMS-TTS.
 * Usa velocidad lenta para mayor claridad pedagógica.
 */
export function speakSpanishFallback(text: string): void {
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
