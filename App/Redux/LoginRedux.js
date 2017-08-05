import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  loginRequest: ['username', 'password'],
  loginSuccess: ['authToken', 'userId', 'displayName'],
  loginFailure: ['error'],
  logout: null,
  autoLogin: null
})

export const LoginTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  username: null,
  error: null,
  fetching: false,
  authToken: null,
  userId: null,
  displayName: null
})

/* ------------- Reducers ------------- */

// we're attempting to login
export const request = (state, { username }) => state.merge({
  username,
  fetching: true
})

// we've successfully logged in
export const success = (state, { authToken, userId, displayName }) => state.merge({
  fetching: false,
  error: null,
  authToken,
  userId,
  displayName
})

// we've had a problem logging in
export const failure = (state, { error }) => state.merge({ fetching: false,
  error
})

// we've logged out
export const logout = (state) => INITIAL_STATE

// startup saga invoked autoLogin
export const autoLogin = (state) => state

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.LOGIN_REQUEST]: request,
  [Types.LOGIN_SUCCESS]: success,
  [Types.LOGIN_FAILURE]: failure,
  [Types.LOGOUT]: logout,
  [Types.AUTO_LOGIN]: autoLogin
})

/* ------------- Selectors ------------- */

// Is the current user logged in?
export const isLoggedIn = (loginState) => loginState.authToken !== null
