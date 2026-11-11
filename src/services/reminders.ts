import { Platform } from 'react-native';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { getJSON, setJSON } from './localStorage';
import { getUpcoming } from './releases';
import { ensureNotificationPermission } from '../utils/reminders';

export type ReleaseReminder = { movieId: number; title: string; releaseDate: string | null; remindAt: string | null; createdAt: string; notificationId?: string };
const KEY = 'release-reminders';
const load = async () => (await getJSON<ReleaseReminder[]>(KEY)) ?? [];

export const getReleaseReminders = load;

export async function subscribeToRelease(movieId: number): Promise<ReleaseReminder> {
  const movie = (await getUpcoming()).find(m => m.id === movieId);
  if (!movie) throw new Error('No encontramos el estreno');
  const at = movie.releaseDate ? new Date(`${movie.releaseDate.slice(0, 10)}T13:00:00Z`) : null;
  let notificationId: string | undefined;
  if (at && at.getTime() > Date.now() && Platform.OS !== 'web' && (await ensureNotificationPermission()).granted) {
    notificationId = await scheduleNotificationAsync({
      content: { title: '¡Hoy se estrena!', body: `${movie.title} llega hoy a los cines.`, data: { kind: 'estreno', movieId } },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: at, channelId: 'estrenos' },
    });
  }
  const reminder = { movieId, title: movie.title, releaseDate: movie.releaseDate, remindAt: at?.toISOString() ?? null, createdAt: new Date().toISOString(), notificationId };
  await setJSON(KEY, [...(await load()).filter(r => r.movieId !== movieId), reminder]);
  return reminder;
}

export async function unsubscribeFromRelease(movieId: number): Promise<void> {
  const rows = await load();
  const row = rows.find(r => r.movieId === movieId);
  if (row?.notificationId) await cancelScheduledNotificationAsync(row.notificationId).catch(() => {});
  await setJSON(KEY, rows.filter(r => r.movieId !== movieId));
}