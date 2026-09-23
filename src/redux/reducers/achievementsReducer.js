import {
  FETCH_ACHIEVEMENTS_PENDING,
  FETCH_ACHIEVEMENTS_SUCCESS,
} from '../actionTypes/achievementsActionTypes';

const initialState = {
  list: [],
  isFetching: false,
};

export default function achievementsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ACHIEVEMENTS_PENDING:
      return { ...state, isFetching: true };
    case FETCH_ACHIEVEMENTS_SUCCESS:
      return { ...state, isFetching: false, list: action.payload };
    default:
      return state;
  }
}
