import {
  FETCH_POPULAR_REVIEWS_PENDING,
  FETCH_POPULAR_REVIEWS_SUCCESS,
  FETCH_POPULAR_REVIEWERS_PENDING,
  FETCH_POPULAR_REVIEWERS_SUCCESS,
} from '../actionTypes/feedActionTypes';
import { mockGetPopularReviews, mockGetPopularReviewers } from '../../mockData';

export function fetchPopularReviews() {
  return async (dispatch) => {
    dispatch({ type: FETCH_POPULAR_REVIEWS_PENDING });
    const reviews = await mockGetPopularReviews();
    dispatch({ type: FETCH_POPULAR_REVIEWS_SUCCESS, payload: reviews });
  };
}

export function fetchPopularReviewers() {
  return async (dispatch) => {
    dispatch({ type: FETCH_POPULAR_REVIEWERS_PENDING });
    const reviewers = await mockGetPopularReviewers();
    dispatch({ type: FETCH_POPULAR_REVIEWERS_SUCCESS, payload: reviewers });
  };
}
