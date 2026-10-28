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

export function calculateRank(reviewCount: number) {
  const index = RANKS.filter((rank) => reviewCount >= rank.min).length - 1;
  const current = index >= 0 ? RANKS[index] : null;
  const next = RANKS[index + 1] ?? null;
  const currentMin = current?.min ?? 0;

  return {
    current,
    next,
    index,
    progress: next ? (reviewCount - currentMin) / (next.min - currentMin) : 1,
  };
}
