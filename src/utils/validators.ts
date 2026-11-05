
const bytes = (s: string) => new TextEncoder().encode(s).length;

export function isValidEmail(email: string) {
  const e = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 120;
}
export function isValidPassword(password: string) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password) && bytes(password) <= 72;
}
export const isValidLoginPassword = (p: string) => p.length > 0 && bytes(p) <= 72;
export const isValidName = (n: string) => n.trim().length >= 1 && n.trim().length <= 60;
export const isValidReviewText = (t: string) => t.trim().length >= 1 && t.trim().length <= 5000;
export const isValidRating = (r: unknown) =>
  typeof r === 'number' && r >= 0 && r <= 5 && Number.isInteger(r * 2);
export const isValidRedemptionCode = (c: string) => /^[A-F0-9]{16}$/.test(c.trim().toUpperCase());
export const isValidImageUpload = (image: string) => image.length <= 2_000_000;

export function isValidIsoDate(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
export function movieFormError(m) {
  const tooLong = (items: string[], max: number) => items.some((s) => s.length > max);
  const providers = [m.watchProviders.AR.stream, m.watchProviders.AR.rent, m.watchProviders.AR.buy];

  if (m.title.length > 200) return 'El título admite hasta 200 caracteres';
  if (m.overview.length > 10000) return 'La sinopsis admite hasta 10000 caracteres';
  if (m.genres.length > 20 || tooLong(m.genres, 80)) return 'Hasta 20 géneros de 80 caracteres cada uno';
  if (m.actors.length > 50 || m.actors.some((a) => a.name.length > 150 || a.character.length > 150)) return 'Hasta 50 actores, con nombre y personaje de 150 caracteres';
  if (m.directors.length > 20 || tooLong(m.directors, 150)) return 'Hasta 20 directores de 150 caracteres';
  if (m.crew.length > 50 || m.crew.some((c) => c.name.length > 150 || c.job.length > 150)) return 'Hasta 50 personas de equipo, con nombre y rol de 150 caracteres';
  if (m.trailers.length > 10 || tooLong(m.trailers.map((t) => t.name), 150)) return 'Hasta 10 trailers, con nombre de 150 caracteres';
  if (m.trailers.some((t) => !/^[\w-]{11}$/.test(t.key))) return 'La clave de cada trailer debe tener 11 caracteres (la que está en el link de YouTube)';
  if (providers.some((p) => p.length > 50 || tooLong(p, 100))) return 'Hasta 50 plataformas de 100 caracteres por categoría';
  return null;
}

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con al menos una letra y un número. Máximo 72 bytes (las tildes y los emojis ocupan más).';
