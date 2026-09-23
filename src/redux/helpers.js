import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as userActionCreators from './actions/userActions';
import * as moviesActionCreators from './actions/moviesActions';
import * as commentsActionCreators from './actions/commentsActions';
import * as feedActionCreators from './actions/feedActions';
import * as adminActionCreators from './actions/adminActions';
import * as achievementsActionCreators from './actions/achievementsActions';

const allActionCreators = {
  ...userActionCreators,
  ...moviesActionCreators,
  ...commentsActionCreators,
  ...feedActionCreators,
  ...adminActionCreators,
  ...achievementsActionCreators,
};

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(allActionCreators, dispatch) };
}

export function connectScreen(screenComponent, mapStateToProps) {
  return connect(mapStateToProps, mapDispatchToProps)(screenComponent);
}
