export function getMovieYear(movie: { releaseDate?: string | null }) {
  return movie.releaseDate?.slice(0, 4) || 'Sin fecha';
}

export function getPrimaryGenre(movie: { genres?: string[] }) {
  return movie.genres?.[0] || 'Sin género';
}

export function formatRating(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(1) : fallback;
}
