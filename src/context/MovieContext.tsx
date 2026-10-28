import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getMovieHome, createMovie, updateMovie, deleteMovie, type MovieHome } from '../services/movies';
import { useAuth } from './AuthContext';
type Result = { success: boolean; error?: string };
type MoviesState = MovieHome & { isFetching: boolean; error: string | false };
type MoviesContextValue = {
  movies: MoviesState;
  fetchMovies: () => Promise<void>;
  createMovie: (data: unknown) => Promise<Result>;
  updateMovie: (movieId: number, data: unknown) => Promise<Result>;
  deleteMovie: (movieId: number) => Promise<Result>;
};
const emptyMovies: MoviesState = { list: [], featured: [], hero: [], trending: [], isFetching: false, error: false };
const MoviesContext = createContext<MoviesContextValue | undefined>(undefined);
export function MoviesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user.user?.id;
  const currentUser = useRef(userId);
  currentUser.current = userId;
  const requestId = useRef(0);
  const [movies, setMovies] = useState<MoviesState>(emptyMovies);
  useEffect(() => { setMovies(emptyMovies); }, [userId]);

  async function fetchMovies() {
    const version = ++requestId.current, viewer = userId;
    setMovies(current => ({ ...current, isFetching: true, error: false }));
    try {
      const data = await getMovieHome();
      if (version === requestId.current && viewer === currentUser.current) setMovies({ ...data, isFetching: false, error: false });
    } catch (error) {
      if (version === requestId.current && viewer === currentUser.current) setMovies(current => ({ ...current, isFetching: false, error: error.message }));
    }
  }
  async function mutate(request: () => Promise<unknown>): Promise<Result> {
    try {
      await request();
      // Refetch server-selected sections so edits/deletions immediately update every list.
      await fetchMovies();
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  }
  const value = useMemo<MoviesContextValue>(() => ({
    movies, fetchMovies,
    createMovie: data => mutate(() => createMovie(data)),
    updateMovie: (id, data) => mutate(() => updateMovie(id, data)),
    deleteMovie: id => mutate(() => deleteMovie(id)),
  }), [movies, userId]);
  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
}
export function useMovies() {
  const context = useContext(MoviesContext);
  if (!context) throw new Error('useMovies must be used inside MoviesProvider');
  return context;
}
