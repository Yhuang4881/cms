import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux'
import { DISMISS_NOTIFICATION, PUSH_NOTIFICATION, SET_GITHUB_TOKEN, UPDATE_PAGE_STATIC_PROPS } from './actions';

const initialState = {
  pageStaticProps: {},
  githubToken: null,
  notifications: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case HYDRATE:
      return state;
    case UPDATE_PAGE_STATIC_PROPS: {
      const pageStaticProps = { ...state.pageStaticProps, [action.page]: action.props };
      return { ...state, pageStaticProps };
    }
    case SET_GITHUB_TOKEN: {
      const githubToken = action.token;
      return { ...state, githubToken };
    }
    case PUSH_NOTIFICATION: {
      const {id, content, className} = action;
      const notifications = [...state.notifications, {id, content, className}];
      return { ...state, notifications };
    }
    case DISMISS_NOTIFICATION: {
      const {id} = action;
      const notifications = state.notifications.filter(notification => notification.id !== id);
      return { ...state, notifications };
    }
    default:
      return state;
  }
};


export default combineReducers({
  reducer
})