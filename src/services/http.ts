import { getToken, expireSession } from './session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { resolveApiUrl } from './apiUrl';
const BASE = resolveApiUrl({
  configuredUrl: process.env.EXPO_PUBLIC_API_URL,
  development: __DEV__,
  expoHost: Constants.expoConfig?.hostUri,
  browserHostname: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.hostname : undefined,
});
export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}
export async function request(path: string, method = 'GET', body?: unknown): Promise<any> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { method, headers: {
      Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  } catch { throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.', 0); }
  if (response.status === 204) return;
  const result = await response.json().catch(() => null);
  if (response.status === 401 && token && !['/auth/login', '/auth/register'].includes(path)) await expireSession(token);
  if (!response.ok) throw new ApiError(result?.error ?? 'No se pudo completar la operación', response.status, result?.code);
  const origin = new URL(BASE).origin;
  const resolveMedia = (value: any): any => {
    if (Array.isArray(value)) return value.map(resolveMedia);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key,
      ['url', 'photo', 'posterUrl', 'backdropUrl'].includes(key) && typeof child === 'string' && child.startsWith('/media/') ? origin + child : resolveMedia(child)]));
    return value;
  };
  return resolveMedia(result);
}
