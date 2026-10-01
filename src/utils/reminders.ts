// Avisos locales de estreno con expo-notifications (funcionan en Expo Go)
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { TmdbMovie } from '../services/tmdb';

// Para probar en clase: poné 10 y el aviso llega a los 10 segundos en vez del día del estreno
const TEST_SECONDS = 0;

export async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('estrenos', {
      name: 'Estrenos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

// Los avisos programados los guarda el sistema, así que sobreviven a cerrar la app
export async function getScheduledReminders(): Promise<Record<number, string>> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
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

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🎬 ¡Hoy se estrena!',
      body: `${movie.title} ya está en cines. ¿Vas a verla?`,
      data: { movieId: movie.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: 'estrenos',
    },
  });
}

export function cancelReminder(notificationId: string) {
  return Notifications.cancelScheduledNotificationAsync(notificationId);
}