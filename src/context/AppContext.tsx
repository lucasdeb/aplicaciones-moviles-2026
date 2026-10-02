import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  mockLogin,
  mockRegister,
  mockGetMovies,
  mockGetFeaturedMovies,
  mockGetMovie,
  mockGetRecommendations,
  mockCreateMovie,
  mockUpdateMovie,
  mockDeleteMovie,
  mockGetComments,
  mockPostComment,
  mockDeleteComment,
  mockLikeComment,
  mockRepostComment,
  mockGetPopularReviews,
  mockGetPopularReviewers,
  mockGetAllUsers,
  mockUpdateUserRole,
  mockGetAchievements,
  mockGetUserComments,
} from '../mockData';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AppContextValue = {
  user: { user: User | null; isFetching: boolean; isLoggedIn: boolean };
  movies: any;
  comments: any;
  feed: any;
  admin: any;
  achievements: any;
  [key: string]: any;
};

const AppContext = createContext<AppContextValue | null>(null);

const initialMovies = {
  list: [],
  isFetching: false,
  error: false,
  featured: [],
  isFetchingFeatured: false,
  selectedMovie: null,
  recommendations: [],
  isFetchingDetail: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState({ user: null as User | null, isFetching: false, isLoggedIn: false });
  const [movies, setMovies] = useState(initialMovies);
  const [comments, setComments] = useState({ list: [], isFetching: false, isPosting: false, error: false });
  const [feed, setFeed] = useState({
    popularReviews: [],
    isFetchingReviews: false,
    popularReviewers: [],
    isFetchingReviewers: false,
  });

  const [admin, setAdmin] = useState({ users: [], isFetchingUsers: false });
  const [achievements, setAchievements] = useState({ list: [], totalPoints: 0, profile: null, isFetching: false });
  const [rewards, setRewards] = useState({ spentPoints: 0, redeemed: [] });


    async function handleLogin(credentials) {
    setUser((current) => ({ ...current, isFetching: true }));
    try {
      const nextUser = await mockLogin(credentials);
      setUser({ user: nextUser, isFetching: false, isLoggedIn: true });
      return { success: true };
    } catch (error) {
      setUser((current) => ({ ...current, isFetching: false }));
      return { success: false, error: error.message };
    }
  }

  async function handleRegister(userInfo) {
    setUser((current) => ({ ...current, isFetching: true }));
    try {
      const nextUser = await mockRegister(userInfo);
      setUser({ user: nextUser, isFetching: false, isLoggedIn: true });
      return { success: true };
    } catch (error) {
      setUser((current) => ({ ...current, isFetching: false }));
      return { success: false, error: error.message };
    }
  }


  function logOut() {
    setUser({ user: null, isFetching: false, isLoggedIn: false });
    setAchievements({ list: [], totalPoints: 0, profile: null, isFetching: false });
    setRewards({ spentPoints: 0, redeemed: [] });
  }

    async function fetchMovies() {
    setMovies((current) => ({ ...current, isFetching: true, error: false }));
    try {
      const list = await mockGetMovies();
      setMovies((current) => ({ ...current, list }));
    } catch (error) {
      setMovies((current) => ({ ...current, error: error.message }));
    } finally {
      setMovies((current) => ({ ...current, isFetching: false }));
    }
  }

  async function fetchFeaturedMovies() {
    setMovies((current) => ({ ...current, isFetchingFeatured: true }));
    try {
      const featured = await mockGetFeaturedMovies();
      setMovies((current) => ({ ...current, featured }));
    } catch (error) {
      setMovies((current) => ({ ...current, error: error.message }));
    } finally {
      setMovies((current) => ({ ...current, isFetchingFeatured: false }));
    }
  }

  async function fetchMovieDetail(movieId) {
    setMovies((current) => ({ ...current, isFetchingDetail: true, error: false }));
    try {
      const [selectedMovie, recommendations] = await Promise.all([
        mockGetMovie(movieId),
        mockGetRecommendations(movieId),
      ]);
      setMovies((current) => ({ ...current, selectedMovie, recommendations }));
    } catch (error) {
      setMovies((current) => ({ ...current, error: error.message }));
    } finally {
      setMovies((current) => ({ ...current, isFetchingDetail: false }));
    }
  }

  function clearMovieDetail() {
    setMovies((current) => ({ ...current, selectedMovie: null, recommendations: [] }));
  }

  async function createMovie(requesterId, movieData) {
    try {
      const movie = await mockCreateMovie(movieData);
      setMovies((current) => ({ ...current, list: [movie, ...current.list] }));
      return { success: true };
    } catch (error) {
      setMovies((current) => ({ ...current, error: error.message }));
      return { success: false, error: error.message };
    }
  }

  async function updateMovie(requesterId, movieId, movieData) {
    try {
      const movie = await mockUpdateMovie(movieId, movieData);
      setMovies((current) => ({
        ...current,
        list: current.list.map((item) => (item.id === movie.id ? movie : item)),
        selectedMovie: current.selectedMovie?.id === movie.id ? movie : current.selectedMovie,
      }));
      return { success: true };
    } catch (error) {
      setMovies((current) => ({ ...current, error: error.message }));
      return { success: false, error: error.message };
    }
  }

  async function deleteMovie(requesterId, movieId) {
    try {
      await mockDeleteMovie(movieId);
      setMovies((current) => ({ ...current, list: current.list.filter((item) => item.id !== movieId) }));
      return { success: true };
    } catch (error) {
      setMovies((current) => ({ ...current, error: error.message }));
      return { success: false, error: error.message };
    }
  }

  async function fetchComments(movieId) {
    setComments((current) => ({ ...current, isFetching: true, error: false }));
    try {
      const list = await mockGetComments(movieId);
      setComments((current) => ({ ...current, list }));
    } catch (error) {
      setComments((current) => ({ ...current, error: error.message }));
    } finally {
      setComments((current) => ({ ...current, isFetching: false }));
    }
  }

  function clearComments() {
    setComments({ list: [], isFetching: false, isPosting: false, error: false });
  }

  async function postComment(movieId, authorId, text, rating?: number, photo?: string) {
    try {
      const comment = await mockPostComment(movieId, authorId, text, rating, photo);
      setComments((current) => ({ ...current, list: [comment, ...current.list] }));
    } catch (error) {
      setComments((current) => ({ ...current, error: error.message }));
    }
  }

  async function deleteComment(commentId, requesterId) {
    try {
      await mockDeleteComment(commentId);
      setComments((current) => ({
        ...current,
        list: current.list.filter((comment) => comment.id !== commentId),
      }));
      return { success: true };
    } catch (error) {
      setComments((current) => ({ ...current, error: error.message }));
      return { success: false, error: error.message };
    }
  }

  async function likeComment(commentId) {
    try {
      const comment = await mockLikeComment(commentId);
      setComments((current) => ({
        ...current,
        list: current.list.map((item) => (item.id === comment.id ? comment : item)),
      }));
    } catch (error) {
      setComments((current) => ({ ...current, error: error.message }));
    }
  }

  async function repostComment(commentId) {
    try {
      const comment = await mockRepostComment(commentId);
      setComments((current) => ({
        ...current,
        list: current.list.map((item) => (item.id === comment.id ? comment : item)),
      }));
    } catch (error) {
      setComments((current) => ({ ...current, error: error.message }));
    }
  }

  async function fetchPopularReviews() {
    setFeed((current) => ({ ...current, isFetchingReviews: true }));
    try {
      const popularReviews = await mockGetPopularReviews();
      setFeed((current) => ({ ...current, popularReviews }));
    } finally {
      setFeed((current) => ({ ...current, isFetchingReviews: false }));
    }
  }

  async function fetchPopularReviewers() {
    setFeed((current) => ({ ...current, isFetchingReviewers: true }));
    const popularReviewers = await mockGetPopularReviewers();
    setFeed((current) => ({ ...current, isFetchingReviewers: false, popularReviewers }));
  }

    async function fetchAllUsers(requesterId) {
    setAdmin((current) => ({ ...current, isFetchingUsers: true }));
    try {
      const users = await mockGetAllUsers();
      setAdmin((current) => ({ ...current, users }));
    } finally {
      setAdmin((current) => ({ ...current, isFetchingUsers: false }));
    }
  }

  async function fetchAchievements(userId) {
    setAchievements((c) => ({ ...c, isFetching: true }));
    try {
      const { list, totalPoints, profile } = await mockGetAchievements(userId);
      setAchievements((c) => ({ ...c, list, totalPoints, profile }));
    } finally {
      setAchievements((c) => ({ ...c, isFetching: false }));
    }
  }

  async function updateUserRole(requesterId, userId, role) {
    try {
      const updatedUser = await mockUpdateUserRole(userId, role);
      setAdmin((current) => ({
        ...current,
        users: current.users.map((item) => (item.id === updatedUser.id ? updatedUser : item)),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  

  function redeemReward(reward) {
  const available = achievements.totalPoints - rewards.spentPoints;
  if (reward.cost > available) return { success: false, error: 'No te alcanzan los puntos' };
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  setRewards((c) => ({
    spentPoints: c.spentPoints + reward.cost,
    redeemed: [{ ...reward, code, date: new Date().toISOString() }, ...c.redeemed],
  }));
  return { success: true, code };
  }

  // Las reseñas de un usuario solo las usa una pantalla: se devuelven y cada pantalla
  // las guarda en su propio useState, sin sumar estado global.
  function getUserReviews(userId) {
    return mockGetUserComments(userId);
  }

  // Memoizado: el objeto se rearma solo cuando cambia el estado, así los consumidores
  // no se vuelven a renderizar en cada render del Provider. Las funciones usan
  // setX(c => ...) o leen estado que ya está en las dependencias.
  const value = useMemo(() => ({
    user,
    movies,
    comments,
    feed,
    admin,
    achievements,
    rewards,
    redeemReward,
    handleLogin,
    handleRegister,
    logOut,
    fetchMovies,
    fetchFeaturedMovies,
    fetchMovieDetail,
    clearMovieDetail,
    createMovie,
    updateMovie,
    deleteMovie,
    fetchComments,
    clearComments,
    postComment,
    deleteComment,
    likeComment,
    repostComment,
    fetchPopularReviews,
    fetchPopularReviewers,
    fetchAllUsers,
    updateUserRole,
    fetchAchievements,
    getUserReviews,
  }), [user, movies, comments, feed, admin, achievements, rewards]);
  

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
