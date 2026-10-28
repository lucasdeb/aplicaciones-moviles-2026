import { prisma } from '../prisma';
import { fail } from '../utils/http';
import { REWARDS } from './gamification';
export function redemptionStatus(row: { status: string; expiresAt: Date }) {
  return row.status === 'active' && row.expiresAt <= new Date() ? 'expired' : row.status;
}
export async function validateRedemption(code: unknown) {
  if (typeof code !== 'string' || !/^[A-F0-9]{16}$/.test(code.trim().toUpperCase())) fail(400, 'Ingresá un código de canje válido');
  const row = await prisma.redemption.findUnique({ where: { code: code.trim().toUpperCase() }, include: { user: { select: { id: true, name: true } } } });
  if (!row) fail(404, 'Código no encontrado');
  return { ...row, status: redemptionStatus(row), reward: REWARDS.find(r => r.id === row.rewardId) };
}
export async function useRedemption(code: unknown, actorId: number) {
  const row = await validateRedemption(code);
  const changed = await prisma.redemption.updateMany({ where: { id: row.id, status: 'active', usedAt: null, refundedAt: null, expiresAt: { gt: new Date() } }, data: { status: 'used', usedAt: new Date(), usedById: actorId } });
  if (!changed.count) fail(409, 'El código ya fue usado, venció o fue reintegrado');
  return validateRedemption(row.code);
}
export async function refundRedemption(id: number, actorId: number) {
  const changed = await prisma.redemption.updateMany({ where: { id, status: 'active', usedAt: null, refundedAt: null }, data: { status: 'refunded', refundedAt: new Date(), refundedById: actorId } });
  if (!changed.count) fail(409, 'Solo se pueden reintegrar canjes que no fueron usados ni reintegrados');
  return { refunded: true };
}
