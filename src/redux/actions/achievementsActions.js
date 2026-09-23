import {
  FETCH_ACHIEVEMENTS_PENDING,
  FETCH_ACHIEVEMENTS_SUCCESS,
} from '../actionTypes/achievementsActionTypes';
import { mockGetAchievements } from '../../mockData';

export function fetchAchievements(userId) {
  return async (dispatch) => {
    dispatch({ type: FETCH_ACHIEVEMENTS_PENDING });
    const achievements = await mockGetAchievements(userId);
    dispatch({ type: FETCH_ACHIEVEMENTS_SUCCESS, payload: achievements });
  };
}
