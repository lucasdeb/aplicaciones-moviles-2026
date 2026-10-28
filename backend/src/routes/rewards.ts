import type { Express } from 'express';
import { randomBytes } from 'node:crypto';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middlewares/auth';
import { getAchievements, getRewards, REWARDS } from '../services/gamification';
import { validateRedemption, useRedemption, refundRedemption } from '../services/fulfillment';
import { movieId } from '../validation/movies';
import { fail } from '../utils/http';
export function rewardRoutes(app: Express) {
  app.post('/api/admin/redemptions/validate', requireAuth, requireRole('moderator', 'superadmin'), async (req, res) => res.json(await validateRedemption(req.body?.code)));
  app.post('/api/admin/redemptions/use', requireAuth, requireRole('moderator', 'superadmin'), async (req, res) => res.json(await useRedemption(req.body?.code, req.userId!)));
  app.post('/api/admin/redemptions/:id/refund', requireAuth, requireRole('superadmin'), async (req, res) => res.json(await refundRedemption(movieId(req.params.id), req.userId!)));

  app.get('/api/achievements', requireAuth, async (req, res) => res.json(await getAchievements(req.userId!)));
  app.get('/api/rewards', requireAuth, async (req, res) => res.json(await getRewards(req.userId!)));
  app.post('/api/rewards/redeem', requireAuth, async (req, res) => {
    const reward = REWARDS.find(r => r.id === req.body?.rewardId);
    if (!reward) fail(400, 'Premio no válido');
    const result = await prisma.$transaction(async tx => {
      // Acquire SQLite's writer lock before reading the balance. Concurrent redemptions serialize.
      await tx.user.update({ where: { id: req.userId }, data: { id: req.userId! } });
      const achievements = await getAchievements(req.userId!, tx), rewards = await getRewards(req.userId!, tx);
      if (achievements.totalPoints - rewards.spentPoints < reward.cost) fail(409, 'No te alcanzan los puntos');
      const redemption = await tx.redemption.create({ data: { userId: req.userId!, rewardId: reward.id, cost: reward.cost, code: randomBytes(8).toString('hex').toUpperCase(), expiresAt: new Date(Date.now() + 30 * 86400000) } });
      return { success: true, code: redemption.code, rewards: await getRewards(req.userId!, tx) };
    });
    res.status(201).json(result);
  });
}
