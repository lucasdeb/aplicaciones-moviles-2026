import type { Express } from 'express';
import { prisma } from '../prisma';
import { optionalAuth, requireAuth } from '../middlewares/auth';
import { cleanText, isPhoto, isRating, parseId } from '../utils/validation';
import { fail } from '../utils/http';
import { listReviews, reviewDTO, reviewInclude } from '../services/reviews';
import { imageReference } from '../services/uploads';
import { getFriendIds } from '../services/social';

function reviewInput(body: any) {
  const text = cleanText(body?.text, 5000);
  if (!text || !isRating(body?.rating) || !isPhoto(body?.photo)) fail(400, 'Reseña inválida: revisá texto, puntaje y foto');
  return { text: text!, rating: body.rating as number, photo: body.photo ?? null };
}
export function reviewRoutes(app: Express) {
  app.get('/api/movies/:id/reviews', optionalAuth, async (req, res) => res.json(await listReviews({ movieId: parseId(req.params.id) ?? 0 }, req.userId)));
  app.post('/api/movies/:id/reviews', requireAuth, async (req, res) => {
    const data = reviewInput(req.body), movieId = parseId(req.params.id);
    if (!movieId || !await prisma.movie.findFirst({ where: { id: movieId, hidden: false } })) fail(404, 'Película no encontrada');
    data.photo = await imageReference(data.photo, req.userId!) ?? null;
    try {
      const r = await prisma.review.create({ data: { ...data, movieId: movieId!, authorId: req.userId! }, include: reviewInclude });
      res.status(201).json(reviewDTO(r, req.userId));
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ error: 'Ya reseñaste esta película. Podés editar tu reseña existente.', code: 'REVIEW_ALREADY_EXISTS' });
      throw e;
    }
  });
  app.patch('/api/reviews/:id', requireAuth, async (req, res) => {
    const id = parseId(req.params.id), data = reviewInput(req.body);
    const review = await prisma.review.findUnique({ where: { id: id ?? 0 } });
    if (!review) fail(404, 'Reseña no encontrada');
    if (review.authorId !== req.userId) fail(403, 'No tenés permiso para editar esta reseña');
    data.photo = await imageReference(data.photo, req.userId!) ?? null;
    res.json(reviewDTO(await prisma.review.update({ where: { id: review.id }, data, include: reviewInclude }), req.userId));
  });
  app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: parseId(req.params.id) ?? 0 } });
    if (!review) fail(404, 'Reseña no encontrada');
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } });
    if (review.authorId !== user.id && !['moderator', 'superadmin'].includes(user.role)) fail(403, 'No tenés permiso');
    await prisma.review.delete({ where: { id: review.id } });
    res.status(204).end();
  });
  for (const kind of ['like', 'repost'] as const) {
    app.post(`/api/reviews/:id/${kind}`, requireAuth, async (req, res) => {
      const reviewId = parseId(req.params.id) ?? 0, userId = req.userId!;
      const result = await prisma.$transaction(async tx => {
        const review = await tx.review.findUnique({ where: { id: reviewId } });
        if (!review) fail(404, 'Reseña no encontrada');
        const where = { userId_reviewId: { userId, reviewId } };
        const existing = await (kind === 'like' ? tx.like.findUnique({ where }) : tx.repost.findUnique({ where }));
        const type = kind === 'like' ? 'review_like' : 'review_repost';
        if (existing) {
          await (kind === 'like' ? tx.like.delete({ where }) : tx.repost.delete({ where }));
          await tx.notification.deleteMany({ where: { actorId: userId, reviewId, type } });
        } else {
          await (kind === 'like' ? tx.like.create({ data: { userId, reviewId } }) : tx.repost.create({ data: { userId, reviewId } }));
          if (review.authorId !== userId) await tx.notification.create({ data: { actorId: userId, recipientId: review.authorId, reviewId, type } });
        }
        const updated = await tx.review.findUniqueOrThrow({ where: { id: reviewId }, include: reviewInclude });
        return { comment: reviewDTO(updated, userId), [kind === 'like' ? 'liked' : 'reposted']: !existing };
      });
      res.json(result);
    });
  }
  app.get('/api/feed/popular', optionalAuth, async (req, res) => res.json((await listReviews({}, req.userId, true)).slice(0, 10)));
  app.get('/api/feed/friends', requireAuth, async (req, res) => res.json((await listReviews({ authorId: { in: await getFriendIds(req.userId!) } }, req.userId)).slice(0, 10)));
}
