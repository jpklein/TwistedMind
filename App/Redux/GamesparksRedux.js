import Reactotron from 'reactotron-react-native'
import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  log: ['LOG'],
  resetGamesparksConfig: null,
  startWebsocket: ['env'],
  setEndpoint: ['env', 'uri'],
  websocketClosed: null,
  gamesparksConnected: ['sessionId'],
  websocketSend: ['data', 'onResponse']
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

/* Selectors ----------------------------- */

export const sdkStatus = state => ({
  initializing: state.gamesparks.initializing,
  connected: state.gamesparks.connected
})

export const sdkConfig = state => ({
  endpoints: state.gamesparks.endpoints,
  secret: state.gamesparks.secret
})

export const sdkSession = state => ({
  session: state.gamesparks.session
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

export const setUri = (state, { env, uri }) => state.merge({
  endpoints: Object.assign({}, state.endpoints, { [env]: uri })
})

export const disconnected = state => state.merge({
  initializing: false,
  connected: false,
  session: null
})

export const connected = (state, { sessionId }) => state.merge({
  initializing: false,
  connected: true,
  session: sessionId
})

export const reducer = createReducer(INITIAL_STATE, {
  [Types.LOG]: logger,
  [Types.RESET_GAMESPARKS_CONFIG]: resetter,
  [Types.START_WEBSOCKET]: start,
  [Types.SET_ENDPOINT]: setUri,
  [Types.WEBSOCKET_CLOSED]: disconnected,
  [Types.GAMESPARKS_CONNECTED]: connected
})

/* Handlers ------------------------------ */

export const onAuthResponse = (emit, msg) => {
  if (msg.authToken) {
    emit({ type: 'authenticated', ...msg })
  } else {
    emit({ type: 'log', ...msg })
  }
}
