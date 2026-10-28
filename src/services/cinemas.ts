import { requestAxios as request } from './apiAxios';
export type Cinema = { id: string; name: string; address: string | null; lat: number; lng: number; distanceKm: number };
export type NearbyCinemas = { cinemas: Cinema[]; source: 'live' | 'cache' | 'stale'; updatedAt: string };
export const fetchNearbyCinemas = (lat: number, lng: number, radiusM = 15000): Promise<NearbyCinemas> => request('/cinemas/nearby', 'POST', { lat, lng, radiusM });
