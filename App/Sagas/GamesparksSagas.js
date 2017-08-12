/* global WebSocket */
import CryptoJS from 'crypto-js'
import { eventChannel } from 'redux-saga'
import { call, put, race, select, take } from 'redux-saga/effects'
import Actions, { GamesparksTypes, INITIAL_STATE, sdkStatus, sdkConfig } from '../Redux/GamesparksRedux.js'
import LoginActions from '../Redux/LoginRedux.js'

// @todo handle network reconnection/error reporting
export function * hasGamesparksConnection () {
  let sdkIs = yield select(sdkStatus)
  if (sdkIs.connected === false) {
    yield put(Actions.startWebsocket('preview'))
    sdkIs = yield select(sdkStatus)
  }
  if (sdkIs.initializing === true) {
    const status = yield race({
      initialized: take(GamesparksTypes.GAMESPARKS_CONNECTED),
      offline: take(GamesparksTypes.WEBSOCKET_CLOSED)
    })
    if (status.offline) {
      return false
    }
  }
  return true
}

// attempts to login
export function * connectSaga () {
  while (true) {
    const { env } = yield take(GamesparksTypes.START_WEBSOCKET)
    const sdk = yield select(sdkConfig)
    const url = sdk.endpoints[env] || INITIAL_STATE.endpoints[env]
    let shouldReconnect
    try {
      const socket = new WebSocket(url)
      const channel = yield call(initSdk, socket, sdk.secret)
      while (true) {
        // @todo add internal listener to invalidate connection (request close)
        const { event } = yield race({
          send: call(transmitSaga, socket),
          event: take(channel)
        })
        if (typeof event === 'object' && event.type) {
          const handle = getHandler(event.type)
          const { type } = yield handle({ env: env, ...event })
          shouldReconnect = type === 'SET_ENDPOINT'
        }
      }
    } catch (e) {
      if (shouldReconnect === true) {
        yield put(Actions.startWebsocket(env))
      }
    }
  }
}

function initSdk (socket, secret) {
  return eventChannel(emit => {
    let authToken,
      redirectUrl,
      sessionId
    socket.onclose = (event) => {
      if (redirectUrl) {
        emit({ type: 'redirected', url: redirectUrl })
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

function * transmitSaga (socket) {
  while (true) {
    const { data, onResponse } = yield take('WEBSOCKET_SEND')
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

function getHandler (type) {
  const handlers = {
    log: function * (event) {
      return yield put(Actions.log(event))
    },
    redirected: function * ({ env, url }) {
      return yield put(Actions.setEndpoint(env, url))
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
