import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import user from './reducers/User';

import Login from './Login';

let store = createStore(user);

export default class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <Login />
      </Provider>
    )
  }
}
