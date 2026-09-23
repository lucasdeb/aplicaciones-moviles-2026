import React, { createContext, useContext, useState, type ReactNode } from 'react';
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
  const [achievements, setAchievements] = useState({ list: [], isFetching: false });

  async function handleLogin(credentials) {
    setUser((current) => ({ ...current, isFetching: true }));
    const nextUser = await mockLogin(credentials.email);
    setUser({ user: nextUser, isFetching: false, isLoggedIn: true });
  }

  async function handleRegister(userInfo) {
    setUser((current) => ({ ...current, isFetching: true }));
    const nextUser = await mockRegister(userInfo);
    setUser({ user: nextUser, isFetching: false, isLoggedIn: true });
  }

  function logOut() {
    setUser({ user: null, isFetching: false, isLoggedIn: false });
  }

  async function fetchMovies() {
    setMovies((current) => ({ ...current, isFetching: true, error: false }));
    const list = await mockGetMovies();
    setMovies((current) => ({ ...current, isFetching: false, list }));
  }

  async function fetchFeaturedMovies() {
    setMovies((current) => ({ ...current, isFetchingFeatured: true }));
    const featured = await mockGetFeaturedMovies();
    setMovies((current) => ({ ...current, isFetchingFeatured: false, featured }));
  }

  async function fetchMovieDetail(movieId) {
    setMovies((current) => ({ ...current, isFetchingDetail: true, error: false }));
    const [selectedMovie, recommendations] = await Promise.all([
      mockGetMovie(movieId),
      mockGetRecommendations(movieId),
    ]);
    setMovies((current) => ({
      ...current,
      isFetchingDetail: false,
      selectedMovie,
      recommendations,
    }));
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
    const list = await mockGetComments(movieId);
    setComments((current) => ({ ...current, isFetching: false, list }));
  }

  function clearComments() {
    setComments({ list: [], isFetching: false, isPosting: false, error: false });
  }

  async function postComment(movieId, authorId, text) {
    try {
      const comment = await mockPostComment(movieId, authorId, text);
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
    const comment = await mockLikeComment(commentId);
    setComments((current) => ({
      ...current,
      list: current.list.map((item) => (item.id === comment.id ? comment : item)),
    }));
  }

  async function repostComment(commentId) {
    const comment = await mockRepostComment(commentId);
    setComments((current) => ({
      ...current,
      list: current.list.map((item) => (item.id === comment.id ? comment : item)),
    }));
  }

  async function fetchPopularReviews() {
    setFeed((current) => ({ ...current, isFetchingReviews: true }));
    const popularReviews = await mockGetPopularReviews();
    setFeed((current) => ({ ...current, isFetchingReviews: false, popularReviews }));
  }

  async function fetchPopularReviewers() {
    setFeed((current) => ({ ...current, isFetchingReviewers: true }));
    const popularReviewers = await mockGetPopularReviewers();
    setFeed((current) => ({ ...current, isFetchingReviewers: false, popularReviewers }));
  }

  async function fetchAllUsers(requesterId) {
    setAdmin((current) => ({ ...current, isFetchingUsers: true }));
    const users = await mockGetAllUsers();
    setAdmin({ users, isFetchingUsers: false });
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

  async function fetchAchievements(userId) {
    setAchievements((current) => ({ ...current, isFetching: true }));
    const list = await mockGetAchievements(userId);
    setAchievements({ list, isFetching: false });
  }

  const value = {
    user,
    movies,
    comments,
    feed,
    admin,
    achievements,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
