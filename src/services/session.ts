import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const KEY = 'whatnext.session';
let token: string | null = null;
export const getToken = () => token;
export async function loadToken() {
  token = Platform.OS === 'web' ? globalThis.localStorage?.getItem(KEY) ?? null : await SecureStore.getItemAsync(KEY);
  return token;
}
export async function saveToken(value: string | null) {
  token = value;
  if (Platform.OS === 'web') {
    if (value) globalThis.localStorage?.setItem(KEY, value);
    else globalThis.localStorage?.removeItem(KEY);
  } else if (value) await SecureStore.setItemAsync(KEY, value);
  else await SecureStore.deleteItemAsync(KEY);
}

const listeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export async function expireSession() {
  await saveToken(null);
  for (const listener of listeners) listener();
}
