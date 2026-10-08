import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { mockLogin, mockRegister, mockUpdateUser } from '../mockData';

export type User = { id: number; name: string; email: string; role: string };
type AuthState = { user: User | null; isFetching: boolean; isLoggedIn: boolean };
type Result = { success: boolean; error?: string };

type AuthContextValue = {
  user: AuthState;
  handleLogin: (credentials: { email: string; password: string }) => Promise<Result>;
  handleRegister: (info: { name: string; email: string; password: string }) => Promise<Result>;
  logOut: () => void;
  updateUser: (data: { name: string; email: string }) => Promise<Result>;

};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const loggedOut: AuthState = { user: null, isFetching: false, isLoggedIn: false };

// Sesión: la lee casi toda la app y cambia muy poco (login / logout)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState>(loggedOut);

  // Login y registro comparten el mismo flujo (antes estaba duplicado)
  async function authenticate(request: () => Promise<User>): Promise<Result> {
    setUser((current) => ({ ...current, isFetching: true }));
    try {
      const nextUser = await request();
      setUser({ user: nextUser, isFetching: false, isLoggedIn: true });
      return { success: true };
    } catch (error) {
      setUser((current) => ({ ...current, isFetching: false }));
      return { success: false, error: error.message };
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      handleLogin: (credentials) => authenticate(() => mockLogin(credentials)),
      handleRegister: (info) => authenticate(() => mockRegister(info)),
      logOut: () => setUser(loggedOut),
      updateUser: async (data) => {
        try {
          const updated = await mockUpdateUser(user.user!.id, data);
          setUser((current) => ({ ...current, user: updated }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}