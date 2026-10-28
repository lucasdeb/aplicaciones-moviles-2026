import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
type AchievementsState = { list: any[]; totalPoints: number; availablePoints: number; profile: { reviews: number; likes: number } | null; isFetching: boolean; error?: string };
type RewardsState = { catalog: any[]; spentPoints: number; availablePoints: number; redeemed: any[] };
type GamificationContextValue = {
  achievements: AchievementsState; rewards: RewardsState;
  fetchAchievements: () => Promise<void>;
  points: { entries: any[]; nextCursor: number | null };
  fetchMorePoints: () => Promise<void>;
  cancelRedemption: (id: number) => Promise<{ success: boolean; error?: string }>;
  redeemReward: (reward: { id: string; cost: number }) => Promise<{ success: boolean; code?: string; error?: string }>;
};
const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);
const emptyAchievements: AchievementsState = { list: [], totalPoints: 0, availablePoints: 0, profile: null, isFetching: false };
const emptyRewards: RewardsState = { catalog: [], spentPoints: 0, availablePoints: 0, redeemed: [] };
export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user.user?.id;
  const viewer = useRef(userId); viewer.current = userId;
  const [achievements, setAchievements] = useState(emptyAchievements);
  const [points, setPoints] = useState<{ entries: any[]; nextCursor: number | null }>({ entries: [], nextCursor: null });
  const [rewards, setRewards] = useState(emptyRewards);
  useEffect(() => { setAchievements(emptyAchievements); setRewards(emptyRewards); setPoints({ entries: [], nextCursor: null }); }, [userId]);
  const value = useMemo<GamificationContextValue>(() => ({
    achievements, rewards, points,
    fetchMorePoints: async () => {
      if (!points.nextCursor) return;
      const data = await api.request(`/points?before=${points.nextCursor}`);
      if (viewer.current !== userId) return;
      setPoints(current => ({ entries: [...current.entries, ...data.entries.filter(entry => !current.entries.some(existing => existing.id === entry.id))], nextCursor: data.nextCursor }));
    },
    fetchAchievements: async () => {
      if (userId === undefined) return;
      setAchievements(c => ({ ...c, isFetching: true, error: undefined }));
      try {
        const [data, savedRewards, history] = await Promise.all([api.getAchievements(), api.getRewards(), api.request('/points')]);
        if (viewer.current !== userId) return;
        setAchievements({ ...data, isFetching: false }); setRewards(savedRewards); setPoints(history);
      } catch (e) { if (viewer.current === userId) setAchievements(c => ({ ...c, isFetching: false, error: e.message })); }
    },
    cancelRedemption: async id => {
      try {
        const result = await api.cancelRedemption(id);
        if (viewer.current === userId) {
          setRewards(result.rewards);
          try { const history = await api.request('/points'); if (viewer.current === userId) setPoints(history); } catch {}
        }
        return { success: true };
      } catch (e) { return { success: false, error: e.message }; }
    },
    redeemReward: async reward => {
      try {
        const result = await api.redeemReward(reward.id);
        if (viewer.current === userId) {
          setRewards(result.rewards);
          // A history refresh failure must not turn a completed purchase into an apparent failure.
          try { const history = await api.request('/points'); if (viewer.current === userId) setPoints(history); } catch {}
        }
        return { success: true, code: result.code };
      } catch (e) { return { success: false, error: e.message }; }
    },
  }), [achievements, rewards, points, userId]);
  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}
export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used inside GamificationProvider');
  return context;
}
