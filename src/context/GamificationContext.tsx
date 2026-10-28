import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
type AchievementsState = { list: any[]; totalPoints: number; profile: { reviews: number; likes: number } | null; isFetching: boolean; error?: string };
type RewardsState = { catalog: any[]; spentPoints: number; redeemed: any[] };
type GamificationContextValue = {
  achievements: AchievementsState; rewards: RewardsState;
  fetchAchievements: () => Promise<void>;
  redeemReward: (reward: { id: string; cost: number }) => Promise<{ success: boolean; code?: string; error?: string }>;
};
const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);
const emptyAchievements: AchievementsState = { list: [], totalPoints: 0, profile: null, isFetching: false };
const emptyRewards: RewardsState = { catalog: [], spentPoints: 0, redeemed: [] };
export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user.user?.id;
  const [achievements, setAchievements] = useState(emptyAchievements);
  const [rewards, setRewards] = useState(emptyRewards);
  useEffect(() => { setAchievements(emptyAchievements); setRewards(emptyRewards); }, [userId]);
  const value = useMemo<GamificationContextValue>(() => ({
    achievements, rewards,
    fetchAchievements: async () => {
      if (userId === undefined) return;
      setAchievements(c => ({ ...c, isFetching: true, error: undefined }));
      try {
        const [data, savedRewards] = await Promise.all([api.getAchievements(), api.getRewards()]);
        setAchievements({ ...data, isFetching: false }); setRewards(savedRewards);
      } catch (e) { setAchievements(c => ({ ...c, isFetching: false, error: e.message })); }
    },
    redeemReward: async reward => {
      try {
        const result = await api.redeemReward(reward.id);
        setRewards(result.rewards);
        return { success: true, code: result.code };
      } catch (e) { return { success: false, error: e.message }; }
    },
  }), [achievements, rewards, userId]);
  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}
export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used inside GamificationProvider');
  return context;
}
