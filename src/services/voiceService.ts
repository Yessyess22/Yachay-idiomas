import { Language, TranslationRequest } from '@/src/types';
import { supabase } from '@/src/services/supabase';

export type RecognitionResult = {
  transcript: string;
  confidence: number;
};

// ─── Reconocimiento de voz ────────────────────────────────────────────────────

/**
 * Inicia la grabación de voz y devuelve el texto transcrito.
 * Usa la Web Speech API disponible en Chrome/Edge en expo-web.
 * Se accede via `any` porque `SpeechRecognition` no está en el lib de RN.
 */
export async function startVoiceRecognition(_lang: Language): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('SpeechRecognition solo disponible en la plataforma web.'));
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionImpl = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      reject(new Error('SpeechRecognition no está disponible en este navegador.'));
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionImpl();
    recognition.lang = 'es-BO';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const result = event.results[0][0];
      resolve({ transcript: result.transcript as string, confidence: result.confidence as number });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      reject(new Error(`Error de reconocimiento: ${event.error}`));
    };

    recognition.start();
  });
}

// ─── Síntesis de voz ──────────────────────────────────────────────────────────

/** Sintetiza texto en voz usando la Web Speech Synthesis API. */
export function speakText(text: string, lang: Language): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synth = (window as any).speechSynthesis;
  if (!synth) return;
  synth.cancel();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechSynthesisUtteranceImpl = (window as any).SpeechSynthesisUtterance;
  if (!SpeechSynthesisUtteranceImpl) return;
  const utter = new SpeechSynthesisUtteranceImpl(text);
  utter.lang = lang === 'es' ? 'es-BO' : 'es-BO';
  utter.rate = 0.9;
  synth.speak(utter);
}

// ─── Traducción IA via Supabase Edge Function ─────────────────────────────────

export type TranslationResponse = {
  translatedText: string;
  error: string | null;
};

/**
 * Llama a la Edge Function `translate` en Supabase para traducir texto.
 * El payload sigue el tipo TranslationRequest definido en src/types.
 */
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
