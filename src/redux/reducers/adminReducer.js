import {
  FETCH_USERS_PENDING,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  UPDATE_USER_ROLE_SUCCESS,
} from '../actionTypes/adminActionTypes';

const initialState = {
  users: [],
  isFetchingUsers: false,
  error: false,
};

export default function adminReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_USERS_PENDING:
      return { ...state, isFetchingUsers: true, error: false };
    case FETCH_USERS_SUCCESS:
      return { ...state, isFetchingUsers: false, users: action.payload };
    case FETCH_USERS_FAILURE:
      return { ...state, isFetchingUsers: false, error: action.payload };
    case UPDATE_USER_ROLE_SUCCESS:
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
      };
    default:
      return state;
  }
}
