// Avisos locales de estreno con expo-notifications (funcionan en Expo Go)
import { Platform } from 'react-native';
// Importamos solo las partes locales: el index de expo-notifications carga el registro de push,
// que en Expo Go para Android tira error apenas se importa (desde SDK 53).
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import type { TmdbMovie } from '../services/tmdb';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';

// Para probar en clase: poné 10 y el aviso llega a los 10 segundos en vez del día del estreno
const TEST_SECONDS = 10;

export async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('estrenos', {
      name: 'Estrenos',
      importance: AndroidImportance.HIGH,
    });
  }
  const current = await getPermissionsAsync();
  if (current.granted) return true;
  const request = await requestPermissionsAsync();
  return request.granted;
}

// Los avisos programados los guarda el sistema, así que sobreviven a cerrar la app
export async function getScheduledReminders(): Promise<Record<number, string>> {
  const all = await getAllScheduledNotificationsAsync();
  const map: Record<number, string> = {};
  all.forEach((n) => {
    const movieId = n.content.data?.movieId;
    if (movieId) map[Number(movieId)] = n.identifier;
  });
  return map;
}

export function scheduleReleaseReminder(movie: TmdbMovie) {
  let date = new Date(`${movie.releaseDate}T10:00:00`); // 10 AM del día del estreno
  if (TEST_SECONDS > 0 || date.getTime() <= Date.now()) {
    date = new Date(Date.now() + Math.max(TEST_SECONDS, 5) * 1000);
  }

  return scheduleNotificationAsync({
    content: {
      title: '🎬 ¡Hoy se estrena!',
      body: `${movie.title} ya está en cines. ¿Vas a verla?`,
      data: { movieId: movie.id },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date,
      channelId: 'estrenos',
    },
  });
}
export function configureNotifications() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function cancelReminder(notificationId: string) {
  return cancelScheduledNotificationAsync(notificationId);
}
