import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const KEY = 'whatnext.session';
let token: string | null = null;
let revision = 0;
let storageQueue: Promise<void> = Promise.resolve();
export const getToken = () => token;
export async function loadToken() {
  const current = revision;
  await storageQueue.catch(() => {});
  const stored = Platform.OS === 'web' ? globalThis.localStorage?.getItem(KEY) ?? null : await SecureStore.getItemAsync(KEY);
  if (current === revision) token = stored;
  return token;
}
export async function saveToken(value: string | null) {
  token = value;
  ++revision;
  const write = storageQueue.catch(() => {}).then(async () => {
    if (Platform.OS === 'web') {
      if (value) globalThis.localStorage?.setItem(KEY, value);
      else globalThis.localStorage?.removeItem(KEY);
    } else if (value) await SecureStore.setItemAsync(KEY, value);
    else await SecureStore.deleteItemAsync(KEY);
  });
  storageQueue = write;
  await write;
}

const listeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export async function expireSession(expectedToken: string | null = token) {
  if (!expectedToken || token !== expectedToken) return;
  const clearing = saveToken(null);
  const expiredRevision = revision;
  await clearing;
  if (revision !== expiredRevision) return;
  for (const listener of listeners) listener();
}
