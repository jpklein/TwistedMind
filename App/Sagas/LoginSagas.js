import { delay } from 'redux-saga'
import { call, put, race, select, take } from 'redux-saga/effects'
import GamesparksActions, { onAuthResponse } from '../Redux/GamesparksRedux.js'
import { LoginTypes } from '../Redux/LoginRedux.js'

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
    const { username, password } = yield take(LoginTypes.LOGIN_REQUEST)
    yield race({
      auth: call(login, username, password),
      logout: take(LoginTypes.LOGOUT)
    })
  }
}

// attempts to login
export function * login (username, password) {
  const data = {
    '@class': '.AuthenticationRequest',
    password: password,
    userName: username
  }
  yield put(GamesparksActions.websocketSend(data, onAuthResponse))
  return true
}
