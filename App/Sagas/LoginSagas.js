import { put } from 'redux-saga/effects'
import GamesparksActions from '../Redux/GamesparksRedux.js'
import LoginActions from '../Redux/LoginRedux.js'

// attempts to login
export function * login ({ username, password }) {
  if (password === '') {
    // dispatch failure
    yield put(LoginActions.loginFailure('WRONG'))
  } else {
    // dispatch successful logins
    yield put(GamesparksActions.reset())
    yield put(GamesparksActions.startWebsocket('preview'))
    // yield put(LoginActions.loginSuccess(username))
  }
}
