import { delay } from 'redux-saga'
import { call, put, race, select, take } from 'redux-saga/effects'
import GamesparksActions from '../Redux/GamesparksRedux.js'
import LoginActions, { LoginTypes } from '../Redux/LoginRedux.js'

export const sdkStatus = (state) => state.gamesparks

export function * loginFlow () {
  while (true) {
    // @todo only connect on demand/bounce attempts until timeout
    const sdkIs = yield select(sdkStatus)
    if (sdkIs.initializing === true) {
      yield call(delay, 500)
    } else if (sdkIs.connected === false) {
      yield put(GamesparksActions.startWebsocket('preview'))
    }
    const { user, pass } = yield take(LoginTypes.LOGIN_REQUEST)
    const winner = yield race({
      auth: call(login, user, pass),
      logout: take(LoginTypes.LOGOUT)
    })
    if (winner.auth) {
      yield put(LoginActions.loginSuccess(user))
    }
  }
}

// attempts to login
export function * login (username, password) {
  if (password === '') {
    // dispatch failure
    yield put(LoginActions.loginFailure('WRONG'))
  } else {
    // dispatch successful logins
    yield put(GamesparksActions.reset())
  }
  return true
}
