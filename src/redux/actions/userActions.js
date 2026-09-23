import {
  LOG_USER_PENDING,
  LOG_USER_SUCCESS,
  LOG_OUT,
} from '../actionTypes/userActionTypes';
import { mockLogin, mockRegister } from '../../mockData';

function logUserPending() {
  return { type: LOG_USER_PENDING };
}

function logUserSuccess(userData) {
  return { type: LOG_USER_SUCCESS, payload: userData };
}

export function logOut() {
  return { type: LOG_OUT };
}

export function handleLogin(credentials) {
  return async (dispatch) => {
    dispatch(logUserPending());
    const user = await mockLogin(credentials.email);
    dispatch(logUserSuccess(user));
  };
}

export function handleRegister(userInfo) {
  return async (dispatch) => {
    dispatch(logUserPending());
    const user = await mockRegister(userInfo);
    dispatch(logUserSuccess(user));
  };
}
