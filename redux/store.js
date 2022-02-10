import { createStore, applyMiddleware } from 'redux';
import { createWrapper } from 'next-redux-wrapper';
import thunk from 'redux-thunk';
import reducer from './reducer';

const makeStore = context => createStore(reducer, applyMiddleware(thunk));
export const wrapper = createWrapper(makeStore, {debug: false});