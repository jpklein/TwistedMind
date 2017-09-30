/* global WebSocket */
import CryptoJS from 'crypto-js'
import { eventChannel } from 'redux-saga'
import { call, put, race, select, take } from 'redux-saga/effects'
import Actions, { GamesparksTypes, INITIAL_STATE, sdkStatus, sdkConfig } from '../Redux/GamesparksRedux.js'
import LoginActions from '../Redux/LoginRedux.js'

// @todo handle network reconnection/error reporting
export const hasGamesparksConnection = function * () {
  let sdkIs = yield select(sdkStatus)
  if (sdkIs.connected === false) {
    yield put(Actions.startWebsocket('preview'))
    sdkIs = yield select(sdkStatus)
  }
  if (sdkIs.initializing === true) {
    let status
    let wasRedirected = false
    let willReconnect
    do {
      willReconnect = false
      status = yield race({
        initialized: take(GamesparksTypes.GAMESPARKS_CONNECTED),
        redirected: take(GamesparksTypes.SET_ENDPOINT),
        offline: take(GamesparksTypes.WEBSOCKET_CLOSED)
      })
      if ('offline' in status) {
        if (!wasRedirected) {
          const config = yield select(sdkConfig)
          const initialConfig = sdkConfig({ gamesparks: INITIAL_STATE })
          if (JSON.stringify(config) === JSON.stringify(initialConfig)) {
            return false
          }
          yield put(Actions.resetGamesparksConfig())
        }
        yield put(Actions.startWebsocket('preview'))
        willReconnect = true
      }
    } while ((wasRedirected = 'redirected' in status) || willReconnect)
  }
  return true
}

// attempts to login
export const connectSaga = function * () {
  while (true) {
    const { env } = yield take(GamesparksTypes.START_WEBSOCKET)
    const config = yield select(sdkConfig)
    const url = config.endpoints[env] || INITIAL_STATE.endpoints[env]
    try {
      const socket = new WebSocket(url)
      const channel = yield call(initSdk, socket, config.secret)
      while (true) {
        // @todo add internal listener to invalidate connection (request close)
        const { event } = yield race({
          send: call(transmitSaga, socket),
          event: take(channel)
        })
        if (typeof event === 'object' && event.type) {
          const handle = getHandler(event.type)
          yield handle({ env: env, ...event })
        }
      }
    } catch (e) {
      // Restarts saga when close event taken from channel
    }
  }
}

export const initSdk = (socket, secret) => {
  return eventChannel(emit => {
    let authToken,
      redirectUri,
      sessionId
    socket.onclose = (event) => {
      if (redirectUri) {
        emit({ type: 'redirected', uri: redirectUri })
      }
      emit({ type: 'closed' })
    }
    socket.onerror = (event) => {
      emit({ type: 'log', event })
    }
    socket.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch (e) {
        emit({ type: 'log', event })
        return
      }
      if (msg['authToken']) {
        authToken = msg['authToken']
      }
      if (msg['connectUrl']) {
        redirectUri = msg['connectUrl']
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
          socket.requestCounter = 0
          socket.pendingRequests = {}
          // keepalive interval destroyed with socket
          socket.keepAliveInterval = setInterval(() => {
            socket.send(' ')
          }, 30000)
          sessionId = msg['sessionId']
          emit({ type: 'connected', sessionId: sessionId })
        }
      } else if (msg['@class'].match(/Response$/)) {
        const { requestId } = msg
        if (requestId && socket.pendingRequests[requestId]) {
          delete msg.requestId
          // executes onResponse handler
          socket.pendingRequests[requestId](emit, msg)
          delete socket.pendingRequests[requestId]
        }
      }
    }
    return () => {
      socket.close()
    }
  })
}

export const transmitSaga = function * (socket) {
  while (true) {
    const { data, onResponse } = yield take(GamesparksTypes.WEBSOCKET_SEND)
    const requestId = (new Date()).getTime() + '_' + (++socket.requestCounter)
    if (onResponse != null) {
      // assigns onResponse handler
      socket.pendingRequests[requestId] = onResponse
      // emits error if handler hasn't executed after 3.2 sec
      setTimeout(() => {
        if (socket.pendingRequests[requestId]) {
          socket.onerror({ error: 'NO_RESPONSE', requestId })
        }
      }, 3200)
    }
    socket.send(JSON.stringify({ requestId: requestId, ...data }))
  }
}

const getHandler = type => {
  const handlers = {
    log: function * (event) {
      return yield put(Actions.log(event))
    },
    redirected: function * ({ env, uri }) {
      return yield put(Actions.setEndpoint(env, uri))
    },
    connected: function * ({ sessionId }) {
      return yield put(Actions.gamesparksConnected(sessionId))
    },
    authenticated: function * ({ userId, authToken, displayName }) {
      return yield put(LoginActions.loginSuccess(userId, authToken, displayName))
    },
    closed: function * () {
      // undefined return triggers connect() finally block
      yield put(Actions.websocketClosed())
    }
  }
  const fn = handlers[type] || handlers.log
  return fn
}
