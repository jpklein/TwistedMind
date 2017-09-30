import { is } from 'ramda'
import { put, select } from 'redux-saga/effects'
import AppStateActions from '../Redux/AppStateRedux.js'
import GithubActions from '../Redux/GithubRedux.js'
import LoggedInActions, { isLoggedIn } from '../Redux/LoginRedux.js'

// exported to make available for tests
export const selectAvatar = state => state.github.avatar
export const selectLoggedInStatus = state => isLoggedIn(state.login)

// process STARTUP actions
export const startup = function * (action) {
  const avatar = yield select(selectAvatar)
  // only get if we don't have it yet
  if (!is(String, avatar)) {
    yield put(GithubActions.userRequest('GantMan'))
  }
  yield put(AppStateActions.setRehydrationComplete())
  const isLoggedIn = yield select(selectLoggedInStatus)
  if (isLoggedIn) {
    yield put(LoggedInActions.autoLogin())
  }
}
