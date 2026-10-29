export const RANKS = [
  {
    min: 5,
    name: 'Espectador',
    icon: 'eye',
  },
  {
    min: 25,
    name: 'Cinéfilo',
    icon: 'film',
  },
  {
    min: 50,
    name: 'Crítico',
    icon: 'chatbubble-ellipses',
  },
  {
    min: 100,
    name: 'Director',
    icon: 'videocam',
  },
] as const;

const RANK_DECOR = [
  { ring: ['#7d7d7d', '#cfcfcf'], thickness: 4 },
  { ring: ['#1e88e5', '#64b5f6'], thickness: 5 },
  { ring: ['#8e24aa', '#e040fb'], thickness: 6 },
  { ring: ['#e50914', '#ffc107'], thickness: 7 },
] as const;
const NO_RANK_DECOR = { ring: ['#3a3a3a', '#555555'], thickness: 3 } as const;

export function getRankDecor(index: number) {
  if (index < 0) return NO_RANK_DECOR;
  return RANK_DECOR[Math.min(index, RANK_DECOR.length - 1)];
}

export function getRankIndex(reviewCount?: number) {
  return RANKS.filter((rank) => (reviewCount ?? 0) >= rank.min).length - 1;
}

export function getAuthorRing(reviewCount?: number) {
  const index = getRankIndex(reviewCount);
  return index < 0 ? null : getRankDecor(index).ring[1];
}
