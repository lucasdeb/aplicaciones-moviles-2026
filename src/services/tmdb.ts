
const API_KEY = process.env.EXPO_PUBLIC_TMDB_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w342';

export type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  releaseDate: string; // 'YYYY-MM-DD'
  posterUrl: string | null;
  rating: number;
};


function todayLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function get(path: string): Promise<TmdbMovie[]> {
  if (!API_KEY) throw new Error('Falta EXPO_PUBLIC_TMDB_KEY en el archivo .env');
  const res = await fetch(`${BASE_URL}${path}?api_key=${API_KEY}&language=es-AR&region=AR&page=1`);
  if (!res.ok) throw new Error(`TMDB respondió ${res.status}`);
  const json = await res.json();
  return json.results.map((m: any) => ({
    id: m.id,
    title: m.title,
    overview: m.overview,
    releaseDate: m.release_date,
    posterUrl: m.poster_path ? `${IMG_URL}${m.poster_path}` : null,
    rating: Math.round(m.vote_average * 10) / 10,
  }));
}

export function getNowPlaying() {
  return get('/movie/now_playing');
}

export async function getUpcoming() {
  const today = todayLocal();
  const list = await get('/movie/upcoming');
  return list
    .filter((m) => m.releaseDate && m.releaseDate > today)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
}