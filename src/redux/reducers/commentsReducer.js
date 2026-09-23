import {
  FETCH_COMMENTS_PENDING,
  FETCH_COMMENTS_SUCCESS,
  FETCH_COMMENTS_FAILURE,
  ADD_COMMENT_SUCCESS,
  UPDATE_COMMENT_SUCCESS,
  DELETE_COMMENT_SUCCESS,
  CLEAR_COMMENTS,
} from '../actionTypes/commentsActionTypes';

const initialState = {
  list: [],
  isFetching: false,
  isPosting: false,
  error: false,
};

export default function commentsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_COMMENTS_PENDING:
      return { ...state, isFetching: true, error: false };
    case FETCH_COMMENTS_SUCCESS:
      return { ...state, isFetching: false, list: action.payload };
    case FETCH_COMMENTS_FAILURE:
      return { ...state, isFetching: false, isPosting: false, error: action.payload };
    case ADD_COMMENT_SUCCESS:
      return { ...state, isPosting: false, list: [action.payload, ...state.list] };
    case UPDATE_COMMENT_SUCCESS:
      return {
        ...state,
        list: state.list.map((comment) =>
          comment.id === action.payload.id ? action.payload : comment
        ),
      };
    case DELETE_COMMENT_SUCCESS:
      return { ...state, list: state.list.filter((comment) => comment.id !== action.payload) };
    case CLEAR_COMMENTS:
      return initialState;
    default:
      return state;
  }
}
