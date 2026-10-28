import { request } from './http';
export type ReleaseMovie = {
  id: number; title: string; overview: string; releaseDate: string;
  posterUrl: string | null; rating: number | '-';
};
// Both lists are snapshots saved by the backend's daily TMDB job.
export const getNowPlaying = (): Promise<ReleaseMovie[]> => request('/releases/now-playing');
export const getUpcoming = (): Promise<ReleaseMovie[]> => request('/releases/upcoming');
