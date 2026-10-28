import type { Movie, MovieHome } from './movies';

export type JSONStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export function createJSONStorage(storage: JSONStorage) {
  return {
    async getJSON<T>(key: string): Promise<T | null> {
      try {
        const value = await storage.getItem(key);
        return value === null ? null : JSON.parse(value);
      } catch { return null; }
    },
    async setJSON(key: string, value: unknown): Promise<boolean> {
      try { await storage.setItem(key, JSON.stringify(value)); return true; }
      catch { return false; }
    },
    async remove(key: string): Promise<boolean> {
      try { await storage.removeItem(key); return true; }
      catch { return false; }
    },
  };
}

export function addRecentSearch(current: string[], query: string) {
  const text = query.trim();
  if (!text) return current;
  return [text, ...current.filter(item => item.toLowerCase() !== text.toLowerCase())].slice(0, 5);
}

export function publicHomeSnapshot(home: MovieHome): MovieHome {
  const publicMovie = (movie: Movie): Movie => ({ ...movie, friendsRating: null });
  return {
    list: home.list.map(publicMovie), featured: home.featured.map(publicMovie),
    hero: home.hero.map(publicMovie), trending: home.trending.map(publicMovie),
  };
}
