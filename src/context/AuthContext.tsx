import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../services/api';
import { loadToken, saveToken, onSessionExpired } from '../services/session';
export type User = { id: number; name: string; email: string; role: string; reposts: number[]; likes: number[] };
type AuthState = { user: User | null; isFetching: boolean; isLoggedIn: boolean };
type Result = { success: boolean; error?: string; code?: string };
type AuthContextValue = {
  user: AuthState;
  handleLogin: (credentials: { email: string; password: string }) => Promise<Result>;
  handleRegister: (info: { name: string; email: string; password: string }) => Promise<Result>;
  logOut: () => Promise<void>;
  updateUser: (data: { name: string; email: string }) => Promise<Result>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const loggedOut: AuthState = { user: null, isFetching: false, isLoggedIn: false };
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState>({ ...loggedOut, isFetching: true });
  useEffect(() => onSessionExpired(() => setUser(loggedOut)), []);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await loadToken();
        const restored = token ? await api.getSession() : null;
        if (active) setUser({ user: restored, isFetching: false, isLoggedIn: !!restored });
      } catch (e) {
        // Keep the stored session on transient network failures, so a restart can retry.
        if (e instanceof api.ApiError && e.status === 401) await saveToken(null);
        if (active) setUser(loggedOut);
      }
    })();
    return () => { active = false; };
  }, []);
  async function authenticate(request: () => Promise<any>): Promise<Result> {
    setUser(current => ({ ...current, isFetching: true }));
    try {
      const result = await request();
      await saveToken(result.token);
      setUser({ user: result.user, isFetching: false, isLoggedIn: true });
      return { success: true };
    } catch (e) {
      setUser(current => ({ ...current, isFetching: false }));
      return { success: false, error: e.message, code: e.code };
    }
  }
  const value = useMemo<AuthContextValue>(() => ({
    user,
    handleLogin: credentials => authenticate(() => api.login(credentials)),
    handleRegister: info => authenticate(() => api.register(info)),
    logOut: async () => {
      // Keep the session until the server confirms revocation; the Settings screen shows failures.
      await api.logout();
      await saveToken(null);
      setUser(loggedOut);
    },
    updateUser: async data => {
      try {
        const updated = await api.updateUser(user.user!.id, data);
        setUser(current => ({ ...current, user: updated }));
        return { success: true };
      } catch (e) { return { success: false, error: e.message }; }
    },
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
