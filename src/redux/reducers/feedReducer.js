import {
  FETCH_POPULAR_REVIEWS_PENDING,
  FETCH_POPULAR_REVIEWS_SUCCESS,
  FETCH_POPULAR_REVIEWERS_PENDING,
  FETCH_POPULAR_REVIEWERS_SUCCESS,
} from '../actionTypes/feedActionTypes';

const initialState = {
  popularReviews: [],
  isFetchingReviews: false,
  popularReviewers: [],
  isFetchingReviewers: false,
};

export default function feedReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_POPULAR_REVIEWS_PENDING:
      return { ...state, isFetchingReviews: true };
    case FETCH_POPULAR_REVIEWS_SUCCESS:
      return { ...state, isFetchingReviews: false, popularReviews: action.payload };
    case FETCH_POPULAR_REVIEWERS_PENDING:
      return { ...state, isFetchingReviewers: true };
    case FETCH_POPULAR_REVIEWERS_SUCCESS:
      return { ...state, isFetchingReviewers: false, popularReviewers: action.payload };
    default:
      return state;
  }
}
