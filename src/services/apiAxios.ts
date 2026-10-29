import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { resolveApiUrl } from './apiUrl';
import { getToken, expireSession } from './session';
import { ApiError } from './http';

const apiAxios = axios.create({
  baseURL: resolveApiUrl({
    configuredUrl: process.env.EXPO_PUBLIC_API_URL,
    development: __DEV__,
    expoHost: Constants.expoConfig?.hostUri,
    browserHostname: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.hostname : undefined,
  }),
  timeout: 20000,
});
apiAxios.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiAxios.interceptors.response.use(response => response, async error => {
  const status = error.response?.status ?? 0;
  if (status === 401 && getToken()) await expireSession();
  throw new ApiError(error.response?.data?.error ?? (status === 0
    ? 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
    : 'No se pudo completar la operación'), status, error.response?.data?.code);
});
export async function requestAxios(path: string, method = 'GET', body?: unknown, timeout?: number): Promise<any> {
  const response = await apiAxios.request({ url: path, method, data: body, ...(timeout ? { timeout } : {}) });
  return response.data;
}
