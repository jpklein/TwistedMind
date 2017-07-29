/* global WebSocket */
import CryptoJS from 'crypto-js'
import { END, eventChannel } from 'redux-saga'
import { call, put, select, take } from 'redux-saga/effects'
import Actions, { INITIAL_STATE } from '../Redux/GamesparksRedux.js'
// import LoginActions from '../Redux/LoginRedux.js'

// export const hasWebsocket = state => state.gamesparks.connected
export const sdkConfig = state => ({
  endpoints: state.gamesparks.endpoints,
  secret: state.gamesparks.secret
})

// attempts to login
export function * connect ({ env }) {
//   const isConnected = yield select(hasWebsocket)
//   if (!isConnected) {
  const { endpoints, secret } = yield select(sdkConfig)
  const url = endpoints[env] || INITIAL_STATE.endpoints[env]
  const channel = yield call(initSdk, url, secret)
  let shouldReconnect
  try {
    while (true) {
      const event = yield take(channel)
      if (typeof event === 'object' && event.type) {
        const handle = getHandler(event.type)
        event.env = env
        const { type } = yield handle(event)
        shouldReconnect = type === 'SET_ENDPOINT'
      }
    }
  } finally {
    yield put(Actions.didClose())
    if (shouldReconnect === true) {
      yield put(Actions.startWebsocket(env))
    }
  }
}

function initSdk (url, secret) {
  return eventChannel(emit => {
    let authToken,
      redirectUrl,
      sessionId
    const socket = new WebSocket(url)
    socket.onopen = (event) => {
      emit({ type: 'open' })
    }
    socket.onclose = (event) => {
      if (redirectUrl) {
        emit({ type: 'redirect', url: redirectUrl })
      }
      emit(END)
    }
    socket.onerror = (event) => {
      emit('WebSocket onError')
    }
    socket.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch (e) {
        emit(END)
        return
      }
      if (msg['authToken']) {
        authToken = msg['authToken']
      }
      if (msg['connectUrl']) {
        redirectUrl = msg['connectUrl']
      }
      if (msg['@class'] === '.AuthenticatedConnectResponse') {
        // handshaking
        if (msg['nonce']) {
          const reply = {
            '@class': '.AuthenticatedConnectRequest',
            hmac: CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(msg['nonce'], secret))
          }
          if (authToken) {
            reply.authToken = authToken
          }
          if (sessionId) {
            reply.sessionId = sessionId
          }
          // @todo send platform/os data
          socket.send(JSON.stringify(reply))
        } else if (msg['sessionId']) {
          sessionId = msg['sessionId']
          emit({ type: 'connected', sessionId: sessionId })
          // @todo set keepalive interval?
        }
      }
    }
    return () => {
      socket.close()
    }
  })
}

function getHandler (type) {
  const handlers = {
    log: function * (event) {
      return yield put(Actions.log(event))
    },
    redirect: function * ({ env, url }) {
      return yield put(Actions.setEndpoint(env, url))
    },
    connected: function * ({ sessionId }) {
      return yield put(Actions.didConnect(sessionId))
    }
  }
  const fn = handlers[type] || handlers.log
  return fn
}
