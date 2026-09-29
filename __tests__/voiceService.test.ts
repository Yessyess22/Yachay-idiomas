jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/src/services/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
  },

}));
jest.mock('expo-audio', () => ({
  AudioModule: { AudioRecorder: jest.fn(), AudioPlayer: jest.fn() },
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  createAudioPlayer: jest.fn().mockReturnValue({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  }),
}));

import { evaluatePronunciation, translateText, buildTeachingAudioText } from '@/src/services/voiceService';

describe('voiceService - Evaluación de Pronunciación', () => {
  test('Evalúa coincidencia exacta con 100% de score', () => {
    const result = evaluatePronunciation('Allillanchu', 'Allillanchu');
    expect(result.score).toBe(100);
    expect(result.isPass).toBe(true);
    expect(result.feedback).toContain('Allinmi');
  });

  test('Evalúa diferencias menores de mayúsculas y acentuación como aprobadas', () => {
    const result = evaluatePronunciation('allillanmi', 'Allillanmi');
    expect(result.score).toBe(100);
    expect(result.isPass).toBe(true);
  });

  test('Detecta errores fonéticos y asigna score proporcional', () => {
    // Alilanchu vs Allillanchu (falta 'l')
    const result = evaluatePronunciation('alilanchu', 'Allillanchu');
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.isPass).toBe(true);
  });

  test('Rechaza palabras completamente distintas o erróneas', () => {
    const result = evaluatePronunciation('hola amigo', 'Allillanchu');
    expect(result.score).toBeLessThan(50);
    expect(result.isPass).toBe(false);
    expect(result.feedback).toBeDefined();
  });

  test('Maneja audio vacío o silencio', () => {
    const result = evaluatePronunciation('', 'Allillanchu');
    expect(result.score).toBe(0);
    expect(result.isPass).toBe(false);
    expect(result.feedback).toContain('No se detectó audio');
  });

  test('Evalúa fonemas y vocales individuales correctamente (ej. "a", "ah", "la a")', () => {
    const r1 = evaluatePronunciation('a', 'a');
    expect(r1.score).toBe(100);
    expect(r1.isPass).toBe(true);

    const r2 = evaluatePronunciation('ah', 'a');
    expect(r2.score).toBe(100);
    expect(r2.isPass).toBe(true);

    const r3 = evaluatePronunciation('la vocal a', 'a');
    expect(r3.score).toBe(100);
    expect(r3.isPass).toBe(true);
  });

  test('Evalúa consonantes Achahala correctamente (ej. "qa" o "ka" para "q")', () => {
    const r1 = evaluatePronunciation('qa', 'q');
    expect(r1.score).toBe(100);
    expect(r1.isPass).toBe(true);

    const r2 = evaluatePronunciation('cha', 'ch');
    expect(r2.score).toBe(100);
    expect(r2.isPass).toBe(true);

    const r3 = evaluatePronunciation('kwa', 'q');
    expect(r3.score).toBe(100);
    expect(r3.isPass).toBe(true);

    const r4 = evaluatePronunciation('she', 'sh');
    expect(r4.score).toBe(100);
    expect(r4.isPass).toBe(true);

    const r5 = evaluatePronunciation('hua', 'w');
    expect(r5.score).toBe(100);
    expect(r5.isPass).toBe(true);

    const r6 = evaluatePronunciation('ya', 'll');
    expect(r6.score).toBe(100);
    expect(r6.isPass).toBe(true);
  });
});

