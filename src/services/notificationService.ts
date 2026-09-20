/**
 * notificationService.ts
 * Gestiona las notificaciones locales de recordatorio de racha diaria.
 * Usa expo-notifications, compatible con Android e iOS nativos.
 * En la plataforma web no hace nada (notificaciones web requieren SW).
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const STREAK_CHANNEL_ID = 'yachay_racha';
const STREAK_NOTIFICATION_ID = 'streak_reminder';

// Configurar cómo se muestran las notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Solicita permiso de notificaciones al usuario.
 * Solo actúa en plataformas nativas (Android/iOS).
 * Devuelve true si el permiso fue concedido.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(STREAK_CHANNEL_ID, {
        name: 'Recordatorio de Racha',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B8B8C',
      });
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.warn('[notificationService] No se pudieron solicitar permisos:', err);
    return false;
  }
}

/**
 * Programa un recordatorio de racha para las 19:00 de hoy.
 * Si ya pasaron las 19:00, lo programa para mañana.
 * Cancela cualquier recordatorio previo antes de crear el nuevo.
 */
export async function scheduleStreakReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    // Cancelar cualquier recordatorio anterior
    await cancelStreakReminder();

    const now = new Date();
    const trigger = new Date();
    trigger.setHours(19, 0, 0, 0);

    // Si ya pasó la hora de hoy, programar para mañana
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_NOTIFICATION_ID,
      content: {
        title: '🔥 Yachi te extraña',
        body: '¡No pierdas tu racha! Practica Quechua unos minutos antes de que se acabe el día.',
        data: { type: 'streak_reminder' },
        ...(Platform.OS === 'android' && { channelId: STREAK_CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
  } catch (err) {
    console.warn('[notificationService] No se pudo programar el recordatorio:', err);
  }
}

/**
 * Cancela el recordatorio de racha (cuando el usuario ya practicó hoy).
 */
export async function cancelStreakReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIFICATION_ID);
  } catch {
    // Ignorar si no existía
  }
}
