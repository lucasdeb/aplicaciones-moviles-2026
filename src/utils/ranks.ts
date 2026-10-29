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

// Decoración del perfil según rank.index (-1 = todavía sin rango).
// Si se agregan rangos, los que sobran usan la última.
const RANK_DECOR = [
  { ring: ['#7d7d7d', '#cfcfcf'], thickness: 4 }, // Espectador: plateado
  { ring: ['#007aff', '#5aa9ff'], thickness: 5 }, // Cinéfilo: azul
  { ring: ['#8e24aa', '#e040fb'], thickness: 6 }, // Crítico: violeta
  { ring: ['#e50914', '#ffc107'], thickness: 7 }, // Director: rojo y dorado
] as const;
const NO_RANK_DECOR = { ring: ['#3a3a3a', '#555555'], thickness: 3 } as const;

export function getRankDecor(index: number) {
  if (index < 0) return NO_RANK_DECOR;
  return RANK_DECOR[Math.min(index, RANK_DECOR.length - 1)];
}
