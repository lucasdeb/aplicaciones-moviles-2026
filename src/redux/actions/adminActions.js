import {
  FETCH_USERS_PENDING,
  FETCH_USERS_SUCCESS,
  UPDATE_USER_ROLE_SUCCESS,
} from '../actionTypes/adminActionTypes';
import { mockGetAllUsers, mockUpdateUserRole } from '../../mockData';

export function fetchAllUsers(requesterId) {
  return async (dispatch) => {
    dispatch({ type: FETCH_USERS_PENDING });
    const users = await mockGetAllUsers();
    dispatch({ type: FETCH_USERS_SUCCESS, payload: users });
  };
}

export function updateUserRole(requesterId, userId, role) {
  return async (dispatch) => {
    try {
      const user = await mockUpdateUserRole(userId, role);
      dispatch({ type: UPDATE_USER_ROLE_SUCCESS, payload: user });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };
}
