import { notificationsUnavailable } from '../utils/notificationFeedback';
import { pushDestination, type PushDestination } from '../utils/pushDestination';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { request } from './http';
import { getToken } from './session';
import { clearForeignReleaseReminders, configureChannel, ensureNotificationPermission } from '../utils/reminders';
import { getPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
let registration: Promise<boolean> | null = null;
export function pushUnavailableReason() {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  return Platform.OS === 'web' || Constants.appOwnership === 'expo' || !Device.isDevice || !projectId
    ? notificationsUnavailable : '';
}
export async function registerDevicePush(askPermission = false): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  // Remove the old locally scheduled reminders, since the server is now responsible for delivery.
  await clearForeignReleaseReminders(undefined);
  if (!getToken()) return false;
  const unavailable = pushUnavailableReason();
  if (unavailable) { if (askPermission) throw new Error(unavailable); return false; }
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  await configureChannel();
  const permission = askPermission ? await ensureNotificationPermission() : await getPermissionsAsync();
  const stored = await SecureStore.getItemAsync('whatnext.push.installation');
  if (!permission.granted) {
    if (stored) { const identity = JSON.parse(stored); await request(`/push/devices/${identity.id}`, 'DELETE', { secret: identity.secret }); }
    return false;
  }
  if (registration) return registration;
  registration = (async () => {
    const identity = stored ? JSON.parse(stored) : { id: Crypto.randomUUID(), secret: Array.from(await Crypto.getRandomBytesAsync(32), byte => byte.toString(16).padStart(2, '0')).join('') };
    if (!stored) await SecureStore.setItemAsync('whatnext.push.installation', JSON.stringify(identity));
    const { getExpoPushTokenAsync } = await import('expo-notifications/build/getExpoPushTokenAsync');
    const token = (await getExpoPushTokenAsync({ projectId })).data;
    await request('/push/devices', 'PUT', { ...identity, token, platform: Platform.OS });
    return true;
  })();
  try { return await registration; } finally { registration = null; }
}
export async function listenToPushTaps(onDestination: (destination: PushDestination) => void) {
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') return () => {};
  const { addNotificationResponseReceivedListener, getLastNotificationResponseAsync, clearLastNotificationResponseAsync } = await import('expo-notifications');
  const consume = (response: any) => {
    const destination = pushDestination(response?.notification?.request?.content?.data);
    if (destination) { onDestination(destination); void clearLastNotificationResponseAsync(); }
  };
  const listener = addNotificationResponseReceivedListener(consume);
  consume(await getLastNotificationResponseAsync());
  return () => listener.remove();
}
