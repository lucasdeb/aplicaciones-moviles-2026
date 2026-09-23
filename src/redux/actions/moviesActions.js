import {
  FETCH_MOVIES_PENDING,
  FETCH_MOVIES_SUCCESS,
  FETCH_FEATURED_PENDING,
  FETCH_FEATURED_SUCCESS,
  FETCH_MOVIE_DETAIL_PENDING,
  FETCH_MOVIE_DETAIL_SUCCESS,
  CLEAR_MOVIE_DETAIL,
  CREATE_MOVIE_SUCCESS,
  UPDATE_MOVIE_SUCCESS,
  DELETE_MOVIE_SUCCESS,
  MOVIE_ADMIN_FAILURE,
} from '../actionTypes/moviesActionTypes';
import {
  mockGetMovies,
  mockGetFeaturedMovies,
  mockGetMovie,
  mockGetRecommendations,
  mockCreateMovie,
  mockUpdateMovie,
  mockDeleteMovie,
} from '../../mockData';

export function clearMovieDetail() {
  return { type: CLEAR_MOVIE_DETAIL };
}

export function fetchMovies() {
  return async (dispatch) => {
    dispatch({ type: FETCH_MOVIES_PENDING });
    const movies = await mockGetMovies();
    dispatch({ type: FETCH_MOVIES_SUCCESS, payload: movies });
  };
}

export function fetchFeaturedMovies() {
  return async (dispatch) => {
    dispatch({ type: FETCH_FEATURED_PENDING });
    const movies = await mockGetFeaturedMovies();
    dispatch({ type: FETCH_FEATURED_SUCCESS, payload: movies });
  };
}

// Las siguientes tres acciones son solo para superadmin; como no hay backend
// que vuelva a validar el rol, la pantalla es la única barrera.
export function createMovie(requesterId, movieData) {
  return async (dispatch) => {
    try {
      const movie = await mockCreateMovie(movieData);
      dispatch({ type: CREATE_MOVIE_SUCCESS, payload: movie });
      return { success: true };
    } catch (e) {
      dispatch({ type: MOVIE_ADMIN_FAILURE, payload: e.message });
      return { success: false, error: e.message };
    }
  };
}

export function updateMovie(requesterId, movieId, movieData) {
  return async (dispatch) => {
    try {
      const movie = await mockUpdateMovie(movieId, movieData);
      dispatch({ type: UPDATE_MOVIE_SUCCESS, payload: movie });
      return { success: true };
    } catch (e) {
      dispatch({ type: MOVIE_ADMIN_FAILURE, payload: e.message });
      return { success: false, error: e.message };
    }
  };
}

export function deleteMovie(requesterId, movieId) {
  return async (dispatch) => {
    try {
      await mockDeleteMovie(movieId);
      dispatch({ type: DELETE_MOVIE_SUCCESS, payload: movieId });
      return { success: true };
    } catch (e) {
      dispatch({ type: MOVIE_ADMIN_FAILURE, payload: e.message });
      return { success: false, error: e.message };
    }
  };
}

export function fetchMovieDetail(movieId) {
  return async (dispatch) => {
    dispatch({ type: FETCH_MOVIE_DETAIL_PENDING });
    const [movie, recommendations] = await Promise.all([
      mockGetMovie(movieId),
      mockGetRecommendations(movieId),
    ]);
    dispatch({
      type: FETCH_MOVIE_DETAIL_SUCCESS,
      payload: { movie, recommendations },
    });
  };
}
