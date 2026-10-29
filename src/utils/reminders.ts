import { Platform } from 'react-native';
// Import local APIs only: the package index also initializes remote push registration.
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { foreignReleaseReminders } from './releaseReminderPlan';

export async function configureChannel() {
  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('estrenos', { name: 'Estrenos', importance: AndroidImportance.HIGH });
    await setNotificationChannelAsync('actividad', { name: 'Amistades y reseñas', importance: AndroidImportance.HIGH });
  }
}
export async function ensureNotificationPermission() {
  if (Platform.OS === 'web') return { granted: false, canAskAgain: false };
  await configureChannel();
  const current = await getPermissionsAsync();
  if (current.granted || !current.canAskAgain) return current;
  return requestPermissionsAsync();
}
let queue: Promise<unknown> = Promise.resolve();
export function clearForeignReleaseReminders(userId?: number) {
  const work = queue.catch(() => {}).then(async () => {
    if (Platform.OS === 'web') return;
    const scheduled = await getAllScheduledNotificationsAsync();
    const ids = foreignReleaseReminders(scheduled.map(n => ({ id: n.identifier, body: n.content.body, data: n.content.data })), userId);
    for (const id of ids) await cancelScheduledNotificationAsync(id);
  });
  queue = work;
  return work;
}
export function configureNotifications() {
  if (Platform.OS === 'web') return;
  setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
}
