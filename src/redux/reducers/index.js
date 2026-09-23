import { combineReducers } from 'redux';
import userReducer from './userReducer';
import moviesReducer from './moviesReducer';
import commentsReducer from './commentsReducer';
import feedReducer from './feedReducer';
import adminReducer from './adminReducer';
import achievementsReducer from './achievementsReducer';

const rootReducer = combineReducers({
  users: userReducer,
  movies: moviesReducer,
  comments: commentsReducer,
  feed: feedReducer,
  admin: adminReducer,
  achievements: achievementsReducer,
});

export default rootReducer;
