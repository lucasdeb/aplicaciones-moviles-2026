import {
  FETCH_COMMENTS_PENDING,
  FETCH_COMMENTS_SUCCESS,
  FETCH_COMMENTS_FAILURE,
  ADD_COMMENT_SUCCESS,
  UPDATE_COMMENT_SUCCESS,
  DELETE_COMMENT_SUCCESS,
  CLEAR_COMMENTS,
} from '../actionTypes/commentsActionTypes';
import {
  mockGetComments,
  mockPostComment,
  mockDeleteComment,
  mockLikeComment,
  mockRepostComment,
} from '../../mockData';

export function clearComments() {
  return { type: CLEAR_COMMENTS };
}

export function fetchComments(movieId) {
  return async (dispatch) => {
    dispatch({ type: FETCH_COMMENTS_PENDING });
    const comments = await mockGetComments(movieId);
    dispatch({ type: FETCH_COMMENTS_SUCCESS, payload: comments });
  };
}

export function postComment(movieId, authorId, text) {
  return async (dispatch) => {
    try {
      const comment = await mockPostComment(movieId, authorId, text);
      dispatch({ type: ADD_COMMENT_SUCCESS, payload: comment });
    } catch (e) {
      dispatch({ type: FETCH_COMMENTS_FAILURE, payload: e.message });
    }
  };
}

export function deleteComment(commentId, requesterId) {
  return async (dispatch) => {
    try {
      await mockDeleteComment(commentId);
      dispatch({ type: DELETE_COMMENT_SUCCESS, payload: commentId });
      return { success: true };
    } catch (e) {
      dispatch({ type: FETCH_COMMENTS_FAILURE, payload: e.message });
      return { success: false, error: e.message };
    }
  };
}

export function likeComment(commentId) {
  return async (dispatch) => {
    const comment = await mockLikeComment(commentId);
    dispatch({ type: UPDATE_COMMENT_SUCCESS, payload: comment });
  };
}

export function repostComment(commentId) {
  return async (dispatch) => {
    const comment = await mockRepostComment(commentId);
    dispatch({ type: UPDATE_COMMENT_SUCCESS, payload: comment });
  };
}
