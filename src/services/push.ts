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
  if (Platform.OS === 'web') return 'Las notificaciones push se activan desde la app instalada en tu teléfono.';
  if (Constants.appOwnership === 'expo') return 'Expo Go permite guardar avisos, pero no recibir notificaciones push. Para recibirlas, instalá la versión de desarrollo de WhatNext.';
  if (!Device.isDevice) return 'Probá las notificaciones en un teléfono físico con la versión de desarrollo de WhatNext.';
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) return 'Las notificaciones todavía no están habilitadas para esta versión de WhatNext.';
  return '';
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
export async function listenToPushTaps(onMovie: (id: number) => void) {
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') return () => {};
  const { addNotificationResponseReceivedListener, getLastNotificationResponseAsync, clearLastNotificationResponseAsync } = await import('expo-notifications');
  const consume = (response: any) => {
    const id = response?.notification?.request?.content?.data?.movieId;
    if (Number.isInteger(id) && id > 0) { onMovie(id); void clearLastNotificationResponseAsync(); }
  };
  const listener = addNotificationResponseReceivedListener(consume);
  consume(await getLastNotificationResponseAsync());
  return () => listener.remove();
}
