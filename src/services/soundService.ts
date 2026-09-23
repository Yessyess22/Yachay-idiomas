/**
 * soundService.ts
 * Efectos de sonido cortos de feedback (acierto, error, lección completada,
 * selección) usando expo-audio. La preferencia de silenciado se persiste en
 * AsyncStorage y se cachea en memoria tras la primera lectura.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

const SOUND_ENABLED_KEY = 'yachay_sound_enabled';

const SOUND_SOURCES = {
  correct: require('../../assets/sounds/correct.wav'),
  incorrect: require('../../assets/sounds/incorrect.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  tap: require('../../assets/sounds/tap.wav'),
} as const;

type SoundName = keyof typeof SOUND_SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let enabledCache: boolean | null = null;

function getPlayer(name: SoundName): AudioPlayer | null {
  try {
    if (!players[name]) {
      players[name] = createAudioPlayer(SOUND_SOURCES[name]);
    }
    return players[name]!;
  } catch (err) {
    console.warn('[soundService] No se pudo cargar el sonido:', name, err);
    return null;
  }
}

/**
 * Indica si los efectos de sonido están activados (por defecto sí).
 */
export async function isSoundEnabled(): Promise<boolean> {
  if (enabledCache !== null) return enabledCache;
  try {
    const raw = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    enabledCache = raw === null ? true : raw === '1';
  } catch (err) {
    console.warn('[soundService] No se pudo leer la preferencia de sonido:', err);
    enabledCache = true;
  }
  return enabledCache;
}

/**
 * Activa o desactiva los efectos de sonido y persiste la preferencia.
 */
export async function setSoundEnabled(enabled: boolean): Promise<void> {
  enabledCache = enabled;
  try {
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled ? '1' : '0');
  } catch (err) {
    console.warn('[soundService] No se pudo guardar la preferencia de sonido:', err);
  }
}

async function playSound(name: SoundName): Promise<void> {
  if (!(await isSoundEnabled())) return;
  const player = getPlayer(name);
  if (!player) return;
  try {
    await player.seekTo(0);
    player.play();
  } catch (err) {
    console.warn('[soundService] No se pudo reproducir el sonido:', name, err);
  }
}

export const playCorrectSound = () => playSound('correct');
export const playIncorrectSound = () => playSound('incorrect');
export const playCompleteSound = () => playSound('complete');
export const playTapSound = () => playSound('tap');
