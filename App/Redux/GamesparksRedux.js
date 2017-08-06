import Reactotron from 'reactotron-react-native'
import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  log: ['LOG'],
  reset: null,
  startWebsocket: ['env'],
  gamesparksConnected: ['sessionId'],
  websocketSend: ['data', 'onResponse'],
  websocketClosed: null,
  setEndpoint: ['env', 'url']
})
export const GamesparksTypes = Types
export default Creators

/* Initial State ------------------------- */

export const INITIAL_STATE = Immutable({
  environment: null,
  initializing: false,
  connected: false,
  endpoints: {
    preview: 'wss://preview.gamesparks.net/ws/h313710gdMs0',
    live: 'wss://live.gamesparks.net/ws/h313710gdMs0'
  },
  secret: 'bv7XLbgfeKWviKsfw4Uu2rUc64ncn61S',
  session: null
})

/* Reducers ------------------------------ */

export const logger = (state, { LOG }) => {
  Reactotron.warn(LOG)
  return state
}

export const resetter = state => INITIAL_STATE

export const start = (state, { env }) => state.merge({
  environment: env,
  initializing: true
})

export const connected = (state, { sessionId }) => state.merge({
  initializing: false,
  connected: true,
  session: sessionId
})

export const disconnected = (state) => state.merge({
  initializing: false,
  connected: false,
  session: null
})

export const setUrl = (state, { env, url }) => state.merge({
  endpoints: Object.assign({}, state.endpoints, { [env]: url })
})

export const reducer = createReducer(INITIAL_STATE, {
  [Types.LOG]: logger,
  [Types.RESET]: resetter,
  [Types.START_WEBSOCKET]: start,
  [Types.GAMESPARKS_CONNECTED]: connected,
  [Types.WEBSOCKET_CLOSED]: disconnected,
  [Types.SET_ENDPOINT]: setUrl
})

/* Handlers ------------------------------ */

export const onAuthResponse = (emit, msg) => {
  if (msg.authToken) {
    emit({ type: 'authenticated', ...msg })
  } else {
    emit({ type: 'log', ...msg })
  }
}
