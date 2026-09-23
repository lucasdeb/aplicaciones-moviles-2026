import {
  FETCH_MOVIES_PENDING,
  FETCH_MOVIES_SUCCESS,
  FETCH_MOVIES_FAILURE,
  FETCH_FEATURED_PENDING,
  FETCH_FEATURED_SUCCESS,
  FETCH_FEATURED_FAILURE,
  FETCH_MOVIE_DETAIL_PENDING,
  FETCH_MOVIE_DETAIL_SUCCESS,
  FETCH_MOVIE_DETAIL_FAILURE,
  CLEAR_MOVIE_DETAIL,
  CREATE_MOVIE_SUCCESS,
  UPDATE_MOVIE_SUCCESS,
  DELETE_MOVIE_SUCCESS,
  MOVIE_ADMIN_FAILURE,
} from '../actionTypes/moviesActionTypes';

const initialState = {
  list: [],
  isFetching: false,
  error: false,
  featured: [],
  isFetchingFeatured: false,
  selectedMovie: null,
  recommendations: [],
  isFetchingDetail: false,
};

export default function moviesReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_MOVIES_PENDING:
      return { ...state, isFetching: true, error: false };
    case FETCH_MOVIES_SUCCESS:
      return { ...state, isFetching: false, error: false, list: action.payload };
    case FETCH_MOVIES_FAILURE:
      return { ...state, isFetching: false, error: action.payload };
    case FETCH_FEATURED_PENDING:
      return { ...state, isFetchingFeatured: true };
    case FETCH_FEATURED_SUCCESS:
      return { ...state, isFetchingFeatured: false, featured: action.payload };
    case FETCH_FEATURED_FAILURE:
      return { ...state, isFetchingFeatured: false };
    case FETCH_MOVIE_DETAIL_PENDING:
      return { ...state, isFetchingDetail: true, error: false };
    case FETCH_MOVIE_DETAIL_SUCCESS:
      return {
        ...state,
        isFetchingDetail: false,
        selectedMovie: action.payload.movie,
        recommendations: action.payload.recommendations,
      };
    case FETCH_MOVIE_DETAIL_FAILURE:
      return { ...state, isFetchingDetail: false, error: action.payload };
    case CLEAR_MOVIE_DETAIL:
      return { ...state, selectedMovie: null, recommendations: [] };
    case CREATE_MOVIE_SUCCESS:
      return { ...state, list: [action.payload, ...state.list] };
    case UPDATE_MOVIE_SUCCESS:
      return {
        ...state,
        list: state.list.map((m) => (m.id === action.payload.id ? action.payload : m)),
        selectedMovie:
          state.selectedMovie?.id === action.payload.id ? action.payload : state.selectedMovie,
      };
    case DELETE_MOVIE_SUCCESS:
      return { ...state, list: state.list.filter((m) => m.id !== action.payload) };
    case MOVIE_ADMIN_FAILURE:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
