import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { mockGetMovies, mockCreateMovie, mockUpdateMovie, mockDeleteMovie } from '../mockData';

type Result = { success: boolean; error?: string };
type MoviesState = { list: any[]; isFetching: boolean; error: string | false };

type MoviesContextValue = {
  movies: MoviesState & { featured: any[] };
  fetchMovies: () => Promise<void>;
  createMovie: (data: any) => Promise<Result>;
  updateMovie: (movieId: number, data: any) => Promise<Result>;
  deleteMovie: (movieId: number) => Promise<Result>;
};

const MoviesContext = createContext<MoviesContextValue | undefined>(undefined);

// Catálogo: lo comparten Home, ManageMovies y AddMovie
export function MoviesProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<MoviesState>({ list: [], isFetching: false, error: false });

  // Las destacadas se derivan de la lista: no hace falta otro fetch ni otro estado
  const featured = useMemo(() => movies.list.filter((m) => m.featured), [movies.list]);

  async function fetchMovies() {
    setMovies((current) => ({ ...current, isFetching: true, error: false }));
    try {
      const list = await mockGetMovies();
      setMovies({ list, isFetching: false, error: false });
    } catch (error) {
      setMovies((current) => ({ ...current, isFetching: false, error: error.message }));
    }
  }

  // Create, update y delete comparten el manejo de errores
  async function mutate(request: () => Promise<void>): Promise<Result> {
    try {
      await request();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  const value = useMemo<MoviesContextValue>(
    () => ({
      movies: { ...movies, featured },
      fetchMovies,
      createMovie: (data) =>
        mutate(async () => {
          const movie = await mockCreateMovie(data);
          setMovies((c) => ({ ...c, list: [movie, ...c.list] }));
        }),
      updateMovie: (movieId, data) =>
        mutate(async () => {
          const movie = await mockUpdateMovie(movieId, data);
          setMovies((c) => ({ ...c, list: c.list.map((m) => (m.id === movie.id ? movie : m)) }));
        }),
      deleteMovie: (movieId) =>
        mutate(async () => {
          await mockDeleteMovie(movieId);
          setMovies((c) => ({ ...c, list: c.list.filter((m) => m.id !== movieId) }));
        }),
    }),
    [movies, featured]
  );

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
}

export function useMovies() {
  const context = useContext(MoviesContext);
  if (!context) throw new Error('useMovies must be used inside MoviesProvider');
  return context;
}