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
  AudioModule: { AudioRecorder: jest.fn() },
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

import { evaluatePronunciation } from '@/src/services/voiceService';

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

