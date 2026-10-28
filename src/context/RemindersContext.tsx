import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { getToken } from '../services/session';
import * as api from '../services/reminders';
import { clearForeignReleaseReminders } from '../utils/reminders';
import { registerDevicePush } from '../services/push';
type RemindersContextValue = {
  reminders: api.ReleaseReminder[]; busy: number[]; error: string; deviceError: string;
  refresh: () => Promise<boolean>;
  toggle: (movieId: number) => Promise<{ subscribed: boolean; deviceEnabled: boolean; deviceError?: string }>;
};
const RemindersContext = createContext<RemindersContextValue | undefined>(undefined);
export function RemindersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user.user?.id;
  const viewer = useRef(userId); viewer.current = userId;
  const version = useRef(0), pending = useRef(new Set<number>());
  const [reminders, setReminders] = useState<api.ReleaseReminder[]>([]);
  const [busy, setBusy] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [deviceError, setDeviceError] = useState('');
  const refresh = useCallback(async () => {
    if (!userId) return false;
    const current = ++version.current;
    try {
      const rows = await api.getReleaseReminders();
      if (viewer.current !== userId || current !== version.current) return false;
      setReminders(rows); setError('');
      try { const enabled = await registerDevicePush(false); if (viewer.current === userId) setDeviceError(!enabled && rows.length && Platform.OS !== 'web' ? 'Tus avisos están guardados. Las notificaciones no están activas en este dispositivo.' : ''); return enabled; }
      catch { if (viewer.current === userId) setDeviceError('Tus avisos están guardados. No pudimos registrar las notificaciones push de este dispositivo.'); }
    } catch (e) { if (viewer.current === userId && current === version.current) setError(e.message); }
    return false;
  }, [userId]);
  useEffect(() => {
    // Wait for session restoration before loading account subscriptions.
    if ((!userId && user.isFetching) || (!userId && getToken())) return;
    setReminders([]); setError(''); setDeviceError(''); pending.current.clear(); setBusy([]);
    ++version.current;
    // Clean up legacy local alerts during migration to server push.
    void clearForeignReleaseReminders(userId).catch(() => {});
    void refresh();
    const listener = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => listener.remove();
  }, [refresh, user.isFetching]);
  async function toggle(movieId: number) {
    if (!userId) throw new Error('Iniciá sesión para guardar un aviso');
    if (pending.current.has(movieId)) throw new Error('El aviso se está guardando');
    ++version.current;
    pending.current.add(movieId); setBusy([...pending.current]);
    const subscribed = !reminders.some(r => r.movieId === movieId);
    try {
      const saved = subscribed ? await api.subscribeToRelease(movieId) : null;
      if (!subscribed) await api.unsubscribeFromRelease(movieId);
      if (viewer.current !== userId) return { subscribed, deviceEnabled: false };
      // Keep the saved subscription even if push registration fails.
      const nextRows = saved ? [...reminders.filter(r => r.movieId !== movieId), saved] : reminders.filter(r => r.movieId !== movieId);
      setReminders(nextRows);
      let enabled = false, localError = '';
      try {
        if (subscribed) enabled = await registerDevicePush(true);
        else await clearForeignReleaseReminders(undefined);
      }
      catch { localError = subscribed
        ? 'El aviso está guardado, pero no pudimos activar la notificación en este dispositivo.'
        : 'La suscripción se eliminó, pero no pudimos quitar la notificación de este dispositivo. Volvé a abrir la app para reintentar.'; }
      const synced = await refresh();
      if (synced) localError = '';
      if (localError && viewer.current === userId) setDeviceError(localError);
      if (enabled && !synced) localError ||= 'El aviso está guardado. No pudimos sincronizar la notificación de este dispositivo.';
      return { subscribed, deviceEnabled: enabled && synced, deviceError: localError || undefined };
    } finally {
      if (viewer.current === userId) { pending.current.delete(movieId); setBusy([...pending.current]); }
    }
  }
  return <RemindersContext.Provider value={{ reminders, busy, error, deviceError, refresh, toggle }}>{children}</RemindersContext.Provider>;
}
export function useReminders() {
  const context = useContext(RemindersContext);
  if (!context) throw new Error('useReminders must be used inside RemindersProvider');
  return context;
}
