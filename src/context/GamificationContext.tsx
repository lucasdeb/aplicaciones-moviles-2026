import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockGetAchievements } from '../mockData';
import { useAuth } from './AuthContext';

type AchievementsState = {
  list: any[];
  totalPoints: number;
  profile: { reviews: number; likes: number } | null;
  isFetching: boolean;
};
type RewardsState = { spentPoints: number; redeemed: any[] };

type GamificationContextValue = {
  achievements: AchievementsState;
  rewards: RewardsState;
  fetchAchievements: () => Promise<void>;
  redeemReward: (reward: { cost: number }) => { success: boolean; code?: string; error?: string };
};

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);
const emptyAchievements: AchievementsState = { list: [], totalPoints: 0, profile: null, isFetching: false };
const emptyRewards: RewardsState = { spentPoints: 0, redeemed: [] };

// Logros y premios. Va DENTRO de AuthProvider porque depende del usuario logueado
export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user.user?.id;
  const [achievements, setAchievements] = useState(emptyAchievements);
  const [rewards, setRewards] = useState(emptyRewards);

  // Al cerrar sesión (o cambiar de usuario) se descarta lo del usuario anterior
  useEffect(() => {
    setAchievements(emptyAchievements);
    setRewards(emptyRewards);
  }, [userId]);

  const value = useMemo<GamificationContextValue>(
    () => ({
      achievements,
      rewards,
      fetchAchievements: async () => {
        if (userId === undefined) return;
        setAchievements((c) => ({ ...c, isFetching: true }));
        try {
          const { list, totalPoints, profile } = await mockGetAchievements(userId);
          setAchievements({ list, totalPoints, profile, isFetching: false });
        } catch {
          setAchievements((c) => ({ ...c, isFetching: false }));
        }
      },
      redeemReward: (reward) => {
        const available = achievements.totalPoints - rewards.spentPoints;
        if (reward.cost > available) return { success: false, error: 'No te alcanzan los puntos' };
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        setRewards((c) => ({
          spentPoints: c.spentPoints + reward.cost,
          redeemed: [{ ...reward, code, date: new Date().toISOString() }, ...c.redeemed],
        }));
        return { success: true, code };
      },
    }),
    [achievements, rewards, userId]
  );

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used inside GamificationProvider');
  return context;
}