describe('voiceService - Traducción de Texto (Español ↔ Quechua)', () => {
  test('Traduce palabras comunes de Español a Quechua en el diccionario local', async () => {
    const r1 = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'hola' });
    expect(r1.translatedText).toBe('Allinllachu');
    expect(r1.error).toBeNull();

    const r2 = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'gracias' });
    expect(r2.translatedText).toBe('Añay');

    const r3 = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'casa' });
    expect(r3.translatedText).toBe('Wasi');
  });

  test('Traduce palabras comunes de Quechua a Español en el diccionario local', async () => {
    const r1 = await translateText({ source_lang: 'qu', target_lang: 'es', source_text: 'Inti' });
    expect(r1.translatedText).toBe('Sol');

    const r2 = await translateText({ source_lang: 'qu', target_lang: 'es', source_text: 'Allqo' });
    expect(r2.translatedText).toBe('Perro');
  });

  test('Traduce vocabulario de las lecciones aunque se consulte con signos', async () => {
    const result = await translateText({ source_lang: 'qu', target_lang: 'es', source_text: 'Allin.' });
    expect(result.translatedText.toLowerCase()).toContain('bueno');
    expect(result.error).toBeNull();
  });

  test('Traduce expresiones de afecto como "te quiero" y "te amo" bidireccionalmente', async () => {
    const r1 = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'te quiero' });
    expect(r1.translatedText).toBe('Munakuyki');
    expect(r1.error).toBeNull();

    const r2 = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'te amo' });
    expect(r2.translatedText).toBe('Munakuyki');

    const r3 = await translateText({ source_lang: 'qu', target_lang: 'es', source_text: 'Munakuyki' });
    expect(r3.translatedText.toLowerCase()).toContain('te quiero');

    const r4 = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'te quiero mucho' });
    expect(r4.translatedText).toBe('Anchatam munakuyki');
  });

  test('Traduce el código moral inca (Ama sua, ama llulla, ama qilla) en todas sus variantes', async () => {
    // Con comas y puntuación
    const r1 = await translateText({
      source_lang: 'qu',
      target_lang: 'es',
      source_text: 'ama sua, ama llulla, ama qilla',
    });
    expect(r1.translatedText).toContain('No seas ladrón');
    expect(r1.translatedText).toContain('mentiroso');
    expect(r1.translatedText).toContain('ocioso');
    expect(r1.error).toBeNull();

    // Sin comas (como lo escribió el usuario)
    const r2 = await translateText({
      source_lang: 'qu',
      target_lang: 'es',
      source_text: 'ama sua ama llulla ama qilla',
    });
    expect(r2.translatedText).toContain('No seas ladrón');

    // Variaciones ortográficas quechuas (suwa / qhilla)
    const r3 = await translateText({
      source_lang: 'qu',
      target_lang: 'es',
      source_text: 'ama suwa, ama llulla, ama qhilla',
    });
    expect(r3.translatedText).toContain('No seas ladrón');

    // Preceptos individuales
    const rSua = await translateText({ source_lang: 'qu', target_lang: 'es', source_text: 'ama sua' });
    expect(rSua.translatedText.toLowerCase()).toContain('ladrón');

    const rLlulla = await translateText({ source_lang: 'qu', target_lang: 'es', source_text: 'ama llulla' });
    expect(rLlulla.translatedText.toLowerCase()).toContain('mentiroso');

    const rQilla = await translateText({ source_lang: 'qu', target_lang: 'es', source_text: 'ama qilla' });
    expect(rQilla.translatedText.toLowerCase()).toContain('ocioso');
  });

  test('Traduce con artículos en español eliminados ("el perro" -> "Allqu", "la casa" -> "Wasi")', async () => {
    const rPerro = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'el perro' });
    expect(rPerro.translatedText).toBe('Allqu');

    const rCasa = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'la casa' });
    expect(rCasa.translatedText).toBe('Wasi');
  });

  test('Distingue correctamente "papá" (padre) y "papa" (tubérculo)', async () => {
    const rPapaConAcento = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'papá' });
    expect(rPapaConAcento.translatedText).toBe('Tayta');

    const rPapaSinAcento = await translateText({ source_lang: 'es', target_lang: 'qu', source_text: 'papa' });
    expect(rPapaSinAcento.translatedText).toBe('Papa');
  });
});

describe('voiceService - Texto Fonético para Enseñanza Achahala', () => {
  test('Aisla y pronuncia únicamente la letra en tarjetas con ejemplo entre paréntesis', () => {
    expect(buildTeachingAudioText('CH (Chaki)')).toBe('cha');
    expect(buildTeachingAudioText('A (Allqu)')).toBe('a');
    expect(buildTeachingAudioText('H (Hatun)')).toBe('ha');
    expect(buildTeachingAudioText('LL (Llaqta)')).toBe('lla');
    expect(buildTeachingAudioText('Q (Quri)')).toBe('qa');
    expect(buildTeachingAudioText("CH' (Ch'aska)")).toBe("ch'a");
  });

  test('Mantiene intacta la palabra cuando no hay paréntesis de ejemplo salvo corrección fonética', () => {
    expect(buildTeachingAudioText('Allillanchu')).toBe('Allillanchu');
    expect(buildTeachingAudioText('Tupananchiskama')).toBe('Tupananchiskama');
    expect(buildTeachingAudioText('Inti')).toBe('intí');
  });
});
