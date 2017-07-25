import Reactotron from 'reactotron-react-native'
import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  startWebsocket: ['env', 'key', 'secret'],
  redirectWebsocket: ['url'],
  invalidateWebsocket: null
})
export const LoginTypes = Types
export default Creators

/* Initial State ------------------------- */

export const INITIAL_STATE = Immutable({
  initializing: false,
  connected: false,
  url: null,
  env: null,
  key: null,
  secret: null,
  token: null
})

/* Reducers ------------------------------ */

export const start = (state, { env, key, secret }) => { // state.merge({
  // attempt to capture play-by-play from login saga
  Reactotron.error(secret); return state.merge({
    initializing: true,
    env: env,
    key: key // ,
    // secret: secret,
  })
}

export const redirect = (state, { url }) => state.merge({
  url: url
})

export const invalidate = (state) => state.merge({
  connected: false
})

export const reducer = createReducer(INITIAL_STATE, {
  [Types.START_WEBSOCKET]: start,
  [Types.REDIRECT_WEBSOCKET]: redirect,
  [Types.INVALIDATE_WEBSOCKET]: invalidate
})
