import { request } from './http';
export type ReleaseReminder = { movieId: number; title: string; releaseDate: string | null; remindAt: string | null; createdAt: string };
export const getReleaseReminders = (): Promise<ReleaseReminder[]> => request('/reminders');
export const subscribeToRelease = (movieId: number): Promise<ReleaseReminder> => request(`/reminders/${movieId}`, 'PUT');
export const unsubscribeFromRelease = (movieId: number): Promise<void> => request(`/reminders/${movieId}`, 'DELETE');
