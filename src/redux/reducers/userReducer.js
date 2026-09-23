import {
  LOG_USER_PENDING,
  LOG_USER_SUCCESS,
  LOG_OUT,
} from '../actionTypes/userActionTypes';

const initialState = {
  user: {},
  isFetching: false,
  isLoggedIn: false,
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case LOG_USER_PENDING:
      return {
        ...state,
        isLoggedIn: false,
        isFetching: true,
      };
    case LOG_USER_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isLoggedIn: true,
        user: action.payload,
      };
    case LOG_OUT:
      return {
        ...state,
        isLoggedIn: false,
        user: {},
      };
    default:
      return state;
  }
}
