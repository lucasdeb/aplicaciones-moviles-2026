import type { Prisma, PrismaClient, Redemption } from '@prisma/client';
import { prisma } from '../prisma';
import { calculateRank } from './ranks';
import { initializePoints, recordPoints, pointsSummary, withUserPoints } from './points';
export { calculateRank };
type AchievementStat = 'totalReviews' | 'maxLikesOnReview' | 'distinctGenres' | 'totalRatings' | 'totalPhotos';

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  stat: AchievementStat;
  goal: number;
  points: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_review',
    title: 'Primera reseña',
    description: 'Publicá tu primera reseña',
    icon: 'create-outline',
    stat: 'totalReviews',
    goal: 1,
    points: 10,
  },
  {
    id: 'active_critic',
    title: 'Crítico en marcha',
    description: 'Publicá 5 reseñas',
    icon: 'chatbubbles-outline',
    stat: 'totalReviews',
     goal: 5,
    points: 20,
  },
  {
    id: 'expert_critic',
    title: 'Crítico experto',
    description: 'Publicá 15 reseñas',
    icon: 'ribbon-outline',
    stat: 'totalReviews',
    goal: 15,
    points: 30,
  },
  {
    id: 'viral_review',
    title: 'Reseña viral',
    description: 'Conseguí 100 likes o más en una sola reseña',
    icon: 'flame-outline',
    stat: 'maxLikesOnReview',
    goal: 100,
    points: 50,
  },
  {
    id: 'genre_explorer',
    title: 'Explorador de géneros',
    description: 'Reseñá películas de 3 géneros distintos',
    icon: 'compass-outline',
    stat: 'distinctGenres',
    goal: 3,
    points: 10,
  },
  {
    id: 'star_rater',
    title: 'Todo estrellas',
    description: 'Calificá con estrellas 5 películas',
    icon: 'star-outline',
    stat: 'totalRatings',
    goal: 5,
    points: 15,
  },
  { id: 'cinema_photo', title: 'Fui al cine', description: 'Subí una reseña con foto', icon: 'camera-outline', stat: 'totalPhotos', goal: 1, points: 20 },
];

export const REWARDS = [
  { id: 'popcorn', title: 'Pochoclos medianos', description: 'En cines adheridos', icon: 'fast-food-outline', cost: 30 },
  { id: 'two_for_one', title: '2x1 en entradas', description: 'Válido de lunes a jueves', icon: 'ticket-outline', cost: 60 },
  { id: 'presale', title: 'Preventa anticipada', description: 'Acceso 24 h antes a preventas', icon: 'time-outline', cost: 100 },
  { id: 'free_ticket', title: 'Entrada gratis', description: 'Una función 2D a elección', icon: 'film-outline', cost: 150 },
];


type AchievementsResult = {
  list: (AchievementDef & { current: number; unlocked: boolean; awardedAt: Date | null })[];
  totalPoints: number; availablePoints: number; profile: { reviews: number; likes: number };
};
export async function getAchievements(userId: number, db: Prisma.TransactionClient | PrismaClient = prisma): Promise<AchievementsResult> {
  if ('$transaction' in db) return withUserPoints(userId, tx => getAchievements(userId, tx));
  await initializePoints(db, userId);
  const reviews = await db.review.findMany({ where: { authorId: userId }, include: { movie: { include: { genres: true } }, _count: { select: { likes: true } } } });
  const stats: Record<AchievementStat, number> = {
    totalReviews: reviews.length,
    maxLikesOnReview: Math.max(0, ...reviews.map(r => r._count.likes)),
    distinctGenres: new Set(reviews.flatMap(r => r.movie.genres.map(g => g.id))).size,
    totalRatings: reviews.filter(r => r.rating !== null).length,
    totalPhotos: reviews.filter(r => r.photo).length,
  };
  for (const achievement of ACHIEVEMENTS) {
    if (stats[achievement.stat] < achievement.goal) continue;
    const award = await db.achievementAward.upsert({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
      create: { userId, achievementId: achievement.id, points: achievement.points }, update: {},
    });
    await recordPoints(db, userId, `achievement:${achievement.id}`, 'achievement', award.points, achievement.title, award.awardedAt);
  }
  const awards = await db.achievementAward.findMany({ where: { userId } });
  const list = ACHIEVEMENTS.map(a => {
    const award = awards.find(row => row.achievementId === a.id);
    return { ...a, points: award?.points ?? a.points, current: award ? a.goal : Math.min(stats[a.stat], a.goal), unlocked: !!award, awardedAt: award?.awardedAt ?? null };
  });
  const summary = await pointsSummary(db, userId);
  return { list, totalPoints: summary.earned, availablePoints: summary.balance, profile: { reviews: reviews.length, likes: reviews.reduce((sum, r) => sum + r._count.likes, 0) } };
}

export async function getRewards(userId: number, db: Prisma.TransactionClient | PrismaClient = prisma): Promise<{
  catalog: typeof REWARDS; spentPoints: number; availablePoints: number;
  redeemed: (Redemption & { title?: string; description?: string; icon?: string; date: Date })[];
}> {
  if ('$transaction' in db) return withUserPoints(userId, tx => getRewards(userId, tx));
  await getAchievements(userId, db);
  const summary = await pointsSummary(db, userId);
  const rows = await db.redemption.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return {
    catalog: REWARDS,
    spentPoints: summary.spent,
    availablePoints: summary.balance,
    redeemed: rows.filter(r => r.status !== 'canceled').map(r => ({ ...REWARDS.find(x => x.id === r.rewardId), ...r, status: r.status === 'active' && r.expiresAt <= new Date() ? 'expired' : r.status, date: r.createdAt })),
  };
}
