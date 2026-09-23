import {
  FETCH_ACHIEVEMENTS_PENDING,
  FETCH_ACHIEVEMENTS_SUCCESS,
  FETCH_ACHIEVEMENTS_FAILURE,
} from '../actionTypes/achievementsActionTypes';

const initialState = {
  list: [],
  isFetching: false,
  error: false,
};

export default function achievementsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ACHIEVEMENTS_PENDING:
      return { ...state, isFetching: true, error: false };
    case FETCH_ACHIEVEMENTS_SUCCESS:
      return { ...state, isFetching: false, list: action.payload };
    case FETCH_ACHIEVEMENTS_FAILURE:
      return { ...state, isFetching: false, error: action.payload };
    default:
      return state;
  }
}
